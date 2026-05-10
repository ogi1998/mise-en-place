import type { BookingStatus } from '@/types/database'

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
}

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  seated: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-[#f0ece4] text-[#7a7060] border-[#e8e4dc]',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  no_show: 'bg-gray-50 text-gray-500 border-gray-200',
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('sl-SI', {
    hour: '2-digit',
    minute: '2-digit',
  })
}