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

export type TableShape = 'rectangle' | 'circle' | 'square' | 'oval'

export type Table = {
  id: string
  restaurant_id: string
  service_area_id: string
  name: string
  nickname: string | null
  shape: TableShape
  sort_order: number
  min_seats: number
  seats: number
  max_seats: number
  allow_multi: boolean
  disabled: boolean
  disabled_online: boolean
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

export type ServiceAreaFormData = {
  name: string
  description: string
  is_indoor: boolean
  is_active: boolean
  sort_order: number
}

export type TableFormData = {
  name: string
  nickname: string
  shape: TableShape
  sort_order: number
  min_seats: number
  seats: number
  max_seats: number
  allow_multi: boolean
  disabled: boolean
  disabled_online: boolean
}

export type AreaLockPeriodFormData = {
  name: string
  start_date: string
  end_date: string
  reason: string
}