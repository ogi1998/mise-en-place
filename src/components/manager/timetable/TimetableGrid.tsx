'use client';

import { useEffect, useRef, useState } from 'react';
import type { TimetableTable, TimetableBooking, DaySchedule } from '@/services/manager/timetable/types';
import {
	generateTimeLabels,
	gridWidth,
	nowLineLeft,
	COL_WIDTH,
	ROW_HEIGHT,
	HEADER_HEIGHT
} from '@/services/manager/timetable/utils';
import TableRow from '@/components/manager/timetable/TableRow';
import ClipboardRow from '@/components/manager/timetable/ClipboardRow';
import NowLine from '@/components/manager/timetable/NowLine';

type TimetableGridProps = {
	tables: TimetableTable[];
	bookings: TimetableBooking[];
	schedule: DaySchedule;
	date: string;
	onBookingClick: (booking: TimetableBooking) => void;
};

export default function TimetableGrid({ tables, bookings, schedule, date, onBookingClick }: TimetableGridProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [nowLeft, setNowLeft] = useState<number | null>(null);
	const timeLabels = generateTimeLabels(schedule);
	const totalWidth = gridWidth(schedule);

	const isToday = date === new Date().toISOString().split('T')[0];

	useEffect(() => {
		if (!isToday) {
			setNowLeft(null);
			return;
		}
		const update = () => setNowLeft(nowLineLeft(schedule));
		update();
		const interval = setInterval(update, 60_000);
		return () => clearInterval(interval);
	}, [schedule, isToday]);

	useEffect(() => {
		if (nowLeft !== null && scrollRef.current) {
			scrollRef.current.scrollLeft = Math.max(0, nowLeft - 200);
		}
	}, [nowLeft]);

	const assignedBookings = bookings.filter((b) => b.table_ids.length > 0);
	const unassignedBookings = bookings.filter((b) => b.table_ids.length === 0);

	return (
		<div className='flex h-full flex-col overflow-hidden bg-[#faf9f6]'>
			<div className='flex flex-1 overflow-hidden'>
				<div className='shrink-0 border-r border-black/6 bg-white' style={{ width: 80 }}>
					<div style={{ height: HEADER_HEIGHT }} className='border-b border-black/6' />

					{tables.map((table) => (
						<div
							key={table.id}
							style={{ height: ROW_HEIGHT }}
							className='flex items-center border-b border-black/4 px-3 last:border-0'>
							<div>
								<p className='text-[12px] font-medium text-[#1a1a18]'>{table.name}</p>
								{table.nickname && <p className='text-[10px] text-black/35'>{table.nickname}</p>}
							</div>
						</div>
					))}

					{unassignedBookings.length > 0 && (
						<div
							style={{ height: ROW_HEIGHT }}
							className='flex items-center border-t border-dashed border-black/10 px-3'>
							<p className='text-[10px] uppercase tracking-wider text-black/30'>Unassigned</p>
						</div>
					)}
				</div>

				<div ref={scrollRef} className='flex-1 overflow-x-auto overflow-y-hidden'>
					<div style={{ width: totalWidth, minWidth: totalWidth }} className='relative'>
						<div
							style={{ height: HEADER_HEIGHT }}
							className='sticky top-0 z-10 flex border-b border-black/6 bg-white'>
							{timeLabels.map((label, i) => (
								<div
									key={label}
									style={{ width: COL_WIDTH * 2, minWidth: COL_WIDTH * 2 }} // 30min = 2 cols
									className={`flex items-center border-r border-black/4 px-1.5 last:border-0 ${
										i === 0 ? '' : ''
									}`}>
									<span className='text-[10px] tabular-nums text-black/35'>{label}</span>
								</div>
							))}
						</div>

						<div className='relative'>
							{tables.map((table) => {
								const tableBookings = assignedBookings.filter((b) => b.table_ids.includes(table.id));
								return (
									<TableRow
										key={table.id}
										table={table}
										bookings={tableBookings}
										schedule={schedule}
										totalWidth={totalWidth}
										onBookingClick={onBookingClick}
									/>
								);
							})}

							{nowLeft !== null && <NowLine left={nowLeft} height={tables.length * ROW_HEIGHT} />}
						</div>

						{unassignedBookings.length > 0 && (
							<ClipboardRow
								bookings={unassignedBookings}
								schedule={schedule}
								totalWidth={totalWidth}
								onBookingClick={onBookingClick}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
