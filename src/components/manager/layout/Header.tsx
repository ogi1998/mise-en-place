'use client'

import { useAuthStore } from '@/store/authStore'

export default function Header() {
  const { restaurant } = useAuthStore()

  const restaurantName = restaurant?.name ?? ''

  const today = new Date().toLocaleDateString('sl-SI', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="flex h-[52px] flex-shrink-0 items-center border-b border-black/8 bg-[#faf9f6] px-6">
      <p className="font-serif text-[14px] text-[#1a1a18]">{restaurantName}</p>
      <p className="ml-2 text-[12px] text-[#1a1a18]/40">{today}</p>
      <div className="ml-auto flex items-center gap-3">
        <span className="rounded-full bg-black/6 px-3 py-1 text-[11px] text-black/50">
          Manager
        </span>
      </div>
    </header>
  )
}