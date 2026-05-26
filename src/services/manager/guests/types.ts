export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export type GuestListItem = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  allergens: string[] | null
  created_at: string
  last_visit: string | null
  total_visits: number
  loyalty_tier: LoyaltyTier | null
  lifetime_spend: number | null
  company: string | null
}

export type GuestProfile = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  allergens: string[] | null
  dietary_type: string | null
  company: string | null
  company_position: string | null
  company_tax_id: string | null
  loyalty_tier: LoyaltyTier | null
  lifetime_spend: number | null
  seating_preference: string | null
  birthday: string | null
  anniversary: string | null
  favourite_food: { notes?: string } | null
  favourite_wine: { notes?: string } | null
  internal_notes: string | null
  marketing_consent: boolean | null
  created_at: string
}

export type GuestBookingItem = {
  id: string
  booking_number: string
  booking_date: string
  start_time: string
  party_size: number
  status: string
  spend_amount: number | null
  service_area_name: string | null
}