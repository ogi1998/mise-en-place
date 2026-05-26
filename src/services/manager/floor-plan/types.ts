import type { BookingStatus } from '@/types/database'

export type FloorPlanTable = {
  id: string
  name: string
  nickname: string | null
  shape: 'circle' | 'rectangle' | 'square'
  min_seats: number
  seats: number
  max_seats: number
  sort_order: number
  floor_plan_x: number | null
  floor_plan_y: number | null
  floor_plan_rotation: number | null
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
  spend_amount: number | null
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