--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.12 (Debian 17.12-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'manager'
);


--
-- Name: create_default_booking_rules(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_default_booking_rules() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  insert into booking_rules (restaurant_id, service_area_id)
  values (NEW.restaurant_id, NEW.id);
  return NEW;
end;
$$;


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
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
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: area_lock_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.area_lock_periods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_area_id uuid NOT NULL,
    restaurant_id uuid NOT NULL,
    name text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT area_lock_periods_date_check CHECK ((start_date <= end_date))
);


--
-- Name: booking_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    service_area_id uuid NOT NULL,
    min_guests integer DEFAULT 1 NOT NULL,
    max_guests_online integer DEFAULT 8 NOT NULL,
    default_guests integer DEFAULT 2 NOT NULL,
    booking_duration integer DEFAULT 150 NOT NULL,
    buffer_time integer DEFAULT 30 NOT NULL,
    min_time_before_slot integer DEFAULT 15 NOT NULL,
    booking_before_closing integer DEFAULT 120 NOT NULL,
    future_booking_window integer DEFAULT 30 NOT NULL,
    delay_validity integer DEFAULT 15 NOT NULL,
    cancellation_window_days integer DEFAULT 1 NOT NULL,
    cancellation_window_hours integer DEFAULT 0 NOT NULL,
    waitlist_enabled boolean DEFAULT false NOT NULL,
    waitlist_confirmation_window integer DEFAULT 15 NOT NULL,
    reminder_intervals integer[] DEFAULT '{1440,60}'::integer[] NOT NULL,
    thank_you_email boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: booking_tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    table_id uuid NOT NULL,
    restaurant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    service_area_id uuid NOT NULL,
    guest_id uuid,
    booking_number integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    source text DEFAULT 'online'::text NOT NULL,
    party_size integer NOT NULL,
    booking_date date NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    notes text,
    internal_notes text,
    allergens text[],
    is_delayed boolean DEFAULT false NOT NULL,
    delay_notified_at timestamp with time zone,
    reminder_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    guest_message text,
    marks jsonb DEFAULT '{}'::jsonb,
    company_name text,
    voucher_id uuid,
    is_walkin boolean DEFAULT false,
    spend_amount numeric,
    CONSTRAINT bookings_source_check CHECK ((source = ANY (ARRAY['online'::text, 'walk_in'::text, 'phone'::text, 'manual'::text]))),
    CONSTRAINT bookings_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'seated'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text]))),
    CONSTRAINT bookings_times_check CHECK ((start_time < end_time))
);


--
-- Name: bookings_booking_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_booking_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_booking_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_booking_number_seq OWNED BY public.bookings.booking_number;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    cover_image text,
    date date NOT NULL,
    time_start time without time zone NOT NULL,
    time_end time without time zone NOT NULL,
    capacity integer,
    is_public boolean DEFAULT true NOT NULL,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    locked_area_ids uuid[] DEFAULT '{}'::uuid[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: guests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auth_id uuid,
    email text,
    phone text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    company text,
    locale text DEFAULT 'sl'::text,
    allergens text[],
    marketing_consent boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    auth_user_id uuid,
    dietary_type text,
    favourite_food jsonb DEFAULT '[]'::jsonb,
    favourite_wine jsonb DEFAULT '[]'::jsonb,
    company_position text,
    company_tax_id text,
    loyalty_tier text DEFAULT 'none'::text,
    birthday date,
    anniversary date,
    seating_preference text,
    internal_notes text,
    total_visits integer DEFAULT 0,
    lifetime_spend numeric DEFAULT 0,
    CONSTRAINT guests_email_or_phone CHECK (((email IS NOT NULL) OR (phone IS NOT NULL)))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    restaurant_id uuid NOT NULL,
    role public.user_role DEFAULT 'manager'::public.user_role NOT NULL,
    first_name text,
    last_name text,
    email text NOT NULL,
    avatar_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: restaurants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.restaurants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    timezone text DEFAULT 'Europe/Ljubljana'::text NOT NULL,
    locale text DEFAULT 'sl'::text NOT NULL,
    phone text,
    email text,
    address text,
    city text,
    country text DEFAULT 'SI'::text NOT NULL,
    logo_url text,
    cover_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    time_format text DEFAULT '24h'::text,
    week_start text DEFAULT 1,
    hide_closed_days boolean DEFAULT true,
    available_languages text[] DEFAULT '{sl,en}'::text[],
    default_language text DEFAULT 'sl'::text,
    currency text DEFAULT 'EUR'::text,
    bank_iban text,
    bank_name text,
    bank_bic text,
    bank_account_holder text,
    vouchers_enabled boolean DEFAULT false NOT NULL
);


