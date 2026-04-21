'use client'

import { useState } from 'react'
import type { TimetableBooking } from '@/services/timetable/types'
import { bufferTailWidth, isoToHHMM } from '@/services/timetable/utils'
import { ROW_HEIGHT } from '@/services/timetable/utils'

type BookingBlockProps = {
  booking: TimetableBooking
  left: number
  width: number
  onClick: () => void
}

function blockColors(status: string) {
  switch (status) {
    case 'confirmed': return { bg: '#d4e8d0', border: '#5a9e6f', text: '#1a4028' }
    case 'pending':   return { bg: '#fdf0d5', border: '#c9a96e', text: '#5c3d0a' }
    case 'seated':    return { bg: '#d0e4f7', border: '#5a8fbf', text: '#0a2a4a' }
    case 'completed': return { bg: '#e8e8e8', border: '#999',    text: '#444'    }
    default:          return { bg: '#f0ece4', border: '#ccc',    text: '#666'    }
  }
}

export default function BookingBlock({
  booking,
  left,
  width,
  onClick,
}: BookingBlockProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const colors = blockColors(booking.status)
  const tailWidth = bufferTailWidth()
  const mainWidth = Math.max(0, width - tailWidth)

  const guestName = booking.guests
    ? `${booking.guests.first_name} ${booking.guests.last_name}`
    : 'Walk-in'

  return (
    <div
      className="absolute top-1 flex cursor-pointer select-none"
      style={{ left, width, height: ROW_HEIGHT - 8 }}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main booking block */}
      <div
        className="relative flex flex-col justify-center overflow-hidden rounded-l-md px-2"
        style={{
          width: mainWidth,
          minWidth: 0,
          backgroundColor: colors.bg,
          borderTop: `1.5px solid ${colors.border}`,
          borderBottom: `1.5px solid ${colors.border}`,
          borderLeft: `1.5px solid ${colors.border}`,
        }}
      >
        {/* Delay red stripe */}
        {booking.is_delayed && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 4px,
                rgba(180,30,30,0.12) 4px,
                rgba(180,30,30,0.12) 8px
              )`,
            }}
          />
        )}

        <p
          className="truncate text-[11px] font-medium leading-tight"
          style={{ color: colors.text }}
        >
          {guestName}
        </p>
        <p
          className="truncate text-[10px] leading-tight opacity-60"
          style={{ color: colors.text }}
        >
          {booking.party_size}p · {isoToHHMM(booking.start_time)}
        </p>
      </div>

      {/* Buffer tail — hatched */}
      <div
        className="rounded-r-md"
        style={{
          width: tailWidth,
          borderTop: `1.5px dashed ${colors.border}`,
          borderBottom: `1.5px dashed ${colors.border}`,
          borderRight: `1.5px dashed ${colors.border}`,
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 3px,
            ${colors.bg}99 3px,
            ${colors.bg}99 6px
          )`,
        }}
      />

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute bottom-full left-0 z-50 mb-1.5 min-w-40 rounded-lg border border-black/8 bg-white p-2.5 shadow-lg"
          style={{ pointerEvents: 'none' }}
        >
          <p className="text-[12px] font-medium text-[#1a1a18]">{guestName}</p>
          <p className="mt-0.5 text-[11px] text-black/50">
            {isoToHHMM(booking.start_time)} – {isoToHHMM(booking.end_time)}
          </p>
          <p className="text-[11px] text-black/50">{booking.party_size} guests</p>
          {booking.is_delayed && (
            <p className="mt-1 text-[11px] font-medium text-red-500">⚠ Delayed</p>
          )}
          {booking.notes && (
            <p className="mt-1 text-[11px] text-black/40 italic">{booking.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}