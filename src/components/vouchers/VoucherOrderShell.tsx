'use client'

import { useState } from 'react'
import {
  ArrowLeft, ArrowRight, Check, Banknote, UtensilsCrossed,
  Wine, Building2, Mail, Package, Printer, CheckCircle2,
} from 'lucide-react'
import VoucherTemplate from '@/components/manager/vouchers/VoucherTemplate'
import UPNSlip from '@/components/manager/vouchers/UPNSlip'
import type { VoucherType, DeliveryType, Voucher } from '@/services/manager/vouchers/types'

type Props = {
  restaurantId: string
  restaurantName: string
  currency: string
  bankIban?: string | null
  bankAccountHolder?: string | null
  bankName?: string | null
  bankBic?: string | null
}

type OrderState = {
  type: VoucherType
  amount: number | null
  courses: number | null
  wine_guests: number | null
  hotel_addon: boolean
  delivery_type: DeliveryType
  delivery_address: { street: string; city: string; postal_code: string; country: string } | null
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  recipient_name: string
  dedication: string
}

type Step = 'type' | 'configure' | 'delivery' | 'details' | 'summary' | 'done'

const DEFAULT_ORDER: OrderState = {
  type: 'value',
  amount: null,
  courses: null,
  wine_guests: null,
  hotel_addon: false,
  delivery_type: 'digital',
  delivery_address: null,
  buyer_name: '',
  buyer_email: '',
  buyer_phone: '',
  recipient_name: '',
  dedication: '',
}

function getStepFlow(type: VoucherType): Step[] {
  if (type === 'hotel_addon') return ['type', 'delivery', 'details', 'summary', 'done']
  return ['type', 'configure', 'delivery', 'details', 'summary', 'done']
}

const STEP_LABELS: Partial<Record<Step, string>> = {
  type: 'Type',
  configure: 'Options',
  delivery: 'Delivery',
  details: 'Details',
  summary: 'Summary',
}

const inputClass = 'w-full px-3 py-2.5 text-sm border border-[#d8d3ca] rounded-lg bg-white text-[#1a1a18] placeholder:text-[#a09880] focus:outline-none focus:border-[#1a1a18] transition-colors'

function formatTypeLabel(type: VoucherType): string {
  switch (type) {
    case 'value': return 'Value Voucher'
    case 'experience_menu': return 'Experience Menu'
    case 'wine_pairing': return 'Wine Pairing'
    case 'hotel_addon': return 'Hotel Add-on'
  }
}

function formatVoucherSummaryLine(order: OrderState, currencySymbol: string): string {
  switch (order.type) {
    case 'value': return `${currencySymbol}${order.amount} gift voucher`
    case 'experience_menu': return `${order.courses}-course tasting menu${order.hotel_addon ? ' + hotel' : ''}`
    case 'wine_pairing': return `Wine pairing${order.wine_guests ? ` for ${order.wine_guests} guests` : ''}`
    case 'hotel_addon': return 'Hotel accommodation'
  }
}

function formatDeliveryLabel(type: DeliveryType): string {
  switch (type) {
    case 'digital': return 'Digital (email)'
    case 'physical': return 'Physical envelope'
    case 'print': return 'Print at home (PDF)'
  }
}

// ─── Step: Type ───────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: VoucherType; icon: React.ElementType; label: string; description: string }[] = [
  { value: 'value', icon: Banknote, label: 'Value Voucher', description: 'A monetary gift card in any amount' },
  { value: 'experience_menu', icon: UtensilsCrossed, label: 'Experience Menu', description: '5, 7 or 9-course tasting menu' },
  { value: 'wine_pairing', icon: Wine, label: 'Wine Pairing', description: 'Sommelier wine pairing add-on' },
  { value: 'hotel_addon', icon: Building2, label: 'Hotel Add-on', description: 'Overnight accommodation package' },
]

