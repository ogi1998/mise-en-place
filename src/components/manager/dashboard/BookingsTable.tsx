import type { BookingWithJoins } from '@/services/dashboard/types'
import { formatTime, formatBookingNumber, statusLabel, statusClasses, guestName } from '@/services/dashboard/utils'
import EmptyState from './EmptyState'

type BookingsTableProps = {
  bookings: BookingWithJoins[]
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-black/35">
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>
}

export default function BookingsTable({ bookings }: BookingsTableProps) {
  if (bookings.length === 0) {
    return <EmptyState message="No bookings today." />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-black/6 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/6 bg-black/2">
            <Th>Booking</Th>
            <Th>Guest</Th>
            <Th>Time</Th>
            <Th>Area</Th>
            <Th>Covers</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => (
            <tr
              key={b.id}
              className={`border-b border-black/4 transition-colors last:border-0 hover:bg-black/1.5 ${
                i % 2 === 0 ? '' : 'bg-black/1'
              }`}
            >
              <Td>
                <span className="font-mono text-[11px] text-black/40">
                  {formatBookingNumber(b.booking_number)}
                </span>
              </Td>
              <Td>
                <span className="font-medium text-[#1a1a18]">
                  {guestName(b)}
                </span>
              </Td>
              <Td>
                <span className="tabular-nums text-black/60">
                  {formatTime(b.start_time)} – {formatTime(b.end_time)}
                </span>
              </Td>
              <Td>
                <span className="text-black/50">{b.service_areas?.name ?? '—'}</span>
              </Td>
              <Td>
                <span className="tabular-nums text-black/70">{b.party_size}</span>
              </Td>
              <Td>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusClasses(b.status)}`}
                >
                  {statusLabel(b.status)}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}