'use client'

type Area = { id: string; name: string }

type AreaTabsProps = {
  areas: Area[]
  // Single select
  activeAreaId?: string | null
  onChange?: (areaId: string) => void
  // Multi select
  activeAreaIds?: string[]
  onAreaChange?: (areaIds: string[]) => void
}

export default function AreaTabs({ areas, activeAreaId, onChange, activeAreaIds, onAreaChange }: AreaTabsProps) {
  if (areas.length === 0) return null

  const isMulti = !!onAreaChange

  function handleClick(areaId: string) {
    if (isMulti && onAreaChange && activeAreaIds) {
      const isActive = activeAreaIds.includes(areaId)
      if (isActive && activeAreaIds.length === 1) return
      const next = isActive
        ? activeAreaIds.filter(id => id !== areaId)
        : [...activeAreaIds, areaId]
      onAreaChange(next)
    } else {
      onChange?.(areaId)
    }
  }

  function isActive(areaId: string) {
    if (isMulti && activeAreaIds) return activeAreaIds.includes(areaId)
    return areaId === activeAreaId
  }

  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-black/6 bg-white px-6">
      {areas.map((area) => (
        <button
          key={area.id}
          onClick={() => handleClick(area.id)}
          className={`relative px-3 py-2.5 text-[12px] font-medium transition-colors ${
            isActive(area.id) ? 'text-[#1a1a18]' : 'text-black/35 hover:text-black/60'
          }`}
        >
          {area.name}
          {isActive(area.id) && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1a1a18]" />
          )}
        </button>
      ))}
    </div>
  )
}