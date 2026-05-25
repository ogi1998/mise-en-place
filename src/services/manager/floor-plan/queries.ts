import type { SupabaseClient } from '@supabase/supabase-js'
import type { FloorPlanTable, FloorPlanBooking } from './types'

export async function getFloorPlanTables(
  supabase: SupabaseClient,
  restaurantId: string,
  areaId: string
): Promise<FloorPlanTable[]> {
  const { data } = await supabase
    .from('tables')
    .select('id, name, nickname, shape, min_seats, seats, max_seats, sort_order, floor_plan_x, floor_plan_y, floor_plan_rotation')
    .eq('restaurant_id', restaurantId)
    .eq('service_area_id', areaId)
    .eq('is_active', true)
    .order('sort_order')

  return (data ?? []) as FloorPlanTable[]
}

export async function getFloorPlanBookings(
  supabase: SupabaseClient,
  restaurantId: string,
  date: string
): Promise<FloorPlanBooking[]> {
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, booking_number, status, party_size,
      start_time, end_time, notes, internal_notes, is_delayed,
      guests(first_name, last_name, email, phone)
    `)
    .eq('restaurant_id', restaurantId)
    .eq('booking_date', date)
    .not('status', 'in', '("cancelled","no_show","completed")')

  if (!bookings?.length) return []

  const bookingIds = bookings.map((b) => b.id)
  const { data: bookingTables } = await supabase
    .from('booking_tables')
    .select('booking_id, table_id')
    .in('booking_id', bookingIds)

  const tableMap = (bookingTables ?? []).reduce<Record<string, string[]>>(
    (acc, row) => {
      if (!acc[row.booking_id]) acc[row.booking_id] = []
      acc[row.booking_id].push(row.table_id)
      return acc
    },
    {}
  )

  return bookings.map((b) => ({
    ...(b as unknown as Omit<FloorPlanBooking, 'table_ids'>),
    table_ids: tableMap[b.id] ?? [],
  }))
}

export async function updateTablePosition(
  supabase: SupabaseClient,
  tableId: string,
  x: number,
  y: number,
  rotation: number
): Promise<void> {
  await supabase
    .from('tables')
    .update({ floor_plan_x: x, floor_plan_y: y, floor_plan_rotation: rotation })
    .eq('id', tableId)
}

export async function clearTablePosition(
  supabase: SupabaseClient,
  tableId: string
): Promise<void> {
  await supabase
    .from('tables')
    .update({ floor_plan_x: null, floor_plan_y: null, floor_plan_rotation: null })
    .eq('id', tableId)
}

export async function assignBookingToTable(
  supabase: SupabaseClient,
  bookingId: string,
  tableId: string,
  restaurantId: string
): Promise<void> {
  await supabase
    .from('booking_tables')
    .insert({ booking_id: bookingId, table_id: tableId, restaurant_id: restaurantId })
}