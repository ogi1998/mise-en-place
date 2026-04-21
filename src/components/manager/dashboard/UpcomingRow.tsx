import type { BookingWithJoins } from '@/services/dashboard/types'
import { formatTime, formatBookingNumber, statusLabel, statusClasses } from '@/services/dashboard/utils'

type UpcomingRowProps = {
  booking: BookingWithJoins
}

export default function UpcomingRow({ booking: b }: UpcomingRowProps) {
  const date = new Date(b.start_time).toLocaleDateString('sl-SI', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className="flex items-center gap-4 rounded-xl border border-black/6 bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:bg-black/1.5">
      <div className="w-24 shrink-0">
        <p className="text-[12px] capitalize text-black/50">{date}</p>
        <p className="tabular-nums text-[12px] text-black/40">{formatTime(b.start_time)}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[#1a1a18]">
          {b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Walk-in'}
        </p>
        <p className="text-[12px] text-black/40">
          {b.service_areas?.name ?? '—'} · {b.party_size}{' '}
          {b.party_size === 1 ? 'guest' : 'guests'}
        </p>
      </div>
      <div className="shrink-0">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusClasses(b.status)}`}
        >
          {statusLabel(b.status)}
        </span>
      </div>
      <span className="shrink-0 font-mono text-[11px] text-black/25">
        {formatBookingNumber(b.booking_number)}
      </span>
    </div>
  )
}