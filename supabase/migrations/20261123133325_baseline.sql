SET local check_function_bodies = off;

CREATE SEQUENCE "public"."bookings_booking_number_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

CREATE TABLE "public"."area_lock_periods" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "service_area_id" uuid                     NOT NULL,
  "restaurant_id"   uuid                     NOT NULL,
  "name"            text,
  "start_date"      date                     NOT NULL,
  "end_date"        date                     NOT NULL,
  "reason"          text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "area_lock_periods_date_check" CHECK ((start_date <= end_date)),
  CONSTRAINT "area_lock_periods_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."area_lock_periods"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."booking_rules" (
  "id"                           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id"                uuid                     NOT NULL,
  "service_area_id"              uuid                     NOT NULL,
  "min_guests"                   integer                  NOT NULL DEFAULT 1,
  "max_guests_online"            integer                  NOT NULL DEFAULT 8,
  "default_guests"               integer                  NOT NULL DEFAULT 2,
  "booking_duration"             integer                  NOT NULL DEFAULT 150,
  "buffer_time"                  integer                  NOT NULL DEFAULT 30,
  "min_time_before_slot"         integer                  NOT NULL DEFAULT 15,
  "booking_before_closing"       integer                  NOT NULL DEFAULT 120,
  "future_booking_window"        integer                  NOT NULL DEFAULT 30,
  "delay_validity"               integer                  NOT NULL DEFAULT 15,
  "cancellation_window_days"     integer                  NOT NULL DEFAULT 1,
  "cancellation_window_hours"    integer                  NOT NULL DEFAULT 0,
  "waitlist_enabled"             boolean                  NOT NULL DEFAULT false,
  "waitlist_confirmation_window" integer                  NOT NULL DEFAULT 15,
  "reminder_intervals"           integer[]                NOT NULL DEFAULT '{1440,60}'::integer[],
  "thank_you_email"              boolean                  NOT NULL DEFAULT true,
  "created_at"                   timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"                   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "booking_rules_pkey" PRIMARY KEY (id),
  CONSTRAINT "booking_rules_unique" UNIQUE (service_area_id)
);

ALTER TABLE "public"."booking_rules"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."booking_tables" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "booking_id"    uuid                     NOT NULL,
  "table_id"      uuid                     NOT NULL,
  "restaurant_id" uuid                     NOT NULL,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "booking_tables_pkey" PRIMARY KEY (id),
  CONSTRAINT "booking_tables_unique" UNIQUE (booking_id, table_id)
);

ALTER TABLE "public"."booking_tables"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."bookings" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id"       uuid                     NOT NULL,
  "service_area_id"     uuid                     NOT NULL,
  "guest_id"            uuid,
  "booking_number"      integer                  NOT NULL DEFAULT nextval('public.bookings_booking_number_seq'::regclass),
  "status"              text                     NOT NULL DEFAULT 'pending'::text,
  "source"              text                     NOT NULL DEFAULT 'online'::text,
  "party_size"          integer                  NOT NULL,
  "booking_date"        date                     NOT NULL,
  "start_time"          timestamp with time zone NOT NULL,
  "end_time"            timestamp with time zone NOT NULL,
  "notes"               text,
  "internal_notes"      text,
  "allergens"           text[],
  "is_delayed"          boolean                  NOT NULL DEFAULT false,
  "delay_notified_at"   timestamp with time zone,
  "reminder_sent_at"    timestamp with time zone,
  "confirmed_at"        timestamp with time zone,
  "cancelled_at"        timestamp with time zone,
  "cancellation_reason" text,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "guest_message"       text,
  "marks"               jsonb                    DEFAULT '{}'::jsonb,
  "company_name"        text,
  "voucher_id"          uuid,
  "is_walkin"           boolean                  DEFAULT false,
  "spend_amount"        numeric,
  CONSTRAINT "bookings_pkey" PRIMARY KEY (id),
  CONSTRAINT "bookings_source_check" CHECK ((source = ANY (ARRAY['online'::text, 'walk_in'::text, 'phone'::text, 'manual'::text]))),
  CONSTRAINT "bookings_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'seated'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text]))),
  CONSTRAINT "bookings_times_check" CHECK ((start_time < end_time)),
  CONSTRAINT "bookings_unique_number" UNIQUE (restaurant_id, booking_number)
);

