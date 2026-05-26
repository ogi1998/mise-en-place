'use client'

import { useState, useCallback } from 'react'
import type { GuestListItem, GuestProfile } from '@/services/manager/guests/types'
import GuestRow from './GuestRow'
import GuestProfileModal from './GuestProfileModal'

type Props = {
  initialGuests: GuestListItem[]
  restaurantId: string
  currency: string
}

export default function GuestsShell({ initialGuests, restaurantId, currency }: Props) {
  const [search, setSearch] = useState('')
  const [guests, setGuests] = useState(initialGuests)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = guests.filter(g => {
    const q = search.toLowerCase()
    return (
      g.first_name.toLowerCase().includes(q) ||
      g.last_name.toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      g.phone?.includes(q) ||
      g.company?.toLowerCase().includes(q)
    )
  })

  const handleUpdated = useCallback((
    id: string,
    changes: Partial<Pick<GuestProfile, 'first_name' | 'last_name' | 'loyalty_tier' | 'lifetime_spend' | 'company'>>
  ) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...changes } : g))
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/6 bg-white px-6 py-4">
        <div>
          <h1 className="text-[15px] font-semibold text-[#1a1a18]"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            Guests
          </h1>
          <p className="text-[12px] text-black/40 mt-0.5">{guests.length} total</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, email, phone or company…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-72 px-3 py-2 text-sm border border-[#e8e4dc] rounded-lg bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] placeholder:text-black/25"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">Allergens</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">Last visit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">Visits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">Spend</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(guest => (
                  <GuestRow
                    key={guest.id}
                    guest={guest}
                    currency={currency}
                    onClick={() => setSelectedId(guest.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile modal */}
      {selectedId && (
        <GuestProfileModal
          guestId={selectedId}
          restaurantId={restaurantId}
          currency={currency}
          onClose={() => setSelectedId(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}