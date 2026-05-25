'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, ImagePlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { createEvent, updateEvent } from '@/services/manager/events/queries'
import { eventSchema, type EventFormData } from '@/schemas/manager/events'
import TimePicker from '@/components/ui/TimePicker'
import DatePicker from '@/components/ui/DatePicker'
import type { Event } from '@/services/manager/events/types'
import type { ServiceArea } from '@/services/manager/settings/service-areas/types'

type Props = {
  restaurantId: string
  event?: Event
  areas: ServiceArea[]
  onClose: () => void
  onSaved: (event: Event) => void
}

function toHHMM(t: string): string {
  return t ? t.slice(0, 5) : ''
}

function Field({ label, error, children }: {
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

export default function EventModal({ restaurantId, event, areas, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(event?.cover_image ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!event

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event?.name ?? '',
      date: event?.date ?? '',
      time_start: event ? toHHMM(event.time_start) : '',
      time_end: event ? toHHMM(event.time_end) : '',
      capacity: event?.capacity ?? null,
      is_public: event?.is_public ?? true,
      locked_area_ids: event?.locked_area_ids ?? [],
    },
  })

  const isPublic = watch('is_public')
  const date = watch('date')
  const timeStart = watch('time_start')
  const timeEnd = watch('time_end')
  const lockedAreaIds = watch('locked_area_ids')

  function toggleArea(id: string) {
    const current = lockedAreaIds ?? []
    setValue(
      'locked_area_ids',
      current.includes(id) ? current.filter(a => a !== id) : [...current, id],
    )
  }

  async function onSubmit(data: EventFormData) {
    setSaving(true)
    setSaveError('')

    let coverImage = event?.cover_image ?? null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${restaurantId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('event-covers')
        .upload(path, imageFile, { upsert: true })
      if (uploadError) {
        setSaveError('Failed to upload image')
        setSaving(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('event-covers').getPublicUrl(path)
      coverImage = publicUrl
    }

    const payload = {
      ...data,
      capacity: Number.isNaN(data.capacity as number) ? null : data.capacity,
      cover_image: coverImage,
    }

    if (isEditing) {
      const { error } = await updateEvent(supabase, event.id, payload)
      if (error) { setSaveError(error); setSaving(false); return }
      onSaved({ ...event, ...payload })
    } else {
      const { data: created, error } = await createEvent(supabase, restaurantId, payload)
      if (error || !created) { setSaveError(error ?? 'Failed to create'); setSaving(false); return }
      onSaved(created)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e4dc]">
          <h2 className="text-sm font-semibold text-[#1a1a18]">
            {isEditing ? 'Edit event' : 'New event'}
          </h2>
          <button onClick={onClose} className="text-[#a09880] hover:text-[#1a1a18] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Cover image */}
          <div>
            <label className="block text-xs font-medium text-[#7a7060] mb-1">Cover image (optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative h-36 w-full rounded-lg overflow-hidden group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={imagePreview} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Change image</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 rounded-lg border border-dashed border-[#d8d3ca] flex flex-col items-center justify-center gap-1.5 text-[#a09880] hover:border-[#1a1a18] hover:text-[#1a1a18] transition-colors"
              >
                <ImagePlus size={18} />
                <span className="text-xs">Upload image</span>
              </button>
            )}
          </div>

          <Field label="Event name" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="e.g. Wine Tasting Evening"
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] placeholder:text-[#a09880] focus:outline-none focus:border-[#1a1a18]"
            />
          </Field>

          <Field label="Date" error={errors.date?.message}>
            <DatePicker
              value={date}
              onChange={v => setValue('date', v, { shouldValidate: true })}
              hasError={!!errors.date}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time" error={errors.time_start?.message}>
              <TimePicker
                value={timeStart}
                onChange={v => setValue('time_start', v, { shouldValidate: true })}
              />
            </Field>
            <Field label="End time" error={errors.time_end?.message}>
              <TimePicker
                value={timeEnd}
                onChange={v => setValue('time_end', v, { shouldValidate: true })}
              />
            </Field>
          </div>

          <Field label="Max capacity (optional)" error={errors.capacity?.message}>
            <input
              {...register('capacity', { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="No limit"
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] placeholder:text-[#a09880] focus:outline-none focus:border-[#1a1a18]"
            />
          </Field>

          <Field label="Visibility" error={errors.is_public?.message}>
            <div className="flex gap-2 mt-1">
              {[{ label: 'Public', value: true }, { label: 'Private', value: false }].map(opt => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setValue('is_public', opt.value)}
                  className={`px-4 py-1.5 text-xs rounded-full border transition-colors ${
                    isPublic === opt.value
                      ? 'bg-[#1a1a18] text-[#f5f0e8] border-[#1a1a18]'
                      : 'bg-white text-[#5a5545] border-[#d8d3ca] hover:border-[#1a1a18]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          {areas.length > 0 && (
            <Field label="Lock service areas during event">
              <p className="text-[11px] text-[#a09880] mb-2">Selected areas will be reserved for this event only</p>
              <div className="flex flex-wrap gap-2">
                {areas.map(area => {
                  const locked = (lockedAreaIds ?? []).includes(area.id)
                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => toggleArea(area.id)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        locked
                          ? 'bg-[#1a1a18] text-[#f5f0e8] border-[#1a1a18]'
                          : 'bg-white text-[#5a5545] border-[#d8d3ca] hover:border-[#1a1a18]'
                      }`}
                    >
                      {area.name}
                    </button>
                  )
                })}
              </div>
            </Field>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-[#e8e4dc]">
          <div>
            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#5a5545] hover:text-[#1a1a18] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="px-5 py-2 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-md hover:bg-[#2a2a26] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
