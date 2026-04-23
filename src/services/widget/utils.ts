export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export function getDayOfWeek(date: string): number {
  const d = new Date(date)
  const day = d.getDay()
  return day === 0 ? 7 : day
}

export function isToday(date: string): boolean {
  return date === new Date().toISOString().split('T')[0]
}

export function nowInMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

type GenerateSlotsParams = {
  openTime: string
  closeTime: string
  pauseFrom: string | null
  pauseTo: string | null
  slotInterval: number
  bookingBeforeClosing: number
  minTimeBeforeSlot: number
  date: string
}

export function generateRawSlots({
  openTime,
  closeTime,
  pauseFrom,
  pauseTo,
  slotInterval,
  bookingBeforeClosing,
  minTimeBeforeSlot,
  date,
}: GenerateSlotsParams): string[] {
  const openMin = timeToMinutes(openTime)
  const closeMin = timeToMinutes(closeTime)
  const pauseFromMin = pauseFrom ? timeToMinutes(pauseFrom) : null
  const pauseToMin = pauseTo ? timeToMinutes(pauseTo) : null

  const lastSlot = closeMin - bookingBeforeClosing

  const slots: string[] = []
  let current = openMin

  while (current <= lastSlot) {
    const inPause = pauseFromMin !== null && pauseToMin !== null
      && current >= pauseFromMin && current < pauseToMin

    if (!inPause) {
      if (isToday(date)) {
        const minStart = nowInMinutes() + minTimeBeforeSlot
        if (current >= minStart) {
          slots.push(minutesToTime(current))
        }
      } else {
        slots.push(minutesToTime(current))
      }
    }

    current += slotInterval
  }

  return slots
}

type BookingWindow = {
  startMin: number
  endMin: number
}

export function getBookingWindows(
  bookings: { start_time: string; end_time: string }[],
  bufferTime: number
): BookingWindow[] {
  return bookings.map(b => {
    const start = new Date(b.start_time)
    const end = new Date(b.end_time)
    const startMin = start.getHours() * 60 + start.getMinutes()
    const endMin = end.getHours() * 60 + end.getMinutes() + bufferTime
    return { startMin, endMin }
  })
}

export function isTableFree(
  tableId: string,
  slotStartMin: number,
  slotEndMin: number,
  bookingsByTable: Record<string, BookingWindow[]>
): boolean {
  const windows = bookingsByTable[tableId] ?? []
  return !windows.some(w => slotStartMin < w.endMin && slotEndMin > w.startMin)
}