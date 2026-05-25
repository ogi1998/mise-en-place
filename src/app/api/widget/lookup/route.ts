import { NextRequest, NextResponse } from 'next/server'
import { createAnonSupabaseClient } from '@/lib/supabase-anon'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ guest: null })

  const supabase = createAnonSupabaseClient()
  const { data } = await supabase
    .from('guests')
    .select('first_name, last_name, email, phone, allergens')
    .eq('email', email)
    .maybeSingle()

  return NextResponse.json({ guest: data ?? null })
}
