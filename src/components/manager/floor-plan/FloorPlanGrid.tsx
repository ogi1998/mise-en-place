import type { TableWithStatus } from '@/services/floor-plan/types'
import TableCard from './TableCard'

type FloorPlanGridProps = {
  tables: TableWithStatus[]
  onTableClick: (table: TableWithStatus) => void
}

export default function FloorPlanGrid({ tables, onTableClick }: FloorPlanGridProps) {
  if (tables.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-black/10">
        <p className="text-[13px] text-black/30">No tables configured for this area.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={() => onTableClick(table)}
        />
      ))}
    </div>
  )
}