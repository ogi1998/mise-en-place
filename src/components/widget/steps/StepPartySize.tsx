'use client'

import { Minus, Plus } from 'lucide-react'
import type { BookingState } from '../BookingWidget'
import type { WidgetServiceArea } from '@/services/widget/types'
import type { WidgetTranslations } from '@/lib/widget-translations'

type Props = {
  booking: BookingState
  serviceAreas: WidgetServiceArea[]
  onChange: (updates: Partial<BookingState>) => void
  onNext: () => void
  t: WidgetTranslations
}

export default function StepPartySize({ booking, serviceAreas, onChange, onNext, t }: Props) {
  function decrement() {
    if (booking.partySize > 1) onChange({ partySize: booking.partySize - 1 })
  }

  function increment() {
    if (booking.partySize < 20) onChange({ partySize: booking.partySize + 1 })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
          {t.party_title}
        </h2>
        <p className="text-sm text-[#7a7060] mt-1">{t.party_subtitle}</p>
      </div>

      {/* Party size stepper */}
      <div className="flex items-center justify-center gap-6 py-4">
        <button
          onClick={decrement}
          disabled={booking.partySize <= 1}
          className="w-10 h-10 rounded-full border border-[#e8e4dc] flex items-center justify-center text-[#1a1a18] hover:bg-[#f7f5f2] disabled:opacity-30 transition-colors"
        >
          <Minus size={16} />
        </button>
        <div className="text-center">
          <span className="text-4xl font-semibold text-[#1a1a18]">{booking.partySize}</span>
          <p className="text-xs text-[#a09880] mt-1">{t.guests(booking.partySize)}</p>
        </div>
        <button
          onClick={increment}
          disabled={booking.partySize >= 20}
          className="w-10 h-10 rounded-full border border-[#e8e4dc] flex items-center justify-center text-[#1a1a18] hover:bg-[#f7f5f2] disabled:opacity-30 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Service area selector — only show if more than one area */}
      {serviceAreas.length > 1 && (
        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-2">{t.preferred_area}</label>
          <div className="grid grid-cols-2 gap-2">
            {serviceAreas.map(area => (
              <button
                key={area.id}
                onClick={() => onChange({ serviceAreaId: area.id })}
                className={`px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                  booking.serviceAreaId === area.id
                    ? 'bg-[#1a1a18] text-[#f5f0e8] border-[#1a1a18]'
                    : 'bg-white text-[#3a3528] border-[#e8e4dc] hover:border-[#1a1a18]'
                }`}
              >
                {area.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full py-3 bg-[#1a1a18] text-[#f5f0e8] rounded-xl text-sm font-medium hover:bg-[#2a2a26] transition-colors"
      >
        {t.continue}
      </button>
    </div>
  )
}