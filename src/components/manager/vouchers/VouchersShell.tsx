'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Gift, Eye, BadgeCheck, AlertTriangle, ToggleLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { redeemVoucher, deleteVoucher } from '@/services/manager/vouchers/queries'
import VoucherModal from '@/components/manager/vouchers/VoucherModal'
import VoucherPreviewModal from '@/components/manager/vouchers/VoucherPreviewModal'
import { useAuthStore } from '@/store/authStore'
import type { Voucher, VoucherStatus } from '@/services/manager/vouchers/types'

type Props = {
  initialVouchers: Voucher[]
  restaurantId: string
  bankIban?: string | null
  bankAccountHolder?: string | null
  bankName?: string | null
  bankBic?: string | null
  currency?: string
  vouchersEnabled?: boolean
}

type DisplayStatus = VoucherStatus | 'expired'
type FilterTab = 'all' | VoucherStatus

function getDisplayStatus(voucher: Voucher): DisplayStatus {
  if (
    voucher.status === 'active' &&
    voucher.expires_at &&
    new Date(voucher.expires_at) < new Date()
  ) {
    return 'expired'
  }
  return voucher.status
}

function formatVoucherDetails(voucher: Voucher): string {
  switch (voucher.type) {
    case 'value':
      return voucher.amount ? `€${voucher.amount}` : '—'
    case 'experience_menu':
      return `${voucher.courses ?? '?'}-course menu${voucher.hotel_addon ? ' + hotel' : ''}`
    case 'wine_pairing':
      return `Wine pairing${voucher.wine_guests ? ` · ${voucher.wine_guests} guests` : ''}`
    case 'hotel_addon':
      return 'Hotel accommodation'
  }
}

function formatTypeLabel(type: Voucher['type']): string {
  switch (type) {
    case 'value': return 'Value'
    case 'experience_menu': return 'Experience'
    case 'wine_pairing': return 'Wine'
    case 'hotel_addon': return 'Hotel'
  }
}

function formatDeliveryLabel(type: Voucher['delivery_type']): string {
  switch (type) {
    case 'digital': return 'Digital'
    case 'print': return 'Print at home'
    case 'physical': return 'Physical post'
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_STYLES: Record<DisplayStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  active: 'bg-green-50 text-green-700',
  redeemed: 'bg-[#f0ede6] text-[#7a6a50]',
  expired: 'bg-red-50 text-red-600',
}

const TYPE_STYLES: Record<Voucher['type'], string> = {
  value: 'bg-blue-50 text-blue-700',
  experience_menu: 'bg-purple-50 text-purple-700',
  wine_pairing: 'bg-rose-50 text-rose-700',
  hotel_addon: 'bg-cyan-50 text-cyan-700',
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'active', label: 'Active' },
  { id: 'redeemed', label: 'Redeemed' },
  { id: 'expired', label: 'Expired' },
]

