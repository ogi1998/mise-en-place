'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { updateGeneralSettings } from '@/services/manager/settings/general/queries'
import { generalSchema, type GeneralFormData } from '@/schemas/manager/settings/general'
import type { GeneralSettings } from '@/services/manager/settings/general/types'

export function useGeneral(initialSettings: GeneralSettings, restaurantId: string) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string>('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const form = useForm<GeneralFormData>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      time_format: initialSettings.time_format ?? '24h',
      week_start: initialSettings.week_start ?? 'monday',
      hide_closed_days: initialSettings.hide_closed_days ?? false,
      available_languages: initialSettings.available_languages ?? ['en'],
      default_language: initialSettings.default_language ?? 'en',
      timezone: initialSettings.timezone ?? 'Europe/Ljubljana',
      currency: initialSettings.currency ?? 'EUR',
      bank_iban: initialSettings.bank_iban ?? '',
      bank_name: initialSettings.bank_name ?? '',
      bank_bic: initialSettings.bank_bic ?? '',
      bank_account_holder: initialSettings.bank_account_holder ?? '',
      vouchers_enabled: initialSettings.vouchers_enabled ?? false,
    },
  })

  async function handleSave(data: GeneralFormData) {
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    const { error } = await updateGeneralSettings(supabase, restaurantId, {
      ...data,
      bank_iban: data.bank_iban || null,
      bank_name: data.bank_name || null,
      bank_bic: data.bank_bic || null,
      bank_account_holder: data.bank_account_holder || null,
    })

    if (error) {
      setSaveError(error)
    } else {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    }
    setSaving(false)
  }

  return { form, saving, saveError, saveSuccess, handleSave }
}
