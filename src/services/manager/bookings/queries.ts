import type { SupabaseClient } from '@supabase/supabase-js'
import type { BookingListItem } from './types'

export async function getBookingsForDate(
  supabase: SupabaseClient,
  restaurantId: string,
  date: string
): Promise<BookingListItem[]> {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id, booking_number, status, source, party_size,
      booking_date, start_time, end_time, notes, internal_notes,
      is_delayed, spend_amount, allergens,
      service_areas(id, name),
      guests(first_name, last_name, email, phone)
    `)
    .eq('restaurant_id', restaurantId)
    .eq('booking_date', date)
    .order('start_time')

  if (error) console.error('[getBookingsForDate]', error)
  if (!bookings?.length) return []

  const bookingIds = bookings.map(b => b.id)
  const { data: bookingTables } = await supabase
    .from('booking_tables')
    .select('booking_id, table_id')
    .in('booking_id', bookingIds)

  const tableMap = (bookingTables ?? []).reduce<Record<string, string[]>>((acc, row) => {
    if (!acc[row.booking_id]) acc[row.booking_id] = []
    acc[row.booking_id].push(row.table_id)
    return acc
  }, {})

  return bookings.map(b => ({
    ...(b as unknown as Omit<BookingListItem, 'table_ids' | 'service_area'>),
    service_area: (b.service_areas as unknown as { id: string; name: string } | null),
    table_ids: tableMap[b.id] ?? [],
  }))
}