function TypeStep({ order, update }: { order: OrderState; update: <K extends keyof OrderState>(k: K, v: OrderState[K]) => void }) {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="font-serif text-xl font-normal text-[#1a1a18]">Choose your gift voucher</h2>
        <p className="text-[13px] text-[#7a7060] mt-1">Select the type of experience you'd like to gift</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TYPE_OPTIONS.map(opt => {
          const Icon = opt.icon
          const selected = order.type === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('type', opt.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                selected
                  ? 'border-[#1a1a18] bg-[#1a1a18]'
                  : 'border-[#e8e4dc] bg-white hover:border-[#1a1a18]/40'
              }`}
            >
              <Icon size={20} className={selected ? 'text-[#c9a96e]' : 'text-[#7a7060]'} />
              <p className={`text-[13px] font-semibold mt-2 ${selected ? 'text-[#f5f0e8]' : 'text-[#1a1a18]'}`}>
                {opt.label}
              </p>
              <p className={`text-[11px] mt-0.5 leading-snug ${selected ? 'text-[#f5f0e8]/60' : 'text-[#7a7060]'}`}>
                {opt.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step: Configure ──────────────────────────────────────────────────────────

function ConfigureStep({ order, update, currencySymbol }: {
  order: OrderState
  update: <K extends keyof OrderState>(k: K, v: OrderState[K]) => void
  currencySymbol: string
}) {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="font-serif text-xl font-normal text-[#1a1a18]">Configure your voucher</h2>
        <p className="text-[13px] text-[#7a7060] mt-1">{formatTypeLabel(order.type)}</p>
      </div>

      {order.type === 'value' && (
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1.5">Voucher amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#7a7060] font-medium">
              {currencySymbol}
            </span>
            <input
              type="number"
              min={1}
              step={1}
              placeholder="50"
              value={order.amount ?? ''}
              onChange={e => update('amount', e.target.value ? Number(e.target.value) : null)}
              className={`${inputClass} pl-8`}
            />
          </div>
          <p className="text-[11px] text-[#a09880] mt-1.5">Minimum amount: {currencySymbol}1</p>
        </div>
      )}

      {order.type === 'experience_menu' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#7a7060] mb-2">Number of courses</label>
            <div className="flex gap-2">
              {[5, 7, 9].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update('courses', n)}
                  className={`flex-1 py-3 text-sm font-medium rounded-xl border-2 transition-all ${
                    order.courses === n
                      ? 'border-[#1a1a18] bg-[#1a1a18] text-[#f5f0e8]'
                      : 'border-[#e8e4dc] bg-white text-[#1a1a18] hover:border-[#1a1a18]/40'
                  }`}
                >
                  {n} courses
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#faf9f6] rounded-xl border border-[#e8e4dc]">
            <div>
              <p className="text-[13px] font-medium text-[#1a1a18]">Include hotel accommodation</p>
              <p className="text-[11px] text-[#7a7060] mt-0.5">Add an overnight stay to the package</p>
            </div>
            <button
              type="button"
              onClick={() => update('hotel_addon', !order.hotel_addon)}
              className={`relative inline-flex h-[26px] w-[46px] shrink-0 rounded-full border-2 border-transparent transition-colors ${
                order.hotel_addon ? 'bg-[#1a1a18]' : 'bg-[#d8d3ca]'
              }`}
            >
              <span className={`inline-block h-[18px] w-[18px] mt-0.5 rounded-full bg-white shadow transition-transform ${
                order.hotel_addon ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      )}

      {order.type === 'wine_pairing' && (
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1.5">Number of guests (optional)</label>
          <input
            type="number"
            min={1}
            placeholder="e.g. 2"
            value={order.wine_guests ?? ''}
            onChange={e => update('wine_guests', e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
        </div>
      )}
    </div>
  )
}

// ─── Step: Delivery ───────────────────────────────────────────────────────────

const DELIVERY_OPTIONS: { value: DeliveryType; icon: React.ElementType; label: string; description: string }[] = [
  { value: 'digital', icon: Mail, label: 'Digital', description: 'Voucher PDF emailed to you' },
  { value: 'print', icon: Printer, label: 'Print at home', description: 'Download and print the PDF yourself' },
  { value: 'physical', icon: Package, label: 'Physical envelope', description: 'Mailed to a postal address' },
]

