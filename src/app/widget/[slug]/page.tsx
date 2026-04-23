import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getRestaurantBySlug, getActiveServiceAreas } from '@/services/widget/queries'
import BookingWidget from '@/components/widget/BookingWidget'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function WidgetPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const restaurant = await getRestaurantBySlug(supabase, slug)
  if (!restaurant) notFound()

  const serviceAreas = await getActiveServiceAreas(supabase, restaurant.id)

  return (
    <BookingWidget
      restaurantId={restaurant.id}
      restaurantName={restaurant.name}
      serviceAreas={serviceAreas}
    />
  )
}