--
-- Name: service_areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_areas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    slug text,
    description text,
    capacity integer,
    is_active boolean DEFAULT true NOT NULL,
    is_bookable_online boolean DEFAULT true NOT NULL,
    substitute_area_id uuid,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_indoor boolean DEFAULT true NOT NULL
);


--
-- Name: special_days; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.special_days (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    service_area_id uuid,
    name text NOT NULL,
    date date NOT NULL,
    type text NOT NULL,
    open_time time without time zone,
    close_time time without time zone,
    pause_from time without time zone,
    pause_to time without time zone,
    slot_interval integer DEFAULT 30,
    is_recurring boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    date_end date,
    weather_status text,
    CONSTRAINT special_days_type_check CHECK ((type = ANY (ARRAY['closed'::text, 'open'::text, 'modified'::text])))
);


--
-- Name: table_combination_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.table_combination_members (
    combination_id uuid NOT NULL,
    table_id uuid NOT NULL
);


--
-- Name: table_combinations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.table_combinations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text,
    min_seats integer NOT NULL,
    max_seats integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    service_area_id uuid NOT NULL,
    name text NOT NULL,
    nickname text,
    shape text DEFAULT 'rectangle'::text NOT NULL,
    min_seats integer DEFAULT 1 NOT NULL,
    seats integer DEFAULT 2 NOT NULL,
    max_seats integer DEFAULT 4 NOT NULL,
    allow_multi boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_active_online boolean DEFAULT true NOT NULL,
    floor_plan_x integer,
    floor_plan_y integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    floor_plan_rotation double precision DEFAULT 0,
    CONSTRAINT tables_seats_check CHECK (((min_seats <= seats) AND (seats <= max_seats))),
    CONSTRAINT tables_shape_check CHECK ((shape = ANY (ARRAY['rectangle'::text, 'circle'::text, 'square'::text])))
);


--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vouchers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    type text NOT NULL,
    amount numeric,
    courses integer,
    wines integer,
    wine_guests integer,
    hotel_addon boolean DEFAULT false NOT NULL,
    delivery_type text DEFAULT 'digital'::text NOT NULL,
    delivery_address jsonb,
    buyer_name text NOT NULL,
    buyer_email text NOT NULL,
    buyer_phone text,
    recipient_name text,
    dedication text,
    code text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    issued_at timestamp with time zone,
    expires_at timestamp with time zone,
    redeemed_at timestamp with time zone,
    redeemed_by_guest_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: waitlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waitlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    service_area_id uuid NOT NULL,
    guest_id uuid,
    party_size integer NOT NULL,
    preferred_date date NOT NULL,
    preferred_time time without time zone,
    status text DEFAULT 'waiting'::text NOT NULL,
    notified_at timestamp with time zone,
    confirmation_deadline timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT waitlist_status_check CHECK ((status = ANY (ARRAY['waiting'::text, 'notified'::text, 'confirmed'::text, 'expired'::text, 'cancelled'::text])))
);


--
-- Name: weekly_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    service_area_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    is_open boolean DEFAULT true NOT NULL,
    open_time time without time zone,
    close_time time without time zone,
    pause_from time without time zone,
    pause_to time without time zone,
    slot_interval integer DEFAULT 30 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT weekly_schedules_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7))),
    CONSTRAINT weekly_schedules_pause_check CHECK ((pause_from < pause_to)),
    CONSTRAINT weekly_schedules_times_check CHECK ((open_time < close_time))
);


--
-- Name: bookings booking_number; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN booking_number SET DEFAULT nextval('public.bookings_booking_number_seq'::regclass);


--
-- Name: area_lock_periods area_lock_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.area_lock_periods
    ADD CONSTRAINT area_lock_periods_pkey PRIMARY KEY (id);


--
-- Name: booking_rules booking_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_rules
    ADD CONSTRAINT booking_rules_pkey PRIMARY KEY (id);


