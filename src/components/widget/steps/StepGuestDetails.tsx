'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabaseWidget } from '@/lib/supabase-widget'
import type { BookingState } from '../BookingWidget'
import type { WidgetTranslations } from '@/lib/widget-translations'

const guestSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  email:     z.string().email('Invalid email'),
  phone:     z.string().min(6, 'Invalid phone'),
  notes:     z.string().optional(),
})

type GuestFormData = z.infer<typeof guestSchema>

const ALLERGEN_OPTIONS = [
  'Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts',
  'Shellfish', 'Fish', 'Soy', 'Sesame',
]

type Props = {
  booking: BookingState
  onChange: (updates: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
  t: WidgetTranslations
}

export default function StepGuestDetails({ booking, onChange, onNext, onBack, t }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: booking.firstName,
      lastName:  booking.lastName,
      email:     booking.email,
      phone:     booking.phone,
      notes:     booking.notes,
    },
  })

  function toggleAllergen(allergen: string) {
    const next = booking.allergens.includes(allergen)
      ? booking.allergens.filter(a => a !== allergen)
      : [...booking.allergens, allergen]
    onChange({ allergens: next })
  }

  async function onSubmit(data: GuestFormData) {
    setSubmitting(true)
    setSubmitError('')

    onChange({
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      phone:     data.phone,
      notes:     data.notes ?? '',
    })

    const { error: err } = await supabaseWidget.auth.signInWithOtp({ email: data.email })
    setSubmitting(false)
    if (err) {
      setSubmitError(err.message)
    } else {
      onNext()
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-[#a09880] hover:text-[#1a1a18] transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t.details_title}
          </h2>
          <p className="text-sm text-[#7a7060]">
            {booking.partySize} {t.guests(booking.partySize)} · {booking.date} · {booking.slot}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1">{t.details_first_name}</label>
          <input
            {...register('firstName')}
            className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1">{t.details_last_name}</label>
          <input
            {...register('lastName')}
            className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#7a7060] mb-1">{t.details_email}</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#7a7060] mb-1">{t.details_phone}</label>
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
            {t.details_notes} <span className="text-[#a09880] font-normal">({t.optional})</span>
          </label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] resize-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#7a7060] mb-2">
          {t.details_allergens} <span className="text-[#a09880] font-normal">({t.optional})</span>
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
        {submitting ? t.details_sending : t.details_send_code}
      </button>
    </div>
  )
}
