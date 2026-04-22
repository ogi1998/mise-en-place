'use client'

import { Plus } from 'lucide-react'
import { useServiceAreas } from '@/hooks/manager/settings/useServiceAreas'
import AreaRow from '@/components/manager/settings/service-areas/AreaRow'
import InlineAreaForm from '@/components/manager/settings/service-areas/InlineAreaForm'
import LockPeriodsPanel from '@/components/manager/settings/service-areas/LockPeriodsPanel'
import type { ServiceArea } from '@/services/manager/settings/service-areas/types'

type Props = {
  initialAreas: ServiceArea[]
  restaurantId: string
}

export default function ServiceAreasShell({ initialAreas, restaurantId }: Props) {
  const {
    areas,
    expandedAreaId,
    lockPeriods,
    loadingLocks,
    showAreaForm,
    editingArea,
    areaForm,
    areaFormLoading,
    areaFormError,
    showLockForm,
    lockForm,
    lockFormLoading,
    lockFormError,
    confirmDelete,
    setConfirmDelete,
    handleToggleExpand,
    handleOpenCreate,
    handleOpenEdit,
    handleCancelAreaForm,
    handleSubmitArea,
    handleDeleteArea,
    handleOpenLockForm,
    handleCancelLockForm,
    handleSubmitLock,
    handleDeleteLock,
  } = useServiceAreas(initialAreas, restaurantId)

  const { handleSubmit: handleSubmitAreaForm } = areaForm
  const { handleSubmit: handleSubmitLockForm } = lockForm

  return (
    <div className="p-8 max-w-3xl">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-semibold text-[#1a1a18]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Service Areas
          </h1>
          <p className="text-sm text-[#8a8070] mt-0.5">
            Manage dining zones and their availability windows.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a18] text-[#f5f0e8] text-sm rounded-lg hover:bg-[#2d2d2a] transition-colors"
        >
          <Plus size={15} />
          New Area
        </button>
      </div>

      {showAreaForm && !editingArea && (
        <div className="mb-6 border border-[#e8e4dc] rounded-xl overflow-hidden">
          <InlineAreaForm
            areaForm={areaForm}
            areaFormLoading={areaFormLoading}
            onSubmit={handleSubmitAreaForm(handleSubmitArea)}
            onCancel={handleCancelAreaForm}
            areaFormError={areaFormError}
          />
        </div>
      )}

      {areas.length === 0 && !showAreaForm ? (
        <div className="border border-dashed border-[#d8d4cc] rounded-xl p-12 text-center">
          <p className="text-[#a09880] text-sm">
            No service areas yet. Create your first area to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {areas.map(area => (
            <div
              key={area.id}
              className="border border-[#e8e4dc] rounded-xl bg-white overflow-hidden"
            >
              {editingArea?.id === area.id ? (
                <InlineAreaForm
                  area={area}
                  areaForm={areaForm}
                  areaFormLoading={areaFormLoading}
                  onSubmit={handleSubmitAreaForm(handleSubmitArea)}
                  onCancel={handleCancelAreaForm}
                  areaFormError={areaFormError}
                />
              ) : (
                <AreaRow
                  area={area}
                  confirmDelete={confirmDelete}
                  isExpanded={expandedAreaId === area.id}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteArea}
                  onToggleExpand={handleToggleExpand}
                  onSetConfirmDelete={setConfirmDelete}
                />
              )}

              {expandedAreaId === area.id && !editingArea && (
                <LockPeriodsPanel
                  area={area}
                  lockPeriods={lockPeriods[area.id] ?? []}
                  loadingLocks={loadingLocks}
                  showLockForm={showLockForm}
                  lockForm={lockForm}
                  lockFormLoading={lockFormLoading}
                  onOpenLockForm={handleOpenLockForm}
                  onCancelLockForm={handleCancelLockForm}
                  onSubmitLock={handleSubmitLockForm(data => handleSubmitLock(area.id, data))}
                  onDeleteLock={handleDeleteLock}
                  lockFormError={lockFormError}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}