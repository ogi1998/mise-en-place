import type { SupabaseClient } from '@supabase/supabase-js'
import type { TimetableArea, TimetableTable, TimetableBooking, DaySchedule } from './types'
import { FALLBACK_SCHEDULE } from './types'

export async function getTimetableAreas(
  supabase: SupabaseClient,
  restaurantId: string
): Promise<TimetableArea[]> {
  const { data } = await supabase
    .from('service_areas')
    .select('id, name')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('name')

  return (data ?? []) as TimetableArea[]
}

export async function getTimetableTables(
  supabase: SupabaseClient,
  restaurantId: string,
  areaId: string
): Promise<TimetableTable[]> {
  const { data } = await supabase
    .from('tables')
    .select('id, name, nickname, min_seats, seats, max_seats, sort_order')
    .eq('restaurant_id', restaurantId)
    .eq('service_area_id', areaId)
    .eq('is_active', true)
    .order('sort_order')

  return (data ?? []) as TimetableTable[]
}

export async function getTimetableBookings(
  supabase: SupabaseClient,
  restaurantId: string,
  date: string
): Promise<TimetableBooking[]> {
  // Fetch bookings for the date
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, booking_number, status, party_size,
      start_time, end_time, notes, internal_notes, is_delayed,
      guests(first_name, last_name, email, phone)
    `)
    .eq('restaurant_id', restaurantId)
    .eq('booking_date', date)
    .not('status', 'in', '("cancelled","no_show")')

  if (!bookings?.length) return []

  // Fetch table assignments for these bookings
  const bookingIds = bookings.map((b) => b.id)
  const { data: bookingTables } = await supabase
    .from('booking_tables')
    .select('booking_id, table_id')
    .in('booking_id', bookingIds)

  // Map table_ids onto each booking
  const tableMap = (bookingTables ?? []).reduce<Record<string, string[]>>(
    (acc, row) => {
      if (!acc[row.booking_id]) acc[row.booking_id] = []
      acc[row.booking_id].push(row.table_id)
      return acc
    },
    {}
  )

  return bookings.map((b) => ({
    ...(b as unknown as Omit<TimetableBooking, 'table_ids'>),
    table_ids: tableMap[b.id] ?? [],
  }))
}

export async function getDaySchedule(
  supabase: SupabaseClient,
  restaurantId: string,
  areaId: string,
  date: string
): Promise<DaySchedule> {
  const jsDay = new Date(date).getDay()
  const dbDay = jsDay === 0 ? 7 : jsDay

  const { data } = await supabase
    .from('weekly_schedules')
    .select('open_time, close_time, pause_from, pause_to')
    .eq('restaurant_id', restaurantId)
    .eq('service_area_id', areaId)
    .eq('day_of_week', dbDay)
    .eq('is_open', true)
    .single()

  return (data as DaySchedule | null) ?? FALLBACK_SCHEDULE
}