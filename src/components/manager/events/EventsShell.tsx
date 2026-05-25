'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Lock, Globe } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { deleteEvent } from '@/services/manager/events/queries'
import EventModal from '@/components/manager/events/EventModal'
import type { Event } from '@/services/manager/events/types'
import type { ServiceArea } from '@/services/manager/settings/service-areas/types'

type Props = {
  initialEvents: Event[]
  restaurantId: string
  areas: ServiceArea[]
}

function toHHMM(t: string): string {
  return t ? t.slice(0, 5) : ''
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EventsShell({ initialEvents, restaurantId, areas }: Props) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Event | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const upcoming = events.filter(e => e.date >= today)
  const past = events.filter(e => e.date < today)

  function openCreate() {
    setEditing(undefined)
    setShowModal(true)
  }

  function openEdit(event: Event) {
    setEditing(event)
    setShowModal(true)
  }

  function handleSaved(event: Event) {
    setEvents(prev => {
      const exists = prev.find(e => e.id === event.id)
      return exists
        ? prev.map(e => e.id === event.id ? event : e)
        : [...prev, event].sort((a, b) => a.date.localeCompare(b.date))
    })
    setShowModal(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteEvent(supabase, id)
    setEvents(prev => prev.filter(e => e.id !== id))
    setDeletingId(null)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-[26px] font-normal text-[#1a1a18]">Events</h1>
            <p className="mt-0.5 text-[13px] text-black/40">Manage special events and private functions</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#1a1a18] text-[#f5f0e8] rounded-md hover:bg-[#2a2a26] transition-colors"
          >
            <Plus size={14} />
            New event
          </button>
        </div>

        {events.length === 0 && (
          <div className="bg-white rounded-xl border border-[#e8e4dc] py-16 text-center">
            <p className="text-sm text-[#7a7060]">No events yet</p>
            <p className="mt-1 text-xs text-[#a09880]">Create your first event to get started</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <EventList
            title="Upcoming"
            events={upcoming}
            areas={areas}
            onEdit={openEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}

        {past.length > 0 && (
          <EventList
            title="Past"
            events={past}
            areas={areas}
            onEdit={openEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
            muted
          />
        )}
      </div>

      {showModal && (
        <EventModal
          restaurantId={restaurantId}
          event={editing}
          areas={areas}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}

type EventListProps = {
  title: string
  events: Event[]
  areas: ServiceArea[]
  onEdit: (e: Event) => void
  onDelete: (id: string) => void
  deletingId: string | null
  muted?: boolean
}

function EventList({ title, events, areas, onEdit, onDelete, deletingId, muted }: EventListProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#a09880] mb-3">{title}</p>
      <div className="bg-white rounded-xl border border-[#e8e4dc] overflow-hidden">
        {events.map((event, idx) => {
          const lockedAreaNames = (event.locked_area_ids ?? [])
            .map(id => areas.find(a => a.id === id)?.name)
            .filter(Boolean) as string[]
          return (
          <div
            key={event.id}
            className={`flex items-center gap-4 px-5 py-3.5 ${
              idx < events.length - 1 ? 'border-b border-[#e8e4dc]' : ''
            } ${muted ? 'opacity-60' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#1a1a18]">{event.name}</p>
              <p className="mt-0.5 text-xs text-[#7a7060]">
                {formatDate(event.date)} · {toHHMM(event.time_start)}–{toHHMM(event.time_end)}
                {event.capacity ? ` · ${event.capacity} max` : ''}
                {lockedAreaNames.length > 0 ? ` · Locks: ${lockedAreaNames.join(', ')}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                event.is_public
                  ? 'bg-[#e0f0e8] text-[#2a6e47]'
                  : 'bg-[#f0ede6] text-[#7a6a50]'
              }`}>
                {event.is_public ? <Globe size={10} /> : <Lock size={10} />}
                {event.is_public ? 'Public' : 'Private'}
              </span>

              <button
                onClick={() => onEdit(event)}
                className="p-1.5 text-[#a09880] hover:text-[#1a1a18] transition-colors"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => handleDeleteClick(event.id, onDelete)}
                disabled={deletingId === event.id}
                className="p-1.5 text-[#a09880] hover:text-red-500 transition-colors disabled:opacity-40"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}

function handleDeleteClick(id: string, onDelete: (id: string) => void) {
  if (window.confirm('Delete this event?')) {
    onDelete(id)
  }
}
