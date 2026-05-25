'use client'

import type { WidgetEvent } from '@/services/widget/types'

type Props = {
  events: WidgetEvent[]
  onBookEvent: (date: string) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function toHHMM(t: string): string {
  return t ? t.slice(0, 5) : ''
}

export default function EventsSection({ events, onBookEvent }: Props) {
  if (events.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[#a09880] mb-3 text-center">
        Upcoming events
      </h2>
      <div className="space-y-3">
        {events.map(event => (
          <div
            key={event.id}
            className="bg-white rounded-2xl border border-[#e8e4dc] overflow-hidden shadow-sm"
          >
            {event.cover_image && (
              <div className="h-36 w-full overflow-hidden">
                <img src={event.cover_image} alt={event.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1a1a18] truncate">{event.name}</p>
                <p className="text-xs text-[#7a7060] mt-0.5">
                  {formatDate(event.date)} · {toHHMM(event.time_start)}–{toHHMM(event.time_end)}
                  {event.capacity ? ` · ${event.capacity} seats` : ''}
                </p>
              </div>
              <button
                onClick={() => onBookEvent(event.date)}
                className="shrink-0 px-3 py-1.5 text-xs font-medium bg-[#1a1a18] text-[#f5f0e8] rounded-full hover:bg-[#2a2a26] transition-colors"
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
