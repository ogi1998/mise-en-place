import type { SupabaseClient } from '@supabase/supabase-js'
import type { GuestListItem, GuestProfile, GuestBookingItem } from './types'

export async function getGuests(
  supabase: SupabaseClient,
  restaurantId: string
): Promise<GuestListItem[]> {
  const { data } = await supabase
    .from('guests')
    .select(`
      id, first_name, last_name, email, phone, allergens, created_at,
      loyalty_tier, company,
      bookings!inner(booking_date, restaurant_id, spend_amount)
    `)
    .eq('bookings.restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (!data?.length) return []

  return data.map(g => {
    const bs = g.bookings as { booking_date: string; spend_amount: number | null }[]
    const bookingDates = bs.map(b => b.booking_date).sort().reverse()
    const totalSpend = bs.reduce((sum, b) => sum + (b.spend_amount ?? 0), 0)

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
      loyalty_tier: g.loyalty_tier ?? null,
      lifetime_spend: totalSpend > 0 ? totalSpend : null,
      company: g.company ?? null,
    }
  })
}

export async function getGuestProfile(
  supabase: SupabaseClient,
  guestId: string
): Promise<GuestProfile | null> {
  const { data, error } = await supabase
    .from('guests')
    .select(`
      id, first_name, last_name, email, phone, allergens, dietary_type,
      company, company_position, company_tax_id, loyalty_tier, lifetime_spend,
      seating_preference, birthday, anniversary, favourite_food, favourite_wine,
      internal_notes, marketing_consent, created_at
    `)
    .eq('id', guestId)
    .single()

  if (error || !data) return null
  return data as unknown as GuestProfile
}

export async function getGuestBookingHistory(
  supabase: SupabaseClient,
  guestId: string,
  restaurantId: string
): Promise<GuestBookingItem[]> {
  const { data } = await supabase
    .from('bookings')
    .select(`
      id, booking_number, booking_date, start_time, party_size, status, spend_amount,
      service_areas(name)
    `)
    .eq('guest_id', guestId)
    .eq('restaurant_id', restaurantId)
    .order('booking_date', { ascending: false })
    .limit(30)

  if (!data?.length) return []

  return data.map(b => ({
    id: b.id,
    booking_number: b.booking_number,
    booking_date: b.booking_date,
    start_time: b.start_time,
    party_size: b.party_size,
    status: b.status,
    spend_amount: b.spend_amount,
    service_area_name: (b.service_areas as unknown as { name: string } | null)?.name ?? null,
  }))
}

export async function updateGuest(
  supabase: SupabaseClient,
  guestId: string,
  payload: Partial<GuestProfile>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('guests')
    .update(payload)
    .eq('id', guestId)

  if (error) return { error: error.message }
  return { error: null }
}
