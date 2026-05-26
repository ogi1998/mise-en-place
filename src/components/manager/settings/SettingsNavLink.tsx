'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, TableProperties, Clock, CalendarDays, SlidersHorizontal, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  '/settings/service-areas': MapPin,
  '/settings/tables': TableProperties,
  '/settings/schedule': Clock,
  '/settings/special-days': CalendarDays,
  '/settings/rules': SlidersHorizontal,
  '/settings/general': Globe,
}

type Props = {
  href: string
  label: string
}

export default function SettingsNavLink({ href, label }: Props) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  const Icon = ICON_MAP[href]

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
        isActive
          ? 'bg-[#1a1a18] text-[#f5f0e8] font-medium'
          : 'text-[#5a5545] hover:bg-[#f0ede6] hover:text-[#1a1a18]'
      }`}
    >
      {Icon && <Icon size={15} strokeWidth={1.8} />}
      {label}
    </Link>
  )
}