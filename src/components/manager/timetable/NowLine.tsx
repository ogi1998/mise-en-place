type NowLineProps = {
  left: number
  height: number
}

export default function NowLine({ left, height }: NowLineProps) {
  return (
    <div
      className="pointer-events-none absolute top-0 z-20 flex flex-col items-center"
      style={{ left, height }}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-red-500 -translate-x-0.5" />
      <div
        className="w-[1.5px] flex-1"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            #ef4444,
            #ef4444 4px,
            transparent 4px,
            transparent 8px
          )`,
        }}
      />
    </div>
  )
}