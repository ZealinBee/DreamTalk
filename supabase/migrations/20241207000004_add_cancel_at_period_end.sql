-- Add cancel_at_period_end column to track scheduled cancellations
-- When true, subscription stays active until period end but won't auto-renew

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Update the helper function to still consider subscriptions with cancel_at_period_end as active
-- (they remain active until the period ends)
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
