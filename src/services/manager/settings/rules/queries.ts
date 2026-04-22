import type { SupabaseClient } from '@supabase/supabase-js'
import type { BookingRules } from './types'

export async function getRulesForArea(
  supabase: SupabaseClient,
  serviceAreaId: string
): Promise<{ data: BookingRules | null; error: string | null }> {
  const { data, error } = await supabase
    .from('booking_rules')
    .select('*')
    .eq('service_area_id', serviceAreaId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as unknown as BookingRules, error: null }
}

export async function updateRules(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<Omit<BookingRules, 'id' | 'restaurant_id' | 'service_area_id'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('booking_rules')
    .update(payload)
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}