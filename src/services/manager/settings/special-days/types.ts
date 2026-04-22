export type SpecialDayType = 'closed' | 'open' | 'modified'

export type SpecialDay = {
  id: string
  restaurant_id: string
  service_area_id: string | null
  name: string
  date: string
  type: SpecialDayType
  open_time: string | null
  close_time: string | null
  pause_from: string | null
  pause_to: string | null
  slot_interval: number | null
  is_recurring: boolean
}