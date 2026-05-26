"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type {
  TimetableArea,
  TimetableTable,
  TimetableBooking,
  DaySchedule,
} from "@/services/manager/timetable/types";
import {
  getTimetableBookings,
  getTimetableTables,
  getDaySchedule,
} from "@/services/manager/timetable/queries";
import { getEventsForDate } from "@/services/manager/events/queries";
import type { Event } from "@/services/manager/events/types";

import { FALLBACK_SCHEDULE } from "@/services/manager/timetable/types";
import { ZOOM_LEVELS, DEFAULT_ZOOM_INDEX } from "@/services/manager/timetable/utils";
import TimetableHeader from "@/components/manager/timetable/TimetableHeader";
import AreaTabs from "@/components/manager/ui/AreaTabs";
import TimetableGrid from "@/components/manager/timetable/TimetableGrid";
import BookingModal from "@/components/manager/ui/BookingModal";
import BookingContextMenu from "@/components/manager/timetable/BookingContextMenu";
import NewBookingModal from "@/components/manager/timetable/NewBookingModal";

export type AreaData = {
  area: TimetableArea;
  tables: TimetableTable[];
  schedule: DaySchedule;
};

type TimetableShellProps = {
  restaurantId: string;
  initialDate: string;
  initialAreas: TimetableArea[];
  initialAreaData: AreaData[];
  initialBookings: TimetableBooking[];
  initialEvents: Event[];
};

