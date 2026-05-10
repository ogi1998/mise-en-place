import { requireRestaurant } from '@/lib/require-restaurant'
import { getGuests } from '@/services/manager/guests/queries'
import GuestsShell from '@/components/manager/guests/GuestsShell'

export default async function GuestsPage() {
  const { supabase, restaurantId } = await requireRestaurant()
  const guests = await getGuests(supabase, restaurantId)

  return <GuestsShell initialGuests={guests} />
}