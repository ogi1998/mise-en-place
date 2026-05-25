import type { SupabaseClient } from '@supabase/supabase-js'

export type DayCount = { bookings: number; covers: number }

export async function getMonthBookingCounts(
  supabase: SupabaseClient,
  restaurantId: string,
  year: number,
  month: number
): Promise<Record<string, DayCount>> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data } = await supabase
    .from('bookings')
    .select('booking_date, party_size')
    .eq('restaurant_id', restaurantId)
    .gte('booking_date', from)
    .lte('booking_date', to)
    .not('status', 'in', '("cancelled","no_show")')

  const result: Record<string, DayCount> = {}
  for (const row of data ?? []) {
    if (!result[row.booking_date]) result[row.booking_date] = { bookings: 0, covers: 0 }
    result[row.booking_date].bookings++
    result[row.booking_date].covers += row.party_size
  }
  return result
}
