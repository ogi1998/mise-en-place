import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/manager/layout/Sidebar";
import Header from "@/components/manager/layout/Header";

import type { ProfileWithRestaurant } from "@/types/database";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("first_name, last_name, restaurant:restaurants(name)")
    .eq("id", user.id)
    .single();

  const profile = data as ProfileWithRestaurant | null;

  const firstName = profile?.first_name ?? "";
  const lastName = profile?.last_name ?? "";

  const restaurantName =
    (profile?.restaurant as unknown as { name: string } | null)?.name ?? "";

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf9f6]">
      <div className="hidden md:flex md:shrink-0">
        <Sidebar
          restaurantName={restaurantName}
          managerName={fullName}
          managerInitials={initials}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header restaurantName={restaurantName} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
