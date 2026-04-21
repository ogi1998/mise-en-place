import type { TableWithStatus, TableStatus } from '@/services/floor-plan/types'
import { statusLabel } from '@/services/floor-plan/utils'
import { Users } from 'lucide-react'

type TableCardProps = {
  table: TableWithStatus
  onClick: () => void
}

function statusStyles(status: TableStatus): { card: string; badge: string } {
  switch (status) {
    case 'empty':
      return {
        card: 'bg-white border-black/8 hover:border-black/15',
        badge: 'bg-black/5 text-black/35',
      }
    case 'upcoming':
      return {
        card: 'bg-[#d4e8d0] border-[#5a9e6f]/30 hover:border-[#5a9e6f]/50',
        badge: 'bg-[#5a9e6f]/15 text-[#2a5c24]',
      }
    case 'seated':
      return {
        card: 'bg-[#d0e4f7] border-[#5a8fbf]/30 hover:border-[#5a8fbf]/50',
        badge: 'bg-[#5a8fbf]/15 text-[#1a3d6b]',
      }
    case 'delayed':
      return {
        card: 'bg-[#d0e4f7] border-[#5a8fbf]/30 hover:border-[#5a8fbf]/50',
        badge: 'bg-red-100 text-red-600',
      }
  }
}

export default function TableCard({ table, onClick }: TableCardProps) {
  const styles = statusStyles(table.status)
  const isDelayed = table.status === 'delayed'

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col gap-2 overflow-hidden rounded-xl border p-4 text-left transition-all ${styles.card}`}
    >
      {/* Delay stripe */}
      {isDelayed && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 6px,
              rgba(180,30,30,0.08) 6px,
              rgba(180,30,30,0.08) 12px
            )`,
          }}
        />
      )}

      <div>
        <p className="text-[15px] font-medium text-[#1a1a18]">{table.name}</p>
        {table.nickname && (
          <p className="text-[11px] text-black/40">{table.nickname}</p>
        )}
      </div>

      <div className="flex items-center gap-1 text-black/40">
        <Users className="h-3 w-3" />
        <span className="text-[11px]">{table.seats}</span>
      </div>

      {table.currentBooking && (
        <p className="text-[11px] text-black/50">
          {table.currentBooking.guests
            ? `${table.currentBooking.guests.first_name} ${table.currentBooking.guests.last_name}`
            : 'Walk-in'
          } · {table.currentBooking.party_size}p
        </p>
      )}

      <span className={`self-start rounded-full px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}>
        {statusLabel(table.status)}
      </span>
    </button>
  )
}