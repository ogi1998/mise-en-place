'use client'

import { useState } from 'react'
import StepPartySize from '@/components/widget/steps/StepPartySize'
import StepDateTime from '@/components/widget/steps/StepDateTime'
import StepGuestDetails from '@/components/widget/steps/StepGuestDetails'
import StepConfirmation from '@/components/widget/steps/StepConfirmation'
import type { WidgetServiceArea } from '@/services/widget/types'

type Step = 'party-size' | 'datetime' | 'guest-details' | 'confirmation'

export type BookingState = {
  partySize: number
  serviceAreaId: string
  date: string
  slot: string
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  allergens: string[]
  bookingId: string | null
}

const INITIAL_STATE: BookingState = {
  partySize: 2,
  serviceAreaId: '',
  date: '',
  slot: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
  allergens: [],
  bookingId: null,
}

const STEPS: Step[] = ['party-size', 'datetime', 'guest-details', 'confirmation']

const STEP_LABELS: Record<Step, string> = {
  'party-size': 'Party',
  'datetime': 'Date & Time',
  'guest-details': 'Details',
  'confirmation': 'Confirm',
}

type Props = {
  restaurantId: string
  restaurantName: string
  serviceAreas: WidgetServiceArea[]
}

export default function BookingWidget({ restaurantId, restaurantName, serviceAreas }: Props) {
  const [step, setStep] = useState<Step>('party-size')
  const [booking, setBooking] = useState<BookingState>({
    ...INITIAL_STATE,
    serviceAreaId: serviceAreas[0]?.id ?? '',
  })

  function updateBooking(updates: Partial<BookingState>) {
    setBooking(prev => ({ ...prev, ...updates }))
  }

  function nextStep() {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  function prevStep() {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  const stepIndex = STEPS.indexOf(step)
  const isConfirmed = step === 'confirmation' && booking.bookingId !== null

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-md">

        {/* Restaurant name */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-semibold text-[#1a1a18]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {restaurantName}
          </h1>
          <p className="text-sm text-[#7a7060] mt-1">Reserve a table</p>
        </div>

        {/* Step indicator */}
        {!isConfirmed && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.filter(s => s !== 'confirmation').map((s, i) => {
              const isActive = s === step
              const isDone = STEPS.indexOf(s) < stepIndex
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      isDone
                        ? 'bg-[#1a1a18] text-[#f5f0e8]'
                        : isActive
                          ? 'bg-[#1a1a18] text-[#f5f0e8]'
                          : 'bg-[#e8e4dc] text-[#a09880]'
                    }`}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs hidden sm:block ${isActive ? 'text-[#1a1a18] font-medium' : 'text-[#a09880]'}`}>
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                  {i < 2 && <div className="w-8 h-px bg-[#e8e4dc]" />}
                </div>
              )
            })}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e4dc] overflow-hidden">
          {step === 'party-size' && (
            <StepPartySize
              booking={booking}
              serviceAreas={serviceAreas}
              onChange={updateBooking}
              onNext={nextStep}
            />
          )}
          {step === 'datetime' && (
            <StepDateTime
              booking={booking}
              restaurantId={restaurantId}
              onChange={updateBooking}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {step === 'guest-details' && (
            <StepGuestDetails
              booking={booking}
              restaurantId={restaurantId}
              onChange={updateBooking}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {step === 'confirmation' && (
            <StepConfirmation
              booking={booking}
              restaurantName={restaurantName}
            />
          )}
        </div>

      </div>
    </div>
  )
}