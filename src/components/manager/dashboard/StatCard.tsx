type StatCardProps = {
  label: string
  value: number | string
  icon: React.ElementType
  accent: string
}

export default function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/6 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: accent + '18' }}
      >
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div>
        <p className="font-serif text-3xl font-normal leading-none text-[#1a1a18]">
          {value}
        </p>
        <p className="mt-1 text-[12px] text-black/40">{label}</p>
      </div>
    </div>
  )
}