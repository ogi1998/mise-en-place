'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { supabaseWidget } from '@/lib/supabase-widget'
import type { BookingState } from '../BookingWidget'
import type { WidgetTranslations } from '@/lib/widget-translations'

type Props = {
  booking: BookingState
  restaurantId: string
  onChange: (updates: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
  t: WidgetTranslations
}

export default function StepOtp({ booking, restaurantId, onChange, onNext, onBack, t }: Props) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submitBooking(token: string) {
    try {
      const res = await fetch('/api/widget/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          service_area_id: booking.serviceAreaId,
          party_size: booking.partySize,
          booking_date: booking.date,
          slot_time: booking.slot,
          first_name: booking.firstName,
          last_name: booking.lastName,
          email: booking.email,
          phone: booking.phone,
          notes: booking.notes || null,
          allergens: booking.allergens,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
      } else {
        onChange({ bookingId: json.bookingId })
        onNext()
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (otp.length < 8) return
    setLoading(true)
    setError('')
    const { data, error: err } = await supabaseWidget.auth.verifyOtp({
      email: booking.email,
      token: otp,
      type: 'email',
    })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    if (data.session) {
      onChange({ guestUserId: data.session.user.id })
      await submitBooking(data.session.access_token)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-[#a09880] hover:text-[#1a1a18] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2
            className="text-lg font-semibold text-[#1a1a18]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {t.otp_title}
          </h2>
          <p className="text-sm text-[#7a7060]">
            {booking.partySize} {t.guests(booking.partySize)} · {booking.date} · {booking.slot}
          </p>
        </div>
      </div>

      <p className="text-sm text-[#7a7060]">
        {t.otp_sent_to}{' '}
        <span className="text-[#1a1a18] font-medium">{booking.email}</span>
      </p>

      <div>
        <label className="block text-xs font-medium text-[#7a7060] mb-1">
          {t.otp_code_label}
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="00000000"
          autoFocus
          className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] placeholder:text-[#a09880] tracking-[0.3em] text-center"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleVerify}
        disabled={loading || otp.length < 8}
        className="w-full py-3 bg-[#1a1a18] text-[#f5f0e8] rounded-xl text-sm font-medium hover:bg-[#2a2a26] disabled:opacity-50 transition-colors"
      >
        {loading ? t.otp_confirming : t.otp_confirm}
      </button>

      <button
        onClick={onBack}
        className="w-full text-center text-xs text-[#7a7060] hover:text-[#1a1a18] transition-colors"
      >
        {t.otp_wrong_email}
      </button>
    </div>
  )
}
