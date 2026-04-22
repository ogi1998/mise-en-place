import { requireRestaurant } from '@/lib/require-restaurant'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import RulesShell from '@/components/manager/settings/RulesShell'
import type { BookingRules } from '@/services/manager/settings/rules/types'

export default async function RulesPage() {
  const { restaurantId } = await requireRestaurant()
  const supabase = await createSupabaseServerClient()

  const { data: areas } = await supabase
    .from('service_areas')
    .select('id, name')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('sort_order')

  if (!areas || areas.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-[#7a7060]">No service areas found. Create a service area first.</p>
      </div>
    )
  }

  const firstAreaId = areas[0].id
  const { data: rules } = await supabase
    .from('booking_rules')
    .select('*')
    .eq('service_area_id', firstAreaId)
    .single()

  if (!rules) {
    return (
      <div className="p-6">
        <p className="text-sm text-[#7a7060]">No rules found for this area</p>
      </div>
    )
  }

  return (
    <RulesShell
      areas={areas}
      initialAreaId={firstAreaId}
      initialRules={rules as unknown as BookingRules}
    />
  )
}