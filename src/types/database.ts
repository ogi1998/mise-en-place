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