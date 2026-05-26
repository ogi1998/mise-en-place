import { requireRestaurant } from '@/lib/require-restaurant'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import GeneralShell from '@/components/manager/settings/GeneralShell'
import type { GeneralSettings } from '@/services/manager/settings/general/types'

export default async function GeneralPage() {
  const { restaurantId } = await requireRestaurant()
  const supabase = await createSupabaseServerClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('time_format, week_start, hide_closed_days, available_languages, default_language, timezone, currency, bank_iban, bank_name, bank_bic, bank_account_holder, vouchers_enabled')
    .eq('id', restaurantId)
    .single()

  const r = restaurant as any
  const initialSettings: GeneralSettings = {
    time_format: r?.time_format ?? null,
    week_start: r?.week_start ?? null,
    hide_closed_days: r?.hide_closed_days ?? null,
    available_languages: r?.available_languages ?? null,
    default_language: r?.default_language ?? null,
    timezone: r?.timezone ?? null,
    currency: r?.currency ?? null,
    bank_iban: r?.bank_iban ?? null,
    bank_name: r?.bank_name ?? null,
    bank_bic: r?.bank_bic ?? null,
    bank_account_holder: r?.bank_account_holder ?? null,
    vouchers_enabled: r?.vouchers_enabled ?? false,
  }

  return (
    <GeneralShell
      restaurantId={restaurantId}
      initialSettings={initialSettings}
    />
  )
}
