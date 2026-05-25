import type { SupabaseClient } from "@supabase/supabase-js";
import type { WidgetRestaurant, WidgetServiceArea } from "./types";

export async function getRestaurantBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<WidgetRestaurant | null> {
  const { data } = await supabase
    .from("restaurants")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();
  return data as WidgetRestaurant | null;
}

export async function getActiveServiceAreas(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<WidgetServiceArea[]> {
  const { data } = await supabase
    .from("service_areas")
    .select("id, name")
    .eq("restaurant_id", restaurantId)
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as WidgetServiceArea[];
}

export async function getWeeklySchedule(
  supabase: SupabaseClient,
  serviceAreaId: string,
  dayOfWeek: number,
) {
  const { data } = await supabase
    .from("weekly_schedules")
    .select(
      "is_open, open_time, close_time, pause_from, pause_to, slot_interval",
    )
    .eq("service_area_id", serviceAreaId)
    .eq("day_of_week", dayOfWeek)
    .single();
  return data;
}

export async function getSpecialDay(
  supabase: SupabaseClient,
  restaurantId: string,
  date: string,
) {
  const { data } = await supabase
    .from("special_days")
    .select("type, open_time, close_time, pause_from, pause_to, slot_interval")
    .eq("restaurant_id", restaurantId)
    .eq("date", date)
    .is("service_area_id", null)
    .maybeSingle();
  return data;
}

export async function getBookingRules(
  supabase: SupabaseClient,
  serviceAreaId: string,
) {
  const { data } = await supabase
    .from("booking_rules")
    .select(
      "booking_duration, buffer_time, min_time_before_slot, booking_before_closing, future_booking_window, min_guests, max_guests_online",
    )
    .eq("service_area_id", serviceAreaId)
    .single();
  return data;
}

export async function getTablesForArea(
  supabase: SupabaseClient,
  serviceAreaId: string,
  partySize: number,
) {
  const { data } = await supabase
    .from("tables")
    .select("id, min_seats, max_seats")
    .eq("service_area_id", serviceAreaId)
    .eq("is_active", true)
    .eq("is_active_online", true)
    .lte("min_seats", partySize)
    .gte("max_seats", partySize);
  return (data ?? []) as { id: string; min_seats: number; max_seats: number }[];
}

export async function getExistingBookings(
  supabase: SupabaseClient,
  serviceAreaId: string,
  date: string,
) {
  const { data } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, booking_tables(table_id)")
    .eq("service_area_id", serviceAreaId)
    .eq("booking_date", date)
    .not("status", "in", '("cancelled","no_show")');
  return (data ?? []) as {
    id: string;
    start_time: string;
    end_time: string;
    booking_tables: { table_id: string }[];
  }[];
}

export async function createGuest(
  supabase: SupabaseClient,
  payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    allergens: string[];
    auth_user_id: string;
  },
): Promise<{ id: string } | null> {
  // Check by auth_user_id first (returning authenticated user)
  const { data: byUserId } = await supabase
    .from("guests")
    .select("id")
    .eq("auth_user_id", payload.auth_user_id)
    .maybeSingle();

  if (byUserId) {
    if (payload.allergens?.length) {
      await supabase
        .from("guests")
        .update({ allergens: payload.allergens })
        .eq("id", byUserId.id);
    }
    return byUserId;
  }

  // Check by email to link an existing anon guest to this auth account
  const { data: byEmail } = await supabase
    .from("guests")
    .select("id")
    .eq("email", payload.email)
    .maybeSingle();

  if (byEmail) {
    const updateData: Record<string, unknown> = {
      auth_user_id: payload.auth_user_id,
    };
    if (payload.allergens?.length) updateData.allergens = payload.allergens;
    await supabase.from("guests").update(updateData).eq("id", byEmail.id);
    return byEmail;
  }

  const { data } = await supabase
    .from("guests")
    .insert(payload)
    .select("id")
    .single();

  return data;
}

export async function getGuestByAuthUserId(
  supabase: SupabaseClient,
  authUserId: string,
) {
  const { data } = await supabase
    .from("guests")
    .select("id, first_name, last_name, email, phone, allergens")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  return data as {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    allergens: string[] | null;
  } | null;
}

export async function createBooking(
  supabase: SupabaseClient,
  payload: {
    restaurant_id: string;
    service_area_id: string;
    guest_id: string | null;
    party_size: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    notes: string | null;
    allergens: string[];
    status: "pending";
    source: "online";
  },
): Promise<{ id: string; booking_number: string } | null> {
  const { data } = await supabase
    .from("bookings")
    .insert(payload)
    .select("id, booking_number")
    .single();
  return data;
}
