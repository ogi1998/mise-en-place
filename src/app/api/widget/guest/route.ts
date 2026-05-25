import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAnonSupabaseClient } from '@/lib/supabase-anon'
import { getGuestByAuthUserId } from '@/services/widget/queries'

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ guest: null })

  // Verify JWT to get user ID
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ guest: null })

  // Use anon client for DB read — existing anon SELECT policy covers guests
  const supabase = createAnonSupabaseClient()
  const guest = await getGuestByAuthUserId(supabase, user.id)
  return NextResponse.json({ guest })
}
