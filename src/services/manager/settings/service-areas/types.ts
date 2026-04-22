export type ServiceArea = {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  is_indoor: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
export type AreaLockPeriod = {
  id: string
  restaurant_id: string
  service_area_id: string
  name: string | null
  start_date: string
  end_date: string
  reason: string | null
  created_at: string
  updated_at: string
}