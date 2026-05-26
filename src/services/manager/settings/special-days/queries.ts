import type { SupabaseClient } from '@supabase/supabase-js'
import type { SpecialDay } from './types'

export async function getSpecialDays(
  supabase: SupabaseClient,
  restaurantId: string
): Promise<{ data: SpecialDay[]; error: string | null }> {
  const { data, error } = await supabase
    .from('special_days')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('date')

  if (error) return { data: [], error: error.message }
  return { data: data as unknown as SpecialDay[], error: null }
}

export async function createSpecialDay(
  supabase: SupabaseClient,
  payload: Omit<SpecialDay, 'id'>
): Promise<{ data: SpecialDay | null; error: string | null }> {
  const { data, error } = await supabase
    .from('special_days')
    .insert(payload)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { data: null, error: 'A special day already exists for this date.' }
    return { data: null, error: error.message }
  }
  return { data: data as unknown as SpecialDay, error: null }
}

export async function updateSpecialDay(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<Omit<SpecialDay, 'id' | 'restaurant_id'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('special_days')
    .update(payload)
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function deleteSpecialDay(
  supabase: SupabaseClient,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('special_days')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}