--
-- Name: booking_rules booking_rules_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_rules
    ADD CONSTRAINT booking_rules_unique UNIQUE (service_area_id);


--
-- Name: booking_tables booking_tables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_tables
    ADD CONSTRAINT booking_tables_pkey PRIMARY KEY (id);


--
-- Name: booking_tables booking_tables_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_tables
    ADD CONSTRAINT booking_tables_unique UNIQUE (booking_id, table_id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_unique_number; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_unique_number UNIQUE (restaurant_id, booking_number);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- Name: restaurants restaurants_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_slug_key UNIQUE (slug);


--
-- Name: service_areas service_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT service_areas_pkey PRIMARY KEY (id);


--
-- Name: service_areas service_areas_unique_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT service_areas_unique_name UNIQUE (restaurant_id, name);


--
-- Name: service_areas service_areas_unique_slug; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT service_areas_unique_slug UNIQUE (restaurant_id, slug);


--
-- Name: service_areas service_areas_unique_sort_order; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT service_areas_unique_sort_order UNIQUE (restaurant_id, sort_order);


--
-- Name: special_days special_days_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_days
    ADD CONSTRAINT special_days_pkey PRIMARY KEY (id);


--
-- Name: table_combination_members table_combination_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.table_combination_members
    ADD CONSTRAINT table_combination_members_pkey PRIMARY KEY (combination_id, table_id);


--
-- Name: table_combinations table_combinations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.table_combinations
    ADD CONSTRAINT table_combinations_pkey PRIMARY KEY (id);


--
-- Name: tables tables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_pkey PRIMARY KEY (id);


--
-- Name: tables tables_unique_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_unique_name UNIQUE (restaurant_id, name);


--
-- Name: tables tables_unique_sort_order; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_unique_sort_order UNIQUE (service_area_id, sort_order);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_restaurant_id_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_restaurant_id_code_key UNIQUE (restaurant_id, code);


--
-- Name: waitlist waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_pkey PRIMARY KEY (id);


--
-- Name: weekly_schedules weekly_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_schedules
    ADD CONSTRAINT weekly_schedules_pkey PRIMARY KEY (id);


--
-- Name: weekly_schedules weekly_schedules_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_schedules
    ADD CONSTRAINT weekly_schedules_unique UNIQUE (service_area_id, day_of_week);


--
-- Name: guests_auth_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX guests_auth_user_id_idx ON public.guests USING btree (auth_user_id) WHERE (auth_user_id IS NOT NULL);


--
-- Name: special_days_area_date_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX special_days_area_date_unique ON public.special_days USING btree (restaurant_id, service_area_id, date) WHERE (service_area_id IS NOT NULL);


--
-- Name: special_days_restaurant_date_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX special_days_restaurant_date_unique ON public.special_days USING btree (restaurant_id, date) WHERE (service_area_id IS NULL);


--
-- Name: service_areas on_service_area_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_service_area_created AFTER INSERT ON public.service_areas FOR EACH ROW EXECUTE FUNCTION public.create_default_booking_rules();


--
-- Name: area_lock_periods area_lock_periods_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.area_lock_periods
    ADD CONSTRAINT area_lock_periods_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: area_lock_periods area_lock_periods_service_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.area_lock_periods
    ADD CONSTRAINT area_lock_periods_service_area_id_fkey FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;


--
-- Name: booking_rules booking_rules_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_rules
    ADD CONSTRAINT booking_rules_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: booking_rules booking_rules_service_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_rules
    ADD CONSTRAINT booking_rules_service_area_id_fkey FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;


--
-- Name: booking_tables booking_tables_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_tables
    ADD CONSTRAINT booking_tables_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_tables booking_tables_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_tables
    ADD CONSTRAINT booking_tables_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: booking_tables booking_tables_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_tables
    ADD CONSTRAINT booking_tables_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_service_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_area_id_fkey FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;


--
-- Name: events events_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: guests guests_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: guests guests_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: service_areas service_areas_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT service_areas_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: service_areas service_areas_substitute_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_areas
    ADD CONSTRAINT service_areas_substitute_area_id_fkey FOREIGN KEY (substitute_area_id) REFERENCES public.service_areas(id) ON DELETE SET NULL;


--
-- Name: special_days special_days_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_days
    ADD CONSTRAINT special_days_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: special_days special_days_service_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_days
    ADD CONSTRAINT special_days_service_area_id_fkey FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;


--
-- Name: table_combination_members table_combination_members_combination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.table_combination_members
    ADD CONSTRAINT table_combination_members_combination_id_fkey FOREIGN KEY (combination_id) REFERENCES public.table_combinations(id) ON DELETE CASCADE;


--
-- Name: table_combination_members table_combination_members_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.table_combination_members
    ADD CONSTRAINT table_combination_members_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE CASCADE;


--
-- Name: table_combinations table_combinations_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.table_combinations
    ADD CONSTRAINT table_combinations_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: tables tables_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: tables tables_service_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tables
    ADD CONSTRAINT tables_service_area_id_fkey FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;


--
-- Name: vouchers vouchers_redeemed_by_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_redeemed_by_guest_id_fkey FOREIGN KEY (redeemed_by_guest_id) REFERENCES public.guests(id);


--
-- Name: vouchers vouchers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: waitlist waitlist_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE SET NULL;


--
-- Name: waitlist waitlist_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: waitlist waitlist_service_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_service_area_id_fkey FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;


--
-- Name: weekly_schedules weekly_schedules_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_schedules
    ADD CONSTRAINT weekly_schedules_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: weekly_schedules weekly_schedules_service_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_schedules
    ADD CONSTRAINT weekly_schedules_service_area_id_fkey FOREIGN KEY (service_area_id) REFERENCES public.service_areas(id) ON DELETE CASCADE;


--
-- Name: restaurants anon_select_restaurants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY anon_select_restaurants ON public.restaurants FOR SELECT TO anon USING (true);


--
-- Name: area_lock_periods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.area_lock_periods ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings auth_insert_booking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_insert_booking ON public.bookings FOR INSERT TO authenticated WITH CHECK ((guest_id IN ( SELECT guests.id
   FROM public.guests
  WHERE (guests.auth_user_id = auth.uid()))));


--
-- Name: booking_tables auth_insert_booking_table; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_insert_booking_table ON public.booking_tables FOR INSERT TO authenticated WITH CHECK ((booking_id IN ( SELECT b.id
   FROM (public.bookings b
     JOIN public.guests g ON ((b.guest_id = g.id)))
  WHERE (g.auth_user_id = auth.uid()))));


--
-- Name: booking_tables auth_insert_booking_tables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_insert_booking_tables ON public.booking_tables FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: bookings auth_insert_bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_insert_bookings ON public.bookings FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: booking_rules auth_select_booking_rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_select_booking_rules ON public.booking_rules FOR SELECT TO authenticated USING (true);


--
-- Name: booking_tables auth_select_booking_tables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_select_booking_tables ON public.booking_tables FOR SELECT TO authenticated USING (true);


--
-- Name: bookings auth_select_bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_select_bookings ON public.bookings FOR SELECT TO authenticated USING (true);


--
-- Name: bookings auth_select_own_bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_select_own_bookings ON public.bookings FOR SELECT TO authenticated USING ((guest_id IN ( SELECT guests.id
   FROM public.guests
  WHERE (guests.auth_user_id = auth.uid()))));


--
-- Name: service_areas auth_select_service_areas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_select_service_areas ON public.service_areas FOR SELECT TO authenticated USING (true);


--
-- Name: special_days auth_select_special_days; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_select_special_days ON public.special_days FOR SELECT TO authenticated USING (true);


--
-- Name: tables auth_select_tables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_select_tables ON public.tables FOR SELECT TO authenticated USING (true);


--
-- Name: weekly_schedules auth_select_weekly_schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY auth_select_weekly_schedules ON public.weekly_schedules FOR SELECT TO authenticated USING (true);


--
-- Name: booking_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_tables; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.booking_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: events events_anon_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY events_anon_select ON public.events FOR SELECT TO anon USING (true);


--
-- Name: events events_manager_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY events_manager_all ON public.events TO authenticated USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: guests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

--
-- Name: guests guests_anon_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guests_anon_insert ON public.guests FOR INSERT TO anon WITH CHECK (true);


--
-- Name: guests guests_anon_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guests_anon_select ON public.guests FOR SELECT TO anon USING (true);


--
-- Name: guests guests_authenticated_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guests_authenticated_insert ON public.guests FOR INSERT TO authenticated WITH CHECK ((auth_user_id = auth.uid()));


--
-- Name: guests guests_authenticated_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guests_authenticated_select ON public.guests FOR SELECT TO authenticated USING (true);


--
-- Name: guests guests_authenticated_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guests_authenticated_update ON public.guests FOR UPDATE TO authenticated USING ((auth_user_id = auth.uid()));


--
-- Name: guests guests_manager_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY guests_manager_update ON public.guests FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::public.user_role)))));


