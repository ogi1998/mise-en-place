import type { BookingStatus } from '@/types/database'

export type TimetableArea = {
  id: string
  name: string
}

export type TimetableTable = {
  id: string
  name: string
  nickname: string | null
  min_seats: number
  seats: number
  max_seats: number
  sort_order: number
}

export type TimetableBooking = {
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

export type DaySchedule = {
  open_time: string
  close_time: string
  pause_from: string | null
  pause_to: string | null
}

export const FALLBACK_SCHEDULE: DaySchedule = {
  open_time: '10:00',
  close_time: '23:00',
  pause_from: null,
  pause_to: null,
}