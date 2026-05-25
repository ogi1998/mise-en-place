'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { RotateCw, X } from 'lucide-react'
import type { TableWithStatus } from '@/services/manager/floor-plan/types'

// ─── Canvas constants ─────────────────────────────────────────────────────────
const GRID     = 20
const CANVAS_W = 1600
const CANVAS_H = 1000

// ─── Chair dimensions ─────────────────────────────────────────────────────────
const PADDING     = 5   // SVG edge margin
const CHAIR_S     = 12  // chair depth (perpendicular to table edge)
const CHAIR_L     = 18  // chair length (parallel to table edge)
const CHAIR_GAP   = 3   // tight gap — chairs sit close to the table, like real life
const TABLE_INSET = PADDING + CHAIR_S + CHAIR_GAP  // = 20

// ─── Status palette ───────────────────────────────────────────────────────────
const S = {
  empty: {
    table: '#f0ebe0', tableStroke: '#c0b8a8', sw: 1.5,
    chair: '#ddd5c5', chairStroke: '#bfb8a8',
    text: '#1a1a18', sub: '#7a7060',
  },
  upcoming: {
    table: '#ecf5e9', tableStroke: '#4a8e5a', sw: 2,
    chair: '#d0e8ca', chairStroke: '#4a8e5a',
    text: '#1a3d1a', sub: '#3a6e3a',
  },
  seated: {
    table: '#1a1a18', tableStroke: '#1a1a18', sw: 1.5,
    chair: '#2e2e2a', chairStroke: '#3a3a36',
    text: '#f5f0e8', sub: '#a09880',
  },
  delayed: {
    table: '#1a1a18', tableStroke: '#cc3333', sw: 2,
    chair: '#2a2020', chairStroke: '#cc3333',
    text: '#f5f0e8', sub: '#e87070',
  },
} as const

// ─── Sizing ───────────────────────────────────────────────────────────────────
function defaultSize(shape: string, seats: number): { w: number; h: number } {
  if (shape === 'circle') {
    const d = seats <= 2 ? 140 : seats <= 4 ? 195 : seats <= 6 ? 235 : 270
    return { w: d, h: d }
  }
  if (shape === 'square') {
    const d = seats <= 4 ? 188 : seats <= 6 ? 218 : 248
    return { w: d, h: d }
  }
  // rectangle — height also scales with seat count so 2-tops are clearly smaller
  if (seats <= 2) return { w: 175, h: 118 }
  if (seats <= 4) return { w: 250, h: 145 }
  if (seats <= 6) return { w: 305, h: 155 }
  if (seats <= 8) return { w: 355, h: 158 }
  return { w: 405, h: 162 }
}

function tableSize(t: TableWithStatus): { w: number; h: number } {
  return defaultSize(t.shape, t.seats)
}

// ─── Chair position helpers ───────────────────────────────────────────────────
type Rect = { x: number; y: number; w: number; h: number }

function rectChairs(seats: number, W: number, H: number): Rect[] {
  const bottom = Math.ceil(seats / 2)
  const top    = Math.floor(seats / 2)
  const bodyX  = TABLE_INSET
  const bodyW  = W - 2 * TABLE_INSET
  const out: Rect[] = []
  for (let i = 0; i < bottom; i++) {
    const cx = bodyX + (bodyW / (bottom + 1)) * (i + 1)
    out.push({ x: cx - CHAIR_L / 2, y: H - PADDING - CHAIR_S, w: CHAIR_L, h: CHAIR_S })
  }
  for (let i = 0; i < top; i++) {
    const cx = bodyX + (bodyW / (top + 1)) * (i + 1)
    out.push({ x: cx - CHAIR_L / 2, y: PADDING, w: CHAIR_L, h: CHAIR_S })
  }
  return out
}

function squareChairs(seats: number, W: number, H: number): Rect[] {
  const perSide = Math.floor(seats / 4)
  const rem     = seats % 4
  const counts  = [
    perSide + (rem > 0 ? 1 : 0),
    perSide + (rem > 1 ? 1 : 0),
    perSide + (rem > 2 ? 1 : 0),
    perSide,
  ]
  const bodyX = TABLE_INSET, bodyY = TABLE_INSET
  const bodyW = W - 2 * TABLE_INSET, bodyH = H - 2 * TABLE_INSET
  const out: Rect[] = []
  for (let i = 0; i < counts[0]; i++) {
    const cx = bodyX + (bodyW / (counts[0] + 1)) * (i + 1)
    out.push({ x: cx - CHAIR_L / 2, y: H - PADDING - CHAIR_S, w: CHAIR_L, h: CHAIR_S })
  }
  for (let i = 0; i < counts[1]; i++) {
    const cx = bodyX + (bodyW / (counts[1] + 1)) * (i + 1)
    out.push({ x: cx - CHAIR_L / 2, y: PADDING, w: CHAIR_L, h: CHAIR_S })
  }
  for (let i = 0; i < counts[2]; i++) {
    const cy = bodyY + (bodyH / (counts[2] + 1)) * (i + 1)
    out.push({ x: PADDING, y: cy - CHAIR_L / 2, w: CHAIR_S, h: CHAIR_L })
  }
  for (let i = 0; i < counts[3]; i++) {
    const cy = bodyY + (bodyH / (counts[3] + 1)) * (i + 1)
    out.push({ x: W - PADDING - CHAIR_S, y: cy - CHAIR_L / 2, w: CHAIR_S, h: CHAIR_L })
  }
  return out
}

