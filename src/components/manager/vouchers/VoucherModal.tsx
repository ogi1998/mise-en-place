'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { createVoucher, updateVoucher } from '@/services/manager/vouchers/queries'
import { voucherSchema, type VoucherFormData } from '@/schemas/manager/vouchers'
import type { Voucher, VoucherType, DeliveryType } from '@/services/manager/vouchers/types'

type Props = {
  restaurantId: string
  voucher?: Voucher
  onClose: () => void
  onSaved: (voucher: Voucher) => void
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#7a7060] mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const VOUCHER_TYPES: { value: VoucherType; label: string; description: string }[] = [
  { value: 'value', label: 'Value', description: 'Monetary gift card (e.g. €50)' },
  { value: 'experience_menu', label: 'Experience Menu', description: '5, 7, or 9-course dining' },
  { value: 'wine_pairing', label: 'Wine Pairing', description: 'Wine pairing add-on' },
  { value: 'hotel_addon', label: 'Hotel Add-on', description: 'Hotel accommodation' },
]

const DELIVERY_TYPES: { value: DeliveryType; label: string }[] = [
  { value: 'digital', label: 'Digital (email)' },
  { value: 'physical', label: 'Physical envelope' },
  { value: 'print', label: 'Print at home' },
]

const inputClass = 'w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] placeholder:text-[#a09880] focus:outline-none focus:border-[#1a1a18]'

