'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { supabaseWidget } from '@/lib/supabase-widget'
import type { BookingState } from '../BookingWidget'

type Props = {
  booking: BookingState
  onChange: (updates: Partial<BookingState>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepLookup({ booking, onChange, onNext, onBack }: Props) {
  const [email, setEmail] = useState(booking.email ?? '')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const summaryLine = [
    `${booking.partySize} ${booking.partySize === 1 ? 'guest' : 'guests'}`,
    booking.date,
    booking.slot,
  ].filter(Boolean).join(' · ')

  // Google OAuth popup result
  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'SUPABASE_AUTH_COMPLETE') return

      const { data: { session } } = await supabaseWidget.auth.getSession()
      if (!session) { setGoogleLoading(false); return }

      // Returning guest — look up by auth_user_id
      try {
        const res = await fetch('/api/widget/guest', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const json = await res.json()
        if (json.guest) {
          onChange({
            firstName: json.guest.first_name ?? '',
            lastName:  json.guest.last_name  ?? '',
            email:     json.guest.email      ?? '',
            phone:     json.guest.phone      ?? '',
            allergens: json.guest.allergens  ?? [],
          })
          setGoogleLoading(false)
          onNext()
          return
        }
      } catch {}

      // New Google user — use OAuth metadata
      const meta = session.user.user_metadata as Record<string, string>
      const fullName = (meta.full_name ?? meta.name ?? '').trim()
      const spaceIdx = fullName.indexOf(' ')
      onChange({
        firstName: spaceIdx >= 0 ? fullName.slice(0, spaceIdx) : fullName,
        lastName:  spaceIdx >= 0 ? fullName.slice(spaceIdx + 1) : '',
        email:     session.user.email ?? meta.email ?? '',
      })
      setGoogleLoading(false)
      onNext()
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  async function handleGoogleAuth() {
    setGoogleLoading(true)
    setError('')

    const { data, error: err } = await supabaseWidget.auth.signInWithOAuth({
      provider: 'google',
      options: {
        skipBrowserRedirect: true,
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (err || !data.url) {
      setError(err?.message ?? 'Could not start Google sign in')
      setGoogleLoading(false)
      return
    }

    const w = 500, h = 650
    const left = Math.round(window.screenX + (window.outerWidth - w) / 2)
    const top  = Math.round(window.screenY + (window.outerHeight - h) / 2)
    const popup = window.open(data.url, 'GoogleAuth', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`)
    if (!popup) {
      setError('Popups are blocked. Please allow popups for this site.')
      setGoogleLoading(false)
    }
  }

  async function handleEmailContinue() {
    const trimmed = email.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/widget/lookup?email=${encodeURIComponent(trimmed)}`)
      const json = await res.json()
      if (json.guest) {
        onChange({
          firstName: json.guest.first_name ?? '',
          lastName:  json.guest.last_name  ?? '',
          email:     trimmed,
          phone:     json.guest.phone      ?? '',
          allergens: json.guest.allergens  ?? [],
        })
      } else {
        onChange({ email: trimmed, firstName: '', lastName: '', phone: '', allergens: [] })
      }
    } catch {
      onChange({ email: trimmed, firstName: '', lastName: '', phone: '', allergens: [] })
    }

    setLoading(false)
    onNext()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-[#a09880] hover:text-[#1a1a18] transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-[#1a1a18]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Who's booking?
          </h2>
          <p className="text-sm text-[#7a7060]">{summaryLine}</p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGoogleAuth}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-[#e8e4dc] rounded-xl text-sm font-medium text-[#1a1a18] hover:bg-[#f5f0e8] disabled:opacity-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e8e4dc]" />
          <span className="text-xs text-[#a09880]">or</span>
          <div className="flex-1 h-px bg-[#e8e4dc]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#7a7060] mb-1">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
            placeholder="you@example.com"
            autoFocus
            className="w-full px-3 py-2.5 text-sm border border-[#e8e4dc] rounded-xl bg-white text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] placeholder:text-[#a09880]"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          onClick={handleEmailContinue}
          disabled={loading || googleLoading || !email.trim()}
          className="w-full py-3 bg-[#1a1a18] text-[#f5f0e8] rounded-xl text-sm font-medium hover:bg-[#2a2a26] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Looking up…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
