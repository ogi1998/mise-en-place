'use client'

import { Pencil, Trash2, Cloud } from 'lucide-react'
import type { SpecialDay } from '@/services/manager/settings/special-days/types'
import {
  SPECIAL_DAY_TYPE_LABELS,
  SPECIAL_DAY_TYPE_COLORS,
  formatDateRangeEU,
} from '@/services/manager/settings/special-days/utils'

type Props = {
  day: SpecialDay
  serviceAreas: { id: string; name: string }[]
  isEditing: boolean
  deleting: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function SpecialDayRow({ day, serviceAreas, isEditing, deleting, onEdit, onDelete }: Props) {
  const areaName = day.service_area_id
    ? serviceAreas.find(a => a.id === day.service_area_id)?.name
    : null

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border bg-white transition-colors ${isEditing ? 'border-[#1a1a18]' : 'border-[#e8e4dc]'}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-[#1a1a18] w-36 font-mono shrink-0">
          {formatDateRangeEU(day.date, day.date_end)}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${SPECIAL_DAY_TYPE_COLORS[day.type]}`}>
          {SPECIAL_DAY_TYPE_LABELS[day.type]}
        </span>
        <span className="text-sm text-[#3a3528]">{day.name}</span>
        {areaName && (
          <span className="text-xs px-2 py-0.5 rounded-full border bg-[#f7f5f2] text-[#7a7060] border-[#e8e4dc]">
            {areaName}
          </span>
        )}
        {day.weather_status && (
          <span className="flex items-center gap-1 text-xs text-[#7a7060]">
            <Cloud size={11} />
            {day.weather_status}
          </span>
        )}
        {day.is_recurring && (
          <span className="text-xs text-[#a09880]">↻ recurring</span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 text-[#a09880] hover:text-[#1a1a18] transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="p-1.5 text-[#a09880] hover:text-red-500 disabled:opacity-50 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
