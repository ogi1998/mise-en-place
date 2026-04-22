'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { SpecialDayFormData } from '@/schemas/manager/settings/special-days'
import { SLOT_INTERVAL_OPTIONS } from '@/services/manager/settings/weekly-schedule/utils'

type Props = {
  form: UseFormReturn<SpecialDayFormData>
  saving: boolean
  error: string
  onSave: (data: SpecialDayFormData) => void
  onCancel: () => void
}

export default function SpecialDayForm({ form, saving, error, onSave, onCancel }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = form
  const type = watch('type')

  return (
    <div className="border border-[#1a1a18] rounded-lg p-4 bg-white space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#7a7060] mb-1">Name</label>
          <input
            {...register('name')}
            placeholder="e.g. New Year's Day"
            className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1">Date</label>
          <input
            type="date"
            {...register('date')}
            className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1">Type</label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]"
          >
            <option value="closed">Closed</option>
            <option value="open">Open</option>
            <option value="modified">Modified Hours</option>
          </select>
        </div>
      </div>

      {type === 'modified' && (
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#e8e4dc]">
          <div>
            <label className="block text-xs font-medium text-[#7a7060] mb-1">Open time</label>
            <input type="time" {...register('open_time')}
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]" />
            {errors.open_time && <p className="mt-1 text-xs text-red-500">{errors.open_time.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7a7060] mb-1">Close time</label>
            <input type="time" {...register('close_time')}
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]" />
            {errors.close_time && <p className="mt-1 text-xs text-red-500">{errors.close_time.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7a7060] mb-1">Pause from <span className="text-[#a09880] font-normal">(optional)</span></label>
            <input type="time" {...register('pause_from')}
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]" />
            {errors.pause_from && <p className="mt-1 text-xs text-red-500">{errors.pause_from.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7a7060] mb-1">Pause to <span className="text-[#a09880] font-normal">(optional)</span></label>
            <input type="time" {...register('pause_to')}
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]" />
            {errors.pause_to && <p className="mt-1 text-xs text-red-500">{errors.pause_to.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#7a7060] mb-1">Slot interval</label>
            <select {...register('slot_interval', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-sm border border-[#d8d3ca] rounded-md bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18]">
              {SLOT_INTERVAL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <input
          type="checkbox"
          {...register('is_recurring')}
          className="w-4 h-4 rounded border-[#c8c3b8] accent-[#1a1a18]"
        />
        <span className="text-sm text-[#3a3528]">Repeat every year on this date</span>
      </label>

      <div className="flex items-center gap-3 pt-2 border-t border-[#e8e4dc]">
        <button
          onClick={handleSubmit(onSave)}
          disabled={saving}
          className="px-4 py-2 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-md hover:bg-[#2a2a26] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-[#5a5545] hover:text-[#1a1a18] transition-colors"
        >
          Cancel
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </div>
  )
}