import { requireRestaurant } from '@/lib/require-restaurant'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import GeneralShell from '@/components/manager/settings/GeneralShell'
import type { GeneralSettings } from '@/services/manager/settings/general/types'

export default async function GeneralPage() {
  const { restaurantId } = await requireRestaurant()
  const supabase = await createSupabaseServerClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('time_format, week_start, hide_closed_days, available_languages, default_language, timezone, currency')
    .eq('id', restaurantId)
    .single()

  const initialSettings: GeneralSettings = {
    time_format: (restaurant as any)?.time_format ?? null,
    week_start: (restaurant as any)?.week_start ?? null,
    hide_closed_days: (restaurant as any)?.hide_closed_days ?? null,
    available_languages: (restaurant as any)?.available_languages ?? null,
    default_language: (restaurant as any)?.default_language ?? null,
    timezone: restaurant?.timezone ?? null,
    currency: (restaurant as any)?.currency ?? null,
  }

  return (
    <GeneralShell
      restaurantId={restaurantId}
      initialSettings={initialSettings}
    />
  )
}