ALTER TABLE "public"."bookings"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."events" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id"   uuid                     NOT NULL,
  "name"            text                     NOT NULL,
  "cover_image"     text,
  "date"            date                     NOT NULL,
  "time_start"      time without time zone   NOT NULL,
  "time_end"        time without time zone   NOT NULL,
  "capacity"        integer,
  "is_public"       boolean                  NOT NULL DEFAULT true,
  "custom_fields"   jsonb                    DEFAULT '{}'::jsonb,
  "locked_area_ids" uuid[]                   DEFAULT '{}'::uuid[],
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "events_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."events"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."guests" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "auth_id"            uuid,
  "email"              text,
  "phone"              text,
  "first_name"         text                     NOT NULL,
  "last_name"          text                     NOT NULL,
  "company"            text,
  "locale"             text                     DEFAULT 'sl'::text,
  "allergens"          text[],
  "marketing_consent"  boolean                  NOT NULL DEFAULT false,
  "created_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "auth_user_id"       uuid,
  "dietary_type"       text,
  "favourite_food"     jsonb                    DEFAULT '[]'::jsonb,
  "favourite_wine"     jsonb                    DEFAULT '[]'::jsonb,
  "company_position"   text,
  "company_tax_id"     text,
  "loyalty_tier"       text                     DEFAULT 'none'::text,
  "birthday"           date,
  "anniversary"        date,
  "seating_preference" text,
  "internal_notes"     text,
  "total_visits"       integer                  DEFAULT 0,
  "lifetime_spend"     numeric                  DEFAULT 0,
  CONSTRAINT "guests_email_or_phone" CHECK (((email IS NOT NULL) OR (phone IS NOT NULL))),
  CONSTRAINT "guests_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."guests"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"            uuid NOT NULL,
  "restaurant_id" uuid NOT NULL,
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."restaurants" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"                text                     NOT NULL,
  "slug"                text                     NOT NULL,
  "timezone"            text                     NOT NULL DEFAULT 'Europe/Ljubljana'::text,
  "locale"              text                     NOT NULL DEFAULT 'sl'::text,
  "phone"               text,
  "email"               text,
  "address"             text,
  "city"                text,
  "country"             text                     NOT NULL DEFAULT 'SI'::text,
  "logo_url"            text,
  "cover_url"           text,
  "is_active"           boolean                  NOT NULL DEFAULT true,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "time_format"         text                     DEFAULT '24h'::text,
  "week_start"          text                     DEFAULT 1,
  "hide_closed_days"    boolean                  DEFAULT true,
  "available_languages" text[]                   DEFAULT '{sl,en}'::text[],
  "default_language"    text                     DEFAULT 'sl'::text,
  "currency"            text                     DEFAULT 'EUR'::text,
  "bank_iban"           text,
  "bank_name"           text,
  "bank_bic"            text,
  "bank_account_holder" text,
  "vouchers_enabled"    boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "restaurants_pkey" PRIMARY KEY (id),
  CONSTRAINT "restaurants_slug_key" UNIQUE (slug)
);

ALTER TABLE "public"."restaurants"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."service_areas" (
  "id"                 uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id"      uuid                     NOT NULL,
  "name"               text                     NOT NULL,
  "slug"               text,
  "description"        text,
  "capacity"           integer,
  "is_active"          boolean                  NOT NULL DEFAULT true,
  "is_bookable_online" boolean                  NOT NULL DEFAULT true,
  "substitute_area_id" uuid,
  "sort_order"         integer                  NOT NULL DEFAULT 0,
  "created_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "is_indoor"          boolean                  NOT NULL DEFAULT true,
  CONSTRAINT "service_areas_pkey" PRIMARY KEY (id),
  CONSTRAINT "service_areas_unique_name" UNIQUE (restaurant_id, name),
  CONSTRAINT "service_areas_unique_slug" UNIQUE (restaurant_id, slug),
  CONSTRAINT "service_areas_unique_sort_order" UNIQUE (restaurant_id, sort_order)
);

ALTER TABLE "public"."service_areas"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."special_days" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id"   uuid                     NOT NULL,
  "service_area_id" uuid,
  "name"            text                     NOT NULL,
  "date"            date                     NOT NULL,
  "type"            text                     NOT NULL,
  "open_time"       time without time zone,
  "close_time"      time without time zone,
  "pause_from"      time without time zone,
  "pause_to"        time without time zone,
  "slot_interval"   integer                  DEFAULT 30,
  "is_recurring"    boolean                  NOT NULL DEFAULT false,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "date_end"        date,
  "weather_status"  text,
  CONSTRAINT "special_days_pkey" PRIMARY KEY (id),
  CONSTRAINT "special_days_type_check" CHECK ((type = ANY (ARRAY['closed'::text, 'open'::text, 'modified'::text])))
);

