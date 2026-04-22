'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { DayScheduleFormData } from '@/schemas/manager/settings/weekly-schedule'
import { SLOT_INTERVAL_OPTIONS } from '@/services/manager/settings/weekly-schedule/utils'

type Props = {
  form: UseFormReturn<DayScheduleFormData>
  scheduleId: string
  saving: boolean
  error: string
  success: boolean
  onSave: (data: DayScheduleFormData) => void
}

export default function DayScheduleForm({ form, scheduleId, saving, error, success, onSave }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = form
  const isOpen = watch('is_open')

  return (
    <div className="px-4 pb-4 pt-2 border-t border-[#e8e4dc]">
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <input
            type="checkbox"
            {...register('is_open')}
            className="w-4 h-4 rounded border-[#c8c3b8] accent-[#1a1a18]"
          />
          <span className="text-sm text-[#3a3528]">Open this day</span>
        </label>

        {isOpen && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7a7060] mb-1">Open time</label>
              <input
                type="time"
                {...register('open_time')}
                className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
              />
              {errors.open_time && <p className="mt-1 text-xs text-red-500">{errors.open_time.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7a7060] mb-1">Close time</label>
              <input
                type="time"
                {...register('close_time')}
                className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
              />
              {errors.close_time && <p className="mt-1 text-xs text-red-500">{errors.close_time.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7a7060] mb-1">Pause from <span className="text-[#a09880] font-normal">(optional)</span></label>
              <input
                type="time"
                {...register('pause_from')}
                className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
              />
              {errors.pause_from && <p className="mt-1 text-xs text-red-500">{errors.pause_from.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7a7060] mb-1">Pause to <span className="text-[#a09880] font-normal">(optional)</span></label>
              <input
                type="time"
                {...register('pause_to')}
                className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
              />
              {errors.pause_to && <p className="mt-1 text-xs text-red-500">{errors.pause_to.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#7a7060] mb-1">Slot interval</label>
              <select
                {...register('slot_interval', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
              >
                {SLOT_INTERVAL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSubmit(onSave)}
            disabled={saving}
            className="px-4 py-2 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-md hover:bg-[#2a2a26] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {success && <span className="text-xs text-green-600">Saved</span>}
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      </div>
    </div>
  )
}