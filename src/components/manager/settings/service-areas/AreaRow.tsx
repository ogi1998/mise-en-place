import { Pencil, Trash2, ChevronDown, ChevronRight, Check, X } from 'lucide-react'
import type { ServiceArea } from '@/services/manager/settings/service-areas/types'

type Props = {
  area: ServiceArea
  confirmDelete: string | null
  isExpanded: boolean
  onEdit: (area: ServiceArea) => void
  onDelete: (id: string) => void
  onToggleExpand: (id: string) => void
  onSetConfirmDelete: (id: string | null) => void
}

export default function AreaRow({
  area,
  confirmDelete,
  isExpanded,
  onEdit,
  onDelete,
  onToggleExpand,
  onSetConfirmDelete,
}: Props) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <button
        onClick={() => onToggleExpand(area.id)}
        className="text-[#a09880] hover:text-[#1a1a18] transition-colors"
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#1a1a18] text-sm">{area.name}</span>
          {!area.is_active && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#f0ede6] text-[#a09880]">
              Inactive
            </span>
          )}
          <span className="text-xs px-1.5 py-0.5 rounded bg-[#f0ede6] text-[#a09880]">
            {area.is_indoor ? 'Indoor' : 'Outdoor'}
          </span>
          {!area.is_bookable_online && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#f0ede6] text-[#a09880]">
              Not bookable online
            </span>
          )}
        </div>
        {area.description && (
          <p className="text-xs text-[#a09880] mt-0.5 truncate">{area.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(area)}
          className="p-2 text-[#a09880] hover:text-[#1a1a18] hover:bg-[#f0ede6] rounded-lg transition-colors"
          title="Edit area"
        >
          <Pencil size={14} />
        </button>
        {confirmDelete === area.id ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(area.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Confirm delete"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => onSetConfirmDelete(null)}
              className="p-2 text-[#a09880] hover:bg-[#f0ede6] rounded-lg transition-colors"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onSetConfirmDelete(area.id)}
            className="p-2 text-[#a09880] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete area"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}