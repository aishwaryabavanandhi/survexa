-- Survexa: users profile + phone OTP fields (run in Supabase SQL editor when migrating)

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user',
  organization TEXT DEFAULT '',
  job_role TEXT DEFAULT '',
  phone_number TEXT UNIQUE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  otp_verified_at TIMESTAMPTZ,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Enable Phone provider in Dashboard: Authentication → Providers → Phone
-- Configure SMS via Twilio/MessageBird in Supabase project settings
