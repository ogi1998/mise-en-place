import { create } from 'zustand'
import { supabase  } from '@/lib/supabase'
import type { Profile, Restaurant } from '@/types/database'

type AuthState = {
  profile: Profile | null
  restaurant: Restaurant | null
  isLoading: boolean
  fetch: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  restaurant: null,
  isLoading: true,

  fetch: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ profile: null, restaurant: null, isLoading: false })
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*, restaurant:restaurants(*)')
      .eq('id', user.id)
      .single()

    if (!data) {
      set({ profile: null, restaurant: null, isLoading: false })
      return
    }

    const { restaurant, ...profile } = data

    set({
      profile: profile as Profile,
      restaurant: restaurant as Restaurant | null,
      isLoading: false,
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ profile: null, restaurant: null })
  },
}))