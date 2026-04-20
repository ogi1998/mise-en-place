'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetch = useAuthStore((state) => state.fetch)

  useEffect(() => {
    fetch()
  }, [fetch])

  return <>{children}</>
}