export default function VoucherModal({ restaurantId, voucher, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const isEditing = !!voucher

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      type: voucher?.type ?? 'value',
      amount: voucher?.amount ?? null,
      courses: voucher?.courses ?? null,
      wines: voucher?.wines ?? null,
      wine_guests: voucher?.wine_guests ?? null,
      hotel_addon: voucher?.hotel_addon ?? false,
      delivery_type: voucher?.delivery_type ?? 'digital',
      delivery_address: voucher?.delivery_address ?? null,
      buyer_name: voucher?.buyer_name ?? '',
      buyer_email: voucher?.buyer_email ?? '',
      buyer_phone: voucher?.buyer_phone ?? null,
      recipient_name: voucher?.recipient_name ?? null,
      dedication: voucher?.dedication ?? null,
    },
  })

  const type = watch('type')
  const deliveryType = watch('delivery_type')
  const hotelAddon = watch('hotel_addon')
  const courses = watch('courses')

  async function onSubmit(data: VoucherFormData) {
    setSaving(true)
    setSaveError('')

    const payload = {
      ...data,
      amount: data.type === 'value' ? data.amount : null,
      courses: data.type === 'experience_menu' ? data.courses : null,
      wine_guests: data.type === 'wine_pairing' ? data.wine_guests : null,
      hotel_addon: data.type === 'experience_menu' ? (data.hotel_addon ?? false) : false,
      delivery_address: data.delivery_type === 'physical' ? data.delivery_address : null,
    }

    if (isEditing) {
      const { error } = await updateVoucher(supabase, voucher.id, payload)
      if (error) { setSaveError(error); setSaving(false); return }
      onSaved({ ...voucher, ...payload })
    } else {
      const { data: created, error } = await createVoucher(supabase, restaurantId, payload)
      if (error || !created) { setSaveError(error ?? 'Failed to create'); setSaving(false); return }
      onSaved(created)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e4dc]">
          <div>
            <h2 className="text-sm font-semibold text-[#1a1a18]">
              {isEditing ? `Edit voucher ${voucher.code}` : 'New voucher'}
            </h2>
            {isEditing && (
              <p className="text-xs text-[#7a7060] mt-0.5 capitalize">
                Status: {voucher.status}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-[#a09880] hover:text-[#1a1a18] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Voucher type */}
          <div>
            <label className="block text-xs font-medium text-[#7a7060] mb-2">Voucher type</label>
            <div className="grid grid-cols-2 gap-2">
              {VOUCHER_TYPES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('type', opt.value)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    type === opt.value
                      ? 'border-[#1a1a18] bg-[#1a1a18] text-[#f5f0e8]'
                      : 'border-[#d8d3ca] text-[#1a1a18] hover:border-[#1a1a18]'
                  }`}
                >
                  <p className="font-medium text-[13px]">{opt.label}</p>
                  <p className={`text-[11px] mt-0.5 ${type === opt.value ? 'text-[#f5f0e8]/70' : 'text-[#7a7060]'}`}>
                    {opt.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Type-specific fields */}
          {type === 'value' && (
            <Field label="Amount (€)" error={errors.amount?.message}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7a7060]">€</span>
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  step={0.01}
                  placeholder="50.00"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </Field>
          )}

          {type === 'experience_menu' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#7a7060] mb-2">Number of courses</label>
                <div className="flex gap-2">
                  {[5, 7, 9].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setValue('courses', n)}
                      className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                        courses === n
                          ? 'bg-[#1a1a18] text-[#f5f0e8] border-[#1a1a18]'
                          : 'bg-white text-[#5a5545] border-[#d8d3ca] hover:border-[#1a1a18]'
                      }`}
                    >
                      {n} courses
                    </button>
                  ))}
                </div>
                {errors.courses && <p className="mt-1 text-xs text-red-500">{errors.courses.message}</p>}
              </div>

              <div className="flex items-center justify-between py-2 px-3 bg-[#faf9f6] rounded-lg border border-[#e8e4dc]">
                <div>
                  <p className="text-[13px] font-medium text-[#1a1a18]">Include hotel accommodation</p>
                  <p className="text-[11px] text-[#7a7060]">Add hotel stay to the experience package</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('hotel_addon', !hotelAddon)}
                  className={`relative inline-flex h-[26px] w-[46px] shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    hotelAddon ? 'bg-[#1a1a18]' : 'bg-[#d8d3ca]'
                  }`}
                >
                  <span
                    className={`inline-block h-[18px] w-[18px] mt-0.5 rounded-full bg-white shadow transition-transform ${
                      hotelAddon ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {type === 'wine_pairing' && (
            <Field label="Number of guests (optional)" error={errors.wine_guests?.message}>
              <input
                {...register('wine_guests', { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="e.g. 2"
                className={inputClass}
              />
            </Field>
          )}

          <div className="border-t border-[#e8e4dc] pt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Buyer details</p>
            <Field label="Full name" error={errors.buyer_name?.message}>
              <input {...register('buyer_name')} placeholder="John Doe" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" error={errors.buyer_email?.message}>
                <input {...register('buyer_email')} type="email" placeholder="john@example.com" className={inputClass} />
              </Field>
              <Field label="Phone (optional)" error={errors.buyer_phone?.message}>
                <input {...register('buyer_phone')} type="tel" placeholder="+386 41 123 456" className={inputClass} />
              </Field>
            </div>
          </div>

          <div className="border-t border-[#e8e4dc] pt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Recipient</p>
            <Field label="Recipient name (if different from buyer)" error={errors.recipient_name?.message}>
              <input
                {...register('recipient_name')}
                placeholder="Leave blank if same as buyer"
                className={inputClass}
              />
            </Field>
            <Field label="Personal dedication (optional)" error={errors.dedication?.message}>
              <textarea
                {...register('dedication')}
                placeholder="e.g. Happy Birthday! Enjoy your special evening."
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>

          <div className="border-t border-[#e8e4dc] pt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a09880]">Delivery</p>
            <div className="flex gap-2">
              {DELIVERY_TYPES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setValue('delivery_type', opt.value)
                    if (opt.value !== 'physical') setValue('delivery_address', null)
                  }}
                  className={`flex-1 px-3 py-2 text-xs rounded-md border transition-colors ${
                    deliveryType === opt.value
                      ? 'bg-[#1a1a18] text-[#f5f0e8] border-[#1a1a18]'
                      : 'bg-white text-[#5a5545] border-[#d8d3ca] hover:border-[#1a1a18]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {deliveryType === 'physical' && (
              <div className="space-y-3 p-3 bg-[#faf9f6] rounded-lg border border-[#e8e4dc]">
                <p className="text-[11px] text-[#7a7060]">Postal delivery address</p>
                <Field label="Street address" error={errors.delivery_address?.street?.message}>
                  <input
                    {...register('delivery_address.street')}
                    placeholder="Trubarjeva 1"
                    className={inputClass}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City" error={errors.delivery_address?.city?.message}>
                    <input {...register('delivery_address.city')} placeholder="Ljubljana" className={inputClass} />
                  </Field>
                  <Field label="Postal code" error={errors.delivery_address?.postal_code?.message}>
                    <input {...register('delivery_address.postal_code')} placeholder="1000" className={inputClass} />
                  </Field>
                </div>
                <Field label="Country" error={errors.delivery_address?.country?.message}>
                  <input {...register('delivery_address.country')} placeholder="Slovenia" className={inputClass} />
                </Field>
              </div>
            )}

            {deliveryType === 'digital' && (
              <p className="text-[11px] text-[#7a7060]">
                Voucher code will be emailed to {watch('buyer_email') || 'the buyer'} when activated.
              </p>
            )}
            {deliveryType === 'print' && (
              <p className="text-[11px] text-[#7a7060]">
                A print-ready PDF will be emailed to the buyer when activated.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#e8e4dc]">
          <div>
            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#5a5545] hover:text-[#1a1a18] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="px-5 py-2 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-md hover:bg-[#2a2a26] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create voucher'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
