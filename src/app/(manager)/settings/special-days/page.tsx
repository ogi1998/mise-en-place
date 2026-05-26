import { requireRestaurant } from '@/lib/require-restaurant'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import SpecialDaysShell from '@/components/manager/settings/SpecialDaysShell'
import type { SpecialDay } from '@/services/manager/settings/special-days/types'

export default async function SpecialDaysPage() {
  const { restaurantId } = await requireRestaurant()
  const supabase = await createSupabaseServerClient()

  const [{ data: days }, { data: areas }] = await Promise.all([
    supabase
      .from('special_days')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('date'),
    supabase
      .from('service_areas')
      .select('id, name')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('sort_order'),
  ])

  return (
    <SpecialDaysShell
      initialDays={(days ?? []) as unknown as SpecialDay[]}
      restaurantId={restaurantId}
      serviceAreas={areas ?? []}
    />
  )
}
