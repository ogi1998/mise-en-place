'use client'

import GeneralForm from '@/components/manager/settings/general/GeneralForm'
import { useGeneral } from '@/hooks/manager/settings/useGeneral'
import type { GeneralSettings } from '@/services/manager/settings/general/types'

type Props = {
  restaurantId: string
  initialSettings: GeneralSettings
}

export default function GeneralShell({ restaurantId, initialSettings }: Props) {
  const { form, saving, saveError, saveSuccess, handleSave } = useGeneral(initialSettings, restaurantId)

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
          General &amp; Localisation
        </h1>
        <p className="text-sm text-[#7a7060] mt-1">Configure time format, language, and widget display preferences.</p>
      </div>

      <GeneralForm
        form={form}
        saving={saving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        onSave={handleSave}
      />
    </div>
  )
}
