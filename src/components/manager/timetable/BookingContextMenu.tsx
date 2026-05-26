'use client';

import { useEffect, useRef } from 'react';
import type { TimetableBooking } from '@/services/manager/timetable/types';

type Action = 'edit' | 'duplicate' | 'cancel' | 'no_show' | 'unassign';

type Props = {
	x: number;
	y: number;
	booking: TimetableBooking;
	onAction: (action: Action) => void;
	onClose: () => void;
};

export default function BookingContextMenu({ x, y, booking, onAction, onClose }: Props) {
	const menuRef = useRef<HTMLDivElement>(null);

	const clampedX = Math.min(x, window.innerWidth - 180);
	const clampedY = Math.min(y, window.innerHeight - 220);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose();
			}
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [onClose]);

	function handleAction(action: Action) {
		onAction(action);
		onClose();
	}

	const guestName = booking.guests
		? `${booking.guests.first_name} ${booking.guests.last_name}`
		: 'Walk-in';

	return (
		<div
			ref={menuRef}
			className='fixed z-[9999] shadow-lg border border-[#e8e4dc] rounded-xl bg-white overflow-hidden'
			style={{ left: clampedX, top: clampedY, width: 168 }}>
			<div className='px-3 py-2 border-b border-[#e8e4dc]'>
				<p className='text-[11px] font-semibold text-[#1a1a18] truncate'>{guestName}</p>
				<p className='text-[10px] text-[#a09880]'>#{booking.booking_number} · {booking.party_size}p</p>
			</div>

			<div className='py-1'>
				<button
					className='w-full text-left px-3 py-1.5 text-[12px] text-[#1a1a18] hover:bg-[#faf9f6] transition-colors'
					onClick={() => handleAction('edit')}>
					Edit booking
				</button>
				<button
					className='w-full text-left px-3 py-1.5 text-[12px] text-[#1a1a18] hover:bg-[#faf9f6] transition-colors'
					onClick={() => handleAction('duplicate')}>
					Duplicate
				</button>
			</div>

			<div className='border-t border-[#e8e4dc] py-1'>
				<button
					className='w-full text-left px-3 py-1.5 text-[12px] text-red-500 hover:bg-[#faf9f6] transition-colors'
					onClick={() => handleAction('no_show')}>
					Mark no-show
				</button>
				<button
					className='w-full text-left px-3 py-1.5 text-[12px] text-red-500 hover:bg-[#faf9f6] transition-colors'
					onClick={() => handleAction('cancel')}>
					Cancel booking
				</button>
			</div>

			<div className='border-t border-[#e8e4dc] py-1'>
				<button
					className='w-full text-left px-3 py-1.5 text-[12px] text-[#7a7060] hover:bg-[#faf9f6] transition-colors'
					onClick={() => handleAction('unassign')}>
					Unassign from table
				</button>
			</div>
		</div>
	);
}
