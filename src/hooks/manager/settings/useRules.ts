'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { getRulesForArea, updateRules } from '@/services/manager/settings/rules/queries'
import { rulesSchema, type RulesFormData } from '@/schemas/manager/settings/rules'
import type { BookingRules } from '@/services/manager/settings/rules/types'

function toFormData(rules: BookingRules): RulesFormData {
  return {
    min_guests: rules.min_guests,
    max_guests_online: rules.max_guests_online,
    default_guests: rules.default_guests,
    booking_duration: rules.booking_duration,
    buffer_time: rules.buffer_time,
    min_time_before_slot: rules.min_time_before_slot,
    booking_before_closing: rules.booking_before_closing,
    future_booking_window: rules.future_booking_window,
    delay_validity: rules.delay_validity,
    cancellation_window_days: rules.cancellation_window_days,
    cancellation_window_hours: rules.cancellation_window_hours,
    waitlist_enabled: rules.waitlist_enabled,
    waitlist_confirmation_window: rules.waitlist_confirmation_window,
    reminder_intervals: rules.reminder_intervals,
    thank_you_email: rules.thank_you_email,
  }
}

export function useRules(initialRules: BookingRules) {
  const [rules, setRules] = useState<BookingRules>(initialRules)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string>('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const form = useForm<RulesFormData>({
    resolver: zodResolver(rulesSchema),
    defaultValues: toFormData(initialRules),
  })

  async function handleSave(data: RulesFormData) {
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    const { error } = await updateRules(supabase, rules.id, data)

    if (error) {
      setSaveError(error)
    } else {
      setRules(prev => ({ ...prev, ...data }))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    }
    setSaving(false)
  }

  async function reloadArea(areaId: string) {
    const { data } = await getRulesForArea(supabase, areaId)
    if (data) {
      setRules(data)
      form.reset(toFormData(data))
    }
  }

  return { form, saving, saveError, saveSuccess, handleSave, reloadArea }
}