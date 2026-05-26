import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('restaurant_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 403 })

  const body = await request.json()
  const { date, start_time, end_time, party_size, table_id, area_id, guest_id, notes } = body

  const { count } = await supabase
    .from('bookings').select('*', { count: 'exact', head: true })
    .eq('restaurant_id', profile.restaurant_id)
  const booking_number = (count ?? 0) + 1

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      restaurant_id: profile.restaurant_id,
      service_area_id: area_id,
      guest_id: guest_id ?? null,
      booking_number,
      status: 'confirmed',
      source: 'manual',
      party_size,
      booking_date: date,
      start_time,
      end_time,
      notes: notes || null,
      is_delayed: false,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (table_id) {
    await supabase.from('booking_tables').insert({
      booking_id: booking.id,
      table_id,
      restaurant_id: profile.restaurant_id,
    })
  }

  return NextResponse.json({ id: booking.id })
}
