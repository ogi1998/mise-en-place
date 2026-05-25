"use client";

import { useState, useEffect, useCallback } from "react";
import { PenLine, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { TimetableArea } from "@/services/manager/timetable/types";
import type {
  FloorPlanTable,
  FloorPlanBooking,
  TableWithStatus,
  TableStatus,
} from "@/services/manager/floor-plan/types";
import {
  getFloorPlanTables,
  getFloorPlanBookings,
  updateTablePosition,
  clearTablePosition,
} from "@/services/manager/floor-plan/queries";
import { computeTableStatuses } from "@/services/manager/floor-plan/utils";
import AreaTabs from "@/components/manager/ui/AreaTabs";
import FloorPlanCanvas from "./FloorPlanCanvas";
import BookingModal from "@/components/manager/ui/BookingModal";

const LEGEND: { status: TableStatus; label: string; fill: string; stroke: string }[] = [
  { status: 'empty',    label: 'Empty',    fill: '#f0ebe0', stroke: '#c0b8a8' },
  { status: 'upcoming', label: 'Upcoming', fill: '#ecf5e9', stroke: '#4a8e5a' },
  { status: 'seated',   label: 'Seated',   fill: '#1a1a18', stroke: '#1a1a18' },
  { status: 'delayed',  label: 'Delayed',  fill: '#1a1a18', stroke: '#cc3333' },
]

type FloorPlanShellProps = {
  restaurantId: string;
  initialAreas: TimetableArea[];
  initialTables: FloorPlanTable[];
  initialBookings: FloorPlanBooking[];
  initialAreaId: string | null;
};

export default function FloorPlanShell({
  restaurantId,
  initialAreas,
  initialTables,
  initialBookings,
  initialAreaId,
}: FloorPlanShellProps) {
  const todayDate = new Date().toISOString().split("T")[0];

  const [activeAreaId, setActiveAreaId] = useState(initialAreaId);
  const [tables, setTables] = useState(initialTables);
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedTable, setSelectedTable] = useState<TableWithStatus | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const tablesWithStatus = computeTableStatuses(tables, bookings);
  const unassignedBookings = bookings.filter((b) => b.table_ids.length === 0);

  const fetchData = useCallback(
    async (areaId: string) => {
      const [newTables, newBookings] = await Promise.all([
        getFloorPlanTables(supabase, restaurantId, areaId),
        getFloorPlanBookings(supabase, restaurantId, todayDate),
      ]);
      setTables(newTables);
      setBookings(newBookings);
    },
    [restaurantId, todayDate],
  );

  const handleAreaChange = useCallback(
    (areaId: string) => {
      setActiveAreaId(areaId);
      fetchData(areaId);
    },
    [fetchData],
  );

  useEffect(() => {
    if (!activeAreaId) return;
    const interval = setInterval(() => fetchData(activeAreaId), 60_000);
    return () => clearInterval(interval);
  }, [activeAreaId, fetchData]);

  const handleBookingUpdate = useCallback(
    (updatedBooking: FloorPlanBooking) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)),
      );
      if (selectedTable) {
        setSelectedTable((prev) =>
          prev ? { ...prev, currentBooking: updatedBooking } : null,
        );
      }
    },
    [selectedTable],
  );

  const handleUnplace = useCallback(async (tableId: string) => {
    await clearTablePosition(supabase, tableId);
    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? { ...t, floor_plan_x: null, floor_plan_y: null, floor_plan_rotation: null }
          : t
      )
    );
  }, []);

  const handleAssigned = useCallback(() => {
    if (activeAreaId) fetchData(activeAreaId);
    setSelectedTable(null);
  }, [activeAreaId, fetchData]);

  const handleSavePosition = useCallback(
    async (tableId: string, x: number, y: number, rotation: number) => {
      await updateTablePosition(supabase, tableId, x, y, rotation);
      setTables(prev =>
        prev.map(t =>
          t.id === tableId
            ? { ...t, floor_plan_x: x, floor_plan_y: y, floor_plan_rotation: rotation }
            : t
        )
      );
    },
    [],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header: area tabs + edit toggle */}
      <div className="flex shrink-0 items-center justify-between border-b border-black/6 bg-white px-4">
        <AreaTabs
          areas={initialAreas}
          activeAreaIds={activeAreaId ? [activeAreaId] : []}
          onAreaChange={(ids) => handleAreaChange(ids[ids.length - 1])}
        />
        <button
          onClick={() => setIsEditMode(e => !e)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
            isEditMode
              ? 'bg-[#1a1a18] text-[#f5f0e8]'
              : 'border border-black/10 text-black/50 hover:text-black/80'
          }`}
        >
          {isEditMode
            ? <><Eye className="h-3.5 w-3.5" /> Done editing</>
            : <><PenLine className="h-3.5 w-3.5" /> Edit layout</>
          }
        </button>
      </div>

      {/* Status legend */}
      <div className="flex shrink-0 items-center gap-5 border-b border-black/6 bg-white px-4 py-2">
        {LEGEND.map(({ status, label, fill, stroke }) => {
          const count = tablesWithStatus.filter((t) => t.status === status).length;
          return (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-sm border"
                style={{
                  background: fill,
                  borderColor: stroke,
                  borderWidth: status === "delayed" ? 2 : 1,
                }}
              />
              <span className="text-[11px] text-black/50">{label}</span>
              <span className="text-[11px] font-semibold text-black/70">{count}</span>
            </div>
          );
        })}
        <div className="ml-auto text-[10px] text-black/30">
          {tablesWithStatus.length} tables
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        {tables.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[13px] text-black/30">No tables configured for this area.</p>
          </div>
        ) : (
          <FloorPlanCanvas
            tables={tablesWithStatus}
            isEditMode={isEditMode}
            onTableClick={setSelectedTable}
            onSavePosition={handleSavePosition}
            onUnplace={handleUnplace}
          />
        )}
      </div>

      {selectedTable && !isEditMode && (
        <BookingModal
          restaurantId={restaurantId}
          onClose={() => setSelectedTable(null)}
          booking={selectedTable.currentBooking ?? undefined}
          onUpdate={handleBookingUpdate}
          table={selectedTable}
          unassignedBookings={unassignedBookings}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}