function DeliveryStep({ order, update }: {
  order: OrderState
  update: <K extends keyof OrderState>(k: K, v: OrderState[K]) => void
}) {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="font-serif text-xl font-normal text-[#1a1a18]">How should we deliver it?</h2>
        <p className="text-[13px] text-[#7a7060] mt-1">Choose your preferred delivery method</p>
      </div>

      <div className="space-y-2">
        {DELIVERY_OPTIONS.map(opt => {
          const Icon = opt.icon
          const selected = order.delivery_type === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                update('delivery_type', opt.value)
                if (opt.value !== 'physical') update('delivery_address', null)
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                selected
                  ? 'border-[#1a1a18] bg-[#faf9f6]'
                  : 'border-[#e8e4dc] bg-white hover:border-[#1a1a18]/40'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selected ? 'bg-[#1a1a18]' : 'bg-[#f0ede6]'
              }`}>
                <Icon size={16} className={selected ? 'text-[#c9a96e]' : 'text-[#7a7060]'} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1a1a18]">{opt.label}</p>
                <p className="text-[11px] text-[#7a7060]">{opt.description}</p>
              </div>
              <div className={`ml-auto w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                selected ? 'border-[#1a1a18] bg-[#1a1a18]' : 'border-[#d8d3ca]'
              }`}>
                {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          )
        })}
      </div>

      {order.delivery_type === 'physical' && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Delivery address</p>
          <input
            placeholder="Street address"
            value={order.delivery_address?.street ?? ''}
            onChange={e => update('delivery_address', { ...(order.delivery_address ?? { city: '', postal_code: '', country: '' }), street: e.target.value })}
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="City"
              value={order.delivery_address?.city ?? ''}
              onChange={e => update('delivery_address', { ...(order.delivery_address ?? { street: '', postal_code: '', country: '' }), city: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Postal code"
              value={order.delivery_address?.postal_code ?? ''}
              onChange={e => update('delivery_address', { ...(order.delivery_address ?? { street: '', city: '', country: '' }), postal_code: e.target.value })}
              className={inputClass}
            />
          </div>
          <input
            placeholder="Country"
            value={order.delivery_address?.country ?? ''}
            onChange={e => update('delivery_address', { ...(order.delivery_address ?? { street: '', city: '', postal_code: '' }), country: e.target.value })}
            className={inputClass}
          />
        </div>
      )}
    </div>
  )
}

// ─── Step: Details ────────────────────────────────────────────────────────────

function DetailsStep({ order, update }: {
  order: OrderState
  update: <K extends keyof OrderState>(k: K, v: OrderState[K]) => void
}) {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="font-serif text-xl font-normal text-[#1a1a18]">Your details</h2>
        <p className="text-[13px] text-[#7a7060] mt-1">We'll send the voucher confirmation here</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1.5">Your name <span className="text-red-400">*</span></label>
          <input
            placeholder="Full name"
            value={order.buyer_name}
            onChange={e => update('buyer_name', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1.5">Email address <span className="text-red-400">*</span></label>
          <input
            type="email"
            placeholder="you@example.com"
            value={order.buyer_email}
            onChange={e => update('buyer_email', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1.5">Phone number <span className="text-[#a09880] font-normal">(optional)</span></label>
          <input
            type="tel"
            placeholder="+386 41 123 456"
            value={order.buyer_phone}
            onChange={e => update('buyer_phone', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="border-t border-[#e8e4dc] pt-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Recipient (optional)</p>
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1.5">Recipient name</label>
          <input
            placeholder="Leave blank if same as your name"
            value={order.recipient_name}
            onChange={e => update('recipient_name', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1.5">Personal message</label>
          <textarea
            placeholder="e.g. Happy Birthday! Wishing you a wonderful evening…"
            value={order.dedication}
            onChange={e => update('dedication', e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Step: Summary ────────────────────────────────────────────────────────────

function SummaryStep({ order, previewVoucher, restaurantName, currencySymbol }: {
  order: OrderState
  previewVoucher: Voucher
  restaurantName: string
  currencySymbol: string
}) {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="font-serif text-xl font-normal text-[#1a1a18]">Review your order</h2>
        <p className="text-[13px] text-[#7a7060] mt-1">Your voucher will look like this</p>
      </div>

      {/* Voucher preview — scaled down */}
      <div className="flex justify-center overflow-hidden">
        <div style={{ transform: 'scale(0.62)', transformOrigin: 'top center', marginBottom: '-160px' }}>
          <VoucherTemplate voucher={previewVoucher} restaurantName={restaurantName} />
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-[#faf9f6] rounded-xl border border-[#e8e4dc] divide-y divide-[#e8e4dc]">
        {[
          { label: 'Type', value: formatVoucherSummaryLine(order, currencySymbol) },
          { label: 'Delivery', value: formatDeliveryLabel(order.delivery_type) },
          { label: 'For', value: order.recipient_name || order.buyer_name },
          { label: 'Confirmation to', value: order.buyer_email },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
            <p className="text-xs text-[#7a7060]">{row.label}</p>
            <p className="text-sm text-[#1a1a18] font-medium text-right max-w-[240px] truncate">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <p className="text-[12px] text-amber-800 leading-relaxed">
          <strong>Payment:</strong> After placing your order you'll receive instructions for bank transfer. Your voucher will be activated once payment is confirmed.
        </p>
      </div>
    </div>
  )
}

// ─── Step: Confirmation ───────────────────────────────────────────────────────

function ConfirmationStep({
  voucher,
  restaurantName,
  bankIban,
  bankAccountHolder,
  bankName,
  bankBic,
  currency,
}: {
  voucher: Voucher
  restaurantName: string
  bankIban?: string | null
  bankAccountHolder?: string | null
  bankName?: string | null
  bankBic?: string | null
  currency?: string
}) {
  const hasBankDetails = !!bankIban && !!bankAccountHolder

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a7060] mb-2">{restaurantName}</p>
          <h1 className="font-serif text-3xl font-normal text-[#1a1a18]">Gift Vouchers</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e4dc] p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-normal text-[#1a1a18]">Order placed!</h2>
            <p className="text-[13px] text-[#7a7060] mt-1">Your voucher order has been received</p>
          </div>

          <div className="bg-[#1a1a18] rounded-xl px-6 py-4">
            <p className="text-[10px] text-[#c9a96e] uppercase tracking-[0.2em] mb-1">Voucher code</p>
            <p className="font-mono text-2xl font-semibold text-[#c9a96e] tracking-wider">{voucher.code}</p>
          </div>

          {hasBankDetails ? (
            <div className="text-left space-y-3">
              <p className="text-[12px] font-semibold text-[#1a1a18] uppercase tracking-wide">
                Complete your payment
              </p>
              <p className="text-[12px] text-[#7a7060]">
                Please transfer the amount using the payment slip below. Reference your voucher code{' '}
                <span className="font-mono font-semibold text-[#1a1a18]">{voucher.code}</span>.
              </p>
              <UPNSlip
                voucher={voucher}
                bankIban={bankIban!}
                bankAccountHolder={bankAccountHolder!}
                bankName={bankName}
                bankBic={bankBic}
                currency={currency}
              />
              <p className="text-[11px] text-[#a09880]">
                Your voucher will be activated once payment is confirmed by the restaurant.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-left space-y-2">
              <p className="text-[12px] font-semibold text-amber-800 uppercase tracking-wide">Next steps</p>
              <ol className="text-[12px] text-amber-800 space-y-1.5 list-none">
                <li className="flex gap-2"><span className="font-bold">1.</span><span>The restaurant will contact you at <strong>{voucher.buyer_email}</strong> with bank transfer payment details.</span></li>
                <li className="flex gap-2"><span className="font-bold">2.</span><span>Complete the bank transfer referencing your voucher code.</span></li>
                <li className="flex gap-2"><span className="font-bold">3.</span><span>Once payment is confirmed, your voucher will be activated and sent to you.</span></li>
              </ol>
            </div>
          )}

          <div className="border-t border-[#e8e4dc] pt-4 space-y-1.5 text-left">
            <p className="text-[11px] text-[#7a7060]">
              <span className="text-[#a09880]">Order reference:</span> {voucher.code}
            </p>
            <p className="text-[11px] text-[#7a7060]">
              <span className="text-[#a09880]">Confirmation email:</span> {voucher.buyer_email}
            </p>
          </div>
        </div>

        <p className="text-center text-[12px] text-[#a09880]">
          Questions? Contact {restaurantName} directly.
        </p>
      </div>
    </div>
  )
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export default function VoucherOrderShell({ restaurantId, restaurantName, currency, bankIban, bankAccountHolder, bankName, bankBic }: Props) {
  const [step, setStep] = useState<Step>('type')
  const [order, setOrder] = useState<OrderState>({ ...DEFAULT_ORDER })
  const [createdVoucher, setCreatedVoucher] = useState<Voucher | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'
  const steps = getStepFlow(order.type)
  const visibleSteps = steps.filter(s => s !== 'done')
  const stepIndex = steps.indexOf(step)
  const progress = step === 'done' ? visibleSteps.length : visibleSteps.indexOf(step as Exclude<Step, 'done'>)

  function update<K extends keyof OrderState>(key: K, value: OrderState[K]) {
    setOrder(prev => ({ ...prev, [key]: value }))
  }

  function next() {
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
  }

  function back() {
    const idx = steps.indexOf(step)
    if (idx > 0) setStep(steps[idx - 1])
  }

  function canProceed(): boolean {
    switch (step) {
      case 'type': return true
      case 'configure':
        if (order.type === 'value') return (order.amount ?? 0) > 0
        if (order.type === 'experience_menu') return !!order.courses
        return true
      case 'delivery':
        if (order.delivery_type === 'physical') {
          return !!(order.delivery_address?.street?.trim() && order.delivery_address?.city?.trim())
        }
        return true
      case 'details':
        return !!(order.buyer_name.trim() && order.buyer_email.trim() && order.buyer_email.includes('@'))
      case 'summary':
      case 'done':
      default: return true
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')

    const res = await fetch('/api/widget/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: restaurantId,
        type: order.type,
        amount: order.type === 'value' ? order.amount : null,
        courses: order.type === 'experience_menu' ? order.courses : null,
        wine_guests: order.type === 'wine_pairing' ? order.wine_guests : null,
        hotel_addon: order.type === 'experience_menu' ? order.hotel_addon : false,
        delivery_type: order.delivery_type,
        delivery_address: order.delivery_type === 'physical' ? order.delivery_address : null,
        buyer_name: order.buyer_name,
        buyer_email: order.buyer_email,
        buyer_phone: order.buyer_phone || null,
        recipient_name: order.recipient_name || null,
        dedication: order.dedication || null,
      }),
    })

    const data = await res.json()
    if (data.error) {
      setSubmitError(data.error)
      setSubmitting(false)
      return
    }

    setCreatedVoucher(data.voucher)
    setStep('done')
    setSubmitting(false)
  }

  const previewVoucher: Voucher = {
    id: 'preview',
    restaurant_id: restaurantId,
    type: order.type,
    amount: order.amount,
    courses: order.courses,
    wines: null,
    wine_guests: order.wine_guests,
    hotel_addon: order.hotel_addon,
    delivery_type: order.delivery_type,
    delivery_address: order.delivery_address,
    buyer_name: order.buyer_name || 'Your name',
    buyer_email: order.buyer_email,
    buyer_phone: order.buyer_phone || null,
    recipient_name: order.recipient_name || null,
    dedication: order.dedication || null,
    code: `#XXX-${new Date().getFullYear()}`,
    status: 'pending',
    issued_at: null,
    expires_at: null,
    redeemed_at: null,
    redeemed_by_guest_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (step === 'done' && createdVoucher) {
    return (
      <ConfirmationStep
        voucher={createdVoucher}
        restaurantName={restaurantName}
        bankIban={bankIban}
        bankAccountHolder={bankAccountHolder}
        bankName={bankName}
        bankBic={bankBic}
        currency={currency}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a7060] mb-2">{restaurantName}</p>
          <h1 className="font-serif text-3xl font-normal text-[#1a1a18]">Gift Vouchers</h1>
        </div>

        {/* Step progress */}
        <div className="flex items-center mb-6">
          {visibleSteps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                  i < progress
                    ? 'bg-[#1a1a18] text-[#f5f0e8]'
                    : i === progress
                      ? 'bg-[#1a1a18] text-[#f5f0e8]'
                      : 'bg-[#e8e4dc] text-[#a09880]'
                }`}>
                  {i < progress ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium ${i === progress ? 'text-[#1a1a18]' : 'text-[#a09880]'}`}>
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < visibleSteps.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 ${i < progress ? 'bg-[#1a1a18]' : 'bg-[#e8e4dc]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl border border-[#e8e4dc] overflow-hidden shadow-sm">
          {step === 'type' && <TypeStep order={order} update={update} />}
          {step === 'configure' && <ConfigureStep order={order} update={update} currencySymbol={currencySymbol} />}
          {step === 'delivery' && <DeliveryStep order={order} update={update} />}
          {step === 'details' && <DetailsStep order={order} update={update} />}
          {step === 'summary' && (
            <SummaryStep
              order={order}
              previewVoucher={previewVoucher}
              restaurantName={restaurantName}
              currencySymbol={currencySymbol}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={back}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm text-[#7a7060] hover:text-[#1a1a18] transition-colors rounded-lg ${
              stepIndex === 0 ? 'invisible' : ''
            }`}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {step === 'summary' ? (
            <div className="flex flex-col items-end gap-1.5">
              {submitError && <p className="text-xs text-red-500">{submitError}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-lg hover:bg-[#2a2a26] disabled:opacity-50 transition-colors font-medium"
              >
                {submitting ? 'Placing order…' : 'Place order'}
                {!submitting && <ArrowRight size={14} />}
              </button>
            </div>
          ) : (
            <button
              onClick={next}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-lg hover:bg-[#2a2a26] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
