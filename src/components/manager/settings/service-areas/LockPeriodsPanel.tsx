import { Lock, Plus, X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { AreaLockPeriodFormData } from '@/schemas/manager/settings/service-areas';
import type { AreaLockPeriod, ServiceArea } from '@/services/manager/settings/service-areas/types';

type Props = {
	area: ServiceArea;
	lockPeriods: AreaLockPeriod[];
	loadingLocks: string | null;
	showLockForm: string | null;
	lockForm: UseFormReturn<AreaLockPeriodFormData>;
	lockFormLoading: boolean;
	lockFormError: string | null;
	onOpenLockForm: (areaId: string) => void;
	onCancelLockForm: () => void;
	onSubmitLock: () => void;
	onDeleteLock: (areaId: string, lockId: string) => void;
};

export default function LockPeriodsPanel({
	area,
	lockPeriods,
	loadingLocks,
	showLockForm,
	lockForm,
	lockFormLoading,
	lockFormError,
	onOpenLockForm,
	onCancelLockForm,
	onSubmitLock,
	onDeleteLock
}: Props) {
	const {
		register,
		formState: { errors }
	} = lockForm;

	return (
		<div className='border-t border-[#e8e4dc] bg-[#faf9f6] px-5 py-4'>
			<div className='flex items-center justify-between mb-3'>
				<div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#a09880]'>
					<Lock size={12} />
					Lock Periods
				</div>
				<button
					onClick={() => onOpenLockForm(area.id)}
					className='flex items-center gap-1.5 text-xs text-[#5a5545] hover:text-[#1a1a18] transition-colors'>
					<Plus size={12} />
					Add Period
				</button>
			</div>

			{showLockForm === area.id && (
				<div className='mb-3 p-4 border border-[#e8e4dc] rounded-lg bg-white'>
					<div className='grid grid-cols-2 gap-3'>
						<div className='col-span-2'>
							<label className='block text-xs font-medium text-[#5a5545] mb-1'>Label</label>
							<input
								{...register('name')}
								type='text'
								placeholder='e.g. Winter closure'
								className='w-full px-3 py-1.5 border border-[#e8e4dc] rounded-lg text-sm focus:outline-none focus:border-[#1a1a18] transition-colors'
							/>
						</div>
						<div>
							<label className='block text-xs font-medium text-[#5a5545] mb-1'>From *</label>
							<input
								{...register('start_date')}
								type='date'
								className='w-full px-3 py-1.5 border border-[#e8e4dc] rounded-lg text-sm focus:outline-none focus:border-[#1a1a18] transition-colors'
							/>
							{errors.start_date && (
								<p className='text-[11px] text-red-500 mt-1'>{errors.start_date.message}</p>
							)}
						</div>
						<div>
							<label className='block text-xs font-medium text-[#5a5545] mb-1'>To *</label>
							<input
								{...register('end_date')}
								type='date'
								className='w-full px-3 py-1.5 border border-[#e8e4dc] rounded-lg text-sm focus:outline-none focus:border-[#1a1a18] transition-colors'
							/>
							{errors.end_date && (
								<p className='text-[11px] text-red-500 mt-1'>{errors.end_date.message}</p>
							)}
						</div>
						<div className='col-span-2'>
							<label className='block text-xs font-medium text-[#5a5545] mb-1'>Reason</label>
							<input
								{...register('reason')}
								type='text'
								placeholder='Optional internal note'
								className='w-full px-3 py-1.5 border border-[#e8e4dc] rounded-lg text-sm focus:outline-none focus:border-[#1a1a18] transition-colors'
							/>
						</div>
					</div>
					{lockFormError && <p className='text-[12px] text-red-500 mt-3'>{lockFormError}</p>}
					<div className='flex justify-end gap-2 mt-3'>
						<button
							onClick={onCancelLockForm}
							className='px-3 py-1.5 text-xs text-[#5a5545] hover:text-[#1a1a18] transition-colors'>
							Cancel
						</button>
						<button
							onClick={onSubmitLock}
							disabled={lockFormLoading}
							className='px-3 py-1.5 bg-[#1a1a18] text-[#f5f0e8] text-xs rounded-lg hover:bg-[#2d2d2a] disabled:opacity-50 transition-colors'>
							{lockFormLoading ? 'Saving…' : 'Save'}
						</button>
					</div>
				</div>
			)}

			{loadingLocks === area.id ? (
				<p className='text-xs text-[#a09880]'>Loading…</p>
			) : lockPeriods.length === 0 ? (
				<p className='text-xs text-[#a09880]'>No lock periods defined.</p>
			) : (
				<div className='space-y-1.5'>
					{lockPeriods.map((lock) => (
						<div
							key={lock.id}
							className='flex items-center justify-between text-xs bg-white border border-[#e8e4dc] rounded-lg px-3 py-2'>
							<div>
								<span className='font-medium text-[#1a1a18]'>{lock.name || 'Lock period'}</span>
								<span className='text-[#a09880] ml-2'>
									{formatDate(lock.start_date)} – {formatDate(lock.end_date)}
								</span>
								{lock.reason && <span className='text-[#c0b8a8] ml-2'>· {lock.reason}</span>}
							</div>
							<button
								onClick={() => onDeleteLock(area.id, lock.id)}
								className='text-[#a09880] hover:text-red-600 transition-colors ml-3'>
								<X size={12} />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function formatDate(iso: string) {
	const [year, month, day] = iso.split('-');
	return `${day}.${month}.${year}`;
}
