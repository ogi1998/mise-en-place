import { requireRestaurant } from '@/lib/require-restaurant'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import SpecialDaysShell from '@/components/manager/settings/SpecialDaysShell'
import type { SpecialDay } from '@/services/manager/settings/special-days/types'

export default async function SpecialDaysPage() {
  const { restaurantId } = await requireRestaurant()
  const supabase = await createSupabaseServerClient()

  const { data: days } = await supabase
    .from('special_days')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .is('service_area_id', null)
    .order('date')

  return (
    <SpecialDaysShell
      initialDays={(days ?? []) as unknown as SpecialDay[]}
      restaurantId={restaurantId}
    />
  )
}