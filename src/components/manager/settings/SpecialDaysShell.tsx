'use client'

import { useState } from 'react'
import { PowerOff, Plus } from 'lucide-react'
import { useSpecialDays } from '@/hooks/manager/settings/useSpecialDays'
import SpecialDayRow from '@/components/manager/settings/special-days/SpecialDayRow'
import SpecialDayForm from '@/components/manager/settings/special-days/SpecialDayForm'
import HolidaysTab from '@/components/manager/settings/special-days/HolidaysTab'
import type { SpecialDay } from '@/services/manager/settings/special-days/types'

type Tab = 'special-days' | 'holidays'

type Props = {
  initialDays: SpecialDay[]
  restaurantId: string
  serviceAreas: { id: string; name: string }[]
}

export default function SpecialDaysShell({ initialDays, restaurantId, serviceAreas }: Props) {
  const [tab, setTab] = useState<Tab>('special-days')

  const {
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
    handleAddHoliday,
  } = useSpecialDays(initialDays, restaurantId, serviceAreas)

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Special Days
          </h1>
          <p className="text-sm text-[#7a7060] mt-1">Date exceptions — closures, openings, or modified hours.</p>
        </div>
        {tab === 'special-days' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleKillSwitch}
              disabled={killSwitchLoading}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <PowerOff size={14} />
              Close today
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-md hover:bg-[#2a2a26] transition-colors"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#e8e4dc]">
        {(['special-days', 'holidays'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-[#1a1a18] text-[#1a1a18]'
                : 'border-transparent text-[#7a7060] hover:text-[#1a1a18]'
            }`}
          >
            {t === 'special-days' ? 'Special Days' : 'Holidays'}
          </button>
        ))}
      </div>

      {tab === 'holidays' && (
        <HolidaysTab days={days} onAdd={handleAddHoliday} />
      )}

      {tab === 'special-days' && (
        <>
          {killSwitchError && (
            <p className="mb-4 text-xs text-red-500">{killSwitchError}</p>
          )}

          {showCreateForm && (
            <div className="mb-4">
              <SpecialDayForm
                form={form}
                serviceAreas={serviceAreas}
                saving={saving}
                error={formError}
                onSave={handleCreate}
                onCancel={handleCancelCreate}
              />
            </div>
          )}

          <div className="space-y-2">
            {days.length === 0 && !showCreateForm && (
              <p className="text-sm text-[#a09880] py-4 text-center">No special days configured.</p>
            )}
            {days.map(day => (
              <div key={day.id}>
                {editingId === day.id ? (
                  <SpecialDayForm
                    form={form}
                    serviceAreas={serviceAreas}
                    saving={saving}
                    error={formError}
                    onSave={handleUpdate}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <SpecialDayRow
                    day={day}
                    serviceAreas={serviceAreas}
                    isEditing={false}
                    deleting={deletingId === day.id}
                    onEdit={() => handleOpenEdit(day)}
                    onDelete={() => handleDelete(day.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
