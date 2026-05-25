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
import { FALLBACK_SCHEDULE } from "@/services/manager/timetable/types";
import TimetableHeader from "@/components/manager/timetable/TimetableHeader";
import AreaTabs from "@/components/manager/ui/AreaTabs";
import TimetableGrid from "@/components/manager/timetable/TimetableGrid";
import BookingModal from "@/components/manager/ui/BookingModal";

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
};

export default function TimetableShell({
  restaurantId,
  initialDate,
  initialAreas,
  initialAreaData,
  initialBookings,
}: TimetableShellProps) {
  const [date, setDate] = useState(initialDate);
  const [activeAreaIds, setActiveAreaIds] = useState<string[]>(
    initialAreas.map((a) => a.id), // all selected by default
  );
  const [areaData, setAreaData] = useState<AreaData[]>(initialAreaData);
  const [bookings, setBookings] = useState(initialBookings);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<TimetableBooking | null>(null);

  const fetchData = useCallback(
    async (newDate: string, areaIds: string[]) => {
      setIsLoading(true);
      try {
        const [newBookings, ...areaResults] = await Promise.all([
          getTimetableBookings(supabase, restaurantId, newDate),
          ...areaIds.map((areaId) =>
            Promise.all([
              getTimetableTables(supabase, restaurantId, areaId),
              getDaySchedule(supabase, restaurantId, areaId, newDate),
            ]),
          ),
        ]);

        setBookings(newBookings as TimetableBooking[]);
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

  // Filter areaData to only selected areas, in selection order
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
        {visibleAreaData.map(({ area, tables, schedule }) => (
          <div key={area.id}>
            {visibleAreaData.length > 1 && (
              <div className="px-4 py-2 bg-[#f0ede6] border-b border-black/6">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-black/40">
                  {area.name}
                </span>
              </div>
            )}
            <TimetableGrid
              tables={tables}
              bookings={bookings}
              schedule={schedule}
              date={date}
              onBookingClick={setSelectedBooking}
            />
          </div>
        ))}
      </div>
      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={handleBookingUpdate}
          restaurantId={restaurantId}
        />
      )}
    </div>
  );
}
