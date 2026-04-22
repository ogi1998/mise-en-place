'use client'

import { ChevronDown } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { WeeklySchedule } from '@/services/manager/settings/weekly-schedule/types'
import type { DayScheduleFormData } from '@/schemas/manager/settings/weekly-schedule'
import { DAY_NAMES } from '@/services/manager/settings/weekly-schedule/utils'
import DayScheduleForm from './DayScheduleForm'

type Props = {
  schedule: WeeklySchedule
  isOpen: boolean
  form: UseFormReturn<DayScheduleFormData>
  saving: boolean
  error: string
  success: boolean
  onToggle: () => void
  onSave: (data: DayScheduleFormData) => void
}

function formatTime(t: string | null) {
  if (!t) return null
  return t.slice(0, 5)
}

export default function DayAccordion({ schedule, isOpen, form, saving, error, success, onToggle, onSave }: Props) {
  const openT = formatTime(schedule.open_time)
  const closeT = formatTime(schedule.close_time)

  return (
    <div className={`border border-[#e8e4dc] rounded-lg overflow-hidden ${isOpen ? 'border-[#1a1a18]' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-[#faf9f6] transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[#1a1a18] w-24">{DAY_NAMES[schedule.day_of_week]}</span>
          {schedule.is_open ? (
            <span className="text-xs text-[#5a5545]">
              {openT && closeT ? `${openT} – ${closeT}` : 'Open (times not set)'}
              {schedule.pause_from && schedule.pause_to && (
                <span className="ml-2 text-[#a09880]">· pause {formatTime(schedule.pause_from)}–{formatTime(schedule.pause_to)}</span>
              )}
            </span>
          ) : (
            <span className="text-xs text-[#a09880]">Closed</span>
          )}
        </div>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`text-[#a09880] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <DayScheduleForm
          form={form}
          scheduleId={schedule.id}
          saving={saving}
          error={error}
          success={success}
          onSave={onSave}
        />
      )}
    </div>
  )
}