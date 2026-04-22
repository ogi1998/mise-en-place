'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { getScheduleForArea, updateDaySchedule } from '@/services/manager/settings/weekly-schedule/queries'
import { dayScheduleSchema, type DayScheduleFormData } from '@/schemas/manager/settings/weekly-schedule'
import type { WeeklySchedule } from '@/services/manager/settings/weekly-schedule/types'

export function useWeeklySchedule(initialSchedules: WeeklySchedule[], areaId: string) {
  const [schedules, setSchedules] = useState<WeeklySchedule[]>(initialSchedules)
  const [openDayId, setOpenDayId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<Record<string, string>>({})
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({})

  const form = useForm<DayScheduleFormData>({
    resolver: zodResolver(dayScheduleSchema),
  })

  function handleOpenDay(schedule: WeeklySchedule) {
    if (openDayId === schedule.id) {
      setOpenDayId(null)
      return
    }
    setOpenDayId(schedule.id)
    form.reset({
      is_open: schedule.is_open,
      open_time: schedule.open_time ?? null,
      close_time: schedule.close_time ?? null,
      pause_from: schedule.pause_from ?? null,
      pause_to: schedule.pause_to ?? null,
      slot_interval: schedule.slot_interval,
    })
  }

  async function handleSave(scheduleId: string, data: DayScheduleFormData) {
    setSaving(scheduleId)
    setSaveError(prev => ({ ...prev, [scheduleId]: '' }))
    setSaveSuccess(prev => ({ ...prev, [scheduleId]: false }))

    const payload = data.is_open
      ? data
      : { is_open: false, open_time: null, close_time: null, pause_from: null, pause_to: null, slot_interval: data.slot_interval }

    const { error } = await updateDaySchedule(supabase, scheduleId, payload)

    if (error) {
      setSaveError(prev => ({ ...prev, [scheduleId]: error }))
    } else {
      setSchedules(prev =>
        prev.map(s => s.id === scheduleId ? { ...s, ...payload } : s)
      )
      setSaveSuccess(prev => ({ ...prev, [scheduleId]: true }))
      setTimeout(() => setSaveSuccess(prev => ({ ...prev, [scheduleId]: false })), 2000)
    }
    setSaving(null)
  }

  async function reloadArea(newAreaId: string) {
    const { data } = await getScheduleForArea(supabase, newAreaId)
    setSchedules(data)
    setOpenDayId(null)
  }

  return {
    schedules,
    openDayId,
    saving,
    saveError,
    saveSuccess,
    form,
    handleOpenDay,
    handleSave,
    reloadArea,
  }
}