export default function VouchersShell({ initialVouchers, restaurantId, bankIban, bankAccountHolder, bankName, bankBic, currency, vouchersEnabled = false }: Props) {
  const { restaurant } = useAuthStore()
  const restaurantName = restaurant?.name ?? ''
  const logoUrl = restaurant?.logo_url ?? null

  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Voucher | undefined>(undefined)
  const [previewing, setPreviewing] = useState<Voucher | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  function openCreate() {
    setEditing(undefined)
    setShowModal(true)
  }

  function openEdit(voucher: Voucher) {
    setEditing(voucher)
    setShowModal(true)
  }

  function handleSaved(voucher: Voucher) {
    setVouchers(prev => {
      const exists = prev.find(v => v.id === voucher.id)
      return exists
        ? prev.map(v => v.id === voucher.id ? voucher : v)
        : [voucher, ...prev]
    })
    setShowModal(false)
  }

  async function handleActivate(voucher: Voucher) {
    const isPhysical = voucher.delivery_type === 'physical'
    const addr = isPhysical && voucher.delivery_address
      ? [voucher.delivery_address.street, voucher.delivery_address.city, voucher.delivery_address.postal_code, voucher.delivery_address.country].filter(Boolean).join(', ')
      : null

    const msg = isPhysical
      ? `Activate this voucher?\n\nPayment confirmed. The buyer will be notified their physical voucher is being prepared.\n\n${addr ? `Mail to: ${addr}` : 'No delivery address on file.'}\n\nMake sure to print and post the voucher.`
      : 'Mark this voucher as active? This confirms payment has been received and will send the voucher email to the buyer.'

    if (!window.confirm(msg)) return
    setLoadingId(voucher.id)
    const res = await fetch('/api/manager/vouchers/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: voucher.id }),
    })
    const data = await res.json()
    if (!data.error && data.voucher) {
      setVouchers(prev => prev.map(v =>
        v.id === voucher.id
          ? { ...v, status: 'active', issued_at: data.voucher.issued_at, expires_at: data.voucher.expires_at }
          : v,
      ))
    }
    setLoadingId(null)
  }

  async function handleRedeem(id: string, isExpired = false) {
    const msg = isExpired
      ? 'This voucher is expired. Override and mark as redeemed anyway? (Use this for goodwill redemptions.)'
      : 'Mark this voucher as redeemed?'
    if (!window.confirm(msg)) return
    setLoadingId(id)
    const { error } = await redeemVoucher(supabase, id)
    if (!error) {
      setVouchers(prev => prev.map(v =>
        v.id === id
          ? { ...v, status: 'redeemed', redeemed_at: new Date().toISOString() }
          : v,
      ))
    }
    setLoadingId(null)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this voucher? This cannot be undone.')) return
    setLoadingId(id)
    await deleteVoucher(supabase, id)
    setVouchers(prev => prev.filter(v => v.id !== id))
    setLoadingId(null)
  }

  const filtered = vouchers.filter(v => {
    if (activeTab === 'all') return true
    if (activeTab === 'expired') return getDisplayStatus(v) === 'expired'
    return v.status === activeTab && getDisplayStatus(v) !== 'expired'
  })

  const counts: Record<FilterTab, number> = {
    all: vouchers.length,
    pending: vouchers.filter(v => v.status === 'pending').length,
    active: vouchers.filter(v => v.status === 'active' && getDisplayStatus(v) !== 'expired').length,
    redeemed: vouchers.filter(v => v.status === 'redeemed').length,
    expired: vouchers.filter(v => getDisplayStatus(v) === 'expired').length,
  }

  // Revenue tracking
  const totalSoldValue = vouchers
    .filter(v => v.type === 'value' && v.status !== 'pending')
    .reduce((sum, v) => sum + (v.amount ?? 0), 0)
  const redeemedValue = vouchers
    .filter(v => v.type === 'value' && v.status === 'redeemed')
    .reduce((sum, v) => sum + (v.amount ?? 0), 0)
  const outstandingValue = totalSoldValue - redeemedValue
  const totalVouchersSold = vouchers.filter(v => v.status !== 'pending').length
  const totalRedeemed = vouchers.filter(v => v.status === 'redeemed').length

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-[26px] font-normal text-[#1a1a18]">Vouchers</h1>
            <p className="mt-0.5 text-[13px] text-black/40">Manage gift vouchers and redemptions</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-md hover:bg-[#2a2a26] transition-colors"
          >
            <Plus size={14} />
            New voucher
          </button>
        </div>

        {/* Status banners */}
        {!vouchersEnabled && (
          <div className="flex items-center gap-3 px-4 py-3 bg-[#f5f0e8] border border-[#e0d8cc] rounded-xl">
            <ToggleLeft size={16} className="text-[#a09880] shrink-0" />
            <p className="text-[13px] text-[#7a7060]">
              Online voucher ordering is <strong className="text-[#1a1a18]">disabled</strong>.
              Enable it in{' '}
              <a href="/settings/general" className="underline text-[#1a1a18] hover:text-[#7a7060]">
                General settings
              </a>.
            </p>
          </div>
        )}
        {vouchersEnabled && !bankIban && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <p className="text-[13px] text-amber-800">
              No bank details configured — buyers won't see payment instructions after ordering.
              Add them in{' '}
              <a href="/settings/general" className="underline font-medium hover:opacity-70">
                General settings
              </a>.
            </p>
          </div>
        )}

        {/* Revenue stats */}
        {vouchers.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total issued', value: String(totalVouchersSold) },
              { label: 'Redeemed', value: String(totalRedeemed) },
              { label: 'Value sold', value: totalSoldValue > 0 ? `€${totalSoldValue.toFixed(0)}` : '—' },
              { label: 'Outstanding', value: outstandingValue > 0 ? `€${outstandingValue.toFixed(0)}` : '—', highlight: outstandingValue > 0 },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-[#e8e4dc] px-4 py-3">
                <p className="text-[11px] text-[#a09880] uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl font-semibold mt-0.5 ${stat.highlight ? 'text-amber-600' : 'text-[#1a1a18]'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Status tabs */}
        <div className="flex gap-1 border-b border-[#e8e4dc]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[13px] border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-[#1a1a18] text-[#1a1a18] font-medium'
                  : 'border-transparent text-[#7a7060] hover:text-[#1a1a18]'
              }`}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-[#1a1a18] text-[#f5f0e8]'
                    : 'bg-[#e8e4dc] text-[#7a7060]'
                }`}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-[#e8e4dc] py-16 text-center">
            <Gift className="mx-auto mb-3 text-[#a09880]" size={28} />
            <p className="text-sm text-[#7a7060]">
              {activeTab === 'all' ? 'No vouchers yet' : `No ${activeTab} vouchers`}
            </p>
            {activeTab === 'all' && (
              <p className="mt-1 text-xs text-[#a09880]">Create your first voucher to get started</p>
            )}
          </div>
        )}

        {/* Voucher list */}
        {filtered.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e8e4dc] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[130px_1fr_1fr_1fr_130px_180px] gap-4 px-5 py-2.5 border-b border-[#e8e4dc] bg-[#faf9f6]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09880]">Code</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09880]">Buyer</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09880]">Recipient</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09880]">Details</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09880]">Expires</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09880]">Status</p>
            </div>

            {filtered.map((voucher, idx) => {
              const displayStatus = getDisplayStatus(voucher)
              const isLoading = loadingId === voucher.id

              return (
                <div
                  key={voucher.id}
                  className={`grid grid-cols-[130px_1fr_1fr_1fr_130px_180px] gap-4 px-5 py-3.5 items-center ${
                    idx < filtered.length - 1 ? 'border-b border-[#e8e4dc]' : ''
                  } ${isLoading ? 'opacity-50' : ''}`}
                >
                  {/* Code + type */}
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-medium text-[#1a1a18]">{voucher.code}</p>
                    <span className={`mt-1 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${TYPE_STYLES[voucher.type]}`}>
                      {formatTypeLabel(voucher.type)}
                    </span>
                  </div>

                  {/* Buyer */}
                  <div className="min-w-0">
                    <p className="text-sm text-[#1a1a18] truncate">{voucher.buyer_name}</p>
                    <p className="text-xs text-[#7a7060] truncate">{voucher.buyer_email}</p>
                  </div>

                  {/* Recipient */}
                  <div className="min-w-0">
                    <p className="text-sm text-[#1a1a18] truncate">
                      {voucher.recipient_name ?? voucher.buyer_name}
                    </p>
                    {voucher.dedication && (
                      <p className="text-xs text-[#a09880] truncate italic">{voucher.dedication}</p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <p className="text-sm text-[#1a1a18]">{formatVoucherDetails(voucher)}</p>
                    <p className={`text-xs mt-0.5 ${voucher.delivery_type === 'physical' ? 'text-amber-600' : 'text-[#a09880]'}`}>
                      {formatDeliveryLabel(voucher.delivery_type)}
                    </p>
                  </div>

                  {/* Expires */}
                  <div className="min-w-0">
                    {voucher.expires_at ? (
                      <p className={`text-xs ${displayStatus === 'expired' ? 'text-red-500' : 'text-[#7a7060]'}`}>
                        {formatDate(voucher.expires_at)}
                      </p>
                    ) : (
                      <p className="text-xs text-[#a09880]">Not issued</p>
                    )}
                  </div>

                  {/* Status + actions */}
                  <div className="flex flex-col gap-2">
                    {/* Primary action button */}
                    {voucher.status === 'pending' && (
                      <button
                        onClick={() => handleActivate(voucher)}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-[12px] font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
                      >
                        <BadgeCheck size={13} />
                        Activate
                      </button>
                    )}
                    {voucher.status === 'active' && (
                      <button
                        onClick={() => handleRedeem(voucher.id, displayStatus === 'expired')}
                        disabled={isLoading}
                        className={`flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-[12px] font-semibold rounded-lg disabled:opacity-40 transition-colors ${
                          displayStatus === 'expired'
                            ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                            : 'bg-[#1a1a18] text-[#f5f0e8] hover:bg-[#2a2a26]'
                        }`}
                      >
                        <Gift size={13} />
                        {displayStatus === 'expired' ? 'Override' : 'Redeem'}
                      </button>
                    )}

                    {/* Status badge + utility buttons */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[displayStatus]}`}>
                        {displayStatus}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => setPreviewing(voucher)}
                          title="Preview voucher"
                          className="p-1.5 text-[#a09880] hover:text-[#1a1a18] transition-colors"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => openEdit(voucher)}
                          disabled={isLoading}
                          title="Edit"
                          className="p-1.5 text-[#a09880] hover:text-[#1a1a18] transition-colors disabled:opacity-40"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(voucher.id)}
                          disabled={isLoading}
                          title="Delete"
                          className="p-1.5 text-[#a09880] hover:text-red-500 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <VoucherModal
          restaurantId={restaurantId}
          voucher={editing}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}

      {previewing && (
        <VoucherPreviewModal
          voucher={previewing}
          restaurantName={restaurantName}
          logoUrl={logoUrl}
          bankIban={bankIban}
          bankAccountHolder={bankAccountHolder}
          bankName={bankName}
          bankBic={bankBic}
          currency={currency}
          onClose={() => setPreviewing(undefined)}
        />
      )}
    </>
  )
}
