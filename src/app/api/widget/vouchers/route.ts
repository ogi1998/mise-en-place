import { NextRequest, NextResponse } from 'next/server'
import { createAnonSupabaseClient } from '@/lib/supabase-anon'
import { createVoucher } from '@/services/manager/vouchers/queries'
import { sendVoucherOrderConfirmation } from '@/lib/resend'

function formatTypeLabel(type: string, amount: number | null, courses: number | null, hotel_addon: boolean, wine_guests: number | null, currency: string): string {
  const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'
  switch (type) {
    case 'value': return `Value Voucher — ${sym}${amount?.toFixed(2) ?? '?'}`
    case 'experience_menu': return `${courses ?? '?'}-course tasting menu${hotel_addon ? ' + hotel' : ''}`
    case 'wine_pairing': return `Wine pairing${wine_guests ? ` for ${wine_guests} guests` : ''}`
    case 'hotel_addon': return 'Hotel accommodation'
    default: return type
  }
}

function formatDeliveryLabel(type: string): string {
  switch (type) {
    case 'digital': return 'Digital (email)'
    case 'print': return 'Print at home (PDF)'
    case 'physical': return 'Physical envelope'
    default: return type
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    restaurant_id,
    type,
    amount,
    courses,
    wine_guests,
    hotel_addon,
    delivery_type,
    delivery_address,
    buyer_name,
    buyer_email,
    buyer_phone,
    recipient_name,
    dedication,
  } = body

  if (!restaurant_id || !type || !buyer_name || !buyer_email || !delivery_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createAnonSupabaseClient()

  const { data: voucher, error } = await createVoucher(supabase, restaurant_id, {
    type,
    amount: amount ?? null,
    courses: courses ?? null,
    wines: null,
    wine_guests: wine_guests ?? null,
    hotel_addon: hotel_addon ?? false,
    delivery_type,
    delivery_address: delivery_address ?? null,
    buyer_name,
    buyer_email,
    buyer_phone: buyer_phone ?? null,
    recipient_name: recipient_name ?? null,
    dedication: dedication ?? null,
  })

  if (error || !voucher) {
    return NextResponse.json({ error: error ?? 'Failed to create voucher' }, { status: 500 })
  }

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, currency, bank_iban, bank_account_holder, bank_bic')
    .eq('id', restaurant_id)
    .single()

  try {
    const r = restaurant as any
    await sendVoucherOrderConfirmation({
      to: buyer_email,
      buyerName: buyer_name,
      restaurantName: r?.name ?? '',
      code: voucher.code,
      typeLabel: formatTypeLabel(type, amount ?? null, courses ?? null, hotel_addon ?? false, wine_guests ?? null, r?.currency ?? 'EUR'),
      deliveryLabel: formatDeliveryLabel(delivery_type),
      bankIban: r?.bank_iban ?? null,
      bankAccountHolder: r?.bank_account_holder ?? null,
      bankBic: r?.bank_bic ?? null,
      currency: r?.currency ?? 'EUR',
      amount: type === 'value' ? amount ?? null : null,
    })
  } catch (e) {
    console.error('Voucher order confirmation email failed:', e)
  }

  return NextResponse.json({ voucher })
}
