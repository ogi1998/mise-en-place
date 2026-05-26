import type { TimetableBooking, DaySchedule } from '@/services/manager/timetable/types';
import { bookingToStyle, ROW_HEIGHT } from '@/services/manager/timetable/utils';
import BookingBlock from './BookingBlock';

type ClipboardRowProps = {
	bookings: TimetableBooking[];
	schedule: DaySchedule;
	totalWidth: number;
	colWidth: number;
	onBookingClick: (booking: TimetableBooking) => void;
	onBookingContextMenu: (booking: TimetableBooking, x: number, y: number) => void;
};

export default function ClipboardRow({
	bookings,
	schedule,
	totalWidth,
	colWidth,
	onBookingClick,
	onBookingContextMenu,
}: ClipboardRowProps) {
	return (
		<div
			style={{ width: totalWidth, height: ROW_HEIGHT }}
			className='relative border-t border-dashed border-black/10'>
			<div className='absolute inset-0 bg-black/1' />

			{bookings.map((booking) => {
				const { left, width } = bookingToStyle(booking.start_time, booking.end_time, schedule, colWidth);
				return (
					<BookingBlock
						key={booking.id}
						booking={booking}
						left={left}
						width={width}
						colWidth={colWidth}
						onClick={() => onBookingClick(booking)}
						onContextMenu={(e) => {
							e.preventDefault()
							onBookingContextMenu(booking, e.clientX, e.clientY)
						}}
					/>
				);
			})}
		</div>
	);
}
