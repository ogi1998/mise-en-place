'use client'

import { useEffect } from 'react'
import { X, Printer } from 'lucide-react'
import VoucherTemplate from '@/components/manager/vouchers/VoucherTemplate'
import UPNSlip from '@/components/manager/vouchers/UPNSlip'
import type { Voucher } from '@/services/manager/vouchers/types'

type Props = {
  voucher: Voucher
  restaurantName: string
  logoUrl?: string | null
  bankIban?: string | null
  bankAccountHolder?: string | null
  bankName?: string | null
  bankBic?: string | null
  currency?: string
  onClose: () => void
}

export default function VoucherPreviewModal({ voucher, restaurantName, logoUrl, bankIban, bankAccountHolder, bankName, bankBic, currency, onClose }: Props) {
  const showSlip = voucher.status === 'pending' && !!bankIban && !!bankAccountHolder
  // Inject print styles that isolate the voucher template
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'voucher-print-style'
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #voucher-print-wrapper { display: flex !important; }
        #voucher-print-wrapper > * { display: block !important; }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.getElementById('voucher-print-style')?.remove()
    }
  }, [])

  function handlePrint() {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Actions bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-[#1a1a18] rounded-md hover:bg-[#f5f0e8] transition-colors font-medium"
          >
            <Printer size={14} />
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <X size={14} />
            Close
          </button>
        </div>

        {/* Voucher template */}
        <div id="voucher-print-wrapper" style={{ display: 'flex' }}>
          <VoucherTemplate
            voucher={voucher}
            restaurantName={restaurantName}
            logoUrl={logoUrl}
          />
        </div>

        {/* UPN payment slip — pending vouchers only, when bank details are configured */}
        {showSlip && (
          <div className="w-[593px]">
            <UPNSlip
              voucher={voucher}
              bankIban={bankIban!}
              bankAccountHolder={bankAccountHolder!}
              bankName={bankName}
              bankBic={bankBic}
              currency={currency}
            />
          </div>
        )}

        {/* Info line */}
        <p className="text-[12px] text-white/30">
          A5 landscape · {voucher.code}
          {voucher.status === 'pending' && ' · Expiry shown after activation'}
        </p>
      </div>
    </div>
  )
}
