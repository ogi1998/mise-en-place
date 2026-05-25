'use client'

import { useEffect } from 'react'
import { supabaseWidget as supabase } from '@/lib/supabase-widget'

// Minimal OAuth callback page used only as a popup target.
// Supabase exchanges the code automatically on init; we wait for SIGNED_IN,
// notify the opener, then close.
export default function AuthCallbackPage() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' && window.opener) {
          window.opener.postMessage(
            { type: 'SUPABASE_AUTH_COMPLETE' },
            window.location.origin,
          )
          window.close()
        }
      },
    )
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7f5f2]">
      <p className="text-sm text-[#7a7060]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        Completing sign in…
      </p>
    </div>
  )
}
