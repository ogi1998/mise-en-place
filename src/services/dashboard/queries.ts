import type { SupabaseClient } from '@supabase/supabase-js'
import type { BookingWithJoins } from './types'

const BOOKING_SELECT = `
  id, booking_number, status, party_size, start_time, end_time, notes,
  guests(first_name, last_name),
  service_areas(name)
`

export async function getTodayBookings(
  supabase: SupabaseClient,
  restaurantId: string,
  todayDate: string
): Promise<BookingWithJoins[]> {
  const { data } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('restaurant_id', restaurantId)
    .eq('booking_date', todayDate)
    .not('status', 'in', '("cancelled","no_show")')
    .order('start_time', { ascending: true })

  return (data ?? []) as unknown as BookingWithJoins[]
}

export async function getUpcomingBookings(
  supabase: SupabaseClient,
  restaurantId: string,
  from: string,
  to: string
): Promise<BookingWithJoins[]> {
  const { data } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('restaurant_id', restaurantId)
    .gte('booking_date', from)
    .lte('booking_date', to)
    .not('status', 'in', '("cancelled","no_show")')
    .order('start_time', { ascending: true })
    .limit(8)

  return (data ?? []) as unknown as BookingWithJoins[]
}

export async function getCancellationCount(
  supabase: SupabaseClient,
  restaurantId: string,
  todayDate: string
): Promise<number> {
  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)
    .eq('booking_date', todayDate)
    .in('status', ['cancelled', 'no_show'])

  return count ?? 0
}