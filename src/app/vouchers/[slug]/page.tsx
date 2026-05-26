import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import VoucherOrderShell from '@/components/vouchers/VoucherOrderShell'

type Props = { params: Promise<{ slug: string }> }

export default async function VoucherOrderPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, currency, bank_iban, bank_name, bank_bic, bank_account_holder, vouchers_enabled')
    .eq('slug', slug)
    .single()

  if (!restaurant) notFound()

  const r = restaurant as any

  if (!r.vouchers_enabled) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a7060] mb-2">{r.name}</p>
          <h1 className="font-serif text-3xl font-normal text-[#1a1a18] mb-4">Gift Vouchers</h1>
          <p className="text-[14px] text-[#7a7060]">Online voucher ordering is not available at this time.</p>
          <p className="text-[13px] text-[#a09880] mt-1">Please contact the restaurant directly.</p>
        </div>
      </div>
    )
  }

  return (
    <VoucherOrderShell
      restaurantId={r.id}
      restaurantName={r.name}
      currency={r.currency ?? 'EUR'}
      bankIban={r.bank_iban ?? null}
      bankAccountHolder={r.bank_account_holder ?? null}
      bankName={r.bank_name ?? null}
      bankBic={r.bank_bic ?? null}
    />
  )
}
