import type { FloorPlanTable, FloorPlanBooking, TableStatus, TableWithStatus } from './types';

const UPCOMING_WINDOW_MINUTES = 30;

export function getTableStatus(table: FloorPlanTable, bookings: FloorPlanBooking[]): TableWithStatus {
	const now = new Date();

	const tableBookings = bookings.filter((b) => b.table_ids.includes(table.id));

	const activeBooking = tableBookings.find((b) => {
		const start = new Date(b.start_time);
		const end = new Date(b.end_time);
		return now >= start && now <= end && ['seated', 'confirmed'].includes(b.status);
	});

	if (activeBooking) {
		const status: TableStatus = activeBooking.is_delayed ? 'delayed' : 'seated';
		return { ...table, status, currentBooking: activeBooking };
	}

	const upcomingBooking = tableBookings.find((b) => {
		const start = new Date(b.start_time);
		const minutesUntilStart = (start.getTime() - now.getTime()) / 60_000;
		return minutesUntilStart > 0 && minutesUntilStart <= UPCOMING_WINDOW_MINUTES;
	});

	if (upcomingBooking) {
		return { ...table, status: 'upcoming', currentBooking: upcomingBooking };
	}

	return { ...table, status: 'empty', currentBooking: null };
}

export function computeTableStatuses(tables: FloorPlanTable[], bookings: FloorPlanBooking[]): TableWithStatus[] {
	return tables.map((t) => getTableStatus(t, bookings));
}

export function hasCapacityMismatch(booking: FloorPlanBooking, table: FloorPlanTable): boolean {
	return booking.party_size > table.max_seats;
}

export function statusLabel(status: TableStatus): string {
	switch (status) {
		case 'empty':
			return 'Empty';
		case 'upcoming':
			return 'Upcoming';
		case 'seated':
			return 'Seated';
		case 'delayed':
			return 'Delayed';
	}
}
