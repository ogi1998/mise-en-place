import { Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react'
import type { Table } from '@/services/manager/settings/types'

type Props = {
  table: Table
  confirmDelete: string | null
  onEdit: (table: Table) => void
  onDelete: (id: string) => void
  onToggleField: (table: Table, field: 'disabled' | 'disabled_online') => void
  onSetConfirmDelete: (id: string | null) => void
}

export default function TableRow({
  table,
  confirmDelete,
  onEdit,
  onDelete,
  onToggleField,
  onSetConfirmDelete,
}: Props) {
  return (
    <tr className="bg-white hover:bg-[#faf9f6] transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-[#1a1a18]">{table.name}</div>
        {table.nickname && (
          <div className="text-xs text-[#a09880]">{table.nickname}</div>
        )}
      </td>
      <td className="px-4 py-3 text-[#5a5545] capitalize">{table.shape}</td>
      <td className="px-4 py-3 text-center text-[#5a5545]">
        {table.min_seats}–{table.seats}–{table.max_seats}
      </td>
      <td className="px-4 py-3 text-center">
        <StatusDot active={table.allow_multi} />
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onToggleField(table, 'disabled_online')}
          className={`transition-colors ${table.disabled_online ? 'text-red-400' : 'text-emerald-500'}`}
          title={table.disabled_online ? 'Online booking disabled' : 'Online booking enabled'}
        >
          {table.disabled_online ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
        </button>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onToggleField(table, 'disabled')}
          className={`transition-colors ${table.disabled ? 'text-red-400' : 'text-emerald-500'}`}
          title={table.disabled ? 'Table disabled' : 'Table active'}
        >
          {table.disabled ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(table)}
            className="p-1.5 text-[#a09880] hover:text-[#1a1a18] hover:bg-[#f0ede6] rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          {confirmDelete === table.id ? (
            <>
              <button
                onClick={() => onDelete(table.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Check size={13} />
              </button>
              <button
                onClick={() => onSetConfirmDelete(null)}
                className="p-1.5 text-[#a09880] hover:bg-[#f0ede6] rounded-lg transition-colors"
              >
                <X size={13} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onSetConfirmDelete(table.id)}
              className="p-1.5 text-[#a09880] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-emerald-400' : 'bg-[#d8d4cc]'}`} />
  )
}