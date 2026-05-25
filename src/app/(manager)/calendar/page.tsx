import { requireRestaurant } from '@/lib/require-restaurant'
import { getMonthBookingCounts } from '@/services/manager/calendar/queries'
import CalendarGrid from '@/components/manager/calendar/CalendarGrid'

type Props = { searchParams: Promise<{ year?: string; month?: string }> }

export default async function CalendarPage({ searchParams }: Props) {
  const { supabase, restaurantId } = await requireRestaurant()
  const { year: yearStr, month: monthStr } = await searchParams

  const now = new Date()
  const year = yearStr ? parseInt(yearStr) : now.getFullYear()
  const month = monthStr ? parseInt(monthStr) : now.getMonth() + 1

  const counts = await getMonthBookingCounts(supabase, restaurantId, year, month)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-[26px] font-normal text-[#1a1a18]">Calendar</h1>
        <p className="mt-0.5 text-[13px] text-black/40">Click a day to open the timetable</p>
      </div>
      <CalendarGrid year={year} month={month} counts={counts} />
    </div>
  )
}
