'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleSignOut}>Sign out</button>
    </div>
  )
}