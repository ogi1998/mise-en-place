export type Event = {
  id: string
  restaurant_id: string
  name: string
  cover_image: string | null
  date: string
  time_start: string
  time_end: string
  capacity: number | null
  is_public: boolean
  locked_area_ids: string[]
  created_at: string
  updated_at: string
}
