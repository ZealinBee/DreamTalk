-- Create subscriptions table
-- Tracks user premium subscriptions from Stripe
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

  -- Stripe identifiers
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT, -- Only for monthly subscriptions
  stripe_session_id TEXT,      -- Checkout session ID

  -- Subscription details
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),

  -- Dates
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,  -- NULL for lifetime
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update/delete (via webhooks)
-- No INSERT/UPDATE/DELETE policies for regular users

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS on_subscription_updated ON public.subscriptions;
CREATE TRIGGER on_subscription_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Helper function to check if a user has an active subscription
CREATE OR REPLACE FUNCTION public.user_has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND (
      plan = 'lifetime'
      OR (plan = 'monthly' AND current_period_end > NOW())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
