import { requireRestaurant } from '@/lib/require-restaurant'
import { getGuests } from '@/services/manager/guests/queries'
import GuestsShell from '@/components/manager/guests/GuestsShell'

export default async function GuestsPage() {
  const { supabase, restaurantId } = await requireRestaurant()

  const [guests, restaurantRow] = await Promise.all([
    getGuests(supabase, restaurantId),
    supabase.from('restaurants').select('currency').eq('id', restaurantId).single(),
  ])

  const currency = (restaurantRow.data?.currency as string | null) ?? 'EUR'

  return <GuestsShell initialGuests={guests} restaurantId={restaurantId} currency={currency} />
}