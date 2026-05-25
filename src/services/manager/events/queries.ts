import type { SupabaseClient } from '@supabase/supabase-js'
import type { Event } from './types'

const SELECT = 'id, restaurant_id, name, cover_image, date, time_start, time_end, capacity, is_public, locked_area_ids, created_at, updated_at'

export async function getEvents(
  supabase: SupabaseClient,
  restaurantId: string
): Promise<Event[]> {
  const { data } = await supabase
    .from('events')
    .select(SELECT)
    .eq('restaurant_id', restaurantId)
    .order('date', { ascending: true })
    .order('time_start', { ascending: true })

  return (data ?? []) as Event[]
}

export async function getEventsForDate(
  supabase: SupabaseClient,
  restaurantId: string,
  date: string
): Promise<Event[]> {
  const { data } = await supabase
    .from('events')
    .select(SELECT)
    .eq('restaurant_id', restaurantId)
    .eq('date', date)
    .order('time_start', { ascending: true })

  return (data ?? []) as Event[]
}

export async function getMonthEvents(
  supabase: SupabaseClient,
  restaurantId: string,
  year: number,
  month: number
): Promise<string[]> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data } = await supabase
    .from('events')
    .select('date')
    .eq('restaurant_id', restaurantId)
    .gte('date', from)
    .lte('date', to)

  return (data ?? []).map(r => r.date as string)
}

export async function createEvent(
  supabase: SupabaseClient,
  restaurantId: string,
  payload: Omit<Event, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>
): Promise<{ data: Event | null; error: string | null }> {
  const { data, error } = await supabase
    .from('events')
    .insert({ ...payload, restaurant_id: restaurantId })
    .select(SELECT)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Event, error: null }
}

export async function updateEvent(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<Omit<Event, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function deleteEvent(
  supabase: SupabaseClient,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}
