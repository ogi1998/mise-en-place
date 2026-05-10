'use client'

import type { GuestListItem } from '@/services/manager/guests/types'
import { getInitials, formatDateEU } from '@/services/manager/guests/utils'

type Props = {
  guest: GuestListItem
}

export default function GuestRow({ guest }: Props) {
  const initials = getInitials(guest.first_name, guest.last_name)

  return (
    <tr className="border-b border-[#e8e4dc] last:border-0 hover:bg-[#faf9f6] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a1a18] text-[11px] font-semibold text-[#f5f0e8]">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-[#1a1a18]">
              {guest.first_name} {guest.last_name}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-[#5a5545]">{guest.email ?? '—'}</p>
        <p className="text-xs text-[#a09880]">{guest.phone ?? '—'}</p>
      </td>
      <td className="px-4 py-3">
        {guest.allergens?.length ? (
          <div className="flex flex-wrap gap-1">
            {guest.allergens.map(a => (
              <span
                key={a}
                className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700"
              >
                {a}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-[#a09880]">None</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-[#5a5545]">
        {guest.last_visit ? formatDateEU(guest.last_visit) : '—'}
      </td>
      <td className="px-4 py-3 text-xs text-[#5a5545]">
        {guest.total_visits}
      </td>
    </tr>
  )
}