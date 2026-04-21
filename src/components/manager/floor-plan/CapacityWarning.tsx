import { AlertTriangle } from 'lucide-react'

type CapacityWarningProps = {
  partySize: number
  maxSeats: number
}

export default function CapacityWarning({ partySize, maxSeats }: CapacityWarningProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-700">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <p className="text-[12px]">
        Party of {partySize} exceeds table maximum of {maxSeats} seats.
      </p>
    </div>
  )
}