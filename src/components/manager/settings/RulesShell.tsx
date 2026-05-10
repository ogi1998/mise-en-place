'use client'

import { useState } from 'react'
import AreaTabs from '@/components/manager/ui/AreaTabs'
import RulesForm from '@/components/manager/settings/rules/RulesForm'
import { useRules } from '@/hooks/manager/settings/useRules'
import type { BookingRules } from '@/services/manager/settings/rules/types'

type Area = { id: string; name: string }

type Props = {
  areas: Area[]
  initialAreaId: string
  initialRules: BookingRules
}

export default function RulesShell({ areas, initialAreaId, initialRules }: Props) {
  const [activeAreaId, setActiveAreaId] = useState(initialAreaId)
  const { form, saving, saveError, saveSuccess, handleSave, reloadArea } = useRules(initialRules)

  async function handleAreaChange(areaId: string) {
    setActiveAreaId(areaId)
    await reloadArea(areaId)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Rules Engine
        </h1>
        <p className="text-sm text-[#7a7060] mt-1">Configure booking rules per service area.</p>
      </div>

      <AreaTabs areas={areas} activeAreaId={activeAreaId} onChange={handleAreaChange} />

      <div className="mt-5">
        <RulesForm
          form={form}
          saving={saving}
          saveError={saveError}
          saveSuccess={saveSuccess}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}