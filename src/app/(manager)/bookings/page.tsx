import { requireRestaurant } from '@/lib/require-restaurant'
import { getBookingsForDate } from '@/services/manager/bookings/queries'
import BookingsShell from '@/components/manager/bookings/BookingsShell'

export default async function BookingsPage() {
  const { supabase, restaurantId } = await requireRestaurant()
  const todayDate = new Date().toISOString().split('T')[0]

  const bookings = await getBookingsForDate(supabase, restaurantId, todayDate)

  return (
    <BookingsShell
      restaurantId={restaurantId}
      initialDate={todayDate}
      initialBookings={bookings}
    />
  )
}