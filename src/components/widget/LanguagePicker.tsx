'use client'

import { useState, useRef, useEffect } from 'react'
import { LANGUAGE_META } from '@/lib/widget-translations'

type Props = {
  lang: string
  availableLanguages: string[]
  onChange: (lang: string) => void
}

export default function LanguagePicker({ lang, availableLanguages, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = LANGUAGE_META[lang]
  if (!current || availableLanguages.length < 2) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-[#5a5545] hover:bg-[#f0ede6] transition-colors"
      >
        <span>{current.flag}</span>
        <span className="font-medium uppercase text-xs tracking-wide">{lang}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${open ? 'rotate-180' : ''}`} fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e8e4dc] rounded-xl shadow-md z-50 overflow-hidden">
          {availableLanguages.map(code => {
            const meta = LANGUAGE_META[code]
            if (!meta) return null
            return (
              <button
                key={code}
                type="button"
                onClick={() => { onChange(code); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  code === lang
                    ? 'bg-[#f7f5f2] text-[#1a1a18] font-medium'
                    : 'text-[#5a5545] hover:bg-[#f7f5f2]'
                }`}
              >
                <span className="text-base">{meta.flag}</span>
                <span>{meta.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
