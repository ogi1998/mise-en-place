import { requireRestaurant } from '@/lib/require-restaurant'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import WeeklyScheduleShell from '@/components/manager/settings/WeeklyScheduleShell'
import type { WeeklySchedule } from '@/services/manager/settings/weekly-schedule/types'

export default async function WeeklySchedulePage() {
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
  const { data: schedules } = await supabase
    .from('weekly_schedules')
    .select('*')
    .eq('service_area_id', firstAreaId)
    .order('day_of_week')

  return (
    <WeeklyScheduleShell
      areas={areas}
      initialAreaId={firstAreaId}
      initialSchedules={(schedules ?? []) as unknown as WeeklySchedule[]}
    />
  )
}