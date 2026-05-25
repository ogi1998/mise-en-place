'use client'

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

type TimetableHeaderProps = {
  date: string
  onDateChange: (date: string) => void
  specialDayLabel?: string
  isClosed?: boolean
}

function offsetDate(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('sl-SI', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function isToday(date: string): boolean {
  return date === new Date().toISOString().split('T')[0]
}

export default function TimetableHeader({ date, onDateChange, specialDayLabel, isClosed }: TimetableHeaderProps) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-black/6 bg-white px-6">
      <button
        onClick={() => onDateChange(offsetDate(date, -1))}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-black/8 text-black/40 transition-colors hover:border-black/15 hover:text-black/70"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => onDateChange(offsetDate(date, 1))}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-black/8 text-black/40 transition-colors hover:border-black/15 hover:text-black/70"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      <p className="text-[13px] font-medium capitalize text-[#1a1a18]">
        {formatDate(date)}
      </p>

      {specialDayLabel && (
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
          isClosed
            ? 'bg-red-50 text-red-600'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {isClosed ? `Closed · ${specialDayLabel}` : `Modified hours · ${specialDayLabel}`}
        </span>
      )}

      {!isToday(date) && (
        <button
          onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
          className="flex items-center gap-1.5 rounded-md border border-black/8 px-2.5 py-1 text-[11px] text-black/40 transition-colors hover:border-black/15 hover:text-black/70"
        >
          <CalendarDays className="h-3 w-3" />
          Today
        </button>
      )}
    </div>
  )
}