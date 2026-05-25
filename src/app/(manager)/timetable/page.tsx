import { requireRestaurant } from '@/lib/require-restaurant';
import {
  getTimetableAreas,
  getTimetableBookings,
  getDaySchedule,
  getTimetableTables
} from '@/services/manager/timetable/queries';
import { getEventsForDate } from '@/services/manager/events/queries';
import TimetableShell from '@/components/manager/timetable/TimetableShell';
import { FALLBACK_SCHEDULE } from '@/services/manager/timetable/types';

type Props = { searchParams: Promise<{ date?: string }> }

export default async function TimetablePage({ searchParams }: Props) {
  const { supabase, restaurantId } = await requireRestaurant();
  const { date: dateParam } = await searchParams
  const todayDate = new Date().toISOString().split('T')[0]
  const initialDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayDate

  const areas = await getTimetableAreas(supabase, restaurantId);
  const [bookings, initialEvents] = await Promise.all([
    areas.length ? getTimetableBookings(supabase, restaurantId, initialDate) : Promise.resolve([]),
    getEventsForDate(supabase, restaurantId, initialDate),
  ]);

  const initialAreaData = await Promise.all(
    areas.map(async area => {
      const [tables, schedule] = await Promise.all([
        getTimetableTables(supabase, restaurantId, area.id),
        getDaySchedule(supabase, restaurantId, area.id, initialDate),
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
      initialDate={initialDate}
      initialAreas={areas}
      initialAreaData={initialAreaData}
      initialBookings={bookings}
      initialEvents={initialEvents}
    />
  );
}