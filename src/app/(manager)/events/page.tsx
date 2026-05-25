import { requireRestaurant } from '@/lib/require-restaurant'
import { getEvents } from '@/services/manager/events/queries'
import { getServiceAreas } from '@/services/manager/settings/service-areas/queries'
import EventsShell from '@/components/manager/events/EventsShell'

export default async function EventsPage() {
  const { supabase, restaurantId } = await requireRestaurant()
  const [events, areas] = await Promise.all([
    getEvents(supabase, restaurantId),
    getServiceAreas(supabase, restaurantId),
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <EventsShell initialEvents={events} restaurantId={restaurantId} areas={areas} />
    </div>
  )
}