--
-- Name: area_lock_periods managers can manage own area lock periods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own area lock periods" ON public.area_lock_periods USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: booking_rules managers can manage own booking rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own booking rules" ON public.booking_rules USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: booking_tables managers can manage own booking tables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own booking tables" ON public.booking_tables USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: bookings managers can manage own bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own bookings" ON public.bookings USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: table_combination_members managers can manage own combination members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own combination members" ON public.table_combination_members USING ((combination_id IN ( SELECT table_combinations.id
   FROM public.table_combinations
  WHERE (table_combinations.restaurant_id = ( SELECT profiles.restaurant_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));


--
-- Name: service_areas managers can manage own service areas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own service areas" ON public.service_areas USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: special_days managers can manage own special days; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own special days" ON public.special_days USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: table_combinations managers can manage own table combinations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own table combinations" ON public.table_combinations USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: tables managers can manage own tables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own tables" ON public.tables USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: waitlist managers can manage own waitlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own waitlist" ON public.waitlist USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: weekly_schedules managers can manage own weekly schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can manage own weekly schedules" ON public.weekly_schedules USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: profiles managers can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can update own profile" ON public.profiles FOR UPDATE USING ((id = auth.uid()));


--
-- Name: profiles managers can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can view own profile" ON public.profiles FOR SELECT USING ((id = auth.uid()));


