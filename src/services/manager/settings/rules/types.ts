export type BookingRules = {
  id: string
  restaurant_id: string
  service_area_id: string
  min_guests: number
  max_guests_online: number
  default_guests: number
  booking_duration: number
  buffer_time: number
  min_time_before_slot: number
  booking_before_closing: number
  future_booking_window: number
  delay_validity: number
  cancellation_window_days: number
  cancellation_window_hours: number
  waitlist_enabled: boolean
  waitlist_confirmation_window: number
  reminder_intervals: number[]
  thank_you_email: boolean
}