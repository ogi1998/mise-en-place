'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker } from 'react-day-picker'
import { format, parseISO, isValid } from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  value: string
  onChange: (value: string) => void
  min?: string
  placeholder?: string
  theme?: 'manager' | 'widget'
  hasError?: boolean
}

function getClassNames(theme: 'manager' | 'widget') {
  const rounded = theme === 'widget' ? 'rounded-xl' : 'rounded-md'
  return {
    months: 'flex flex-col',
    month: 'space-y-2',
    caption: 'flex justify-center items-center relative h-8',
    caption_label: 'text-sm font-semibold text-[#1a1a18]',
    nav: 'flex items-center justify-between absolute inset-x-0',
    nav_button: `p-1 text-[#7a7060] hover:text-[#1a1a18] hover:bg-[#f5f0e8] ${rounded} transition-colors`,
    nav_button_previous: '',
    nav_button_next: '',
    table: 'w-full border-collapse',
    head_row: 'flex mb-1',
    head_cell: 'text-[#a09880] text-[11px] font-medium w-8 h-6 flex items-center justify-center',
    row: 'flex w-full mt-0.5',
    cell: 'w-8 h-8 text-center p-0',
    day: `w-8 h-8 text-sm ${rounded} hover:bg-[#f5f0e8] transition-colors text-[#1a1a18] font-normal`,
    day_selected: `!bg-[#1a1a18] !text-[#f5f0e8] hover:!bg-[#2a2a26]`,
    day_today: '!font-bold',
    day_outside: '!text-[#d8d3ca]',
    day_disabled: '!text-[#d8d3ca] cursor-not-allowed',
    day_hidden: 'invisible',
  }
}

export default function DatePicker({
  value,
  onChange,
  min,
  placeholder = 'Select date',
  theme = 'manager',
  hasError,
}: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const selected = value && isValid(parseISO(value)) ? parseISO(value) : undefined
  const disabledDays = min && isValid(parseISO(min)) ? { before: parseISO(min) } : undefined

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        popupRef.current?.contains(target)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
    setOpen(o => !o)
  }

  const isWidget = theme === 'widget'
  const borderClass = hasError ? 'border-red-400' : 'border-[#e8e4dc] hover:border-[#1a1a18]'
  const triggerClass = isWidget
    ? `w-full flex items-center gap-2 px-3 py-2.5 text-sm border rounded-xl bg-white cursor-pointer transition-colors focus:outline-none ${borderClass} ${selected ? 'text-[#1a1a18]' : 'text-[#a09880]'}`
    : `w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-md bg-white cursor-pointer transition-colors focus:outline-none ${hasError ? 'border-red-400' : 'border-[#d8d3ca] hover:border-[#1a1a18]'} ${selected ? 'text-[#1a1a18]' : 'text-[#a09880]'}`

  const popup = open ? createPortal(
    <div
      ref={popupRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
      className="bg-white border border-[#e8e4dc] rounded-xl shadow-lg p-3 min-w-[260px]"
    >
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(date) => {
          if (date) {
            onChange(format(date, 'yyyy-MM-dd'))
            setOpen(false)
          }
        }}
        disabled={disabledDays}
        weekStartsOn={1}
        classNames={getClassNames(theme)}
        components={{
          IconLeft: () => <ChevronLeft size={14} />,
          IconRight: () => <ChevronRight size={14} />,
        }}
      />
    </div>,
    document.body
  ) : null

  return (
    <div ref={triggerRef} className="relative">
      <button type="button" onClick={handleOpen} className={triggerClass}>
        <CalendarDays size={14} className="shrink-0 text-[#a09880]" />
        <span className="flex-1 text-left">
          {selected ? format(selected, 'dd.MM.yyyy') : placeholder}
        </span>
      </button>
      {popup}
    </div>
  )
}
