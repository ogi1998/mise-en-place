'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DayCount } from '@/services/manager/calendar/queries'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Props = {
  year: number
  month: number
  counts: Record<string, DayCount>
  eventDates?: string[]
}

type HeatLevel = 0 | 1 | 2 | 3 | 4

function heatLevel(count: number, max: number): HeatLevel {
  if (count === 0 || max === 0) return 0
  const ratio = count / max
  if (ratio <= 0.25) return 1
  if (ratio <= 0.50) return 2
  if (ratio <= 0.75) return 3
  return 4
}

const HEAT_BG: Record<HeatLevel, string> = {
  0: '',
  1: 'bg-emerald-50',
  2: 'bg-emerald-100',
  3: 'bg-emerald-200',
  4: 'bg-emerald-300',
}

const HEAT_TEXT: Record<HeatLevel, string> = {
  0: 'text-[#1a1a18]',
  1: 'text-emerald-800',
  2: 'text-emerald-800',
  3: 'text-emerald-900',
  4: 'text-emerald-900',
}

const HEAT_SUBTEXT: Record<HeatLevel, string> = {
  0: 'text-[#7a7060]',
  1: 'text-emerald-600',
  2: 'text-emerald-700',
  3: 'text-emerald-800',
  4: 'text-emerald-800',
}

export default function CalendarGrid({ year, month, counts, eventDates = [] }: Props) {
  const eventDateSet = new Set(eventDates)
  const router = useRouter()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // First day of month (0=Sun…6=Sat), convert to Mon-based (0=Mon…6=Sun)
  const firstDow = new Date(year, month - 1, 1).getDay()
  const offset = (firstDow + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()

  const maxBookings = Math.max(...Object.values(counts).map(d => d.bookings), 1)

  function navigate(delta: number) {
    let y = year
    let m = month + delta
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    router.push(`/calendar?year=${y}&month=${m}`)
  }

  function goToDay(dateStr: string) {
    router.push(`/timetable?date=${dateStr}`)
  }

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="bg-white rounded-2xl border border-[#e8e4dc] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e4dc]">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-[#7a7060] hover:text-[#1a1a18] hover:bg-[#f5f0e8] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-serif text-lg font-semibold text-[#1a1a18]">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button
          onClick={() => navigate(1)}
          className="p-1.5 rounded-lg text-[#7a7060] hover:text-[#1a1a18] hover:bg-[#f5f0e8] transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-[#e8e4dc]">
        {DAY_NAMES.map(d => (
          <div key={d} className="py-2 text-center text-[11px] font-medium uppercase tracking-wider text-[#a09880]">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-28 border-b border-r border-[#e8e4dc] last:border-r-0 bg-[#faf9f6]/50" />
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayData = counts[dateStr]
          const hasEvent = eventDateSet.has(dateStr)
          const isToday = dateStr === todayStr
          const isWeekend = (idx % 7) >= 5
          const level = dayData ? heatLevel(dayData.bookings, maxBookings) : 0

          return (
            <button
              key={dateStr}
              onClick={() => goToDay(dateStr)}
              className={`h-28 border-b border-r border-[#e8e4dc] p-2 text-left transition-colors hover:brightness-95 cursor-pointer ${
                isWeekend && level === 0 ? 'bg-[#faf9f6]/60' : ''
              } ${HEAT_BG[level]}`}
            >
              <span className={`text-sm font-medium leading-none ${
                isToday
                  ? 'flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a18] text-[#f5f0e8] text-xs'
                  : level > 0 ? HEAT_TEXT[level] : 'text-[#1a1a18]'
              }`}>
                {day}
              </span>

              {dayData && (
                <div className="mt-1 space-y-0.5">
                  <p className={`text-xs font-semibold ${HEAT_TEXT[level]}`}>
                    {dayData.bookings} {dayData.bookings === 1 ? 'booking' : 'bookings'}
                  </p>
                  <p className={`text-[11px] font-medium ${HEAT_SUBTEXT[level]}`}>
                    {dayData.covers} {dayData.covers === 1 ? 'cover' : 'covers'}
                  </p>
                </div>
              )}
              {hasEvent && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#dbeafe] text-[#1d4ed8]">
                    Event
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
