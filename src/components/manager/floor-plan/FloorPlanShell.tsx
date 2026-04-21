'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { TimetableArea } from '@/services/timetable/types';
import type { FloorPlanTable, FloorPlanBooking, TableWithStatus } from '@/services/floor-plan/types';
import { getFloorPlanTables, getFloorPlanBookings } from '@/services/floor-plan/queries';
import { computeTableStatuses } from '@/services/floor-plan/utils';
import AreaTabs from '@/components/manager/ui/AreaTabs';
import FloorPlanGrid from './FloorPlanGrid';
import BookingModal from '@/components/manager/ui/BookingModal';

type FloorPlanShellProps = {
	restaurantId: string;
	initialAreas: TimetableArea[];
	initialTables: FloorPlanTable[];
	initialBookings: FloorPlanBooking[];
	initialAreaId: string | null;
};

export default function FloorPlanShell({
	restaurantId,
	initialAreas,
	initialTables,
	initialBookings,
	initialAreaId
}: FloorPlanShellProps) {
	const todayDate = new Date().toISOString().split('T')[0];

	const [activeAreaId, setActiveAreaId] = useState(initialAreaId);
	const [tables, setTables] = useState(initialTables);
	const [bookings, setBookings] = useState(initialBookings);
	const [selectedTable, setSelectedTable] = useState<TableWithStatus | null>(null);

	const tablesWithStatus = computeTableStatuses(tables, bookings);
	const unassignedBookings = bookings.filter((b) => b.table_ids.length === 0);

	const fetchData = useCallback(
		async (areaId: string) => {
			const [newTables, newBookings] = await Promise.all([
				getFloorPlanTables(supabase, restaurantId, areaId),
				getFloorPlanBookings(supabase, restaurantId, todayDate)
			]);
			setTables(newTables);
			setBookings(newBookings);
		},
		[restaurantId, todayDate]
	);

	const handleAreaChange = useCallback(
		(areaId: string) => {
			setActiveAreaId(areaId);
			fetchData(areaId);
		},
		[fetchData]
	);

	useEffect(() => {
		if (!activeAreaId) return;
		const interval = setInterval(() => fetchData(activeAreaId), 60_000);
		return () => clearInterval(interval);
	}, [activeAreaId, fetchData]);

	const handleBookingUpdate = useCallback(
		(updatedBooking: FloorPlanBooking) => {
			setBookings((prev) => prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)));
			if (selectedTable) {
				setSelectedTable((prev) => (prev ? { ...prev, currentBooking: updatedBooking } : null));
			}
		},
		[selectedTable]
	);

	const handleAssigned = useCallback(() => {
		if (activeAreaId) fetchData(activeAreaId);
		setSelectedTable(null);
	}, [activeAreaId, fetchData]);

	return (
		<div className='flex h-full flex-col overflow-hidden'>
			<AreaTabs areas={initialAreas} activeAreaId={activeAreaId} onAreaChange={handleAreaChange} />
			<div className='flex-1 overflow-y-auto p-6'>
				<FloorPlanGrid tables={tablesWithStatus} onTableClick={setSelectedTable} />
			</div>
			{selectedTable && (
				<BookingModal
					restaurantId={restaurantId}
					onClose={() => setSelectedTable(null)}
					booking={selectedTable.currentBooking ?? undefined}
					onUpdate={handleBookingUpdate}
					table={selectedTable}
					unassignedBookings={unassignedBookings}
					onAssigned={handleAssigned}
				/>
			)}
		</div>
	);
}
