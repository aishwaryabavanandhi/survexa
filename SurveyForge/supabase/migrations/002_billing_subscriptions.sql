-- Survexa billing tables (run when migrating to Supabase)

CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_inr INTEGER NOT NULL DEFAULT 0,
  survey_limit INTEGER,
  response_limit INTEGER,
  ai_limit INTEGER,
  ai_unlimited BOOLEAN NOT NULL DEFAULT FALSE,
  ai_insights BOOLEAN NOT NULL DEFAULT FALSE,
  features_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  razorpay_subscription_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  method TEXT DEFAULT 'razorpay',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usage_tracking (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  surveys_created INTEGER NOT NULL DEFAULT 0,
  responses_collected INTEGER NOT NULL DEFAULT 0,
  ai_requests_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own usage" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);

-- Seed plan tiers (idempotent)
INSERT INTO public.plans (id, name, price_inr, survey_limit, response_limit, ai_limit, ai_unlimited, ai_insights, features_json)
VALUES
  ('free', 'Free', 0, 10, 100, 20, false, false, '["10 surveys", "100 responses", "20 AI generations"]'::jsonb),
  ('starter', 'Starter', 99, 30, 2000, NULL, true, false, '["30 surveys", "2,000 responses", "Unlimited AI"]'::jsonb),
  ('professional', 'Professional', 159, NULL, 20000, NULL, true, true, '["Unlimited surveys", "20,000 responses", "AI Insights"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_inr = EXCLUDED.price_inr,
  survey_limit = EXCLUDED.survey_limit,
  response_limit = EXCLUDED.response_limit,
  ai_limit = EXCLUDED.ai_limit,
  ai_unlimited = EXCLUDED.ai_unlimited,
  ai_insights = EXCLUDED.ai_insights,
  features_json = EXCLUDED.features_json;
