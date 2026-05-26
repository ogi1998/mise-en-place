'use client'

import type { GuestListItem, LoyaltyTier } from '@/services/manager/guests/types'
import { getInitials, formatDateEU } from '@/services/manager/guests/utils'

type Props = {
  guest: GuestListItem
  currency: string
  onClick: () => void
}

function TierBadge({ tier }: { tier: LoyaltyTier }) {
  const styles: Record<LoyaltyTier, string> = {
    bronze: 'bg-amber-50 text-amber-700 border-amber-200',
    silver: 'bg-slate-100 text-slate-600 border-slate-200',
    gold: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    platinum: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${styles[tier]}`}>
      {tier}
    </span>
  )
}

function formatSpend(amount: number | null, currency: string): string {
  if (amount == null) return '—'
  const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'
  return `${sym}${amount.toFixed(2)}`
}

export default function GuestRow({ guest, currency, onClick }: Props) {
  const initials = getInitials(guest.first_name, guest.last_name)

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-[#e8e4dc] last:border-0 hover:bg-[#faf9f6] transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a1a18] text-[11px] font-semibold text-[#f5f0e8]">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-[#1a1a18]">
              {guest.first_name} {guest.last_name}
            </p>
            {guest.company && (
              <p className="text-[11px] text-[#a09880]">{guest.company}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-[#5a5545]">{guest.email ?? '—'}</p>
        <p className="text-xs text-[#a09880]">{guest.phone ?? '—'}</p>
      </td>
      <td className="px-4 py-3">
        {guest.loyalty_tier ? (
          <TierBadge tier={guest.loyalty_tier} />
        ) : (
          <span className="text-xs text-[#a09880]">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {guest.allergens?.length ? (
          <div className="flex flex-wrap gap-1">
            {guest.allergens.slice(0, 3).map(a => (
              <span
                key={a}
                className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700"
              >
                {a}
              </span>
            ))}
            {guest.allergens.length > 3 && (
              <span className="text-[10px] text-[#a09880]">+{guest.allergens.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-[#a09880]">None</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-[#5a5545]">
        {guest.last_visit ? formatDateEU(guest.last_visit) : '—'}
      </td>
      <td className="px-4 py-3 text-xs text-[#5a5545]">{guest.total_visits}</td>
      <td className="px-4 py-3 text-xs text-[#5a5545]">
        {formatSpend(guest.lifetime_spend, currency)}
      </td>
    </tr>
  )
}