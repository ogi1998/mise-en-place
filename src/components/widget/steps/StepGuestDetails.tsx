'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { BookingState } from '../BookingWidget'

const guestSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(6, 'Invalid phone'),
  notes: z.string().optional(),
})

type GuestFormData = z.infer<typeof guestSchema>

const ALLERGEN_OPTIONS = [
  'Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts',
  'Shellfish', 'Fish', 'Soy', 'Sesame',
]

type Props = {
  booking: BookingState
  restaurantId: string
  onChange: (updates: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepGuestDetails({ booking, restaurantId, onChange, onNext, onBack }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      phone: booking.phone,
      notes: booking.notes,
    },
  })

  function toggleAllergen(allergen: string) {
    const current = booking.allergens
    const next = current.includes(allergen)
      ? current.filter(a => a !== allergen)
      : [...current, allergen]
    onChange({ allergens: next })
  }

  async function onSubmit(data: GuestFormData) {
    setSubmitting(true)
    setSubmitError('')

    onChange({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      notes: data.notes ?? '',
    })

    try {
      const res = await fetch('/api/widget/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          service_area_id: booking.serviceAreaId,
          party_size: booking.partySize,
          booking_date: booking.date,
          slot_time: booking.slot,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          notes: data.notes || null,
          allergens: booking.allergens,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setSubmitError(json.error ?? 'Something went wrong. Please try again.')
      } else {
        onChange({ bookingId: json.bookingId })
        onNext()
      }
    } catch {
      setSubmitError('Network error. Please try again.')
    }

    setSubmitting(false)
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-[#a09880] hover:text-[#1a1a18] transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your details
          </h2>
          <p className="text-sm text-[#7a7060]">
            {booking.partySize} {booking.partySize === 1 ? 'guest' : 'guests'} · {booking.date} · {booking.slot}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1">First name</label>
          <input
            {...register('firstName')}
            className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1">Last name</label>
          <input
            {...register('lastName')}
            className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#7a7060] mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#7a7060] mb-1">Phone</label>
          <input
            {...register('phone')}
            type="tel"
            placeholder="+386"
            className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#7a7060] mb-1">
            Special requests <span className="text-[#a09880] font-normal">(optional)</span>
          </label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] resize-none"
          />
        </div>
      </div>

      {/* Allergens */}
      <div>
        <label className="block text-xs font-medium text-[#7a7060] mb-2">
          Allergens <span className="text-[#a09880] font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map(allergen => {
            const selected = booking.allergens.includes(allergen)
            return (
              <button
                key={allergen}
                type="button"
                onClick={() => toggleAllergen(allergen)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  selected
                    ? 'bg-[#1a1a18] text-[#f5f0e8] border-[#1a1a18]'
                    : 'bg-white text-[#5a5545] border-[#e8e4dc] hover:border-[#1a1a18]'
                }`}
              >
                {allergen}
              </button>
            )
          })}
        </div>
      </div>

      {submitError && <p className="text-xs text-red-500">{submitError}</p>}

      <button
        onClick={handleSubmit(onSubmit)}
        disabled={submitting}
        className="w-full py-3 bg-[#1a1a18] text-[#f5f0e8] rounded-xl text-sm font-medium hover:bg-[#2a2a26] disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Confirming…' : 'Confirm booking'}
      </button>
    </div>
  )
}