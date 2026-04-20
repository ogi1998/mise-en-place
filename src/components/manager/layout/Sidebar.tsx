"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import {
  LayoutDashboard,
  CalendarRange,
  Map,
  Calendar,
  BookOpen,
  Users,
  Ticket,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Operations",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/timetable", label: "Timetable", icon: "timetable" },
      { href: "/floor-plan", label: "Floor Plan", icon: "floorplan" },
      { href: "/calendar", label: "Calendar", icon: "calendar" },
      { href: "/bookings", label: "Bookings", icon: "bookings" },
    ],
  },
  {
    label: "Guests & Admin",
    items: [
      { href: "/guests", label: "Guests", icon: "guests" },
      { href: "/vouchers", label: "Vouchers", icon: "vouchers" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

const icons: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  timetable: CalendarRange,
  floorplan: Map,
  calendar: Calendar,
  bookings: BookOpen,
  guests: Users,
  vouchers: Ticket,
  settings: Settings,
};

interface SidebarProps {
  restaurantName: string;
  managerName: string;
  managerInitials: string;
}

export default function Sidebar({
  restaurantName,
  managerName,
  managerInitials,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="flex h-full w-55 min-w-55 flex-col bg-[#1a1a18]">
      {/* Logo */}
      <div className="border-b border-white/8 px-5 py-5">
        <p className="font-serif text-[15px] tracking-wide text-[#f0ece4]">
          Mise en Place
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#f0ece4]/30">
          {restaurantName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1 px-3">
            <p className="px-2 pb-1 pt-2 text-[9px] uppercase tracking-[0.14em] text-[#f0ece4]/25">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = icons[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors ${
                    isActive
                      ? "bg-white/10 text-[#f0ece4]"
                      : "text-[#f0ece4]/50 hover:bg-white/6 hover:text-[#f0ece4]/75"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "opacity-100" : "opacity-50"
                    }`}
                  />
                  <span
                    className={`text-[13px] ${
                      isActive ? "font-medium" : "font-normal"
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto h-1 w-1 rounded-full bg-[#c9a96e]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#c9a96e]/20 text-[11px] font-medium text-[#c9a96e]">
            {managerInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] text-[#f0ece4]/70">
              {managerName}
            </p>
            <p className="text-[10px] text-[#f0ece4]/30">Manager</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-[#f0ece4]/25 transition-colors hover:text-[#f0ece4]/60"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
