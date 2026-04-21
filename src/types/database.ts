export type UserRole = 'manager' | 'superadmin'

export interface Restaurant {
  id: string
  name: string
  slug: string
  timezone: string
  locale: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string
  logo_url: string | null
  cover_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  restaurant_id: string
  role: UserRole
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProfileWithRestaurant = {
  first_name: string
  last_name: string
  restaurant: { name: string } | null
}

export type BookingStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show'
export type BookingSource = 'online' | 'walk_in' | 'phone' | 'manual'

export interface Booking {
  id: string
  restaurant_id: string
  service_area_id: string
  guest_id: string | null
  booking_number: number
  status: BookingStatus
  source: BookingSource
  party_size: number
  booking_date: string
  start_time: string
  end_time: string
  notes: string | null
  internal_notes: string | null
  allergens: string[] | null
  is_delayed: boolean
  created_at: string
  updated_at: string
}