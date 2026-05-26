'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { GeneralFormData } from '@/schemas/manager/settings/general'
import Toggle from '@/components/manager/ui/Toggle'

const LANGUAGES = [
  { code: 'sl', label: 'Slovenian' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'hr', label: 'Croatian' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'sr', label: 'Serbian' },
]

const TIMEZONES = [
  'Europe/Ljubljana',
  'Europe/Zagreb',
  'Europe/Sarajevo',
  'Europe/Belgrade',
  'Europe/Vienna',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Paris',
  'Europe/Zurich',
  'Europe/London',
  'UTC',
]

const CURRENCIES = [
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'CHF', label: 'CHF — Swiss Franc' },
]

type Props = {
  form: UseFormReturn<GeneralFormData>
  saving: boolean
  saveError: string
  saveSuccess: boolean
  onSave: (data: GeneralFormData) => void
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#a09880] pt-2 pb-1 border-b border-[#e8e4dc]">
      {children}
    </h3>
  )
}

function SelectField({ label, error, children }: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#7a7060] mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function GeneralForm({ form, saving, saveError, saveSuccess, onSave }: Props) {
  const { handleSubmit, watch, setValue, formState: { errors } } = form

  const timeFormat = watch('time_format')
  const weekStart = watch('week_start')
  const timezone = watch('timezone')
  const currency = watch('currency')
  const availableLanguages = watch('available_languages')
  const defaultLanguage = watch('default_language')
  const hideClosed = watch('hide_closed_days')

  function toggleLanguage(code: string) {
    const current = availableLanguages ?? []
    if (current.includes(code)) {
      if (current.length === 1) return
      const next = current.filter(c => c !== code)
      setValue('available_languages', next)
      if (defaultLanguage === code) {
        setValue('default_language', next[0])
      }
    } else {
      setValue('available_languages', [...current, code])
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <SectionTitle>Date &amp; Time</SectionTitle>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <SelectField label="Time format" error={errors.time_format?.message}>
            <select
              value={timeFormat}
              onChange={(e) => setValue('time_format', e.target.value as '24h' | '12h')}
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
            >
              <option value="24h">24-hour (14:30)</option>
              <option value="12h">12-hour (2:30 PM)</option>
            </select>
          </SelectField>
          <SelectField label="Week starts on" error={errors.week_start?.message}>
            <select
              value={weekStart}
              onChange={(e) => setValue('week_start', e.target.value as 'monday' | 'sunday')}
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </SelectField>
          <SelectField label="Timezone" error={errors.timezone?.message}>
            <select
              value={timezone}
              onChange={(e) => setValue('timezone', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </SelectField>
        </div>
      </div>

      <div>
        <SectionTitle>Localisation</SectionTitle>
        <div className="mt-3 w-48">
          <SelectField label="Currency" error={errors.currency?.message}>
            <select
              value={currency}
              onChange={(e) => setValue('currency', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </SelectField>
        </div>
      </div>

      <div>
        <SectionTitle>Widget</SectionTitle>
        <div className="space-y-5 mt-3">
          <div className="flex items-center gap-4">
            <Toggle
              checked={hideClosed}
              onChange={(v) => setValue('hide_closed_days', v)}
            />
            <div>
              <p className="text-sm text-[#3a3528]">Hide closed days in widget</p>
              <p className="text-xs text-[#a09880]">Guests won't see days the restaurant is closed</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7a7060] mb-2">Available guest languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => {
                const selected = (availableLanguages ?? []).includes(lang.code)
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selected
                        ? 'bg-[#1a1a18] text-[#f5f0e8] border-[#1a1a18]'
                        : 'bg-white text-[#5a5545] border-[#d8d3ca] hover:border-[#1a1a18]'
                    }`}
                  >
                    {lang.label}
                  </button>
                )
              })}
            </div>
            {errors.available_languages && (
              <p className="mt-1 text-xs text-red-500">{errors.available_languages.message}</p>
            )}
          </div>

          <div className="w-48">
            <SelectField label="Default language" error={errors.default_language?.message}>
              <select
                value={defaultLanguage}
                onChange={(e) => setValue('default_language', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
              >
                {(availableLanguages ?? []).map(code => {
                  const lang = LANGUAGES.find(l => l.code === code)
                  return (
                    <option key={code} value={code}>{lang?.label ?? code}</option>
                  )
                })}
              </select>
            </SelectField>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-[#e8e4dc]">
        <button
          onClick={handleSubmit(onSave)}
          disabled={saving}
          className="px-5 py-2 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-md hover:bg-[#2a2a26] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {saveSuccess && <span className="text-xs text-green-600">Saved</span>}
        {saveError && <span className="text-xs text-red-500">{saveError}</span>}
      </div>
    </div>
  )
}
