'use client'

import dynamic from 'next/dynamic'
import type { WidgetServiceArea, WidgetEvent } from '@/services/widget/types'

const BookingWidget = dynamic(() => import('./BookingWidget'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#f7f5f2] flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="h-10 w-48 bg-[#e8e4dc] rounded-lg mx-auto mb-8 animate-pulse" />
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e4dc] h-64 animate-pulse" />
      </div>
    </div>
  ),
})

type Props = {
  restaurantId: string
  restaurantName: string
  serviceAreas: WidgetServiceArea[]
  events: WidgetEvent[]
}

export default function BookingWidgetLoader(props: Props) {
  return <BookingWidget {...props} />
}
