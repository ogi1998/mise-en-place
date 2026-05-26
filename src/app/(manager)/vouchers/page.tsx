import { requireRestaurant } from '@/lib/require-restaurant'
import { getVouchers } from '@/services/manager/vouchers/queries'
import VouchersShell from '@/components/manager/vouchers/VouchersShell'

export default async function VouchersPage() {
  const { supabase, restaurantId } = await requireRestaurant()
  const [vouchers, { data: restaurant }] = await Promise.all([
    getVouchers(supabase, restaurantId),
    supabase
      .from('restaurants')
      .select('bank_iban, bank_name, bank_bic, bank_account_holder, currency, vouchers_enabled')
      .eq('id', restaurantId)
      .single(),
  ])
  const r = restaurant as any

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <VouchersShell
        initialVouchers={vouchers}
        restaurantId={restaurantId}
        bankIban={r?.bank_iban ?? null}
        bankAccountHolder={r?.bank_account_holder ?? null}
        bankName={r?.bank_name ?? null}
        bankBic={r?.bank_bic ?? null}
        currency={r?.currency ?? 'EUR'}
        vouchersEnabled={r?.vouchers_enabled ?? false}
      />
    </div>
  )
}
