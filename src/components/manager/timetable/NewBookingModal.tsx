'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { TimetableTable } from '@/services/manager/timetable/types';

type GuestResult = {
	id: string;
	first_name: string;
	last_name: string;
	email: string | null;
};

type Props = {
	restaurantId: string;
	table: TimetableTable;
	areaId: string;
	date: string;
	startTime: string;
	onClose: () => void;
	onCreated: () => void;
};

const DURATION_OPTIONS = [
	{ value: 30, label: '30 min' },
	{ value: 60, label: '1 hr' },
	{ value: 90, label: '1 hr 30 min' },
	{ value: 120, label: '2 hr' },
	{ value: 180, label: '3 hr' },
];

function addMinutes(hhmm: string, minutes: number): string {
	const [h, m] = hhmm.split(':').map(Number);
	const total = h * 60 + m + minutes;
	const newH = Math.floor(total / 60) % 24;
	const newM = total % 60;
	return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

export default function NewBookingModal({
	restaurantId,
	table,
	areaId,
	date,
	startTime: initialStartTime,
	onClose,
	onCreated,
}: Props) {
	const [startTime, setStartTime] = useState(initialStartTime);
	const [duration, setDuration] = useState(90);
	const [partySize, setPartySize] = useState(table.min_seats);
	const [isWalkIn, setIsWalkIn] = useState(true);
	const [guestSearch, setGuestSearch] = useState('');
	const [selectedGuest, setSelectedGuest] = useState<GuestResult | null>(null);
	const [guestResults, setGuestResults] = useState<GuestResult[]>([]);
	const [notes, setNotes] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (isWalkIn || guestSearch.length < 2) {
			setGuestResults([]);
			return;
		}
		if (searchRef.current) clearTimeout(searchRef.current);
		searchRef.current = setTimeout(async () => {
			const q = guestSearch;
			const { data } = await supabase
				.from('guests')
				.select('id, first_name, last_name, email')
				.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
				.limit(6);
			setGuestResults((data as GuestResult[]) ?? []);
		}, 250);
	}, [guestSearch, isWalkIn]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setError(null);

		const endTime = addMinutes(startTime, duration);
		const startIso = `${date}T${startTime}:00`;
		const endIso = `${date}T${endTime}:00`;

		try {
			const res = await fetch('/api/manager/bookings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					date,
					start_time: startIso,
					end_time: endIso,
					party_size: partySize,
					table_id: table.id,
					area_id: areaId,
					guest_id: selectedGuest?.id ?? null,
					notes: notes || null,
				}),
			});

			if (!res.ok) {
				const body = await res.json();
				setError(body.error ?? 'Failed to create booking');
				return;
			}

			onCreated();
			onClose();
		} catch {
			setError('Failed to create booking');
		} finally {
			setSaving(false);
		}
	}

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]'
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<div className='w-full max-w-sm rounded-2xl border border-[#e8e4dc] bg-white shadow-xl'>
				<div className='flex items-center justify-between border-b border-[#e8e4dc] px-5 py-4'>
					<div>
						<h2 className='text-[14px] font-semibold text-[#1a1a18]'>New Booking</h2>
						<p className='text-[12px] text-[#a09880]'>{table.name} · {date}</p>
					</div>
					<button
						onClick={onClose}
						className='flex h-7 w-7 items-center justify-center rounded-full text-[#a09880] hover:bg-[#f5f0e8] hover:text-[#1a1a18] transition-colors'>
						<svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
							<path d='M1 1l12 12M13 1L1 13' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit} className='px-5 py-4 space-y-4'>
					<div className='grid grid-cols-2 gap-3'>
						<div>
							<label className='block text-[11px] font-medium text-[#7a7060] mb-1'>Start time</label>
							<input
								type='time'
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								className='w-full rounded-lg border border-[#e8e4dc] bg-[#faf9f6] px-3 py-2 text-[13px] text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]'
							/>
						</div>
						<div>
							<label className='block text-[11px] font-medium text-[#7a7060] mb-1'>Duration</label>
							<select
								value={duration}
								onChange={(e) => setDuration(Number(e.target.value))}
								className='w-full rounded-lg border border-[#e8e4dc] bg-[#faf9f6] px-3 py-2 text-[13px] text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]'>
								{DURATION_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>{opt.label}</option>
								))}
							</select>
						</div>
					</div>

					<div>
						<label className='block text-[11px] font-medium text-[#7a7060] mb-1'>Party size</label>
						<input
							type='number'
							min={1}
							max={table.max_seats}
							value={partySize}
							onChange={(e) => setPartySize(Number(e.target.value))}
							className='w-full rounded-lg border border-[#e8e4dc] bg-[#faf9f6] px-3 py-2 text-[13px] text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]'
						/>
					</div>

					<div>
						<div className='flex items-center gap-3 mb-3'>
							<button
								type='button'
								onClick={() => { setIsWalkIn(true); setSelectedGuest(null); setGuestSearch(''); }}
								className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${isWalkIn ? 'bg-[#1a1a18] text-white border-[#1a1a18]' : 'bg-white text-[#7a7060] border-[#e8e4dc] hover:border-[#1a1a18]'}`}>
								Walk-in
							</button>
							<button
								type='button'
								onClick={() => setIsWalkIn(false)}
								className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors ${!isWalkIn ? 'bg-[#1a1a18] text-white border-[#1a1a18]' : 'bg-white text-[#7a7060] border-[#e8e4dc] hover:border-[#1a1a18]'}`}>
								Guest search
							</button>
						</div>

						{!isWalkIn && (
							<div className='relative'>
								{selectedGuest ? (
									<div className='flex items-center justify-between rounded-lg border border-[#1a1a18] bg-[#faf9f6] px-3 py-2'>
										<div>
											<p className='text-[13px] font-medium text-[#1a1a18]'>
												{selectedGuest.first_name} {selectedGuest.last_name}
											</p>
											{selectedGuest.email && (
												<p className='text-[11px] text-[#a09880]'>{selectedGuest.email}</p>
											)}
										</div>
										<button
											type='button'
											onClick={() => setSelectedGuest(null)}
											className='text-[#a09880] hover:text-[#1a1a18] text-[11px]'>
											Clear
										</button>
									</div>
								) : (
									<>
										<input
											type='text'
											placeholder='Search by name or email...'
											value={guestSearch}
											onChange={(e) => setGuestSearch(e.target.value)}
											className='w-full rounded-lg border border-[#e8e4dc] bg-[#faf9f6] px-3 py-2 text-[13px] text-[#1a1a18] placeholder-[#a09880] focus:outline-none focus:border-[#1a1a18]'
										/>
										{guestResults.length > 0 && (
											<div className='absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-[#e8e4dc] bg-white shadow-lg overflow-hidden'>
												{guestResults.map((g) => (
													<button
														key={g.id}
														type='button'
														onClick={() => {
															setSelectedGuest(g);
															setGuestSearch('');
															setGuestResults([]);
														}}
														className='w-full text-left px-3 py-2 hover:bg-[#faf9f6] transition-colors border-b border-[#e8e4dc] last:border-0'>
														<p className='text-[12px] font-medium text-[#1a1a18]'>
															{g.first_name} {g.last_name}
														</p>
														{g.email && (
															<p className='text-[11px] text-[#a09880]'>{g.email}</p>
														)}
													</button>
												))}
											</div>
										)}
									</>
								)}
							</div>
						)}
					</div>

					<div>
						<label className='block text-[11px] font-medium text-[#7a7060] mb-1'>Notes</label>
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={2}
							placeholder='Optional notes...'
							className='w-full rounded-lg border border-[#e8e4dc] bg-[#faf9f6] px-3 py-2 text-[13px] text-[#1a1a18] placeholder-[#a09880] focus:outline-none focus:border-[#1a1a18] resize-none'
						/>
					</div>

					{error && (
						<p className='text-[12px] text-red-500'>{error}</p>
					)}

					<div className='flex gap-3 pt-1'>
						<button
							type='button'
							onClick={onClose}
							className='flex-1 rounded-lg border border-[#e8e4dc] py-2.5 text-[13px] text-[#7a7060] hover:border-[#1a1a18] transition-colors'>
							Cancel
						</button>
						<button
							type='submit'
							disabled={saving}
							className='flex-1 rounded-lg bg-[#1a1a18] py-2.5 text-[13px] font-medium text-white hover:bg-[#2d2d2a] disabled:opacity-50 transition-colors'>
							{saving ? 'Creating...' : 'Create booking'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
