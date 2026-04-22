import type { DaySchedule } from './types'

export const COL_WIDTH = 20   // px per 15min slot
export const ROW_HEIGHT = 52  // px per table row
export const HEADER_HEIGHT = 40 // px for time header

// Convert "HH:MM" to total minutes from midnight
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// Convert ISO timestamp to "HH:MM"
export function isoToHHMM(iso: string): string {
  return new Date(iso).toLocaleTimeString('sl-SI', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Generate time labels for the grid header (every 30min)
export function generateTimeLabels(schedule: DaySchedule): string[] {
  const start = timeToMinutes(schedule.open_time)
  const end = timeToMinutes(schedule.close_time)
  const labels: string[] = []

  for (let m = start; m <= end; m += 30) {
    const h = Math.floor(m / 60).toString().padStart(2, '0')
    const min = (m % 60).toString().padStart(2, '0')
    labels.push(`${h}:${min}`)
  }

  return labels
}

// Calculate booking block position and width in pixels
export function bookingToStyle(
  startIso: string,
  endIso: string,
  schedule: DaySchedule
) {
  const originMinutes = timeToMinutes(schedule.open_time)
  const startMinutes = new Date(startIso).getHours() * 60 + new Date(startIso).getMinutes()
  const endMinutes = new Date(endIso).getHours() * 60 + new Date(endIso).getMinutes()

  const left = ((startMinutes - originMinutes) / 15) * COL_WIDTH
  const width = ((endMinutes - startMinutes) / 15) * COL_WIDTH

  return { left, width }
}

// Width of buffer tail in px (always 30min = 2 columns)
export function bufferTailWidth(): number {
  return (30 / 15) * COL_WIDTH
}

// Total grid width in px
export function gridWidth(schedule: DaySchedule): number {
  const start = timeToMinutes(schedule.open_time)
  const end = timeToMinutes(schedule.close_time)
  return ((end - start) / 15) * COL_WIDTH
}

// NOW line position in px, returns null if outside schedule
export function nowLineLeft(schedule: DaySchedule): number | null {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const start = timeToMinutes(schedule.open_time)
  const end = timeToMinutes(schedule.close_time)

  if (nowMinutes < start || nowMinutes > end) return null
  return ((nowMinutes - start) / 15) * COL_WIDTH
}