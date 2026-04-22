export type BookingWithJoins = {
  id: string
  booking_number: number
  status: string
  party_size: number
  start_time: string
  end_time: string
  notes: string | null
  guests: { first_name: string; last_name: string } | null
  service_areas: { name: string } | null
}