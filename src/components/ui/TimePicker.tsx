'use client'

import { ChevronDown } from 'lucide-react'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  theme?: 'manager' | 'widget'
  hasError?: boolean
  step?: number
}

function generateTimes(step = 15): string[] {
  const times: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) {
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return times
}

const TIMES_15 = generateTimes(15)
const TIMES_30 = generateTimes(30)

export default function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  theme = 'manager',
  hasError,
  step = 15,
}: Props) {
  const times = step === 30 ? TIMES_30 : TIMES_15
  const isWidget = theme === 'widget'

  const selectClass = isWidget
    ? `w-full appearance-none pl-3 pr-8 py-2.5 text-sm border rounded-xl bg-white cursor-pointer transition-colors focus:outline-none ${hasError ? 'border-red-400' : 'border-[#e8e4dc] hover:border-[#1a1a18] focus:border-[#1a1a18]'} ${value ? 'text-[#1a1a18]' : 'text-[#a09880]'}`
    : `w-full appearance-none pl-3 pr-8 py-2 text-sm border rounded-md bg-white cursor-pointer transition-colors focus:outline-none ${hasError ? 'border-red-400' : 'border-[#d8d3ca] hover:border-[#1a1a18] focus:border-[#1a1a18]'} ${value ? 'text-[#1a1a18]' : 'text-[#a09880]'}`

  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={selectClass}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {times.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a09880]"
      />
    </div>
  )
}
