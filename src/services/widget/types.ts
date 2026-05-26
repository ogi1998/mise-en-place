export type SlotGenerationParams = {
  date: string
  partySize: number
  restaurantId: string
  serviceAreaId: string
}

export type WidgetRestaurant = {
  id: string
  name: string
  slug: string
  available_languages: string[] | null
  default_language: string | null
}

export type WidgetServiceArea = {
  id: string
  name: string
}

export type BookingPayload = {
  restaurant_id: string
  service_area_id: string
  guest_id: string | null
  party_size: number
  booking_date: string
  start_time: string
  end_time: string
  notes: string | null
  allergens: string[]
  status: 'pending'
  source: 'online'
}

export type GuestPayload = {
  first_name: string
  last_name: string
  email: string
  phone: string
}

export type WidgetEvent = {
  id: string
  name: string
  date: string
  time_start: string
  time_end: string
  capacity: number | null
  cover_image: string | null
}