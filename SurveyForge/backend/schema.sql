-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🗄 SURVEXA DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Create Public User Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'respondent')),
  organization TEXT DEFAULT '',
  job_role TEXT DEFAULT '',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Surveys Table
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  share_token TEXT UNIQUE DEFAULT md5(random()::text),
  theme JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rating', 'mcq', 'text', 'checkbox', 'dropdown')),
  options JSONB DEFAULT '[]'::jsonb,
  logic JSONB DEFAULT '[]'::jsonb,
  position INTEGER DEFAULT 0,
  required BOOLEAN DEFAULT false
);

-- 4. Create Responses Table
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,
  respondent_email TEXT DEFAULT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'response',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  report_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Analytics Summary Cache Table (Optional / Performance optimization)
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE UNIQUE NOT NULL,
  completion_rate NUMERIC DEFAULT 0.0,
  total_responses INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- 👤 users (Profiles) Policies
CREATE POLICY "Allow public read access to profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Allow individual user to update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 📋 surveys Policies
CREATE POLICY "Allow users to manage their own surveys" ON public.surveys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow anyone to view public surveys" ON public.surveys
  FOR SELECT USING (true);

-- ❓ questions Policies
CREATE POLICY "Allow anyone to read questions" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Allow survey owners to manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = questions.survey_id AND surveys.user_id = auth.uid()
    )
  );

-- 📥 responses Policies
CREATE POLICY "Allow anyone to submit survey responses" ON public.responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow survey owners to read survey responses" ON public.responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = responses.survey_id AND surveys.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow survey owners to delete survey responses" ON public.responses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = responses.survey_id AND surveys.user_id = auth.uid()
    )
  );

-- 🔔 notifications Policies
CREATE POLICY "Allow users to manage their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- 📄 reports Policies
CREATE POLICY "Allow survey owners to view reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = reports.survey_id AND surveys.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow survey owners to manage reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = reports.survey_id AND surveys.user_id = auth.uid()
    )
  );

-- 📊 analytics Policies
CREATE POLICY "Allow survey owners to view analytics cache" ON public.analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys
      WHERE surveys.id = analytics.survey_id AND surveys.user_id = auth.uid()
    )
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ⚡ TRIGGERS FOR USER PROFILE CREATION & REALTIME
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Trigger to automatically create a row in public.users when a user signs up via auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    -- Promote surveyforgeadmin@gmail.com to admin automatically, others default to 'user'
    CASE WHEN NEW.email = 'surveyforgeadmin@gmail.com' THEN 'admin' ELSE 'user' END,
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime subscriptions for live notifications & response counters
ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
