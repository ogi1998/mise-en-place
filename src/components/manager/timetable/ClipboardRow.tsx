import type { TimetableBooking, DaySchedule } from '@/services/timetable/types'
import { bookingToStyle, ROW_HEIGHT } from '@/services/timetable/utils'
import BookingBlock from './BookingBlock'

type ClipboardRowProps = {
  bookings: TimetableBooking[]
  schedule: DaySchedule
  totalWidth: number
  onBookingClick: (booking: TimetableBooking) => void
}

export default function ClipboardRow({
  bookings,
  schedule,
  totalWidth,
  onBookingClick,
}: ClipboardRowProps) {
  return (
    <div
      style={{ width: totalWidth, height: ROW_HEIGHT }}
      className="relative border-t border-dashed border-black/10"
    >
      <div className="absolute inset-0 bg-black/1" />

      {bookings.map((booking) => {
        const { left, width } = bookingToStyle(
          booking.start_time,
          booking.end_time,
          schedule
        )
        return (
          <BookingBlock
            key={booking.id}
            booking={booking}
            left={left}
            width={width}
            onClick={() => onBookingClick(booking)}
          />
        )
      })}
    </div>
  )
}