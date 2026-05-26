'use client'

import { CheckCircle } from 'lucide-react'
import type { BookingState } from '../BookingWidget'
import type { WidgetTranslations } from '@/lib/widget-translations'

type Props = {
  booking: BookingState
  restaurantName: string
  t: WidgetTranslations
}

export default function StepConfirmation({ booking, restaurantName, t }: Props) {
  const [d, m, y] = booking.date.split('-')
  const formattedDate = `${d}.${m}.${y}`

  return (
    <div className="p-6 text-center space-y-5">
      <div className="flex justify-center">
        <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
          {t.confirm_title}
        </h2>
        <p className="text-sm text-[#7a7060] mt-1">
          {t.confirm_subtitle(restaurantName)}
        </p>
      </div>

      <div className="bg-[#f7f5f2] rounded-xl p-4 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#7a7060]">{t.confirm_name}</span>
          <span className="text-[#1a1a18] font-medium">{booking.firstName} {booking.lastName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#7a7060]">{t.confirm_date}</span>
          <span className="text-[#1a1a18] font-medium">{formattedDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#7a7060]">{t.confirm_time}</span>
          <span className="text-[#1a1a18] font-medium">{booking.slot}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#7a7060]">{t.confirm_guests}</span>
          <span className="text-[#1a1a18] font-medium">{booking.partySize}</span>
        </div>
        {booking.notes && (
          <div className="flex justify-between text-sm">
            <span className="text-[#7a7060]">{t.confirm_requests}</span>
            <span className="text-[#1a1a18] font-medium">{booking.notes}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-[#a09880]">
        {t.confirm_footer(booking.email)}
      </p>
    </div>
  )
}
