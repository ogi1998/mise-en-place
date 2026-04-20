interface HeaderProps {
  restaurantName: string;
}

export default async function Header({ restaurantName }: HeaderProps) {
  const today = new Date().toLocaleDateString("sl-SI", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="flex h-13 shrink-0 items-center border-b border-black/8 bg-[#faf9f6] px-6">
      <p className="font-serif text-[14px] text-[#1a1a18]">{restaurantName}</p>
      <p className="ml-2 text-[12px] text-[#1a1a18]/40">{today}</p>
      <div className="ml-auto flex items-center gap-3">
        <span className="rounded-full bg-black/6 px-3 py-1 text-[11px] text-black/50">
          Manager
        </span>
      </div>
    </header>
  );
}
