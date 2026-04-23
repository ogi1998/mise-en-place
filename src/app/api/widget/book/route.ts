import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createGuest, createBooking, getBookingRules, getTablesForArea, getExistingBookings } from '@/services/widget/queries'
import { getBookingWindows, isTableFree, timeToMinutes } from '@/services/widget/utils'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    restaurant_id,
    service_area_id,
    party_size,
    booking_date,
    slot_time,
    first_name,
    last_name,
    email,
    phone,
    notes,
    allergens,
  } = body

  if (!restaurant_id || !service_area_id || !booking_date || !slot_time || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const rules = await getBookingRules(supabase, service_area_id)
  if (!rules) return NextResponse.json({ error: 'Rules not found' }, { status: 400 })

  const startISO = `${booking_date}T${slot_time}:00`
  const startMin = timeToMinutes(slot_time)
  const endMin = startMin + rules.booking_duration
  const endHH = Math.floor(endMin / 60).toString().padStart(2, '0')
  const endMM = (endMin % 60).toString().padStart(2, '0')
  const endISO = `${booking_date}T${endHH}:${endMM}:00`

  const tables = await getTablesForArea(supabase, service_area_id, party_size)
  if (tables.length === 0) {
    return NextResponse.json({ error: 'No tables available for this party size' }, { status: 400 })
  }

  const existingBookings = await getExistingBookings(supabase, service_area_id, booking_date)
  const bookingsByTable: Record<string, { startMin: number; endMin: number }[]> = {}
  for (const booking of existingBookings) {
    const windows = getBookingWindows([booking], rules.buffer_time)
    for (const bt of booking.booking_tables) {
      if (!bookingsByTable[bt.table_id]) bookingsByTable[bt.table_id] = []
      bookingsByTable[bt.table_id].push(...windows)
    }
  }

  const slotEndMin = startMin + rules.booking_duration
  const freeTable = tables.find(t => isTableFree(t.id, startMin, slotEndMin, bookingsByTable))
  if (!freeTable) {
    return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 })
  }

  const guest = await createGuest(supabase, { first_name, last_name, email, phone })
  if (!guest) return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 })

  const booking = await createBooking(supabase, {
    restaurant_id,
    service_area_id,
    guest_id: guest.id,
    party_size,
    booking_date,
    start_time: startISO,
    end_time: endISO,
    notes: notes || null,
    allergens: allergens || [],
    status: 'pending',
    source: 'online',
  })

  if (!booking) return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })

  await supabase.from('booking_tables').insert({
    booking_id: booking.id,
    table_id: freeTable.id,
    restaurant_id,
  })

  return NextResponse.json({ success: true, bookingId: booking.id })
}