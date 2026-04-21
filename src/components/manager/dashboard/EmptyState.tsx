type EmptyStateProps = {
  message: string
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-black/10 bg-black/1">
      <p className="text-[13px] text-black/30">{message}</p>
    </div>
  )
}