import { Check } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { TableFormData } from '@/schemas/manager/settings/tables'
import type { Table } from '@/services/manager/settings/tables/types'

const TABLE_SHAPES = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'square', label: 'Square' },
  { value: 'circle', label: 'Circle' },
  { value: 'oval', label: 'Oval' },
] as const

type Props = {
  table?: Table
  form: UseFormReturn<TableFormData>
  formLoading: boolean
  formError: string | null
  onSubmit: () => void
  onCancel: () => void
}

export default function InlineTableForm({
  table,
  form,
  formLoading,
  formError,
  onSubmit,
  onCancel,
}: Props) {
  const { register, formState: { errors } } = form

  return (
    <div className="px-5 py-4 bg-[#faf9f6] border-l-2 border-[#1a1a18]">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#a09880] mb-4">
        {table ? `Editing: ${table.name}` : 'New Table'}
      </p>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#5a5545] mb-1">Name *</label>
          <input
            {...register('name')}
            type="text"
            placeholder="e.g. T1, Window Table"
            className="w-full px-3 py-2 border border-[#e8e4dc] rounded-lg text-sm focus:outline-none focus:border-[#1a1a18] transition-colors bg-white"
          />
          {errors.name && (
            <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5a5545] mb-1">Nickname</label>
          <input
            {...register('nickname')}
            type="text"
            placeholder="e.g. The corner booth"
            className="w-full px-3 py-2 border border-[#e8e4dc] rounded-lg text-sm focus:outline-none focus:border-[#1a1a18] transition-colors bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5a5545] mb-1">Shape</label>
          <select
            {...register('shape')}
            className="w-full px-3 py-2 border border-[#e8e4dc] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1a1a18] transition-colors"
          >
            {TABLE_SHAPES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5a5545] mb-1">Min Seats</label>
          <input
            {...register('min_seats', { valueAsNumber: true })}
            type="number"
            min={1}
            className="w-full px-3 py-2 border border-[#e8e4dc] rounded-lg text-sm focus:outline-none focus:border-[#1a1a18] transition-colors bg-white"
          />
          {errors.min_seats && (
            <p className="text-[11px] text-red-500 mt-1">{errors.min_seats.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5a5545] mb-1">Default Seats</label>
          <input
            {...register('seats', { valueAsNumber: true })}
            type="number"
            min={1}
            className="w-full px-3 py-2 border border-[#e8e4dc] rounded-lg text-sm focus:outline-none focus:border-[#1a1a18] transition-colors bg-white"
          />
          {errors.seats && (
            <p className="text-[11px] text-red-500 mt-1">{errors.seats.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5a5545] mb-1">Max Seats</label>
          <input
            {...register('max_seats', { valueAsNumber: true })}
            type="number"
            min={1}
            className="w-full px-3 py-2 border border-[#e8e4dc] rounded-lg text-sm focus:outline-none focus:border-[#1a1a18] transition-colors bg-white"
          />
          {errors.max_seats && (
            <p className="text-[11px] text-red-500 mt-1">{errors.max_seats.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5a5545] mb-1">Sort Order</label>
          <input
            {...register('sort_order', { valueAsNumber: true })}
            type="number"
            min={0}
            className="w-full px-3 py-2 border border-[#e8e4dc] rounded-lg text-sm focus:outline-none focus:border-[#1a1a18] transition-colors bg-white"
          />
          {errors.sort_order && (
            <p className="text-[11px] text-red-500 mt-1">{errors.sort_order.message}</p>
          )}
        </div>
        <div className="col-span-3 flex gap-6 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              {...register('allow_multi')}
              type="checkbox"
              className="w-4 h-4 accent-[#1a1a18]"
            />
            <span className="text-sm text-[#1a1a18]">Allow multi-booking</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              {...register('is_active_online')}
              type="checkbox"
              className="w-4 h-4 accent-[#1a1a18]"
            />
            <span className="text-sm text-[#1a1a18]">Active online booking</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              {...register('is_active')}
              type="checkbox"
              className="w-4 h-4 accent-[#1a1a18]"
            />
            <span className="text-sm text-[#1a1a18]">Is Active</span>
          </label>
        </div>
      </div>
      {formError && (
        <p className="text-[12px] text-red-500 mt-3">{formError}</p>
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
          disabled={formLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a18] text-[#f5f0e8] text-sm rounded-lg hover:bg-[#2d2d2a] disabled:opacity-50 transition-colors"
        >
          <Check size={14} />
          {formLoading ? 'Saving…' : table ? 'Save Changes' : 'Create Table'}
        </button>
      </div>
    </div>
  )
}