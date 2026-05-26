import type { TimetableTable, TimetableBooking, DaySchedule } from '@/services/manager/timetable/types';
import { bookingToStyle, ROW_HEIGHT, timeToMinutes } from '@/services/manager/timetable/utils';
import BookingBlock from '@/components/manager/timetable/BookingBlock';

type TableRowProps = {
	table: TimetableTable;
	bookings: TimetableBooking[];
	schedule: DaySchedule;
	totalWidth: number;
	colWidth: number;
	areaId: string;
	date: string;
	onBookingClick: (booking: TimetableBooking) => void;
	onBookingContextMenu: (booking: TimetableBooking, x: number, y: number) => void;
	onNewBooking: (table: TimetableTable, areaId: string, startTimeHHMM: string) => void;
};

export default function TableRow({
	table,
	bookings,
	schedule,
	totalWidth,
	colWidth,
	areaId,
	date,
	onBookingClick,
	onBookingContextMenu,
	onNewBooking,
}: TableRowProps) {
	function handleDoubleClick(e: React.MouseEvent<HTMLDivElement>) {
		const originMinutes = timeToMinutes(schedule.open_time)
		const minutesFromStart = Math.floor(e.nativeEvent.offsetX / colWidth) * 15
		const totalMinutes = originMinutes + minutesFromStart
		const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
		const m = (totalMinutes % 60).toString().padStart(2, '0')
		onNewBooking(table, areaId, `${h}:${m}`)
	}

	return (
		<div
			style={{ height: ROW_HEIGHT, width: totalWidth }}
			className='relative border-b border-black/4 last:border-0'
			onDoubleClick={handleDoubleClick}>
			{/* Background grid lines every 30min */}
			<div className='absolute inset-0 flex pointer-events-none'>
				{Array.from({ length: Math.floor(totalWidth / (colWidth * 2)) }).map((_, i) => (
					<div key={i} className='h-full border-r border-black/4' style={{ width: colWidth * 2 }} />
				))}
			</div>

			{/* Booking blocks */}
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
