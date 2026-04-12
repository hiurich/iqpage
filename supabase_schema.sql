-- PageIQ — Supabase Schema
-- Run this in the Supabase SQL Editor

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                       TEXT NOT NULL,
  plan                        TEXT NOT NULL DEFAULT 'free'
                              CHECK (plan IN ('free', 'pro', 'edu', 'power')),
  stripe_customer_id          TEXT UNIQUE,
  subscription_end            TIMESTAMPTZ,
  summaries_used_this_period  INTEGER NOT NULL DEFAULT 0,
  qa_used_this_period         INTEGER NOT NULL DEFAULT 0,
  highlights_used_this_period INTEGER NOT NULL DEFAULT 0,
  daily_api_cost              DECIMAL(10, 6) NOT NULL DEFAULT 0,
  last_reset_date             DATE DEFAULT CURRENT_DATE,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── History ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.history (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain       TEXT NOT NULL,
  page_url     TEXT,
  page_title   TEXT,
  summary      TEXT,
  chat_history JSONB NOT NULL DEFAULT '[]'::JSONB,
  citations    JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS history_user_id_idx ON public.history(user_id);
CREATE INDEX IF NOT EXISTS history_domain_idx ON public.history(domain);
CREATE INDEX IF NOT EXISTS history_created_at_idx ON public.history(created_at DESC);

-- ─── Auto-create profile on sign-up ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history  ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own row; service_role bypasses RLS
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- History: users can CRUD their own rows
CREATE POLICY "Users can view own history"
  ON public.history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON public.history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON public.history FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Usage reset function (call via pg_cron or scheduled job) ─────────────────
-- Resets weekly counters for free plan, monthly for paid plans.
-- Configure pg_cron in Supabase to run this daily.
CREATE OR REPLACE FUNCTION public.reset_usage_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  first_of_month DATE := DATE_TRUNC('month', today)::DATE;
  start_of_week DATE := DATE_TRUNC('week', today)::DATE;
BEGIN
  -- Free: weekly reset
  UPDATE public.profiles
  SET summaries_used_this_period  = 0,
      qa_used_this_period         = 0,
      highlights_used_this_period = 0
  WHERE plan = 'free'
    AND last_reset_date < start_of_week;

  -- Paid: monthly reset
  UPDATE public.profiles
  SET summaries_used_this_period  = 0,
      qa_used_this_period         = 0,
      highlights_used_this_period = 0
  WHERE plan IN ('pro', 'edu', 'power')
    AND last_reset_date < first_of_month;

  -- Update reset date
  UPDATE public.profiles
  SET last_reset_date = today
  WHERE last_reset_date < today;
END;
$$;

-- ─── Sample cron (requires pg_cron extension enabled in Supabase) ──────────────
-- SELECT cron.schedule('reset-usage', '0 0 * * *', 'SELECT public.reset_usage_counters()');
