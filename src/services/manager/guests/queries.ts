import type { SupabaseClient } from '@supabase/supabase-js'
import type { GuestListItem } from './types'

export async function getGuests(
  supabase: SupabaseClient,
  restaurantId: string
): Promise<GuestListItem[]> {
  const { data } = await supabase
    .from('guests')
    .select(`
      id, first_name, last_name, email, phone, allergens, created_at,
      bookings!inner(booking_date, restaurant_id)
    `)
    .eq('bookings.restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (!data?.length) return []

  return data.map(g => {
    const bookingDates = (g.bookings as { booking_date: string }[])
      .map(b => b.booking_date)
      .sort()
      .reverse()

    return {
      id: g.id,
      first_name: g.first_name,
      last_name: g.last_name,
      email: g.email,
      phone: g.phone,
      allergens: g.allergens,
      created_at: g.created_at,
      last_visit: bookingDates[0] ?? null,
      total_visits: bookingDates.length,
    }
  })
}