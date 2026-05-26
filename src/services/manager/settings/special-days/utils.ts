import type { SpecialDayType } from './types'

export const SPECIAL_DAY_TYPE_LABELS: Record<SpecialDayType, string> = {
  closed: 'Closed',
  open: 'Open',
  modified: 'Modified Hours',
}

export const SPECIAL_DAY_TYPE_COLORS: Record<SpecialDayType, string> = {
  closed: 'bg-red-50 text-red-700 border-red-200',
  open: 'bg-green-50 text-green-700 border-green-200',
  modified: 'bg-amber-50 text-amber-700 border-amber-200',
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatDateEU(date: string): string {
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y}`
}

export function formatDateRangeEU(date: string, dateEnd: string | null): string {
  if (!dateEnd) return formatDateEU(date)
  const [, ms, ds] = date.split('-')
  const [ye, me, de] = dateEnd.split('-')
  return `${ds}.${ms} – ${de}.${me}.${ye}`
}
