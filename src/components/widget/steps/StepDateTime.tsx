'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import DatePicker from '@/components/ui/DatePicker'
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

export default function StepDateTime({ booking, restaurantId, onChange, onNext, onBack, t }: Props) {
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [closed, setClosed] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!booking.date) return
    fetchSlots(booking.date)
  }, [booking.date, booking.partySize, booking.serviceAreaId])

  async function fetchSlots(date: string) {
    setLoading(true)
    setSlots([])
    setClosed(false)
    setError('')
    onChange({ slot: '' })

    try {
      const res = await fetch(
        `/api/widget/slots?date=${date}&serviceAreaId=${booking.serviceAreaId}&restaurantId=${restaurantId}&partySize=${booking.partySize}`
      )
      const json = await res.json()
      if (json.closed) {
        setClosed(true)
      } else {
        setSlots(json.slots ?? [])
      }
    } catch {
      setError('Failed to load slots. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-[#a09880] hover:text-[#1a1a18] transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t.date_title}
          </h2>
          <p className="text-sm text-[#7a7060]">{t.date_for} {booking.partySize} {t.guests(booking.partySize)}</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#7a7060] mb-1.5">{t.date_label}</label>
        <DatePicker
          value={booking.date}
          onChange={(date) => onChange({ date })}
          min={today}
          placeholder={t.date_select_placeholder}
          theme="widget"
        />
      </div>

      {booking.date && (
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1.5">{t.date_available_times}</label>
          {loading && (
            <p className="text-sm text-[#a09880] py-2">{t.date_loading}</p>
          )}
          {!loading && closed && (
            <p className="text-sm text-[#a09880] py-2">{t.date_closed}</p>
          )}
          {!loading && !closed && slots.length === 0 && (
            <p className="text-sm text-[#a09880] py-2">{t.date_no_slots}</p>
          )}
          {!loading && slots.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => onChange({ slot })}
                  className={`py-2 text-sm rounded-lg border transition-colors ${
                    booking.slot === slot
                      ? 'bg-[#1a1a18] text-[#f5f0e8] border-[#1a1a18]'
                      : 'bg-white text-[#3a3528] border-[#e8e4dc] hover:border-[#1a1a18]'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!booking.date || !booking.slot}
        className="w-full py-3 bg-[#1a1a18] text-[#f5f0e8] rounded-xl text-sm font-medium hover:bg-[#2a2a26] disabled:opacity-40 transition-colors"
      >
        {t.continue}
      </button>
    </div>
  )
}
