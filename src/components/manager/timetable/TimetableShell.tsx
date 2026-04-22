'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { TimetableArea, TimetableTable, TimetableBooking, DaySchedule } from '@/services/manager/timetable/types';
import { getTimetableBookings, getTimetableTables, getDaySchedule } from '@/services/manager/timetable/queries';
import { FALLBACK_SCHEDULE } from '@/services/manager/timetable/types';
import TimetableHeader from '@/components/manager/timetable/TimetableHeader';
import AreaTabs from '@/components/manager/ui/AreaTabs';
import TimetableGrid from '@/components/manager/timetable/TimetableGrid';
import BookingModal from '@/components/manager/ui/BookingModal';

type TimetableShellProps = {
	restaurantId: string;
	initialDate: string;
	initialAreas: TimetableArea[];
	initialTables: TimetableTable[];
	initialBookings: TimetableBooking[];
	initialSchedule: DaySchedule | null;
	initialAreaId: string | null;
};

export default function TimetableShell({
	restaurantId,
	initialDate,
	initialAreas,
	initialTables,
	initialBookings,
	initialSchedule,
	initialAreaId
}: TimetableShellProps) {
	const [date, setDate] = useState(initialDate);
	const [activeAreaId, setActiveAreaId] = useState(initialAreaId);
	const [tables, setTables] = useState(initialTables);
	const [bookings, setBookings] = useState(initialBookings);
	const [schedule, setSchedule] = useState<DaySchedule>(initialSchedule ?? FALLBACK_SCHEDULE);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState<TimetableBooking | null>(null);

	const fetchData = useCallback(
		async (newDate: string, newAreaId: string) => {
			setIsLoading(true);
			try {
				const [newBookings, newTables, newSchedule] = await Promise.all([
					getTimetableBookings(supabase, restaurantId, newDate),
					getTimetableTables(supabase, restaurantId, newAreaId),
					getDaySchedule(supabase, restaurantId, newAreaId, newDate)
				]);
				setBookings(newBookings);
				setTables(newTables);
				setSchedule(newSchedule);
			} finally {
				setIsLoading(false);
			}
		},
		[restaurantId]
	);

	const handleDateChange = useCallback(
		(newDate: string) => {
			setDate(newDate);
			if (activeAreaId) fetchData(newDate, activeAreaId);
		},
		[activeAreaId, fetchData]
	);

	const handleAreaChange = useCallback(
		(newAreaId: string) => {
			setActiveAreaId(newAreaId);
			fetchData(date, newAreaId);
		},
		[date, fetchData]
	);

	const handleBookingUpdate = useCallback((updated: TimetableBooking) => {
		setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
		setSelectedBooking(updated);
	}, []);

	return (
		<div className='flex h-full flex-col overflow-hidden'>
			<TimetableHeader date={date} onDateChange={handleDateChange} />
			<AreaTabs areas={initialAreas} activeAreaId={activeAreaId} onAreaChange={handleAreaChange} />
			<div className='relative flex-1 overflow-hidden'>
				{isLoading && (
					<div className='absolute inset-0 z-10 flex items-center justify-center bg-[#faf9f6]/60'>
						<p className='text-[13px] text-black/40'>Loading...</p>
					</div>
				)}
				<TimetableGrid
					tables={tables}
					bookings={bookings}
					schedule={schedule}
					date={date}
					onBookingClick={setSelectedBooking}
				/>
			</div>
			{selectedBooking && (
				<BookingModal
					booking={selectedBooking}
					onClose={() => setSelectedBooking(null)}
					onUpdate={handleBookingUpdate}
					restaurantId={restaurantId}
				/>
			)}
		</div>
	);
}
