'use client'

import { Plus } from 'lucide-react'
import { useTables } from '@/hooks/manager/settings/useTables'
import AreaTabs from '@/components/manager/ui/AreaTabs'
import TableRow from '@/components/manager/settings/tables/TableRow'
import InlineTableForm from '@/components/manager/settings/tables/InlineTableForm'
import type { ServiceArea } from '@/services/manager/settings/service-areas/types'
import type { Table } from '@/services/manager/settings/tables/types'

type Props = {
  initialAreas: ServiceArea[]
  initialTables: Table[]
  restaurantId: string
}

export default function TablesShell({ initialAreas, initialTables, restaurantId }: Props) {
  const {
    activeAreaId,
    areaTables,
    showForm,
    editingTable,
    form,
    formLoading,
    formError,
    toggleError,
    confirmDelete,
    setConfirmDelete,
    handleSelectArea,
    handleOpenCreate,
    handleOpenEdit,
    handleCancel,
    handleSubmit,
    handleDelete,
    handleToggleField,
  } = useTables(initialAreas, initialTables, restaurantId)

  const { handleSubmit: handleSubmitForm } = form

  if (initialAreas.length === 0) {
    return (
      <div className="p-8">
        <h1
          className="text-2xl font-semibold text-[#1a1a18] mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Tables
        </h1>
        <div className="border border-dashed border-[#d8d4cc] rounded-xl p-12 text-center mt-6">
          <p className="text-[#a09880] text-sm">
            You need to create at least one service area before adding tables.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-semibold text-[#1a1a18]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Tables
          </h1>
          <p className="text-sm text-[#8a8070] mt-0.5">
            Configure tables and seating capacity per area.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a18] text-[#f5f0e8] text-sm rounded-lg hover:bg-[#2d2d2a] transition-colors"
        >
          <Plus size={15} />
          New Table
        </button>
      </div>

      <AreaTabs
        areas={initialAreas}
        activeAreaId={activeAreaId}
        onChange={handleSelectArea}
      />

      {showForm && !editingTable && (
        <div className="mt-4 mb-6 border border-[#e8e4dc] rounded-xl overflow-hidden">
          <InlineTableForm
            form={form}
            formLoading={formLoading}
            formError={formError}
            onSubmit={handleSubmitForm(handleSubmit)}
            onCancel={handleCancel}
          />
        </div>
      )}

      {toggleError && (
        <p className="text-[12px] text-red-500 mb-3">{toggleError}</p>
      )}

      {areaTables.length === 0 && !showForm ? (
        <div className="border border-dashed border-[#d8d4cc] rounded-xl p-12 text-center mt-4">
          <p className="text-[#a09880] text-sm">No tables in this area yet.</p>
        </div>
      ) : (
        <div className="border border-[#e8e4dc] rounded-xl overflow-hidden mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e4dc] bg-[#faf9f6]">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#a09880]">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#a09880]">Shape</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#a09880]">Seats</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#a09880]">Multi</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#a09880]">Online</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#a09880]">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede6]">
              {areaTables.map(table => (
                editingTable?.id === table.id ? (
                  <tr key={table.id}>
                    <td colSpan={7} className="p-0">
                      <InlineTableForm
                        table={table}
                        form={form}
                        formLoading={formLoading}
                        formError={formError}
                        onSubmit={handleSubmitForm(handleSubmit)}
                        onCancel={handleCancel}
                      />
                    </td>
                  </tr>
                ) : (
                  <TableRow
                    key={table.id}
                    table={table}
                    confirmDelete={confirmDelete}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    onToggleField={handleToggleField}
                    onSetConfirmDelete={setConfirmDelete}
                  />
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}