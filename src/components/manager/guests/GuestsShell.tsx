'use client'

import { useState } from 'react'
import type { GuestListItem } from '@/services/manager/guests/types'
import GuestRow from './GuestRow'

type Props = {
  initialGuests: GuestListItem[]
}

export default function GuestsShell({ initialGuests }: Props) {
  const [search, setSearch] = useState('')

  const filtered = initialGuests.filter(g => {
    const q = search.toLowerCase()
    return (
      g.first_name.toLowerCase().includes(q) ||
      g.last_name.toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      g.phone?.includes(q)
    )
  })

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/6 bg-white px-6 py-4">
        <div>
          <h1 className="text-[15px] font-semibold text-[#1a1a18]"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            Guests
          </h1>
          <p className="text-[12px] text-black/40 mt-0.5">{initialGuests.length} total</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64 px-3 py-2 text-sm border border-[#e8e4dc] rounded-lg bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] placeholder:text-black/25"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[#a09880]">
              {search ? 'No guests match your search.' : 'No guests yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#e8e4dc] bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e8e4dc] bg-[#faf9f6]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">Allergens</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">Last visit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">Visits</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(guest => (
                  <GuestRow key={guest.id} guest={guest} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}