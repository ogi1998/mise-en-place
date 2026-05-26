import type { SupabaseClient } from '@supabase/supabase-js'
import type { Voucher } from './types'

const SELECT = 'id, restaurant_id, type, amount, courses, wines, wine_guests, hotel_addon, delivery_type, delivery_address, buyer_name, buyer_email, buyer_phone, recipient_name, dedication, code, status, issued_at, expires_at, redeemed_at, redeemed_by_guest_id, created_at, updated_at'

async function generateCode(supabase: SupabaseClient, restaurantId: string): Promise<string> {
  const year = new Date().getFullYear()
  const yearStart = `${year}-01-01T00:00:00`
  const yearEnd = `${year}-12-31T23:59:59`

  const { count } = await supabase
    .from('vouchers')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)
    .gte('created_at', yearStart)
    .lte('created_at', yearEnd)

  const seq = String((count ?? 0) + 1).padStart(3, '0')
  return `#${seq}-${year}`
}

export async function getVouchers(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<Voucher[]> {
  const { data } = await supabase
    .from('vouchers')
    .select(SELECT)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  return (data ?? []) as Voucher[]
}

export async function createVoucher(
  supabase: SupabaseClient,
  restaurantId: string,
  payload: Omit<Voucher, 'id' | 'restaurant_id' | 'code' | 'status' | 'issued_at' | 'expires_at' | 'redeemed_at' | 'redeemed_by_guest_id' | 'created_at' | 'updated_at'>,
): Promise<{ data: Voucher | null; error: string | null }> {
  const code = await generateCode(supabase, restaurantId)

  const { data, error } = await supabase
    .from('vouchers')
    .insert({ ...payload, restaurant_id: restaurantId, code, status: 'pending' })
    .select(SELECT)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Voucher, error: null }
}

export async function updateVoucher(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<Omit<Voucher, 'id' | 'restaurant_id' | 'code' | 'created_at' | 'updated_at'>>,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('vouchers')
    .update(payload)
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function activateVoucher(
  supabase: SupabaseClient,
  id: string,
): Promise<{ error: string | null }> {
  const issuedAt = new Date()
  const expiresAt = new Date(issuedAt)
  expiresAt.setMonth(expiresAt.getMonth() + 6)

  return updateVoucher(supabase, id, {
    status: 'active',
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  })
}

export async function redeemVoucher(
  supabase: SupabaseClient,
  id: string,
): Promise<{ error: string | null }> {
  return updateVoucher(supabase, id, {
    status: 'redeemed',
    redeemed_at: new Date().toISOString(),
  })
}

export async function deleteVoucher(
  supabase: SupabaseClient,
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('vouchers')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { error: null }
}
