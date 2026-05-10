export type GuestListItem = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  allergens: string[] | null
  created_at: string
  last_visit: string | null
  total_visits: number
}