ALTER TABLE "public"."special_days"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."table_combination_members" (
  "combination_id" uuid NOT NULL,
  "table_id"       uuid NOT NULL,
  CONSTRAINT "table_combination_members_pkey" PRIMARY KEY (combination_id, table_id)
);

ALTER TABLE "public"."table_combination_members"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."table_combinations" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id" uuid                     NOT NULL,
  "name"          text,
  "min_seats"     integer                  NOT NULL,
  "max_seats"     integer                  NOT NULL,
  "is_active"     boolean                  NOT NULL DEFAULT true,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "table_combinations_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."table_combinations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."tables" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id"       uuid                     NOT NULL,
  "service_area_id"     uuid                     NOT NULL,
  "name"                text                     NOT NULL,
  "nickname"            text,
  "shape"               text                     NOT NULL DEFAULT 'rectangle'::text,
  "min_seats"           integer                  NOT NULL DEFAULT 1,
  "seats"               integer                  NOT NULL DEFAULT 2,
  "max_seats"           integer                  NOT NULL DEFAULT 4,
  "allow_multi"         boolean                  NOT NULL DEFAULT false,
  "sort_order"          integer                  NOT NULL DEFAULT 0,
  "is_active"           boolean                  NOT NULL DEFAULT true,
  "is_active_online"    boolean                  NOT NULL DEFAULT true,
  "floor_plan_x"        integer,
  "floor_plan_y"        integer,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "floor_plan_rotation" double precision         DEFAULT 0,
  CONSTRAINT "tables_pkey" PRIMARY KEY (id),
  CONSTRAINT "tables_seats_check" CHECK (((min_seats <= seats) AND (seats <= max_seats))),
  CONSTRAINT "tables_shape_check" CHECK ((shape = ANY (ARRAY['rectangle'::text, 'circle'::text, 'square'::text]))),
  CONSTRAINT "tables_unique_name" UNIQUE (restaurant_id, name),
  CONSTRAINT "tables_unique_sort_order" UNIQUE (service_area_id, sort_order)
);

ALTER TABLE "public"."tables"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."vouchers" (
  "id"                   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id"        uuid                     NOT NULL,
  "type"                 text                     NOT NULL,
  "amount"               numeric,
  "courses"              integer,
  "wines"                integer,
  "wine_guests"          integer,
  "hotel_addon"          boolean                  NOT NULL DEFAULT false,
  "delivery_type"        text                     NOT NULL DEFAULT 'digital'::text,
  "delivery_address"     jsonb,
  "buyer_name"           text                     NOT NULL,
  "buyer_email"          text                     NOT NULL,
  "buyer_phone"          text,
  "recipient_name"       text,
  "dedication"           text,
  "code"                 text                     NOT NULL,
  "status"               text                     NOT NULL DEFAULT 'pending'::text,
  "issued_at"            timestamp with time zone,
  "expires_at"           timestamp with time zone,
  "redeemed_at"          timestamp with time zone,
  "redeemed_by_guest_id" uuid,
  "created_at"           timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "vouchers_pkey" PRIMARY KEY (id),
  CONSTRAINT "vouchers_restaurant_id_code_key" UNIQUE (restaurant_id, code)
);

ALTER TABLE "public"."vouchers"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."waitlist" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id"         uuid                     NOT NULL,
  "service_area_id"       uuid                     NOT NULL,
  "guest_id"              uuid,
  "party_size"            integer                  NOT NULL,
  "preferred_date"        date                     NOT NULL,
  "preferred_time"        time without time zone,
  "status"                text                     NOT NULL DEFAULT 'waiting'::text,
  "notified_at"           timestamp with time zone,
  "confirmation_deadline" timestamp with time zone,
  "created_at"            timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"            timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "waitlist_pkey" PRIMARY KEY (id),
  CONSTRAINT "waitlist_status_check" CHECK ((status = ANY (ARRAY['waiting'::text, 'notified'::text, 'confirmed'::text, 'expired'::text, 'cancelled'::text])))
);

