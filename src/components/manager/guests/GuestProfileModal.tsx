'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, User, Building2, Star, FileText, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getGuestProfile, getGuestBookingHistory } from '@/services/manager/guests/queries'
import type { GuestProfile, GuestBookingItem, LoyaltyTier } from '@/services/manager/guests/types'
import { getInitials, formatDateEU } from '@/services/manager/guests/utils'

type Props = {
  guestId: string
  restaurantId: string
  currency: string
  onClose: () => void
  onUpdated: (id: string, changes: Partial<Pick<GuestProfile, 'first_name' | 'last_name' | 'loyalty_tier' | 'lifetime_spend' | 'company'>>) => void
}

const TIERS: { value: LoyaltyTier | ''; label: string }[] = [
  { value: '', label: 'No tier' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
]

const DIETARY_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
]

const TIER_STYLES: Record<LoyaltyTier, string> = {
  bronze: 'bg-amber-50 text-amber-700 border-amber-200',
  silver: 'bg-slate-100 text-slate-600 border-slate-200',
  gold: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  platinum: 'bg-purple-50 text-purple-700 border-purple-200',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-600',
  confirmed: 'text-green-600',
  seated: 'text-blue-600',
  completed: 'text-[#a09880]',
  cancelled: 'text-red-500',
  no_show: 'text-[#a09880]',
}

function formatCurrency(amount: number | null | undefined, currency: string): string {
  if (amount == null) return '—'
  const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'
  return `${sym}${amount.toFixed(2)}`
}

