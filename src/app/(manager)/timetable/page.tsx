import { requireRestaurant } from '@/lib/require-restaurant';
import {
  getTimetableAreas,
  getTimetableBookings,
  getDaySchedule,
  getTimetableTables
} from '@/services/manager/timetable/queries';
import TimetableShell from '@/components/manager/timetable/TimetableShell';
import { FALLBACK_SCHEDULE } from '@/services/manager/timetable/types';

export default async function TimetablePage() {
  const { supabase, restaurantId } = await requireRestaurant();
  const todayDate = new Date().toISOString().split('T')[0];

  const areas = await getTimetableAreas(supabase, restaurantId);
  const bookings = areas.length
    ? await getTimetableBookings(supabase, restaurantId, todayDate)
    : [];

  const initialAreaData = await Promise.all(
    areas.map(async area => {
      const [tables, schedule] = await Promise.all([
        getTimetableTables(supabase, restaurantId, area.id),
        getDaySchedule(supabase, restaurantId, area.id, todayDate),
      ]);
      return {
        area,
        tables,
        schedule: schedule ?? FALLBACK_SCHEDULE,
      };
    })
  );

  return (
    <TimetableShell
      restaurantId={restaurantId}
      initialDate={todayDate}
      initialAreas={areas}
      initialAreaData={initialAreaData}
      initialBookings={bookings}
    />
  );
}