ALTER TABLE "public"."waitlist"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."weekly_schedules" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "restaurant_id"   uuid                     NOT NULL,
  "service_area_id" uuid                     NOT NULL,
  "day_of_week"     integer                  NOT NULL,
  "is_open"         boolean                  NOT NULL DEFAULT true,
  "open_time"       time without time zone,
  "close_time"      time without time zone,
  "pause_from"      time without time zone,
  "pause_to"        time without time zone,
  "slot_interval"   integer                  NOT NULL DEFAULT 30,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "weekly_schedules_day_of_week_check" CHECK (((day_of_week >= 1) AND (day_of_week <= 7))),
  CONSTRAINT "weekly_schedules_pause_check" CHECK ((pause_from < pause_to)),
  CONSTRAINT "weekly_schedules_pkey" PRIMARY KEY (id),
  CONSTRAINT "weekly_schedules_times_check" CHECK ((open_time < close_time)),
  CONSTRAINT "weekly_schedules_unique" UNIQUE (service_area_id, day_of_week)
);

ALTER TABLE "public"."weekly_schedules"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."bookings_booking_number_seq" OWNED BY "public"."bookings"."booking_number";

CREATE TYPE "public"."user_role" AS ENUM (
  'manager'
);

ALTER TABLE "public"."profiles"
  ADD COLUMN "role" public.user_role NOT NULL DEFAULT 'manager'::public.user_role;

ALTER TABLE "public"."profiles"
  ADD COLUMN "first_name" text;

ALTER TABLE "public"."profiles"
  ADD COLUMN "last_name" text;

ALTER TABLE "public"."profiles"
  ADD COLUMN "email" text NOT NULL;

ALTER TABLE "public"."profiles"
  ADD COLUMN "avatar_url" text;

ALTER TABLE "public"."profiles"
  ADD COLUMN "is_active" boolean NOT NULL DEFAULT true;

ALTER TABLE "public"."profiles"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."profiles"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.create_default_booking_rules()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  insert into booking_rules (restaurant_id, service_area_id)
  values (NEW.restaurant_id, NEW.id);
  return NEW;
end;
$function$;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

ALTER TABLE "public"."booking_tables"
  ADD CONSTRAINT "booking_tables_booking_id_fkey" FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