function circleSeats(seats: number, W: number, H: number) {
  const cx = W / 2, cy = H / 2
  const tableR = Math.min(W, H) / 2 - PADDING - CHAIR_S - CHAIR_GAP
  const dist   = tableR + CHAIR_GAP + CHAIR_S / 2
  return Array.from({ length: seats }, (_, i) => {
    const angle = ((360 / seats) * i - 90) * (Math.PI / 180)
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) }
  })
}

// ─── Table SVG ────────────────────────────────────────────────────────────────
const LINE_H = 14

function fmtTime(iso: string) { return iso.slice(11, 16) }

type TextLine = { text: string; size: number; weight: number; color: string }

function buildLines(table: TableWithStatus, c: typeof S[keyof typeof S]): TextLine[] {
  const label = table.nickname ?? table.name
  const bk    = table.currentBooking

  if (table.status === 'empty') {
    return [
      { text: label,                size: 11, weight: 600, color: c.text },
      { text: `${table.seats} seats`, size: 9, weight: 400, color: c.sub },
    ]
  }
  if (table.status === 'upcoming' && bk) {
    return [
      { text: label,                   size: 10, weight: 600, color: c.text },
      { text: fmtTime(bk.start_time),  size: 13, weight: 700, color: c.text },
      { text: `${bk.party_size} pax`,  size: 9,  weight: 400, color: c.sub  },
    ]
  }
  if ((table.status === 'seated' || table.status === 'delayed') && bk) {
    const name = bk.guests ? bk.guests.first_name : 'Walk-in'
    const lines: TextLine[] = [
      { text: name,                   size: 12, weight: 700, color: c.text },
      { text: `${bk.party_size} pax`, size: 9,  weight: 400, color: c.sub  },
    ]
    if (table.status === 'delayed') {
      lines.push({ text: 'DELAYED', size: 8, weight: 700, color: '#ff6b6b' })
    }
    return lines
  }
  return [{ text: label, size: 11, weight: 600, color: c.text }]
}

function TextLines({ lines, cx, cy }: { lines: TextLine[]; cx: number; cy: number }) {
  const totalH = lines.length * LINE_H
  const startY = cy - totalH / 2 + LINE_H / 2
  return (
    <>
      {lines.map((l, i) => (
        <text
          key={i}
          x={cx}
          y={startY + i * LINE_H}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={l.size}
          fontWeight={l.weight}
          fill={l.color}
          fontFamily="DM Sans, system-ui, sans-serif"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {l.text}
        </text>
      ))}
    </>
  )
}

