'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { RulesFormData } from '@/schemas/manager/settings/rules'
import { REMINDER_OPTIONS } from '@/services/manager/settings/rules/utils'
import Toggle from '@/components/manager/ui/Toggle'

type Props = {
  form: UseFormReturn<RulesFormData>
  saving: boolean
  saveError: string
  saveSuccess: boolean
  onSave: (data: RulesFormData) => void
}

function Field({ label, hint, error, children }: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#7a7060] mb-1">{label}</label>
      {hint && <p className="text-xs text-[#a09880] mb-1">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function NumberInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      min={0}
      {...props}
      className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
    />
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#a09880] pt-2 pb-1 border-b border-[#e8e4dc]">
      {children}
    </h3>
  )
}

export default function RulesForm({ form, saving, saveError, saveSuccess, onSave }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form
  const thankYouEmail = watch('thank_you_email')
  const reminderIntervals = watch('reminder_intervals')
  const waitlistEnabled = watch('waitlist_enabled')

  function toggleReminder(value: number) {
    const current = reminderIntervals ?? []
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    setValue('reminder_intervals', next)
  }

  return (
    <div className="space-y-6">

      <div>
        <SectionTitle>Party Size</SectionTitle>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <Field label="Min guests" error={errors.min_guests?.message}>
            <NumberInput {...register('min_guests', { valueAsNumber: true })} min={1} />
          </Field>
          <Field label="Max guests online" error={errors.max_guests_online?.message}>
            <NumberInput {...register('max_guests_online', { valueAsNumber: true })} min={1} />
          </Field>
          <Field label="Default guests" error={errors.default_guests?.message}>
            <NumberInput {...register('default_guests', { valueAsNumber: true })} min={1} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Timing</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <Field label="Booking duration (min)" hint="How long a table is reserved" error={errors.booking_duration?.message}>
            <NumberInput {...register('booking_duration', { valueAsNumber: true })} min={15} />
          </Field>
          <Field label="Buffer time (min)" hint="Hatched tail after booking ends" error={errors.buffer_time?.message}>
            <NumberInput {...register('buffer_time', { valueAsNumber: true })} min={0} />
          </Field>
          <Field label="Min time before slot (min)" hint="How soon before a slot guests can book" error={errors.min_time_before_slot?.message}>
            <NumberInput {...register('min_time_before_slot', { valueAsNumber: true })} min={0} />
          </Field>
          <Field label="Booking before closing (min)" hint="Last slot must start this many minutes before close" error={errors.booking_before_closing?.message}>
            <NumberInput {...register('booking_before_closing', { valueAsNumber: true })} min={0} />
          </Field>
          <Field label="Future booking window (days)" hint="How far ahead guests can book" error={errors.future_booking_window?.message}>
            <NumberInput {...register('future_booking_window', { valueAsNumber: true })} min={1} />
          </Field>
          <Field label="Delay validity (min)" hint="How long a delay flag stays active" error={errors.delay_validity?.message}>
            <NumberInput {...register('delay_validity', { valueAsNumber: true })} min={1} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Cancellation</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <Field label="Cancellation window (days)" error={errors.cancellation_window_days?.message}>
            <NumberInput {...register('cancellation_window_days', { valueAsNumber: true })} min={0} />
          </Field>
          <Field label="Cancellation window (hours)" error={errors.cancellation_window_hours?.message}>
            <NumberInput {...register('cancellation_window_hours', { valueAsNumber: true })} min={0} />
          </Field>
        </div>
        <p className="text-xs text-[#a09880] mt-2">Guest must cancel at least X days + Y hours before the booking.</p>
      </div>

      <div>
        <SectionTitle>Waitlist</SectionTitle>
        <div className="space-y-3 mt-3">
          <div className="flex items-center gap-4">
            <Toggle
              checked={waitlistEnabled ?? false}
              onChange={(v) => setValue('waitlist_enabled', v)}
            />
            <span className="text-sm text-[#3a3528]">Enable waitlist</span>
          </div>
          {waitlistEnabled && (
            <Field label="Confirmation window (min)" hint="How long guest has to confirm when a slot opens" error={errors.waitlist_confirmation_window?.message}>
              <NumberInput
                {...register('waitlist_confirmation_window', { valueAsNumber: true })}
                min={1}
                className="w-40 px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
              />
            </Field>
          )}
        </div>
      </div>

      <div>
        <SectionTitle>Reminders</SectionTitle>
        <div className="flex flex-wrap gap-2 mt-3">
          {REMINDER_OPTIONS.map(opt => {
            const checked = (reminderIntervals ?? []).includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleReminder(opt.value)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  checked
                    ? 'bg-[#1a1a18] text-[#f5f0e8] border-[#1a1a18]'
                    : 'bg-white text-[#5a5545] border-[#d8d3ca] hover:border-[#1a1a18]'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <SectionTitle>Notifications</SectionTitle>
        <div className="flex items-center gap-4 mt-3">
          <Toggle
            checked={thankYouEmail ?? false}
            onChange={(v) => setValue('thank_you_email', v)}
          />
          <span className="text-sm text-[#3a3528]">Send thank you email after visit</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-[#e8e4dc]">
        <button
          onClick={handleSubmit(onSave)}
          disabled={saving}
          className="px-5 py-2 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-md hover:bg-[#2a2a26] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save rules'}
        </button>
        {saveSuccess && <span className="text-xs text-green-600">Saved</span>}
        {saveError && <span className="text-xs text-red-500">{saveError}</span>}
      </div>
    </div>
  )
}