ALTER TABLE "public"."guests"
  ADD CONSTRAINT "guests_auth_id_fkey" FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE "public"."guests"
  ADD CONSTRAINT "guests_auth_user_id_fkey" FOREIGN KEY (auth_user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."bookings"
  ADD CONSTRAINT "bookings_guest_id_fkey" FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE SET NULL;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."area_lock_periods"
  ADD CONSTRAINT "area_lock_periods_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."booking_rules"
  ADD CONSTRAINT "booking_rules_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."booking_tables"
  ADD CONSTRAINT "booking_tables_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."bookings"
  ADD CONSTRAINT "bookings_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."events"
  ADD CONSTRAINT "events_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."area_lock_periods"
  ADD CONSTRAINT "area_lock_periods_service_area_id_fkey" FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;

ALTER TABLE "public"."booking_rules"
  ADD CONSTRAINT "booking_rules_service_area_id_fkey" FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;

ALTER TABLE "public"."bookings"
  ADD CONSTRAINT "bookings_service_area_id_fkey" FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;

ALTER TABLE "public"."service_areas"
  ADD CONSTRAINT "service_areas_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."service_areas"
  ADD CONSTRAINT "service_areas_substitute_area_id_fkey" FOREIGN KEY (substitute_area_id) REFERENCES public.service_areas(id) ON DELETE SET NULL;

ALTER TABLE "public"."special_days"
  ADD CONSTRAINT "special_days_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."special_days"
  ADD CONSTRAINT "special_days_service_area_id_fkey" FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;

ALTER TABLE "public"."table_combination_members"
  ADD CONSTRAINT "table_combination_members_combination_id_fkey" FOREIGN KEY (combination_id) REFERENCES public.table_combinations(id) ON DELETE CASCADE;

ALTER TABLE "public"."table_combinations"
  ADD CONSTRAINT "table_combinations_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."booking_tables"
  ADD CONSTRAINT "booking_tables_table_id_fkey" FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE CASCADE;

ALTER TABLE "public"."table_combination_members"
  ADD CONSTRAINT "table_combination_members_table_id_fkey" FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE CASCADE;

ALTER TABLE "public"."tables"
  ADD CONSTRAINT "tables_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."tables"
  ADD CONSTRAINT "tables_service_area_id_fkey" FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;

ALTER TABLE "public"."vouchers"
  ADD CONSTRAINT "vouchers_redeemed_by_guest_id_fkey" FOREIGN KEY (redeemed_by_guest_id) REFERENCES public.guests(id);

ALTER TABLE "public"."vouchers"
  ADD CONSTRAINT "vouchers_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."waitlist"
  ADD CONSTRAINT "waitlist_guest_id_fkey" FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE SET NULL;

ALTER TABLE "public"."waitlist"
  ADD CONSTRAINT "waitlist_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."waitlist"
  ADD CONSTRAINT "waitlist_service_area_id_fkey" FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;

ALTER TABLE "public"."weekly_schedules"
  ADD CONSTRAINT "weekly_schedules_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE "public"."weekly_schedules"
  ADD CONSTRAINT "weekly_schedules_service_area_id_fkey" FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX guests_auth_user_id_idx ON public.guests USING btree (auth_user_id)
  WHERE (auth_user_id IS NOT NULL);

CREATE UNIQUE INDEX special_days_area_date_unique ON public.special_days USING btree (restaurant_id, service_area_id, date)
  WHERE (service_area_id IS NOT NULL);

CREATE UNIQUE INDEX special_days_restaurant_date_unique ON public.special_days USING btree (restaurant_id, date)
  WHERE (service_area_id IS NULL);

CREATE TRIGGER on_service_area_created
  AFTER INSERT ON public.service_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_booking_rules();

CREATE POLICY "managers can manage own area lock periods" ON "public"."area_lock_periods"
  FOR ALL
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "managers can manage own booking rules" ON "public"."booking_rules"
  FOR ALL
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "public can view booking rules" ON "public"."booking_rules"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "auth_select_booking_rules" ON "public"."booking_rules"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "managers can manage own booking tables" ON "public"."booking_tables"
  FOR ALL
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "public can insert booking_tables" ON "public"."booking_tables"
  FOR INSERT
  TO "anon"
  WITH CHECK (true);

CREATE POLICY "auth_insert_booking_tables" ON "public"."booking_tables"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (true);

CREATE POLICY "auth_insert_booking_table" ON "public"."booking_tables"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((booking_id IN ( SELECT b.id
   FROM (public.bookings b
     JOIN public.guests g ON ((b.guest_id = g.id)))
  WHERE (g.auth_user_id = auth.uid()))));

CREATE POLICY "auth_select_booking_tables" ON "public"."booking_tables"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "managers can manage own bookings" ON "public"."bookings"
  FOR ALL
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "public can insert bookings" ON "public"."bookings"
  FOR INSERT
  TO "anon"
  WITH CHECK (true);

CREATE POLICY "public can view bookings for slot checking" ON "public"."bookings"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "auth_insert_bookings" ON "public"."bookings"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (true);

CREATE POLICY "auth_insert_booking" ON "public"."bookings"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((guest_id IN ( SELECT guests.id
   FROM public.guests
  WHERE (guests.auth_user_id = auth.uid()))));

CREATE POLICY "auth_select_bookings" ON "public"."bookings"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "auth_select_own_bookings" ON "public"."bookings"
  FOR SELECT
  TO "authenticated"
  USING ((guest_id IN ( SELECT guests.id
   FROM public.guests
  WHERE (guests.auth_user_id = auth.uid()))));

CREATE POLICY "events_anon_select" ON "public"."events"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "events_manager_all" ON "public"."events"
  FOR ALL
  TO "authenticated"
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "guests_anon_insert" ON "public"."guests"
  FOR INSERT
  TO "anon"
  WITH CHECK (true);

CREATE POLICY "guests_anon_select" ON "public"."guests"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "guests_authenticated_insert" ON "public"."guests"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth_user_id = auth.uid()));

CREATE POLICY "guests_authenticated_select" ON "public"."guests"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "guests_authenticated_update" ON "public"."guests"
  FOR UPDATE
  TO "authenticated"
  USING ((auth_user_id = auth.uid()));

CREATE POLICY "guests_manager_update" ON "public"."guests"
  FOR UPDATE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::public.user_role)))));

CREATE POLICY "managers can update own profile" ON "public"."profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((id = auth.uid()));

CREATE POLICY "managers can view own profile" ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING ((id = auth.uid()));

