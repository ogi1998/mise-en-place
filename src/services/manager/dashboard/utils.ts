import type { BookingWithJoins } from './types'

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('sl-SI', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatBookingNumber(n: number) {
  return `#${String(n).padStart(4, '0')}`
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    seated: 'Seated',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No show',
  }
  return map[status] ?? status
}

export function statusClasses(status: string) {
  switch (status) {
    case 'confirmed':  return 'bg-[#d4e8d0] text-[#2a5c24]'
    case 'pending':    return 'bg-[#fdf0d5] text-[#7a5c1a]'
    case 'seated':     return 'bg-[#d0e4f7] text-[#1a3d6b]'
    case 'cancelled':
    case 'no_show':    return 'bg-[#f7d5d5] text-[#6b1a1a]'
    default:           return 'bg-black/6 text-black/50'
  }
}

export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export function guestName(booking: BookingWithJoins) {
  return booking.guests
    ? `${booking.guests.first_name} ${booking.guests.last_name}`
    : 'Walk-in'
}