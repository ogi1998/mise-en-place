'use client'

import { CheckCircle } from 'lucide-react'
import type { BookingState } from '../BookingWidget'

type Props = {
  booking: BookingState
  restaurantName: string
}

export default function StepConfirmation({ booking, restaurantName }: Props) {
  const [d, m, y] = booking.date.split('-')
  const formattedDate = `${d}.${m}.${y}`

  return (
    <div className="p-6 text-center space-y-5">
      <div className="flex justify-center">
        <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Booking confirmed!
        </h2>
        <p className="text-sm text-[#7a7060] mt-1">
          We look forward to welcoming you at {restaurantName}.
        </p>
      </div>

      <div className="bg-[#f7f5f2] rounded-xl p-4 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#7a7060]">Name</span>
          <span className="text-[#1a1a18] font-medium">{booking.firstName} {booking.lastName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#7a7060]">Date</span>
          <span className="text-[#1a1a18] font-medium">{formattedDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#7a7060]">Time</span>
          <span className="text-[#1a1a18] font-medium">{booking.slot}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#7a7060]">Guests</span>
          <span className="text-[#1a1a18] font-medium">{booking.partySize}</span>
        </div>
        {booking.notes && (
          <div className="flex justify-between text-sm">
            <span className="text-[#7a7060]">Requests</span>
            <span className="text-[#1a1a18] font-medium">{booking.notes}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-[#a09880]">
        A confirmation will be sent to {booking.email} once the restaurant reviews your booking.
      </p>
    </div>
  )
}