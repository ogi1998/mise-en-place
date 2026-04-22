import type { TimetableTable, TimetableBooking, DaySchedule } from '@/services/manager/timetable/types';
import { bookingToStyle, ROW_HEIGHT } from '@/services/manager/timetable/utils';
import BookingBlock from '@/components/manager/timetable/BookingBlock';

type TableRowProps = {
	table: TimetableTable;
	bookings: TimetableBooking[];
	schedule: DaySchedule;
	totalWidth: number;
	onBookingClick: (booking: TimetableBooking) => void;
};

export default function TableRow({ table, bookings, schedule, totalWidth, onBookingClick }: TableRowProps) {
	return (
		<div
			style={{ height: ROW_HEIGHT, width: totalWidth }}
			className='relative border-b border-black/4 last:border-0'>
			{/* Background grid lines every 30min */}
			<div className='absolute inset-0 flex pointer-events-none'>
				{Array.from({ length: Math.floor(totalWidth / 40) }).map((_, i) => (
					<div key={i} className='h-full border-r border-black/4' style={{ width: 40 }} />
				))}
			</div>

			{/* Booking blocks */}
			{bookings.map((booking) => {
				const { left, width } = bookingToStyle(booking.start_time, booking.end_time, schedule);
				return (
					<BookingBlock
						key={booking.id}
						booking={booking}
						left={left}
						width={width}
						onClick={() => onBookingClick(booking)}
					/>
				);
			})}
		</div>
	);
}
