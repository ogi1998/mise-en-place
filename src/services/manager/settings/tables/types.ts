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
  is_active: boolean
  is_active_online: boolean
  created_at: string
  updated_at: string
}