'use client';

import { useEffect, useRef, useState } from 'react';
import type { TimetableTable, TimetableBooking, DaySchedule } from '@/services/manager/timetable/types';
import {
	generateTimeLabels,
	gridWidth,
	nowLineLeft,
	ROW_HEIGHT,
	HEADER_HEIGHT,
	ZOOM_LEVELS,
} from '@/services/manager/timetable/utils';
import TableRow from '@/components/manager/timetable/TableRow';
import ClipboardRow from '@/components/manager/timetable/ClipboardRow';
import NowLine from '@/components/manager/timetable/NowLine';

type TimetableGridProps = {
	tables: TimetableTable[];
	bookings: TimetableBooking[];
	schedule: DaySchedule;
	date: string;
	areaId: string;
	zoomIndex: number;
	onZoomChange: (updater: (prev: number) => number) => void;
	onBookingClick: (booking: TimetableBooking) => void;
	onBookingContextMenu: (booking: TimetableBooking, x: number, y: number) => void;
	onNewBooking: (table: TimetableTable, areaId: string, startTime: string) => void;
};

export default function TimetableGrid({
	tables,
	bookings,
	schedule,
	date,
	areaId,
	zoomIndex,
	onZoomChange,
	onBookingClick,
	onBookingContextMenu,
	onNewBooking,
}: TimetableGridProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const scrollbarRef = useRef<HTMLDivElement>(null);
	const isSyncing = useRef(false);
	const onZoomChangeRef = useRef(onZoomChange);
	onZoomChangeRef.current = onZoomChange;
	const [nowLeft, setNowLeft] = useState<number | null>(null);

	const { colWidth, labelInterval } = ZOOM_LEVELS[zoomIndex];
	const timeLabels = generateTimeLabels(schedule, labelInterval);
	const labelCellWidth = Math.round(labelInterval / 15 * colWidth);
	// grid must be as wide as the label row (labels include the closing-time tick = one extra cell)
	const totalWidth = gridWidth(schedule, colWidth) + labelCellWidth;

	const isToday = date === new Date().toISOString().split('T')[0];

	useEffect(() => {
		if (!isToday) {
			setNowLeft(null);
			return;
		}
		const update = () => setNowLeft(nowLineLeft(schedule, colWidth));
		update();
		const interval = setInterval(update, 60_000);
		return () => clearInterval(interval);
	}, [schedule, isToday, colWidth]);

	useEffect(() => {
		if (nowLeft !== null && scrollRef.current) {
			const target = Math.max(0, nowLeft - 200);
			scrollRef.current.scrollLeft = target;
			if (scrollbarRef.current) scrollbarRef.current.scrollLeft = target;
		}
	}, [nowLeft]);

	function handleContentScroll() {
		if (isSyncing.current) return;
		isSyncing.current = true;
		if (scrollbarRef.current && scrollRef.current) {
			scrollbarRef.current.scrollLeft = scrollRef.current.scrollLeft;
		}
		isSyncing.current = false;
	}

	function handleBarScroll() {
		if (isSyncing.current) return;
		isSyncing.current = true;
		if (scrollRef.current && scrollbarRef.current) {
			scrollRef.current.scrollLeft = scrollbarRef.current.scrollLeft;
		}
		isSyncing.current = false;
	}

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		function handleWheel(e: WheelEvent) {
			if (!e.ctrlKey) return;
			e.preventDefault();
			onZoomChangeRef.current((prev) =>
				e.deltaY < 0
					? Math.min(prev + 1, ZOOM_LEVELS.length - 1)
					: Math.max(prev - 1, 0)
			);
		}

		el.addEventListener('wheel', handleWheel, { passive: false });
		return () => el.removeEventListener('wheel', handleWheel);
	}, []);

	const assignedBookings = bookings.filter((b) => b.table_ids.length > 0);
	const unassignedBookings = bookings.filter((b) => b.table_ids.length === 0);

	if (schedule.is_closed) {
		return (
			<div className='flex h-full items-center justify-center bg-[#faf9f6]'>
				<p className='text-sm text-[#a09880]'>Closed on this date</p>
			</div>
		)
	}

	return (
		<div className='flex h-full flex-col overflow-hidden bg-[#faf9f6]'>
			<div className='flex flex-1 overflow-hidden' style={{ minHeight: 0 }}>
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

				<div ref={scrollRef} onScroll={handleContentScroll} className='flex-1 overflow-x-auto overflow-y-hidden relative [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
					<div style={{ width: totalWidth, minWidth: totalWidth }} className='relative'>
						<div
							style={{ height: HEADER_HEIGHT }}
							className='sticky top-0 z-10 flex border-b border-black/6 bg-white'>
							{timeLabels.map((label) => (
								<div
									key={label}
									style={{ width: labelCellWidth, minWidth: labelCellWidth }}
									className='flex items-center border-r border-black/4 px-1.5 last:border-0'>
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
										colWidth={colWidth}
										areaId={areaId}
										date={date}
										onBookingClick={onBookingClick}
										onBookingContextMenu={onBookingContextMenu}
										onNewBooking={onNewBooking}
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
								colWidth={colWidth}
								onBookingClick={onBookingClick}
								onBookingContextMenu={onBookingContextMenu}
							/>
						)}
					</div>
				</div>
			</div>
			{/* Custom scrollbar rail — fixed 12px height so layout never shifts */}
			<div className='flex shrink-0 border-t border-black/4'>
				<div style={{ width: 80 }} className='shrink-0' />
				<div
					ref={scrollbarRef}
					onScroll={handleBarScroll}
					className='flex-1 h-3 overflow-x-auto [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent] [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-track]:bg-transparent'>
					<div style={{ width: totalWidth, height: 1 }} />
				</div>
			</div>
		</div>
	);
}
