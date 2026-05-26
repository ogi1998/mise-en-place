import type { BookingStatus, BookingSource } from '@/types/database'

export type BookingListItem = {
  id: string
  booking_number: number
  status: BookingStatus
  source: BookingSource
  party_size: number
  booking_date: string
  start_time: string
  end_time: string
  notes: string | null
  internal_notes: string | null
  is_delayed: boolean
  spend_amount: number | null
  allergens: string[] | null
  table_ids: string[]
  service_area: { id: string; name: string } | null
  guests: {
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
  } | null
}