-- ============================================================
--  TripCraft AI  ·  Initial Schema Migration
--  File: supabase/migrations/0001_initial_schema.sql
--  Target: Supabase PostgreSQL (pg 15+)
--  Author: TripCraft AI Team
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ──────────────────────────────────────────────────────────────
-- TABLE: profiles
-- Linked 1-to-1 with auth.users via trigger on signup.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email       TEXT        NOT NULL UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS
  'Public profile metadata for each authenticated user.';

-- Auto-create profile row after user signs up ----------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- TABLE: trips
-- Top-level itinerary container per user.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trips (
  id                   UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID           NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  destination          TEXT           NOT NULL CHECK (char_length(destination) BETWEEN 1 AND 100),
  latitude             NUMERIC(9,6),
  longitude            NUMERIC(9,6),
  duration_days        INTEGER        NOT NULL CHECK (duration_days BETWEEN 1 AND 7),
  budget_tier          TEXT           NOT NULL CHECK (budget_tier IN ('budget', 'moderate', 'luxury')),
  total_estimated_cost NUMERIC(10,2)  NOT NULL DEFAULT 0.00,
  currency             TEXT           NOT NULL DEFAULT 'PKR',
  created_at           TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ    NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.trips IS
  'An AI-generated travel itinerary container owned by a user.';
COMMENT ON COLUMN public.trips.budget_tier IS
  'Allowed values: budget | moderate | luxury';
COMMENT ON COLUMN public.trips.currency IS
  'ISO 4217 currency code or local label (default PKR).';

-- Auto-update `updated_at` on any change ---------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trips_set_updated_at ON public.trips;
CREATE TRIGGER trips_set_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- TABLE: itinerary_days
-- One row per day within a trip (Day 1, Day 2, …).
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.itinerary_days (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID        NOT NULL REFERENCES public.trips (id) ON DELETE CASCADE,
  day_number  INTEGER     NOT NULL CHECK (day_number >= 1),
  theme       TEXT        CHECK (char_length(theme) <= 100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (trip_id, day_number)
);

COMMENT ON TABLE public.itinerary_days IS
  'Individual days within a trip schedule.';
COMMENT ON COLUMN public.itinerary_days.theme IS
  'Optional day theme e.g. "Historical Forts & Local Bazaars".';

-- ──────────────────────────────────────────────────────────────
-- TABLE: activities
-- Specific scheduled stops / meals / sights within a day.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id          UUID           NOT NULL REFERENCES public.itinerary_days (id) ON DELETE CASCADE,
  time_slot       TEXT           NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  title           TEXT           NOT NULL CHECK (char_length(title) BETWEEN 1 AND 150),
  description     TEXT,
  location_name   TEXT,
  estimated_cost  NUMERIC(10,2)  NOT NULL DEFAULT 0.00,
  category        TEXT           CHECK (category IN ('sightseeing', 'food', 'travel', 'leisure')),
  order_index     INTEGER        NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.activities IS
  'Individual activity slots within a day (morning / afternoon / evening).';
COMMENT ON COLUMN public.activities.time_slot IS
  'Allowed values: morning | afternoon | evening';
COMMENT ON COLUMN public.activities.category IS
  'Allowed values: sightseeing | food | travel | leisure';

-- ──────────────────────────────────────────────────────────────
-- TABLE: budget_summaries
-- One-to-one with trips; stores AI-computed itemised cost breakdown.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budget_summaries (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id             UUID           NOT NULL UNIQUE REFERENCES public.trips (id) ON DELETE CASCADE,
  accommodation_cost  NUMERIC(10,2)  NOT NULL DEFAULT 0.00,
  food_cost           NUMERIC(10,2)  NOT NULL DEFAULT 0.00,
  transport_cost      NUMERIC(10,2)  NOT NULL DEFAULT 0.00,
  activities_cost     NUMERIC(10,2)  NOT NULL DEFAULT 0.00,
  misc_cost           NUMERIC(10,2)  NOT NULL DEFAULT 0.00
);

COMMENT ON TABLE public.budget_summaries IS
  'Itemised AI budget estimates for a trip (1-to-1 with trips).';

-- ──────────────────────────────────────────────────────────────
-- INDEXES  (for dashboard queries & FK join performance)
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trips_user_id
  ON public.trips (user_id);

CREATE INDEX IF NOT EXISTS idx_trips_created_at
  ON public.trips (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip_id
  ON public.itinerary_days (trip_id);

CREATE INDEX IF NOT EXISTS idx_activities_day_id
  ON public.activities (day_id);

CREATE INDEX IF NOT EXISTS idx_activities_order
  ON public.activities (day_id, time_slot, order_index);

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- Default-deny: enable RLS on every table before adding policies.
-- ──────────────────────────────────────────────────────────────

-- profiles ---------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: owner can read own row"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner can update own row"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- trips -------------------------------------------------------
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips: owner can select"
  ON public.trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trips: owner can insert"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trips: owner can update"
  ON public.trips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trips: owner can delete"
  ON public.trips FOR DELETE
  USING (auth.uid() = user_id);

-- itinerary_days ----------------------------------------------
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "itinerary_days: owner can select"
  ON public.itinerary_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = itinerary_days.trip_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "itinerary_days: owner can insert"
  ON public.itinerary_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = itinerary_days.trip_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "itinerary_days: owner can delete"
  ON public.itinerary_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = itinerary_days.trip_id
        AND t.user_id = auth.uid()
    )
  );

-- activities --------------------------------------------------
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities: owner can select"
  ON public.activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.itinerary_days d
      JOIN public.trips t ON t.id = d.trip_id
      WHERE d.id = activities.day_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "activities: owner can insert"
  ON public.activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.itinerary_days d
      JOIN public.trips t ON t.id = d.trip_id
      WHERE d.id = activities.day_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "activities: owner can delete"
  ON public.activities FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.itinerary_days d
      JOIN public.trips t ON t.id = d.trip_id
      WHERE d.id = activities.day_id
        AND t.user_id = auth.uid()
    )
  );

-- budget_summaries --------------------------------------------
ALTER TABLE public.budget_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_summaries: owner can select"
  ON public.budget_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = budget_summaries.trip_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "budget_summaries: owner can insert"
  ON public.budget_summaries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = budget_summaries.trip_id
        AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "budget_summaries: owner can update"
  ON public.budget_summaries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = budget_summaries.trip_id
        AND t.user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- SERVICE ROLE BYPASS POLICIES
-- Allows server-side route handlers (using the service role key)
-- to perform batch inserts during AI generation flows without
-- being constrained by user-level RLS.
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "trips: service role full access"
  ON public.trips FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "itinerary_days: service role full access"
  ON public.itinerary_days FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "activities: service role full access"
  ON public.activities FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "budget_summaries: service role full access"
  ON public.budget_summaries FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ──────────────────────────────────────────────────────────────
-- GRANT USAGE
-- Allow the `anon` and `authenticated` roles to use the schema.
-- ──────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT                           ON public.profiles         TO authenticated;
GRANT UPDATE (full_name, avatar_url)   ON public.profiles         TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE   ON public.trips            TO authenticated;
GRANT SELECT, INSERT, DELETE           ON public.itinerary_days   TO authenticated;
GRANT SELECT, INSERT, DELETE           ON public.activities        TO authenticated;
GRANT SELECT, INSERT, UPDATE           ON public.budget_summaries  TO authenticated;
