import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { sendVoucherActivation } from '@/lib/resend'

function formatTypeLabel(v: { type: string; amount?: number | null; courses?: number | null; hotel_addon?: boolean; wine_guests?: number | null }, currency: string): string {
  const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'
  switch (v.type) {
    case 'value': return `Value Voucher — ${sym}${v.amount?.toFixed(2) ?? '?'}`
    case 'experience_menu': return `${v.courses ?? '?'}-course tasting menu${v.hotel_addon ? ' + hotel' : ''}`
    case 'wine_pairing': return `Wine pairing${v.wine_guests ? ` for ${v.wine_guests} guests` : ''}`
    case 'hotel_addon': return 'Hotel accommodation'
    default: return v.type
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing voucher id' }, { status: 400 })

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const issuedAt = new Date()
  const expiresAt = new Date(issuedAt)
  expiresAt.setMonth(expiresAt.getMonth() + 6)

  const { data: voucher, error } = await supabase
    .from('vouchers')
    .update({
      status: 'active',
      issued_at: issuedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq('id', id)
    .select('id, restaurant_id, type, amount, courses, hotel_addon, wine_guests, code, buyer_name, buyer_email, recipient_name, dedication, delivery_type, delivery_address, status, issued_at, expires_at')
    .single()

  if (error || !voucher) {
    return NextResponse.json({ error: error?.message ?? 'Failed to activate' }, { status: 500 })
  }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, currency')
    .eq('id', voucher.restaurant_id)
    .single()

  try {
    await sendVoucherActivation({
      to: voucher.buyer_email,
      buyerName: voucher.buyer_name,
      recipientName: voucher.recipient_name,
      restaurantName: (restaurant as any)?.name ?? '',
      code: voucher.code,
      typeLabel: formatTypeLabel(voucher as any, (restaurant as any)?.currency ?? 'EUR'),
      expiresAt: formatDate(voucher.expires_at!),
      dedication: voucher.dedication,
      deliveryType: (voucher as any).delivery_type ?? 'digital',
      deliveryAddress: (voucher as any).delivery_address ?? null,
    })
  } catch (e) {
    console.error('Voucher activation email failed:', e)
  }

  return NextResponse.json({ voucher })
}
