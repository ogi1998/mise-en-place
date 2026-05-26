'use client'

import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import type { SpecialDay } from '@/services/manager/settings/special-days/types'

type Props = {
  days: SpecialDay[]
  onAdd: (name: string, date: string) => Promise<{ error: string | null }>
}

function computeEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function formatDDMM(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}.${m}.`
}

function getHolidays(year: number) {
  const easter = computeEaster(year)
  return [
    { name: "New Year's Day",         date: `${year}-01-01` },
    { name: "New Year's Day (2nd)",    date: `${year}-01-02` },
    { name: 'Prešeren Day',            date: `${year}-02-08` },
    { name: 'Easter Sunday',           date: toISO(easter) },
    { name: 'Easter Monday',           date: toISO(addDays(easter, 1)) },
    { name: 'Uprising Day',            date: `${year}-04-27` },
    { name: 'Labour Day',              date: `${year}-05-01` },
    { name: 'Labour Day (2nd)',         date: `${year}-05-02` },
    { name: 'Statehood Day',           date: `${year}-06-25` },
    { name: 'Assumption Day',          date: `${year}-08-15` },
    { name: 'Reformation Day',         date: `${year}-10-31` },
    { name: "All Saints' Day",         date: `${year}-11-01` },
    { name: 'Day of the Dead',         date: `${year}-11-02` },
    { name: 'Christmas Eve',           date: `${year}-12-24` },
    { name: 'Christmas Day',           date: `${year}-12-25` },
    { name: 'Independence Day',        date: `${year}-12-26` },
    { name: "New Year's Eve",          date: `${year}-12-31` },
  ]
}

export default function HolidaysTab({ days, onAdd }: Props) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [adding, setAdding] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const holidays = getHolidays(year)

  // A holiday is "added" if a recurring closed day exists for that month-day
  function isAdded(isoDate: string): boolean {
    const [, m, d] = isoDate.split('-')
    return days.some(day => {
      const [, dm, dd] = day.date.split('-')
      return dm === m && dd === d && day.type === 'closed' && day.is_recurring
    })
  }

  async function handleAdd(name: string, date: string) {
    setAdding(date)
    setErrors(prev => ({ ...prev, [date]: '' }))
    const { error } = await onAdd(name, date)
    if (error) setErrors(prev => ({ ...prev, [date]: error }))
    setAdding(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-[#7a7060]">
          Slovenian public holidays — added as closed, recurring yearly.
        </p>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setYear(y => y - 1)}
            className="px-2 py-1 text-xs text-[#7a7060] hover:text-[#1a1a18] border border-[#e8e4dc] rounded-md transition-colors"
          >
            ‹
          </button>
          <span className="px-3 py-1 text-xs font-medium text-[#1a1a18] border border-[#e8e4dc] rounded-md min-w-[56px] text-center">
            {year}
          </span>
          <button
            onClick={() => setYear(y => y + 1)}
            className="px-2 py-1 text-xs text-[#7a7060] hover:text-[#1a1a18] border border-[#e8e4dc] rounded-md transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {holidays.map(h => {
          const added = isAdded(h.date)
          return (
            <div
              key={h.date}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#e8e4dc] bg-white"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-[#7a7060] w-10">{formatDDMM(h.date)}</span>
                <span className="text-sm text-[#1a1a18]">{h.name}</span>
                {errors[h.date] && (
                  <span className="text-xs text-red-500">{errors[h.date]}</span>
                )}
              </div>
              <button
                onClick={() => !added && handleAdd(h.name, h.date)}
                disabled={added || adding === h.date}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md border transition-colors ${
                  added
                    ? 'bg-green-50 text-green-700 border-green-200 cursor-default'
                    : 'text-[#1a1a18] border-[#d8d3ca] hover:bg-[#f5f0e8] disabled:opacity-50'
                }`}
              >
                {added ? (
                  <><Check size={11} /> Added</>
                ) : (
                  <><Plus size={11} /> {adding === h.date ? 'Adding…' : 'Add'}</>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
