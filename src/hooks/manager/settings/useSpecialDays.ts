'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import {
  createSpecialDay,
  updateSpecialDay,
  deleteSpecialDay,
} from '@/services/manager/settings/special-days/queries'
import {
  specialDaySchema,
  EMPTY_FORM,
  type SpecialDayFormData,
} from '@/schemas/manager/settings/special-days'
import { todayISO } from '@/services/manager/settings/special-days/utils'
import type { SpecialDay } from '@/services/manager/settings/special-days/types'

export function useSpecialDays(initialDays: SpecialDay[], restaurantId: string) {
  const [days, setDays] = useState<SpecialDay[]>(initialDays)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [killSwitchLoading, setKillSwitchLoading] = useState(false)
  const [killSwitchError, setKillSwitchError] = useState('')

  const form = useForm<SpecialDayFormData>({
    resolver: zodResolver(specialDaySchema),
    defaultValues: EMPTY_FORM,
  })

  function cleanPayload(data: SpecialDayFormData) {
    if (data.type === 'closed' || data.type === 'open') {
      return {
        ...data,
        open_time: null,
        close_time: null,
        pause_from: null,
        pause_to: null,
        slot_interval: null,
      }
    }
    return data
  }

  function handleOpenCreate() {
    setEditingId(null)
    form.reset(EMPTY_FORM)
    setFormError('')
    setShowCreateForm(true)
  }

  function handleCancelCreate() {
    setShowCreateForm(false)
    setFormError('')
  }

  async function handleCreate(data: SpecialDayFormData) {
    setSaving(true)
    setFormError('')
    const { data: created, error } = await createSpecialDay(supabase, {
      ...cleanPayload(data),
      restaurant_id: restaurantId,
      service_area_id: null,
    })
    if (error) {
      setFormError(error)
    } else if (created) {
      setDays(prev => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)))
      setShowCreateForm(false)
    }
    setSaving(false)
  }

  function handleOpenEdit(day: SpecialDay) {
    setShowCreateForm(false)
    setEditingId(day.id)
    setFormError('')
    form.reset({
      name: day.name,
      date: day.date,
      type: day.type,
      open_time: day.open_time,
      close_time: day.close_time,
      pause_from: day.pause_from,
      pause_to: day.pause_to,
      slot_interval: day.slot_interval ?? 30,
      is_recurring: day.is_recurring,
    })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setFormError('')
  }

  async function handleUpdate(data: SpecialDayFormData) {
    if (!editingId) return
    setSaving(true)
    setFormError('')
    const { error } = await updateSpecialDay(supabase, editingId, cleanPayload(data))
    if (error) {
      setFormError(error)
    } else {
      setDays(prev =>
        prev
          .map(d => d.id === editingId ? { ...d, ...cleanPayload(data) } : d)
          .sort((a, b) => a.date.localeCompare(b.date))
      )
      setEditingId(null)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const { error } = await deleteSpecialDay(supabase, id)
    if (!error) {
      setDays(prev => prev.filter(d => d.id !== id))
    }
    setDeletingId(null)
  }

  async function handleKillSwitch() {
    setKillSwitchLoading(true)
    setKillSwitchError('')
    const today = todayISO()
    const alreadyExists = days.some(d => d.date === today && d.type === 'closed')
    if (alreadyExists) {
      setKillSwitchError('Today is already marked as closed.')
      setKillSwitchLoading(false)
      return
    }
    const { data: created, error } = await createSpecialDay(supabase, {
      name: 'Closed today',
      date: today,
      type: 'closed',
      restaurant_id: restaurantId,
      service_area_id: null,
      open_time: null,
      close_time: null,
      pause_from: null,
      pause_to: null,
      slot_interval: null,
      is_recurring: false,
    })
    if (error) {
      setKillSwitchError(error)
    } else if (created) {
      setDays(prev => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)))
    }
    setKillSwitchLoading(false)
  }

  return {
    days,
    showCreateForm,
    editingId,
    saving,
    formError,
    deletingId,
    killSwitchLoading,
    killSwitchError,
    form,
    handleOpenCreate,
    handleCancelCreate,
    handleCreate,
    handleOpenEdit,
    handleCancelEdit,
    handleUpdate,
    handleDelete,
    handleKillSwitch,
  }
}