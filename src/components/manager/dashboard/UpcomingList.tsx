import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { BookingWithJoins } from '@/services/dashboard/types'
import UpcomingRow from './UpcomingRow'
import EmptyState from './EmptyState'

type UpcomingListProps = {
  bookings: BookingWithJoins[]
}

export default function UpcomingList({ bookings }: UpcomingListProps) {
  return (
    <section className="pb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-medium uppercase tracking-widest text-black/30">
          Upcoming — next 5 days
        </h2>
        {bookings.length > 0 && (
          <Link
            href="/bookings"
            className="flex items-center gap-1 text-[12px] text-black/40 transition-colors hover:text-black/70"
          >
            All bookings
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {bookings.length === 0 ? (
        <EmptyState message="No upcoming bookings in the next 5 days." />
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <UpcomingRow key={b.id} booking={b} />
          ))}
        </div>
      )}
    </section>
  )
}