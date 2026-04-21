'use client'

import type { TimetableArea } from '@/services/timetable/types'

type AreaTabsProps = {
  areas: TimetableArea[]
  activeAreaId: string | null
  onAreaChange: (areaId: string) => void
}

export default function AreaTabs({ areas, activeAreaId, onAreaChange }: AreaTabsProps) {
  if (areas.length === 0) return null

  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-black/6 bg-white px-6">
      {areas.map((area) => {
        const isActive = area.id === activeAreaId
        return (
          <button
            key={area.id}
            onClick={() => onAreaChange(area.id)}
            className={`relative px-3 py-2.5 text-[12px] font-medium transition-colors ${
              isActive
                ? 'text-[#1a1a18]'
                : 'text-black/35 hover:text-black/60'
            }`}
          >
            {area.name}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1a1a18]" />
            )}
          </button>
        )
      })}
    </div>
  )
}