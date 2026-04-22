import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import SettingsNavLink from '@/components/manager/settings/SettingsNavLink'

const SETTINGS_NAV = [
  { href: '/settings/service-areas', label: 'Service Areas' },
  { href: '/settings/tables', label: 'Tables' },
  { href: '/settings/schedule', label: 'Weekly Schedule' },
  { href: '/settings/special-days', label: 'Special Days' },
  { href: '/settings/rules', label: 'Rules Engine' },
]

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-56 shrink-0 border-r border-[#e8e4dc] bg-[#faf9f6] py-6">
        <div className="px-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#a09880]">
            Settings
          </p>
        </div>
        <nav className="space-y-0.5 px-3">
          {SETTINGS_NAV.map(({ href, label }) => (
            <SettingsNavLink key={href} href={href} label={label} />
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}