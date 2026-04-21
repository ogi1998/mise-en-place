import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTimetableAreas, getTimetableBookings, getDaySchedule, getTimetableTables } from '@/services/timetable/queries'
import TimetableShell from '@/components/manager/timetable/TimetableShell'

export default async function TimetablePage() {
  const supabase = await createSupabaseServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .single()

  const restaurantId = profile?.restaurant_id
  if (!restaurantId) return null

  const todayDate = new Date().toISOString().split('T')[0]

  const areas = await getTimetableAreas(supabase, restaurantId)
  const firstAreaId = areas[0]?.id ?? null

  const [bookings, tables, schedule] = firstAreaId
    ? await Promise.all([
        getTimetableBookings(supabase, restaurantId, todayDate),
        getTimetableTables(supabase, restaurantId, firstAreaId),
        getDaySchedule(supabase, restaurantId, firstAreaId, todayDate),
      ])
    : [[], [], null]

  return (
    <TimetableShell
      restaurantId={restaurantId}
      initialDate={todayDate}
      initialAreas={areas}
      initialTables={tables}
      initialBookings={bookings}
      initialSchedule={schedule}
      initialAreaId={firstAreaId}
    />
  )
}