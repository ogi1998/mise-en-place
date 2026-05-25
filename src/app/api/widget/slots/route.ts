import { NextRequest, NextResponse } from 'next/server'
import { createAnonSupabaseClient } from '@/lib/supabase-anon'
import {
  getWeeklySchedule,
  getSpecialDay,
  getBookingRules,
  getTablesForArea,
  getExistingBookings,
} from '@/services/widget/queries'
import {
  getDayOfWeek,
  generateRawSlots,
  getBookingWindows,
  isTableFree,
  timeToMinutes,
} from '@/services/widget/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const date = searchParams.get('date')
  const serviceAreaId = searchParams.get('serviceAreaId')
  const restaurantId = searchParams.get('restaurantId')
  const partySize = parseInt(searchParams.get('partySize') ?? '2')

  if (!date || !serviceAreaId || !restaurantId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const supabase = await createAnonSupabaseClient()

  // 1. Check future booking window
  const rules = await getBookingRules(supabase, serviceAreaId)
  if (!rules) return NextResponse.json({ slots: [] })

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + rules.future_booking_window)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  if (date < today || date > maxDateStr) {
    return NextResponse.json({ slots: [] })
  }

  // 2. Check party size bounds
  if (partySize < rules.min_guests || partySize > rules.max_guests_online) {
    return NextResponse.json({ slots: [] })
  }

  // 3. Get hours for the date
  const specialDay = await getSpecialDay(supabase, restaurantId, date)

  let openTime: string | null = null
  let closeTime: string | null = null
  let pauseFrom: string | null = null
  let pauseTo: string | null = null
  let slotInterval: number = 30

  if (specialDay) {
    if (specialDay.type === 'closed') {
      return NextResponse.json({ slots: [], closed: true })
    }
    openTime = specialDay.open_time
    closeTime = specialDay.close_time
    pauseFrom = specialDay.pause_from
    pauseTo = specialDay.pause_to
    slotInterval = specialDay.slot_interval ?? 30
  } else {
    const dayOfWeek = getDayOfWeek(date)
    const schedule = await getWeeklySchedule(supabase, serviceAreaId, dayOfWeek)
    if (!schedule || !schedule.is_open) {
      return NextResponse.json({ slots: [], closed: true })
    }
    openTime = schedule.open_time
    closeTime = schedule.close_time
    pauseFrom = schedule.pause_from
    pauseTo = schedule.pause_to
    slotInterval = schedule.slot_interval
  }

  if (!openTime || !closeTime) {
    return NextResponse.json({ slots: [] })
  }

  // 4. Generate raw slots
  const rawSlots = generateRawSlots({
    openTime,
    closeTime,
    pauseFrom,
    pauseTo,
    slotInterval,
    bookingBeforeClosing: rules.booking_before_closing,
    minTimeBeforeSlot: rules.min_time_before_slot,
    date,
  })

  if (rawSlots.length === 0) return NextResponse.json({ slots: [] })

  // 5. Check table availability
  const tables = await getTablesForArea(supabase, serviceAreaId, partySize)
  if (tables.length === 0) return NextResponse.json({ slots: [] })

  const existingBookings = await getExistingBookings(supabase, serviceAreaId, date)

  // Build a map of tableId → booking windows
  const bookingsByTable: Record<string, { startMin: number; endMin: number }[]> = {}
  for (const booking of existingBookings) {
    const windows = getBookingWindows([booking], rules.buffer_time)
    for (const bt of booking.booking_tables) {
      if (!bookingsByTable[bt.table_id]) bookingsByTable[bt.table_id] = []
      bookingsByTable[bt.table_id].push(...windows)
    }
  }

  // 6. Fetch events for this date and pre-compute capacity usage
  const { data: dayEvents } = await supabase
    .from('events')
    .select('id, time_start, time_end, capacity, locked_area_ids')
    .eq('restaurant_id', restaurantId)
    .eq('date', date)

  const eventCapacityUsed: Record<string, number> = {}
  for (const event of dayEvents ?? []) {
    if (event.capacity === null) continue
    const { data: overlapping } = await supabase
      .from('bookings')
      .select('party_size')
      .eq('restaurant_id', restaurantId)
      .eq('booking_date', date)
      .not('status', 'in', '("cancelled","no_show")')
      .lt('start_time', event.time_end)
      .gt('end_time', event.time_start)
    eventCapacityUsed[event.id] = (overlapping ?? []).reduce(
      (sum: number, b: { party_size: number }) => sum + b.party_size,
      0,
    )
  }

  // For each slot check table availability + event constraints
  const availableSlots = rawSlots.filter(slot => {
    const slotStartMin = timeToMinutes(slot)
    const slotEndMin = slotStartMin + rules.booking_duration

    if (!tables.some(table => isTableFree(table.id, slotStartMin, slotEndMin, bookingsByTable))) {
      return false
    }

    for (const event of dayEvents ?? []) {
      const eventStartMin = timeToMinutes(event.time_start.slice(0, 5))
      const eventEndMin = timeToMinutes(event.time_end.slice(0, 5))
      if (slotStartMin >= eventEndMin || slotEndMin <= eventStartMin) continue

      if ((event.locked_area_ids ?? []).includes(serviceAreaId)) return false

      if (event.capacity !== null) {
        const used = eventCapacityUsed[event.id] ?? 0
        if (used + partySize > event.capacity) return false
      }
    }

    return true
  })

  return NextResponse.json({ slots: availableSlots })
}