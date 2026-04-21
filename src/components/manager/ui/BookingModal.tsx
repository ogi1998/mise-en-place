'use client';

import { useState } from 'react';
import { X, Phone, Mail, AlertTriangle, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { TimetableBooking } from '@/services/timetable/types';
import type { FloorPlanBooking, FloorPlanTable } from '@/services/floor-plan/types';
import { isoToHHMM } from '@/services/timetable/utils';
import { hasCapacityMismatch } from '@/services/floor-plan/utils';
import type { BookingStatus } from '@/types/database';
import CapacityWarning from '@/components/manager/floor-plan/CapacityWarning';

export type ModalBooking = TimetableBooking | FloorPlanBooking;

type BookingModalProps = {
	onClose: () => void;
	restaurantId: string;
	booking?: ModalBooking;
	onUpdate?: (updated: ModalBooking) => void;
	table?: FloorPlanTable;
	unassignedBookings?: FloorPlanBooking[];
	onAssigned?: () => void;
};

const STATUSES: { value: BookingStatus; label: string }[] = [
	{ value: 'pending',   label: 'Pending'   },
	{ value: 'confirmed', label: 'Confirmed' },
	{ value: 'seated',    label: 'Seated'    },
	{ value: 'completed', label: 'Completed' },
	{ value: 'cancelled', label: 'Cancelled' },
];

function statusColors(status: string) {
	switch (status) {
		case 'confirmed': return 'bg-[#d4e8d0] text-[#2a5c24]';
		case 'pending':   return 'bg-[#fdf0d5] text-[#7a5c1a]';
		case 'seated':    return 'bg-[#d0e4f7] text-[#1a3d6b]';
		case 'completed': return 'bg-[#e8e8e8] text-[#444]';
		case 'cancelled': return 'bg-[#f7d5d5] text-[#6b1a1a]';
		default:          return 'bg-black/6 text-black/50';
	}
}

export default function BookingModal({
	onClose,
	restaurantId,
	booking,
	onUpdate,
	table,
	unassignedBookings,
	onAssigned,
}: BookingModalProps) {
	const isFloorPlanMode = !!table;
	const isOccupied = !!booking;

	const [status, setStatus] = useState<BookingStatus>(
		(booking?.status as BookingStatus) ?? 'pending'
	);
	const [notes, setNotes] = useState(booking?.notes ?? '');
	const [internalNotes, setInternalNotes] = useState(booking?.internal_notes ?? '');
	const [isDelayed, setIsDelayed] = useState(booking?.is_delayed ?? false);
	const [isSaving, setIsSaving] = useState(false);
	const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
	const [selectedBookingId, setSelectedBookingId] = useState('');
	const [isAssigning, setIsAssigning] = useState(false);

	const guestName = booking?.guests
		? `${booking.guests.first_name} ${booking.guests.last_name}`
		: 'Walk-in';

	const bookingNumber = booking
		? `#${String(booking.booking_number).padStart(4, '0')}`
		: '';

	const selectedUnassigned = unassignedBookings?.find((b) => b.id === selectedBookingId);
	const showCapacityWarning = selectedUnassigned && table && hasCapacityMismatch(selectedUnassigned, table);

	async function handleSave() {
		if (!booking) return;
		setIsSaving(true);
		try {
			const { data } = await supabase
				.from('bookings')
				.update({
					status,
					notes: notes || null,
					internal_notes: internalNotes || null,
					is_delayed: isDelayed,
					...(status === 'confirmed' ? { confirmed_at: new Date().toISOString() } : {}),
					...(status === 'cancelled'  ? { cancelled_at: new Date().toISOString() }  : {}),
				})
				.eq('id', booking.id)
				.eq('restaurant_id', restaurantId)
				.select(`
					id, booking_number, status, party_size,
					start_time, end_time, notes, internal_notes, is_delayed,
					guests(first_name, last_name, email, phone)
				`)
				.single();

			if (data) {
				onUpdate?.({
					...(data as unknown as ModalBooking),
					table_ids: booking.table_ids,
				});
				onClose();
			}
		} finally {
			setIsSaving(false);
		}
	}

	async function handleAssign() {
		if (!selectedBookingId || !table) return;
		setIsAssigning(true);
		try {
			await supabase
				.from('booking_tables')
				.insert({
					booking_id: selectedBookingId,
					table_id: table.id,
					restaurant_id: restaurantId,
				});
			onAssigned?.();
		} finally {
			setIsAssigning(false);
		}
	}

	function renderHeader() {
		if (isFloorPlanMode && table) {
			return (
				<div>
					<p className='font-serif text-[17px] text-[#1a1a18]'>
						{table.name}
						{table.nickname && (
							<span className='ml-1.5 text-[13px] text-black/40'>{table.nickname}</span>
						)}
					</p>
					<div className='mt-0.5 flex items-center gap-1.5 text-[12px] text-black/40'>
						<Users className='h-3 w-3' />
						<span>Up to {table.max_seats} seats</span>
					</div>
				</div>
			);
		}
		return (
			<div>
				<div className='flex items-center gap-2'>
					<p className='font-serif text-[17px] text-[#1a1a18]'>{guestName}</p>
					<span className='font-mono text-[11px] text-black/30'>{bookingNumber}</span>
				</div>
				{booking && (
					<p className='mt-0.5 text-[12px] text-black/40'>
						{isoToHHMM(booking.start_time)} – {isoToHHMM(booking.end_time)} · {booking.party_size} guests
					</p>
				)}
			</div>
		);
	}

	function renderAssignMode() {
		const bookings = unassignedBookings ?? [];
		return (
			<>
				<div className='px-5 py-4'>
					{bookings.length === 0 ? (
						<p className='text-[13px] text-black/40'>No unassigned bookings for today.</p>
					) : (
						<div className='space-y-3'>
							<p className='text-[11px] font-medium uppercase tracking-wider text-black/35'>
								Assign a booking
							</p>
							<div className='space-y-1.5'>
								{bookings.map((b) => {
									const name = b.guests
										? `${b.guests.first_name} ${b.guests.last_name}`
										: 'Walk-in';
									const time = new Date(b.start_time).toLocaleTimeString('sl-SI', {
										hour: '2-digit',
										minute: '2-digit',
									});
									return (
										<button
											key={b.id}
											onClick={() => setSelectedBookingId(b.id)}
											className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
												selectedBookingId === b.id
													? 'border-[#1a1a18] bg-[#1a1a18]/4'
													: 'border-black/8 hover:border-black/15'
											}`}
										>
											<p className='text-[13px] font-medium text-[#1a1a18]'>{name}</p>
											<p className='text-[11px] text-black/40'>
												{time} · {b.party_size} guests · #{String(b.booking_number).padStart(4, '0')}
											</p>
										</button>
									);
								})}
							</div>
							{showCapacityWarning && selectedUnassigned && (
								<CapacityWarning
									partySize={selectedUnassigned.party_size}
									maxSeats={table!.max_seats}
								/>
							)}
						</div>
					)}
				</div>
				<div className='flex items-center justify-end gap-2 border-t border-black/6 px-5 py-3'>
					<button
						onClick={onClose}
						className='rounded-lg px-4 py-2 text-[12px] text-black/40 transition-colors hover:bg-black/5 hover:text-black/70'
					>
						Cancel
					</button>
					{bookings.length > 0 && (
						<button
							onClick={handleAssign}
							disabled={!selectedBookingId || isAssigning}
							className='rounded-lg bg-[#1a1a18] px-4 py-2 text-[12px] font-medium text-[#faf9f6] transition-opacity hover:opacity-80 disabled:opacity-40'
						>
							{isAssigning ? 'Assigning...' : 'Assign to table'}
						</button>
					)}
				</div>
			</>
		);
	}

	function renderBookingContent() {
		return (
			<>
				<div className='flex border-b border-black/6 px-5'>
					{(['details', 'notes'] as const).map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`relative py-2.5 pr-4 text-[12px] font-medium capitalize transition-colors ${
								activeTab === tab ? 'text-[#1a1a18]' : 'text-black/35 hover:text-black/60'
							}`}
						>
							{tab}
							{activeTab === tab && (
								<span className='absolute bottom-0 left-0 right-4 h-0.5 rounded-full bg-[#1a1a18]' />
							)}
						</button>
					))}
				</div>

				<div className='px-5 py-4'>
					{activeTab === 'details' && (
						<div className='space-y-4'>
							{isFloorPlanMode && booking && (
								<div>
									<p className='text-[13px] font-medium text-[#1a1a18]'>{guestName}</p>
									<p className='text-[12px] text-black/40'>
										{booking.party_size} guests · {bookingNumber}
									</p>
								</div>
							)}

							<div>
								<p className='mb-1.5 text-[11px] font-medium uppercase tracking-wider text-black/35'>
									Status
								</p>
								<div className='flex flex-wrap gap-1.5'>
									{STATUSES.map((s) => (
										<button
											key={s.value}
											onClick={() => setStatus(s.value)}
											className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
												status === s.value
													? statusColors(s.value)
													: 'bg-black/4 text-black/40 hover:bg-black/8'
											}`}
										>
											{s.label}
										</button>
									))}
								</div>
							</div>

							<div className='flex items-center justify-between rounded-xl border border-black/6 px-3 py-2.5'>
								<div className='flex items-center gap-2'>
									<AlertTriangle
										className={`h-3.5 w-3.5 ${isDelayed ? 'text-red-500' : 'text-black/25'}`}
									/>
									<p className='text-[12px] text-black/60'>Mark as delayed</p>
								</div>
								<button
									onClick={() => setIsDelayed(!isDelayed)}
									className={`relative h-5 w-9 rounded-full transition-colors ${
										isDelayed ? 'bg-red-500' : 'bg-black/15'
									}`}
								>
									<span
										className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
											isDelayed ? 'translate-x-0' : '-translate-x-4'
										}`}
									/>
								</button>
							</div>

							{booking?.guests && (
								<div>
									<p className='mb-1.5 text-[11px] font-medium uppercase tracking-wider text-black/35'>
										Guest
									</p>
									<div className='space-y-1.5 rounded-xl border border-black/6 px-3 py-2.5'>
										{booking.guests.phone && (
											<a
												href={`tel:${booking.guests.phone}`}
												className='flex items-center gap-2 text-[12px] text-black/60 hover:text-black/90'
											>
												<Phone className='h-3 w-3 shrink-0 text-black/30' />
												{booking.guests.phone}
											</a>
										)}
										{booking.guests.email && (
											<a
												href={`mailto:${booking.guests.email}`}
												className='flex items-center gap-2 text-[12px] text-black/60 hover:text-black/90'
											>
												<Mail className='h-3 w-3 shrink-0 text-black/30' />
												{booking.guests.email}
											</a>
										)}
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab === 'notes' && (
						<div className='space-y-3'>
							<div>
								<p className='mb-1.5 text-[11px] font-medium uppercase tracking-wider text-black/35'>
									Guest notes
								</p>
								<textarea
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									rows={3}
									placeholder='Notes from guest...'
									className='w-full resize-none rounded-xl border border-black/8 bg-black/2 px-3 py-2.5 text-[13px] text-[#1a1a18] placeholder-black/25 outline-none focus:border-black/20 focus:bg-white'
								/>
							</div>
							<div>
								<p className='mb-1.5 text-[11px] font-medium uppercase tracking-wider text-black/35'>
									Internal notes
								</p>
								<textarea
									value={internalNotes}
									onChange={(e) => setInternalNotes(e.target.value)}
									rows={3}
									placeholder='Internal notes (not visible to guest)...'
									className='w-full resize-none rounded-xl border border-black/8 bg-black/2 px-3 py-2.5 text-[13px] text-[#1a1a18] placeholder-black/25 outline-none focus:border-black/20 focus:bg-white'
								/>
							</div>
						</div>
					)}
				</div>

				<div className='flex items-center justify-end gap-2 border-t border-black/6 px-5 py-3'>
					<button
						onClick={onClose}
						className='rounded-lg px-4 py-2 text-[12px] text-black/40 transition-colors hover:bg-black/5 hover:text-black/70'
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={isSaving}
						className='rounded-lg bg-[#1a1a18] px-4 py-2 text-[12px] font-medium text-[#faf9f6] transition-opacity hover:opacity-80 disabled:opacity-40'
					>
						{isSaving ? 'Saving...' : 'Save changes'}
					</button>
				</div>
			</>
		);
	}

	return (
		<>
			<div className='fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]' onClick={onClose} />
			<div className='fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-black/8 bg-white shadow-2xl'>
				<div className='flex items-start justify-between border-b border-black/6 px-5 py-4'>
					{renderHeader()}
					<button
						onClick={onClose}
						className='rounded-md p-1 text-black/30 transition-colors hover:bg-black/5 hover:text-black/60'
					>
						<X className='h-4 w-4' />
					</button>
				</div>
				{isFloorPlanMode && !isOccupied ? renderAssignMode() : renderBookingContent()}
			</div>
		</>
	);
}