import type { SupabaseClient } from '@supabase/supabase-js'
import type { GeneralSettings } from './types'

export async function getGeneralSettings(
  supabase: SupabaseClient,
  restaurantId: string
): Promise<{ data: GeneralSettings | null; error: string | null }> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('time_format, week_start, hide_closed_days, available_languages, default_language, timezone, currency')
    .eq('id', restaurantId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as unknown as GeneralSettings, error: null }
}

export async function updateGeneralSettings(
  supabase: SupabaseClient,
  restaurantId: string,
  payload: Omit<GeneralSettings, never>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('restaurants')
    .update(payload)
    .eq('id', restaurantId)

  if (error) return { error: error.message }
  return { error: null }
}