export default function TimetableShell({
  restaurantId,
  initialDate,
  initialAreas,
  initialAreaData,
  initialBookings,
  initialEvents,
}: TimetableShellProps) {
  const [date, setDate] = useState(initialDate);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [activeAreaIds, setActiveAreaIds] = useState<string[]>(
    initialAreas.map((a) => a.id),
  );
  const [areaData, setAreaData] = useState<AreaData[]>(initialAreaData);
  const [bookings, setBookings] = useState(initialBookings);
  const [dayEvents, setDayEvents] = useState<Event[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<TimetableBooking | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    booking: TimetableBooking;
    x: number;
    y: number;
  } | null>(null);
  const [newBooking, setNewBooking] = useState<{
    table: TimetableTable;
    areaId: string;
    startTime: string;
  } | null>(null);

  const fetchData = useCallback(
    async (newDate: string, areaIds: string[]) => {
      setIsLoading(true);
      try {
        const [newBookings, newEvents, ...areaResults] = await Promise.all([
          getTimetableBookings(supabase, restaurantId, newDate),
          getEventsForDate(supabase, restaurantId, newDate),
          ...areaIds.map((areaId) =>
            Promise.all([
              getTimetableTables(supabase, restaurantId, areaId),
              getDaySchedule(supabase, restaurantId, areaId, newDate),
            ]),
          ),
        ]);

        setBookings(newBookings as TimetableBooking[]);
        setDayEvents(newEvents as Event[]);
        setAreaData(
          areaIds.map((areaId, i) => {
            const [tables, schedule] = areaResults[i] as [
              TimetableTable[],
              DaySchedule,
            ];
            return {
              area: initialAreas.find((a) => a.id === areaId)!,
              tables,
              schedule: schedule ?? FALLBACK_SCHEDULE,
            };
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [restaurantId, initialAreas],
  );

  const handleDateChange = useCallback(
    (newDate: string) => {
      setDate(newDate);
      fetchData(newDate, activeAreaIds);
    },
    [activeAreaIds, fetchData],
  );

  const handleAreaChange = useCallback(
    (newAreaIds: string[]) => {
      setActiveAreaIds(newAreaIds);
      fetchData(date, newAreaIds);
    },
    [date, fetchData],
  );

  const handleBookingUpdate = useCallback((updated: TimetableBooking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedBooking(updated);
  }, []);

  const handleContextMenuAction = useCallback(
    async (action: 'edit' | 'duplicate' | 'cancel' | 'no_show' | 'unassign', booking: TimetableBooking) => {
      setContextMenu(null);

      if (action === 'edit') {
        setSelectedBooking(booking);
        return;
      }

      if (action === 'cancel') {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('id', booking.id);
        if (!error) {
          setBookings((prev) => prev.map((b) =>
            b.id === booking.id ? { ...b, status: 'cancelled' as const } : b
          ));
        }
        return;
      }

      if (action === 'no_show') {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'no_show' })
          .eq('id', booking.id);
        if (!error) {
          setBookings((prev) => prev.map((b) =>
            b.id === booking.id ? { ...b, status: 'no_show' as const } : b
          ));
        }
        return;
      }

      if (action === 'unassign') {
        const { error } = await supabase
          .from('booking_tables')
          .delete()
          .eq('booking_id', booking.id);
        if (!error) {
          setBookings((prev) => prev.map((b) =>
            b.id === booking.id ? { ...b, table_ids: [] } : b
          ));
        }
        return;
      }

      if (action === 'duplicate') {
        await fetch('/api/manager/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date,
            start_time: booking.start_time,
            end_time: booking.end_time,
            party_size: booking.party_size,
            table_id: booking.table_ids[0] ?? null,
            area_id: booking.service_area_id,
            guest_id: booking.guest_id,
            notes: booking.notes,
          }),
        });
        fetchData(date, activeAreaIds);
      }
    },
    [date, activeAreaIds, fetchData],
  );

  const visibleAreaData = areaData.filter((ad) =>
    activeAreaIds.includes(ad.area.id),
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TimetableHeader
        date={date}
        onDateChange={handleDateChange}
        specialDayLabel={areaData[0]?.schedule.special_day_label}
        isClosed={areaData[0]?.schedule.is_closed}
        eventNames={dayEvents.map((e) => {
          const lockedNames = (e.locked_area_ids ?? [])
            .map((id) => initialAreas.find((a) => a.id === id)?.name)
            .filter(Boolean)
            .join(', ')
          return `${e.name} · ${e.time_start.slice(0, 5)}–${e.time_end.slice(0, 5)}${lockedNames ? ` · Locks: ${lockedNames}` : ''}`
        })}
      />
      <AreaTabs
        areas={initialAreas}
        activeAreaIds={activeAreaIds}
        onAreaChange={handleAreaChange}
      />
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#faf9f6]/60">
            <p className="text-[13px] text-black/40">Loading...</p>
          </div>
        )}
        {visibleAreaData.map(({ area, tables, schedule }) => {
          const { labelInterval } = ZOOM_LEVELS[zoomIndex];
          const zoomLabel = labelInterval < 60 ? `${labelInterval} min` : `${labelInterval / 60} hr`;
          return (
          <div key={area.id}>
            {visibleAreaData.length > 1 && (
              <div className="flex items-center px-4 py-2 bg-[#f0ede6] border-b border-black/6">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-black/40">
                  {area.name}
                </span>
                <span className="ml-auto text-[10px] tabular-nums text-black/30">
                  {zoomLabel}
                </span>
              </div>
            )}
            <TimetableGrid
              tables={tables}
              bookings={bookings}
              schedule={schedule}
              date={date}
              areaId={area.id}
              zoomIndex={zoomIndex}
              onZoomChange={(updater) => setZoomIndex(updater)}
              onBookingClick={setSelectedBooking}
              onBookingContextMenu={(booking, x, y) =>
                setContextMenu({ booking, x, y })
              }
              onNewBooking={(table, areaId, startTime) =>
                setNewBooking({ table, areaId, startTime })
              }
            />
          </div>
        );
        })}
      </div>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={handleBookingUpdate}
          restaurantId={restaurantId}
        />
      )}

      {contextMenu && (
        <BookingContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          booking={contextMenu.booking}
          onAction={(action) => handleContextMenuAction(action, contextMenu.booking)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {newBooking && (
        <NewBookingModal
          restaurantId={restaurantId}
          table={newBooking.table}
          areaId={newBooking.areaId}
          date={date}
          startTime={newBooking.startTime}
          onClose={() => setNewBooking(null)}
          onCreated={() => fetchData(date, activeAreaIds)}
        />
      )}
    </div>
  );
}
