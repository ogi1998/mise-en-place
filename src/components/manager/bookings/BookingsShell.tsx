"use client";

import { useState } from "react";
import { useBookings } from "@/hooks/manager/bookings/useBookings";
import TimetableHeader from "@/components/manager/timetable/TimetableHeader";
import BookingRow from "./BookingRow";
import BookingModal, {
  type ModalBooking,
} from "@/components/manager/ui/BookingModal";
import type { BookingListItem } from "@/services/manager/bookings/types";
import type { TimetableBooking } from "@/services/manager/timetable/types";

type Props = {
  restaurantId: string;
  initialDate: string;
  initialBookings: BookingListItem[];
};

export default function BookingsShell({
  restaurantId,
  initialDate,
  initialBookings,
}: Props) {
  const { date, bookings, loading, handleDateChange, handleBookingUpdate } =
    useBookings(restaurantId, initialDate, initialBookings);
  const [selectedBooking, setSelectedBooking] =
    useState<TimetableBooking | null>(null);

  function toTimetableBooking(b: BookingListItem): TimetableBooking {
    return {
      id: b.id,
      booking_number: b.booking_number,
      status: b.status,
      party_size: b.party_size,
      start_time: b.start_time,
      end_time: b.end_time,
      notes: b.notes,
      internal_notes: b.internal_notes,
      is_delayed: b.is_delayed,
      allergens: b.allergens, // add this
      table_ids: b.table_ids,
      guests: b.guests,
    };
  }

  function handleModalUpdate(updated: ModalBooking) {
    handleBookingUpdate({
      ...bookings.find((b) => b.id === updated.id)!,
      status: updated.status,
      notes: updated.notes,
      internal_notes: updated.internal_notes,
      is_delayed: updated.is_delayed,
    });
    setSelectedBooking(updated as TimetableBooking);
  }

  const activeBookings = bookings.filter(
    (b) => !["cancelled", "no_show"].includes(b.status),
  );
  const cancelledBookings = bookings.filter((b) =>
    ["cancelled", "no_show"].includes(b.status),
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TimetableHeader date={date} onDateChange={handleDateChange} />

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-black/40">Loading...</p>
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[#a09880]">No bookings for this date.</p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="p-6 space-y-6 max-w-4xl">
            {/* Active bookings */}
            {activeBookings.length > 0 && (
              <div>
                <div className="overflow-hidden rounded-xl border border-[#e8e4dc] bg-white">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e8e4dc] bg-[#faf9f6]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">
                          Guest
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">
                          Guests
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">
                          Area
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#a09880]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBookings.map((booking) => (
                        <BookingRow
                          key={booking.id}
                          booking={booking}
                          onClick={() =>
                            setSelectedBooking(toTimetableBooking(booking))
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cancelled / no-show */}
            {cancelledBookings.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-[#a09880] mb-3">
                  Cancelled & No-shows
                </p>
                <div className="overflow-hidden rounded-xl border border-[#e8e4dc] bg-white opacity-60">
                  <table className="w-full">
                    <tbody>
                      {cancelledBookings.map((booking) => (
                        <BookingRow
                          key={booking.id}
                          booking={booking}
                          onClick={() =>
                            setSelectedBooking(toTimetableBooking(booking))
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={handleModalUpdate}
          restaurantId={restaurantId}
        />
      )}
    </div>
  );
}