function TableSvg({ table, w, h }: { table: TableWithStatus; w: number; h: number }) {
  const c     = S[table.status]
  const cx    = w / 2
  const cy    = h / 2
  const lines = buildLines(table, c)

  if (table.shape === 'circle') {
    const tableR = Math.min(w, h) / 2 - PADDING - CHAIR_S - CHAIR_GAP
    const seats  = circleSeats(table.seats, w, h)
    const seatR  = CHAIR_S / 2 + 1
    return (
      <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        {seats.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={seatR} fill={c.chair} stroke={c.chairStroke} strokeWidth={1} />
        ))}
        <circle cx={cx} cy={cy} r={tableR} fill={c.table} stroke={c.tableStroke} strokeWidth={c.sw} />
        <circle cx={cx} cy={cy} r={tableR - 6} fill="none" stroke={c.tableStroke} strokeWidth={0.5} opacity={0.2} />
        <TextLines lines={lines} cx={cx} cy={cy} />
      </svg>
    )
  }

  if (table.shape === 'square') {
    const chairs = squareChairs(table.seats, w, h)
    const bx = TABLE_INSET, by = TABLE_INSET
    const bw = w - 2 * TABLE_INSET, bh = h - 2 * TABLE_INSET
    return (
      <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        {chairs.map((ch, i) => (
          <rect key={i} x={ch.x} y={ch.y} width={ch.w} height={ch.h} rx={3} fill={c.chair} stroke={c.chairStroke} strokeWidth={1} />
        ))}
        <rect x={bx} y={by} width={bw} height={bh} rx={7} fill={c.table} stroke={c.tableStroke} strokeWidth={c.sw} />
        <rect x={bx + 5} y={by + 5} width={bw - 10} height={bh - 10} rx={5} fill="none" stroke={c.tableStroke} strokeWidth={0.5} opacity={0.2} />
        <TextLines lines={lines} cx={cx} cy={cy} />
      </svg>
    )
  }

  // rectangle
  const chairs = rectChairs(table.seats, w, h)
  const bx = TABLE_INSET, by = TABLE_INSET
  const bw = w - 2 * TABLE_INSET, bh = h - 2 * TABLE_INSET
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      {chairs.map((ch, i) => (
        <rect key={i} x={ch.x} y={ch.y} width={ch.w} height={ch.h} rx={3} fill={c.chair} stroke={c.chairStroke} strokeWidth={1} />
      ))}
      <rect x={bx} y={by} width={bw} height={bh} rx={7} fill={c.table} stroke={c.tableStroke} strokeWidth={c.sw} />
      <rect x={bx + 5} y={by + 5} width={bw - 10} height={bh - 10} rx={5} fill="none" stroke={c.tableStroke} strokeWidth={0.5} opacity={0.2} />
      <TextLines lines={lines} cx={cx} cy={cy} />
    </svg>
  )
}

// ─── Canvas ───────────────────────────────────────────────────────────────────
function snap(v: number)  { return Math.round(v / GRID) * GRID }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

type Pos       = { x: number; y: number }
type DragState = { tableId: string; startMX: number; startMY: number; startX: number; startY: number }

type Props = {
  tables: TableWithStatus[]
  isEditMode: boolean
  onTableClick: (table: TableWithStatus) => void
  onSavePosition: (tableId: string, x: number, y: number, rotation: number) => void
  onUnplace: (tableId: string) => void
}

