import { Check } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { ServiceAreaFormData } from '@/schemas/manager/settings/service-areas'
import type { ServiceArea } from '@/services/manager/settings/service-areas/types'
import Toggle from '@/components/manager/ui/Toggle'

type Props = {
  area?: ServiceArea
  areaForm: UseFormReturn<ServiceAreaFormData>
  areaFormLoading: boolean
  areaFormError: string | null
  onSubmit: () => void
  onCancel: () => void
}

export default function InlineAreaForm({
  area,
  areaForm,
  areaFormLoading,
  areaFormError,
  onSubmit,
  onCancel,
}: Props) {
  const { register, watch, setValue, formState: { errors } } = areaForm

  return (
    <div className="px-5 py-4 bg-[#faf9f6] border-l-2 border-[#1a1a18]">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#a09880] mb-4">
        {area ? `Editing: ${area.name}` : 'New Service Area'}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#5a5545] mb-1">Name *</label>
          <input
            {...register('name')}
            type="text"
            placeholder="e.g. Main Hall, Terrace, Private Room"
            className="w-full px-3 py-2 border border-[#e8e4dc] rounded-lg text-sm text-[#1a1a18] placeholder:text-[#c0b8a8] focus:outline-none focus:border-[#1a1a18] transition-colors bg-white"
          />
          {errors.name && (
            <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#5a5545] mb-1">Description</label>
          <input
            {...register('description')}
            type="text"
            placeholder="Optional short description"
            className="w-full px-3 py-2 border border-[#e8e4dc] rounded-lg text-sm text-[#1a1a18] placeholder:text-[#c0b8a8] focus:outline-none focus:border-[#1a1a18] transition-colors bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5a5545] mb-1">Sort Order</label>
          <input
            {...register('sort_order', { valueAsNumber: true })}
            type="number"
            min={0}
            className="w-full px-3 py-2 border border-[#e8e4dc] rounded-lg text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] transition-colors bg-white"
          />
          {errors.sort_order && (
            <p className="text-[11px] text-red-500 mt-1">{errors.sort_order.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex items-center gap-3">
            <Toggle
              checked={watch('is_indoor') ?? false}
              onChange={(v) => setValue('is_indoor', v)}
            />
            <span className="text-sm text-[#1a1a18]">Indoor area</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              checked={watch('is_bookable_online') ?? false}
              onChange={(v) => setValue('is_bookable_online', v)}
            />
            <span className="text-sm text-[#1a1a18]">Bookable online</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              checked={watch('is_active') ?? false}
              onChange={(v) => setValue('is_active', v)}
            />
            <span className="text-sm text-[#1a1a18]">Active</span>
          </div>
        </div>
      </div>
      {areaFormError && (
        <p className="text-[12px] text-red-500 mt-3">{areaFormError}</p>
      )}
      <div className="flex justify-end gap-2 mt-5">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-[#5a5545] hover:text-[#1a1a18] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={areaFormLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a18] text-[#f5f0e8] text-sm rounded-lg hover:bg-[#2d2d2a] disabled:opacity-50 transition-colors"
        >
          <Check size={14} />
          {areaFormLoading ? 'Saving…' : area ? 'Save Changes' : 'Create Area'}
        </button>
      </div>
    </div>
  )
}