import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getFloorPlanTables, getFloorPlanBookings } from '@/services/floor-plan/queries'
import { getTimetableAreas } from '@/services/timetable/queries'
import FloorPlanShell from '@/components/manager/floor-plan/FloorPlanShell'

export default async function FloorPlanPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .eq('id', user!.id)
    .single()

  const restaurantId = profile?.restaurant_id
  if (!restaurantId) return null

  const todayDate = new Date().toISOString().split('T')[0]

  const areas = await getTimetableAreas(supabase, restaurantId)
  const firstAreaId = areas[0]?.id ?? null

  const [tables, bookings] = firstAreaId
    ? await Promise.all([
        getFloorPlanTables(supabase, restaurantId, firstAreaId),
        getFloorPlanBookings(supabase, restaurantId, todayDate),
      ])
    : [[], []]

  return (
    <FloorPlanShell
      restaurantId={restaurantId}
      initialAreas={areas}
      initialTables={tables}
      initialBookings={bookings}
      initialAreaId={firstAreaId}
    />
  )
}