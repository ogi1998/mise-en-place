'use client'

import { PowerOff, Plus } from 'lucide-react'
import { useSpecialDays } from '@/hooks/manager/settings/useSpecialDays'
import SpecialDayRow from '@/components/manager/settings/special-days/SpecialDayRow'
import SpecialDayForm from '@/components/manager/settings/special-days/SpecialDayForm'
import type { SpecialDay } from '@/services/manager/settings/special-days/types'

type Props = {
  initialDays: SpecialDay[]
  restaurantId: string
}

export default function SpecialDaysShell({ initialDays, restaurantId }: Props) {
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
  } = useSpecialDays(initialDays, restaurantId)

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
      </div>

      {killSwitchError && (
        <p className="mb-4 text-xs text-red-500">{killSwitchError}</p>
      )}

      {/* Create form */}
      {showCreateForm && (
        <div className="mb-4">
          <SpecialDayForm
            form={form}
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
                saving={saving}
                error={formError}
                onSave={handleUpdate}
                onCancel={handleCancelEdit}
              />
            ) : (
              <SpecialDayRow
                day={day}
                isEditing={false}
                deleting={deletingId === day.id}
                onEdit={() => handleOpenEdit(day)}
                onDelete={() => handleDelete(day.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}