export default function GuestProfileModal({ guestId, restaurantId, currency, onClose, onUpdated }: Props) {
  const [profile, setProfile] = useState<GuestProfile | null>(null)
  const [bookings, setBookings] = useState<GuestBookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Editable form state
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    loyalty_tier: '' as LoyaltyTier | '',
    company: '',
    company_position: '',
    company_tax_id: '',
    dietary_type: '',
    seating_preference: '',
    birthday: '',
    anniversary: '',
    favourite_food_notes: '',
    favourite_wine_notes: '',
    internal_notes: '',
    marketing_consent: false,
  })

  const [dirty, setDirty] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [p, b] = await Promise.all([
      getGuestProfile(supabase, guestId),
      getGuestBookingHistory(supabase, guestId, restaurantId),
    ])
    if (p) {
      setProfile(p)
      setForm({
        first_name: p.first_name ?? '',
        last_name: p.last_name ?? '',
        phone: p.phone ?? '',
        loyalty_tier: (p.loyalty_tier ?? '') as LoyaltyTier | '',
        company: p.company ?? '',
        company_position: p.company_position ?? '',
        company_tax_id: p.company_tax_id ?? '',
        dietary_type: p.dietary_type ?? '',
        seating_preference: p.seating_preference ?? '',
        birthday: p.birthday ?? '',
        anniversary: p.anniversary ?? '',
        favourite_food_notes: p.favourite_food?.notes ?? '',
        favourite_wine_notes: p.favourite_wine?.notes ?? '',
        internal_notes: p.internal_notes ?? '',
        marketing_consent: p.marketing_consent ?? false,
      })
    }
    setBookings(b)
    setLoading(false)
  }, [guestId, restaurantId])

  useEffect(() => { load() }, [load])

  function handleChange(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
    setDirty(true)
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setError(null)

    const payload: Record<string, unknown> = {
      first_name: form.first_name.trim() || profile.first_name,
      last_name: form.last_name.trim() || profile.last_name,
      phone: form.phone.trim() || null,
      loyalty_tier: form.loyalty_tier || null,
      company: form.company.trim() || null,
      company_position: form.company_position.trim() || null,
      company_tax_id: form.company_tax_id.trim() || null,
      dietary_type: form.dietary_type || null,
      seating_preference: form.seating_preference.trim() || null,
      birthday: form.birthday || null,
      anniversary: form.anniversary || null,
      favourite_food: form.favourite_food_notes.trim() ? { notes: form.favourite_food_notes.trim() } : null,
      favourite_wine: form.favourite_wine_notes.trim() ? { notes: form.favourite_wine_notes.trim() } : null,
      internal_notes: form.internal_notes.trim() || null,
      marketing_consent: form.marketing_consent,
    }

    const res = await fetch(`/api/manager/guests/${profile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Failed to save')
      setSaving(false)
      return
    }

    setDirty(false)
    setSaving(false)
    onUpdated(profile.id, {
      first_name: payload.first_name as string,
      last_name: payload.last_name as string,
      loyalty_tier: (payload.loyalty_tier as LoyaltyTier | null),
      company: (payload.company as string | null),
    })
  }

  const lifetimeSpend = bookings.reduce((sum, b) => sum + (b.spend_amount ?? 0), 0)
  const initials = profile ? getInitials(profile.first_name, profile.last_name) : '??'
  const tier = form.loyalty_tier as LoyaltyTier | ''

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e8e4dc] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1a1a18] text-sm font-semibold text-[#f5f0e8]">
              {initials}
            </div>
            {loading ? (
              <div className="h-5 w-40 animate-pulse rounded bg-[#e8e4dc]" />
            ) : (
              <div>
                <h2 className="text-base font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-xs text-[#a09880]">{profile?.email ?? '—'}</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="rounded p-1 text-[#a09880] hover:text-[#1a1a18] transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-[#a09880]">Loading…</p>
          </div>
        ) : !profile ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-red-500">Failed to load guest.</p>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-3 divide-x divide-[#e8e4dc] border-b border-[#e8e4dc] bg-[#faf9f6]">
              <div className="px-5 py-3 text-center">
                <p className="text-xs text-[#a09880]">Visits</p>
                <p className="text-lg font-semibold text-[#1a1a18]">{bookings.length}</p>
              </div>
              <div className="px-5 py-3 text-center">
                <p className="text-xs text-[#a09880]">Total spend</p>
                <p className="text-lg font-semibold text-[#1a1a18]">{formatCurrency(lifetimeSpend, currency)}</p>
              </div>
              <div className="px-5 py-3 text-center">
                <p className="text-xs text-[#a09880]">Member since</p>
                <p className="text-sm font-semibold text-[#1a1a18]">{formatDateEU(profile.created_at.slice(0, 10))}</p>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-0 divide-y divide-[#e8e4dc]">

                {/* Loyalty */}
                <section className="px-6 py-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Star size={13} className="text-[#a09880]" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Loyalty</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={form.loyalty_tier}
                      onChange={e => handleChange('loyalty_tier', e.target.value)}
                      className="rounded-lg border border-[#e8e4dc] bg-white px-3 py-2 text-sm text-[#1a1a18] focus:border-[#1a1a18] focus:outline-none"
                    >
                      {TIERS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    {tier && (
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${TIER_STYLES[tier]}`}>
                        {tier}
                      </span>
                    )}
                  </div>
                </section>

                {/* Contact */}
                <section className="px-6 py-5">
                  <div className="mb-3 flex items-center gap-2">
                    <User size={13} className="text-[#a09880]" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Contact</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First name">
                      <input
                        value={form.first_name}
                        onChange={e => handleChange('first_name', e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Last name">
                      <input
                        value={form.last_name}
                        onChange={e => handleChange('last_name', e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Email">
                      <input value={profile.email ?? ''} readOnly className={`${inputCls} bg-[#faf9f6] text-[#a09880] cursor-default`} />
                    </Field>
                    <Field label="Phone">
                      <input
                        value={form.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Birthday">
                      <input
                        type="date"
                        value={form.birthday}
                        onChange={e => handleChange('birthday', e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Anniversary">
                      <input
                        type="date"
                        value={form.anniversary}
                        onChange={e => handleChange('anniversary', e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </section>

                {/* Company */}
                <section className="px-6 py-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 size={13} className="text-[#a09880]" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Company</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Company name" className="col-span-2">
                      <input
                        value={form.company}
                        onChange={e => handleChange('company', e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Position">
                      <input
                        value={form.company_position}
                        onChange={e => handleChange('company_position', e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Tax ID">
                      <input
                        value={form.company_tax_id}
                        onChange={e => handleChange('company_tax_id', e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </section>

                {/* Preferences */}
                <section className="px-6 py-5">
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Preferences</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Dietary">
                      <select
                        value={form.dietary_type}
                        onChange={e => handleChange('dietary_type', e.target.value)}
                        className={inputCls}
                      >
                        {DIETARY_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Seating preference">
                      <input
                        value={form.seating_preference}
                        onChange={e => handleChange('seating_preference', e.target.value)}
                        placeholder="e.g. window, terrace"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Favourite food" className="col-span-2">
                      <textarea
                        rows={2}
                        value={form.favourite_food_notes}
                        onChange={e => handleChange('favourite_food_notes', e.target.value)}
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                    <Field label="Favourite wine" className="col-span-2">
                      <textarea
                        rows={2}
                        value={form.favourite_wine_notes}
                        onChange={e => handleChange('favourite_wine_notes', e.target.value)}
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                    {profile.allergens?.length ? (
                      <div className="col-span-2">
                        <p className="mb-1.5 text-[11px] text-[#a09880]">Allergens</p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.allergens.map(a => (
                            <span key={a} className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="col-span-2 flex items-center justify-between">
                      <p className="text-[11px] text-[#a09880]">Marketing consent</p>
                      <button
                        type="button"
                        onClick={() => handleChange('marketing_consent', !form.marketing_consent)}
                        className={`relative h-6 w-10 rounded-full transition-colors ${form.marketing_consent ? 'bg-[#1a1a18]' : 'bg-[#e8e4dc]'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.marketing_consent ? 'translate-x-4' : ''}`} />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Internal notes */}
                <section className="px-6 py-5">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText size={13} className="text-[#a09880]" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Internal notes</h3>
                  </div>
                  <textarea
                    rows={4}
                    value={form.internal_notes}
                    onChange={e => handleChange('internal_notes', e.target.value)}
                    placeholder="Private notes visible only to staff…"
                    className={`w-full resize-none ${inputCls}`}
                  />
                </section>

                {/* Visit history */}
                <section className="px-6 py-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock size={13} className="text-[#a09880]" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Visit history</h3>
                  </div>
                  {bookings.length === 0 ? (
                    <p className="text-xs text-[#a09880]">No bookings yet.</p>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-[#e8e4dc]">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#e8e4dc] bg-[#faf9f6]">
                            <th className="px-3 py-2 text-left font-medium text-[#a09880]">Date</th>
                            <th className="px-3 py-2 text-left font-medium text-[#a09880]">Area</th>
                            <th className="px-3 py-2 text-center font-medium text-[#a09880]">Guests</th>
                            <th className="px-3 py-2 text-left font-medium text-[#a09880]">Status</th>
                            <th className="px-3 py-2 text-right font-medium text-[#a09880]">Spend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map(b => (
                            <tr key={b.id} className="border-b border-[#e8e4dc] last:border-0">
                              <td className="px-3 py-2 text-[#1a1a18]">
                                {formatDateEU(b.booking_date)}
                                <span className="ml-1 text-[#a09880]">{b.start_time.slice(0, 5)}</span>
                              </td>
                              <td className="px-3 py-2 text-[#5a5545]">{b.service_area_name ?? '—'}</td>
                              <td className="px-3 py-2 text-center text-[#5a5545]">{b.party_size}</td>
                              <td className={`px-3 py-2 capitalize ${STATUS_STYLES[b.status] ?? 'text-[#5a5545]'}`}>
                                {b.status.replace('_', ' ')}
                              </td>
                              <td className="px-3 py-2 text-right text-[#1a1a18]">
                                {formatCurrency(b.spend_amount, currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

              </div>
            </div>

            {/* Footer */}
            {(dirty || error) && (
              <div className="border-t border-[#e8e4dc] px-6 py-4">
                {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full rounded-lg bg-[#1a1a18] py-2.5 text-sm font-medium text-[#f5f0e8] transition-opacity disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-[#e8e4dc] bg-white px-3 py-2 text-sm text-[#1a1a18] focus:border-[#1a1a18] focus:outline-none placeholder:text-[#a09880]'

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1 text-[11px] text-[#a09880]">{label}</p>
      {children}
    </div>
  )
}
