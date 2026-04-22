import type { BookingStatus } from '@/types/database'

export type FloorPlanTable = {
  id: string
  name: string
  nickname: string | null
  min_seats: number
  seats: number
  max_seats: number
  sort_order: number
}

export type FloorPlanBooking = {
  id: string
  booking_number: number
  status: BookingStatus
  party_size: number
  start_time: string
  end_time: string
  notes: string | null
  internal_notes: string | null
  is_delayed: boolean
  table_ids: string[]
  guests: {
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
  } | null
}

export type TableStatus = 'empty' | 'upcoming' | 'seated' | 'delayed'

export type TableWithStatus = FloorPlanTable & {
  status: TableStatus
  currentBooking: FloorPlanBooking | null
}