export default function FloorPlanCanvas({ tables, isEditMode, onTableClick, onSavePosition, onUnplace }: Props) {
  const [positions, setPositions] = useState<Record<string, Pos>>(() =>
    Object.fromEntries(tables.filter(t => t.floor_plan_x != null).map(t => [t.id, { x: t.floor_plan_x!, y: t.floor_plan_y! }]))
  )
  const [rotations, setRotations] = useState<Record<string, number>>(() =>
    Object.fromEntries(tables.filter(t => t.floor_plan_rotation != null).map(t => [t.id, t.floor_plan_rotation!]))
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const dragging   = useRef<DragState | null>(null)
  const didDrag    = useRef(false)
  const scrollRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPositions(Object.fromEntries(tables.filter(t => t.floor_plan_x != null).map(t => [t.id, { x: t.floor_plan_x!, y: t.floor_plan_y! }])))
    setRotations(Object.fromEntries(tables.filter(t => t.floor_plan_rotation != null).map(t => [t.id, t.floor_plan_rotation!])))
    setSelectedId(null)
  }, [tables])

  const placed   = tables.filter(t => positions[t.id] !== undefined)
  const unplaced = tables.filter(t => positions[t.id] === undefined)

  function startDrag(e: React.MouseEvent, id: string) {
    if (!isEditMode) return
    e.preventDefault(); e.stopPropagation()
    const pos = positions[id]!
    dragging.current = { tableId: id, startMX: e.clientX, startMY: e.clientY, startX: pos.x, startY: pos.y }
    didDrag.current = false
    setSelectedId(id)
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    const d = dragging.current
    if (!d) return
    const dx = e.clientX - d.startMX, dy = e.clientY - d.startMY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true
    const t = tables.find(t => t.id === d.tableId)
    if (!t) return
    const { w, h } = tableSize(t)
    setPositions(p => ({
      ...p,
      [d.tableId]: {
        x: clamp(snap(d.startX + dx), 0, CANVAS_W - w),
        y: clamp(snap(d.startY + dy), 0, CANVAS_H - h),
      },
    }))
  }, [tables])

  const onMouseUp = useCallback(() => {
    const d = dragging.current
    if (!d) return
    if (didDrag.current) {
      const pos = positions[d.tableId]
      const t   = tables.find(t => t.id === d.tableId)
      if (pos && t) {
        onSavePosition(d.tableId, pos.x, pos.y, rotations[d.tableId] ?? 0)
      }
    }
    dragging.current = null
    didDrag.current = false
  }, [positions, rotations, tables, onSavePosition])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  function handleRotate(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setRotations(prev => {
      const next = ((prev[id] ?? 0) + 90) % 360
      const pos  = positions[id]
      const t    = tables.find(t => t.id === id)
      if (pos && t) { onSavePosition(id, pos.x, pos.y, next) }
      return { ...prev, [id]: next }
    })
  }

  function handleUnplace(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setPositions(p => { const next = { ...p }; delete next[id]; return next })
    setRotations(p => { const next = { ...p }; delete next[id]; return next })
    setSelectedId(null)
    onUnplace(id)
  }

  function handlePlace(id: string) {
    const el = scrollRef.current
    const t  = tables.find(t => t.id === id)
    if (!t) return
    const { w, h } = tableSize(t)
    const x = clamp(snap((el?.scrollLeft ?? 0) + (el?.clientWidth ?? 600) / 2 - w / 2), 0, CANVAS_W - w)
    const y = clamp(snap((el?.scrollTop  ?? 0) + (el?.clientHeight ?? 400) / 2 - h / 2), 0, CANVAS_H - h)
    setPositions(p => ({ ...p, [id]: { x, y } }))
    setSelectedId(id)
    onSavePosition(id, x, y, 0)
  }

  function handleTableClick(e: React.MouseEvent, t: TableWithStatus) {
    e.stopPropagation()
    if (didDrag.current) return
    if (isEditMode) { setSelectedId(t.id); return }
    onTableClick(t)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Scrollable canvas */}
      <div ref={scrollRef} className="flex-1 overflow-auto" style={{ background: '#ede8df' }}>
        <div
          className="relative select-none"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            backgroundImage: 'radial-gradient(circle, rgba(150,140,125,0.45) 1.2px, transparent 1.2px)',
            backgroundSize: `${GRID}px ${GRID}px`,
          }}
          onClick={() => isEditMode && setSelectedId(null)}
        >
          {placed.map(t => {
            const pos        = positions[t.id]!
            const rot        = rotations[t.id] ?? 0
            const { w, h }  = tableSize(t)
            const isSelected = isEditMode && selectedId === t.id
            const isDragging = dragging.current?.tableId === t.id

            return (
              <div
                key={t.id}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: w,
                  height: h,
                  transform: `rotate(${rot}deg)`,
                  transformOrigin: 'center',
                  cursor: isEditMode ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                  zIndex: isSelected ? 10 : 1,
                  filter: isSelected
                    ? 'drop-shadow(0 6px 20px rgba(0,0,0,0.28))'
                    : 'drop-shadow(0 2px 6px rgba(0,0,0,0.14))',
                  transition: isDragging ? 'none' : 'filter 0.15s',
                }}
                onMouseDown={e => startDrag(e, t.id)}
                onClick={e => handleTableClick(e, t)}
              >
                <TableSvg table={t} w={w} h={h} />

                {/* Selection ring */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: -5,
                      borderRadius: t.shape === 'circle' ? '50%' : 11,
                      border: '2px solid #1a1a18',
                      opacity: 0.45,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Edit handles */}
                {isSelected && (
                  <div
                    style={{ position: 'absolute', top: -42, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
                    className="flex items-center gap-1.5"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <button
                      className="flex items-center gap-1.5 rounded-full bg-[#1a1a18] px-3 py-1 text-[10px] font-semibold text-[#f5f0e8] shadow-lg hover:bg-[#2a2a26] transition-colors"
                      onClick={e => handleRotate(e, t.id)}
                    >
                      <RotateCw className="h-3 w-3" />
                      Rotate 90°
                    </button>
                    <button
                      className="flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-1 text-[10px] font-semibold text-black/60 shadow-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                      onClick={e => handleUnplace(e, t.id)}
                    >
                      <X className="h-3 w-3" />
                      Unplace
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Unplaced sidebar */}
      {isEditMode && unplaced.length > 0 && (
        <div className="flex w-52 shrink-0 flex-col overflow-y-auto border-l border-black/8 bg-white">
          <div className="border-b border-black/6 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">Unplaced tables</p>
          </div>
          <div className="flex flex-col gap-1.5 p-2">
            {unplaced.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-black/8 bg-[#faf9f6] px-2.5 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-[#1a1a18]">{t.name}</p>
                  <p className="text-[10px] capitalize text-black/40">{t.shape} · {t.seats} seats</p>
                </div>
                <button
                  onClick={() => handlePlace(t.id)}
                  className="shrink-0 rounded-md bg-[#1a1a18] px-2.5 py-1 text-[10px] font-semibold text-[#f5f0e8] transition-colors hover:bg-[#2a2a26]"
                >
                  Place
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
