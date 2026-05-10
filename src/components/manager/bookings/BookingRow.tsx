'use client'

import type { BookingListItem } from '@/services/manager/bookings/types'
import { STATUS_LABELS, STATUS_COLORS, formatTime } from '@/services/manager/bookings/utils'

type Props = {
  booking: BookingListItem
  onClick: () => void
}

export default function BookingRow({ booking, onClick }: Props) {
  const guestName = booking.guests
    ? `${booking.guests.first_name} ${booking.guests.last_name}`
    : 'Walk-in'

  return (
    <tr
      onClick={onClick}
      className="border-b border-[#e8e4dc] last:border-0 cursor-pointer hover:bg-[#faf9f6] transition-colors"
    >
      <td className="px-4 py-3 text-xs text-[#a09880] font-mono">
        #{String(booking.booking_number).padStart(4, '0')}
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-[#1a1a18]">{guestName}</p>
        {booking.guests?.email && (
          <p className="text-xs text-[#a09880]">{booking.guests.email}</p>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-[#3a3528] tabular-nums">
        {formatTime(booking.start_time)}
      </td>
      <td className="px-4 py-3 text-sm text-[#3a3528]">
        {booking.party_size}
      </td>
      <td className="px-4 py-3 text-sm text-[#3a3528]">
        {booking.service_area?.name ?? '—'}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[booking.status]}`}>
          {STATUS_LABELS[booking.status]}
        </span>
      </td>
    </tr>
  )
}