CREATE POLICY "managers can view own restaurant" ON "public"."restaurants"
  FOR SELECT
  TO PUBLIC
  USING ((id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "anon_select_restaurants" ON "public"."restaurants"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "managers_update_own_restaurant" ON "public"."restaurants"
  FOR UPDATE
  TO "authenticated"
  USING ((id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))))
  WITH CHECK ((id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "managers can manage own service areas" ON "public"."service_areas"
  FOR ALL
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "managers can view own service areas" ON "public"."service_areas"
  FOR SELECT
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "public can view active service areas" ON "public"."service_areas"
  FOR SELECT
  TO "anon"
  USING ((is_active = true));

CREATE POLICY "auth_select_service_areas" ON "public"."service_areas"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "managers can manage own special days" ON "public"."special_days"
  FOR ALL
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "public can view special days" ON "public"."special_days"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "auth_select_special_days" ON "public"."special_days"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "managers can manage own combination members" ON "public"."table_combination_members"
  FOR ALL
  TO PUBLIC
  USING ((combination_id IN ( SELECT table_combinations.id
   FROM public.table_combinations
  WHERE (table_combinations.restaurant_id = ( SELECT profiles.restaurant_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE POLICY "managers can manage own table combinations" ON "public"."table_combinations"
  FOR ALL
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "managers can manage own tables" ON "public"."tables"
  FOR ALL
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "public can view active tables" ON "public"."tables"
  FOR SELECT
  TO "anon"
  USING ((is_active = true));

CREATE POLICY "auth_select_tables" ON "public"."tables"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "vouchers_anon_insert" ON "public"."vouchers"
  FOR INSERT
  TO "anon"
  WITH CHECK (true);

CREATE POLICY "vouchers_anon_select" ON "public"."vouchers"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "vouchers_manager_all" ON "public"."vouchers"
  FOR ALL
  TO "authenticated"
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "managers can manage own waitlist" ON "public"."waitlist"
  FOR ALL
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "managers can manage own weekly schedules" ON "public"."weekly_schedules"
  FOR ALL
  TO PUBLIC
  USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "public can view weekly schedules" ON "public"."weekly_schedules"
  FOR SELECT
  TO "anon"
  USING (true);

CREATE POLICY "auth_select_weekly_schedules" ON "public"."weekly_schedules"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Authenticated users can update event covers" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING ((bucket_id = 'event-covers'::text));

CREATE POLICY "Authenticated users can upload event covers" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((bucket_id = 'event-covers'::text));

CREATE POLICY "Public read event covers" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING ((bucket_id = 'event-covers'::text));

CREATE EVENT TRIGGER "ensure_rls"
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION "public"."rls_auto_enable"();

GRANT EXECUTE ON FUNCTION "public"."create_default_booking_rules"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."create_default_booking_rules"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."create_default_booking_rules"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."create_default_booking_rules"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."rls_auto_enable"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO "service_role";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."bookings_booking_number_seq" TO "anon", "authenticated";

REVOKE ALL ON SEQUENCE "public"."bookings_booking_number_seq" FROM "postgres";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."bookings_booking_number_seq" TO "postgres";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."bookings_booking_number_seq" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."area_lock_periods" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."area_lock_periods" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."area_lock_periods" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."area_lock_periods" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."booking_rules" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."booking_rules" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."booking_rules" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."booking_rules" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."booking_tables" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."booking_tables" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."booking_tables" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."booking_tables" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."bookings" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."bookings" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."bookings" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."bookings" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."events" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."events" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."events" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."events" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."guests" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."guests" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."guests" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."guests" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."restaurants" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."restaurants" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."restaurants" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."restaurants" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."service_areas" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."service_areas" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."service_areas" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."service_areas" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."special_days" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."special_days" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."special_days" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."special_days" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."table_combination_members" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."table_combination_members" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."table_combination_members" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."table_combination_members" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."table_combinations" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."table_combinations" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."table_combinations" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."table_combinations" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tables" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."tables" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tables" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tables" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."vouchers" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."vouchers" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."vouchers" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."vouchers" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."waitlist" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."waitlist" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."waitlist" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."waitlist" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."weekly_schedules" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."weekly_schedules" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."weekly_schedules" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."weekly_schedules" TO "service_role";


-- Storage bucket for event cover images (bucket rows are data, so db pull does not capture them).
-- Already exists in the cloud project; this makes a fresh rebuild complete.
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-covers', 'event-covers', true)
ON CONFLICT (id) DO NOTHING;
