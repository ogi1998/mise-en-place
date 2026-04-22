import type { SupabaseClient } from '@supabase/supabase-js'
import type { WeeklySchedule } from './types'

export async function getScheduleForArea(
  supabase: SupabaseClient,
  serviceAreaId: string
): Promise<{ data: WeeklySchedule[]; error: string | null }> {
  const { data, error } = await supabase
    .from('weekly_schedules')
    .select('*')
    .eq('service_area_id', serviceAreaId)
    .order('day_of_week')

  if (error) return { data: [], error: error.message }
  return { data: (data as unknown) as WeeklySchedule[], error: null }
}

export async function updateDaySchedule(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<Omit<WeeklySchedule, 'id' | 'restaurant_id' | 'service_area_id'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('weekly_schedules')
    .update(payload)
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}