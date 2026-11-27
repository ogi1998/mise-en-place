import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Separate storage key so the guest session never collides with the
// manager session when both are on the same domain (miseenplace.si/widget/*).
export const supabaseWidget = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storageKey: 'mise-widget-session',
      flowType: 'implicit',
    },
  },
)
