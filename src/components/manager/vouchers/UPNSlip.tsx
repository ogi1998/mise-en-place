import type { Voucher } from '@/services/manager/vouchers/types'

type Props = {
  voucher: Voucher
  bankIban: string
  bankAccountHolder: string
  bankName?: string | null
  bankBic?: string | null
  currency?: string
}

export default function UPNSlip({ voucher, bankIban, bankAccountHolder, bankName, bankBic, currency = 'EUR' }: Props) {
  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'
  const isValueVoucher = voucher.type === 'value' && (voucher.amount ?? 0) > 0
  const amountDisplay = isValueVoucher
    ? `${currencySymbol}${(voucher.amount ?? 0).toFixed(2)}`
    : 'Po dogovoru / To be confirmed'

  return (
    <div className="border border-[#d8d3ca] rounded-lg overflow-hidden text-[11px]">
      {/* Header */}
      <div className="bg-[#1a1a18] px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#f5f0e8]">
          Nalog za plačilo · Payment Order
        </span>
        <span className="text-[10px] font-bold text-[#c9a96e]">UPN</span>
      </div>

      <div className="bg-white p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#a09880] mb-0.5">Plačnik / Payer</p>
            <p className="text-[12px] font-medium text-[#1a1a18]">{voucher.buyer_name}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#a09880] mb-0.5">Znesek / Amount</p>
            <p className={`font-bold ${isValueVoucher ? 'text-[15px] text-[#1a1a18]' : 'text-[11px] text-[#a09880] italic'}`}>
              {amountDisplay}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#a09880] mb-0.5">Namen / Purpose</p>
            <p className="text-[12px] text-[#1a1a18] font-mono">Darilni bon {voucher.code}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#a09880] mb-0.5">Koda namena / Code</p>
            <p className="text-[12px] text-[#1a1a18] font-mono">GDSV</p>
          </div>
        </div>

        <div className="border-t border-[#e8e4dc] pt-3">
          <p className="text-[9px] uppercase tracking-wider text-[#a09880] mb-1">Prejemnik / Payee</p>
          <p className="text-[12px] font-semibold text-[#1a1a18]">{bankAccountHolder}</p>
          <p className="text-[12px] text-[#1a1a18] font-mono mt-0.5 tracking-wide">{bankIban}</p>
          <div className="flex gap-4 mt-0.5">
            {bankBic && (
              <p className="text-[10px] text-[#7a7060]">BIC/SWIFT: <span className="font-mono">{bankBic}</span></p>
            )}
            {bankName && (
              <p className="text-[10px] text-[#7a7060]">{bankName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#faf9f6] border-t border-[#e8e4dc] px-4 py-2">
        <p className="text-[10px] text-[#a09880]">
          Pri plačilu navedite referenco{' '}
          <span className="font-mono font-semibold text-[#7a7060]">{voucher.code}</span>
          {' '}· When paying, reference code{' '}
          <span className="font-mono font-semibold text-[#7a7060]">{voucher.code}</span>
        </p>
      </div>
    </div>
  )
}
