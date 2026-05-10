// src/components/manager/settings/weekly-schedule/WeeklyScheduleShell.tsx
'use client'

import { useState } from 'react'
import AreaTabs from '@/components/manager/ui/AreaTabs'
import DayAccordion from '@/components/manager/settings/weekly-schedule/DayAccordion'
import { useWeeklySchedule } from '@/hooks/manager/settings/useWeeklySchedule'
import type { WeeklySchedule } from '@/services/manager/settings/weekly-schedule/types'

type Area = { id: string; name: string }

type Props = {
  areas: Area[]
  initialAreaId: string
  initialSchedules: WeeklySchedule[]
}

export default function WeeklyScheduleShell({ areas, initialAreaId, initialSchedules }: Props) {
  const [activeAreaId, setActiveAreaId] = useState(initialAreaId)

  const {
    schedules,
    openDayId,
    saving,
    saveError,
    saveSuccess,
    form,
    handleOpenDay,
    handleSave,
    reloadArea,
  } = useWeeklySchedule(initialSchedules, initialAreaId)

  async function handleAreaChange(areaId: string) {
    setActiveAreaId(areaId)
    await reloadArea(areaId)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Weekly Schedule
        </h1>
        <p className="text-sm text-[#7a7060] mt-1">Configure opening hours per service area.</p>
      </div>

      <AreaTabs areas={areas} activeAreaId={activeAreaId} onChange={handleAreaChange} />

      <div className="mt-5 space-y-2">
        {schedules.map(schedule => (
          <DayAccordion
            key={schedule.id}
            schedule={schedule}
            isOpen={openDayId === schedule.id}
            form={form}
            saving={saving === schedule.id}
            error={saveError[schedule.id] ?? ''}
            success={saveSuccess[schedule.id] ?? false}
            onToggle={() => handleOpenDay(schedule)}
            onSave={(data) => handleSave(schedule.id, data)}
          />
        ))}
      </div>
    </div>
  )
}