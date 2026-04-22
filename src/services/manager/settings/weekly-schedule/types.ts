export type WeeklySchedule = {
  id: string
  restaurant_id: string
  service_area_id: string
  day_of_week: number // 1=Mon, 7=Sun
  is_open: boolean
  open_time: string | null
  close_time: string | null
  pause_from: string | null
  pause_to: string | null
  slot_interval: number
}