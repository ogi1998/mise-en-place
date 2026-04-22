import { requireRestaurant } from '@/lib/require-restaurant';
import { getFloorPlanTables, getFloorPlanBookings } from '@/services/manager/floor-plan/queries';
import { getTimetableAreas } from '@/services/manager/timetable/queries';
import FloorPlanShell from '@/components/manager/floor-plan/FloorPlanShell';

export default async function FloorPlanPage() {
  const { supabase, restaurantId } = await requireRestaurant();

  const todayDate = new Date().toISOString().split('T')[0];

  const areas = await getTimetableAreas(supabase, restaurantId);
  const firstAreaId = areas[0]?.id ?? null;

  const [tables, bookings] = firstAreaId
    ? await Promise.all([
        getFloorPlanTables(supabase, restaurantId, firstAreaId),
        getFloorPlanBookings(supabase, restaurantId, todayDate)
      ])
    : [[], []];

  return (
    <FloorPlanShell
      restaurantId={restaurantId}
      initialAreas={areas}
      initialTables={tables}
      initialBookings={bookings}
      initialAreaId={firstAreaId}
    />
  );
}