--
-- Name: restaurants managers can view own restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can view own restaurant" ON public.restaurants FOR SELECT USING ((id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: service_areas managers can view own service areas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "managers can view own service areas" ON public.service_areas FOR SELECT USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: restaurants managers_update_own_restaurant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY managers_update_own_restaurant ON public.restaurants FOR UPDATE TO authenticated USING ((id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))) WITH CHECK ((id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: booking_tables public can insert booking_tables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can insert booking_tables" ON public.booking_tables FOR INSERT TO anon WITH CHECK (true);


--
-- Name: bookings public can insert bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can insert bookings" ON public.bookings FOR INSERT TO anon WITH CHECK (true);


--
-- Name: service_areas public can view active service areas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can view active service areas" ON public.service_areas FOR SELECT TO anon USING ((is_active = true));


--
-- Name: tables public can view active tables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can view active tables" ON public.tables FOR SELECT TO anon USING ((is_active = true));


--
-- Name: booking_rules public can view booking rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can view booking rules" ON public.booking_rules FOR SELECT TO anon USING (true);


--
-- Name: bookings public can view bookings for slot checking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can view bookings for slot checking" ON public.bookings FOR SELECT TO anon USING (true);


--
-- Name: special_days public can view special days; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can view special days" ON public.special_days FOR SELECT TO anon USING (true);


--
-- Name: weekly_schedules public can view weekly schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public can view weekly schedules" ON public.weekly_schedules FOR SELECT TO anon USING (true);


--
-- Name: restaurants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

--
-- Name: service_areas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

--
-- Name: special_days; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.special_days ENABLE ROW LEVEL SECURITY;

--
-- Name: table_combination_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.table_combination_members ENABLE ROW LEVEL SECURITY;

--
-- Name: table_combinations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.table_combinations ENABLE ROW LEVEL SECURITY;

--
-- Name: tables; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

--
-- Name: vouchers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

--
-- Name: vouchers vouchers_anon_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vouchers_anon_insert ON public.vouchers FOR INSERT TO anon WITH CHECK (true);


--
-- Name: vouchers vouchers_anon_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vouchers_anon_select ON public.vouchers FOR SELECT TO anon USING (true);


--
-- Name: vouchers vouchers_manager_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY vouchers_manager_all ON public.vouchers TO authenticated USING ((restaurant_id = ( SELECT profiles.restaurant_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: waitlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_schedules ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


