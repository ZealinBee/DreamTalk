'use server'

import { stripe, PRICE_IDS } from './stripe'
import { createClient } from '@/lib/supabase/server'

type PlanType = 'monthly' | 'lifetime'

export async function createCheckoutSession(plan: PlanType, userId: string) {
  const priceId = PRICE_IDS[plan]

  if (!priceId || priceId.includes('PRICE_ID')) {
    throw new Error('Price ID not configured. Please set up products in Stripe Dashboard.')
  }

  if (!userId) {
    throw new Error('User must be signed in to subscribe.')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: plan === 'monthly' ? 'subscription' : 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/subscribe`,
    metadata: {
      plan: plan,
      user_id: userId,  // Pass user_id to webhook
    },
  })

  return { url: session.url }
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.payment_status,
    customerEmail: session.customer_details?.email,
    plan: session.metadata?.plan,
  }
}

export async function getUserSubscription() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { hasSubscription: false, subscription: null }
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!subscription) {
    return { hasSubscription: false, subscription: null }
  }

  // For monthly subscriptions, check if still within period
  if (subscription.plan === 'monthly' && subscription.current_period_end) {
    const periodEnd = new Date(subscription.current_period_end)
    if (periodEnd < new Date()) {
      return { hasSubscription: false, subscription: null }
    }
  }

  return {
    hasSubscription: true,
    subscription: {
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
      stripeSubscriptionId: subscription.stripe_subscription_id,
    },
  }
}

export async function cancelSubscription() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User must be signed in to cancel subscription.')
  }

  // Get the user's active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id, plan')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    throw new Error('No active subscription found.')
  }

  if (subscription.plan === 'lifetime') {
    throw new Error('Lifetime subscriptions cannot be cancelled.')
  }

  if (!subscription.stripe_subscription_id) {
    throw new Error('No Stripe subscription ID found.')
  }

  // Cancel at period end (don't cancel immediately)
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  // Update our database to reflect the pending cancellation
  const { error } = await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('stripe_subscription_id', subscription.stripe_subscription_id)

  if (error) {
    console.error('Error updating subscription:', error)
    throw new Error('Failed to update subscription status.')
  }

  return { success: true }
}

export async function resumeSubscription() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User must be signed in to resume subscription.')
  }

  // Get the user's subscription that's scheduled for cancellation
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id, plan, cancel_at_period_end')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    throw new Error('No active subscription found.')
  }

  if (!subscription.cancel_at_period_end) {
    throw new Error('Subscription is not scheduled for cancellation.')
  }

  if (!subscription.stripe_subscription_id) {
    throw new Error('No Stripe subscription ID found.')
  }

  // Resume the subscription (remove the cancel_at_period_end flag)
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: false,
  })

  // Update our database
  const { error } = await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: false })
    .eq('stripe_subscription_id', subscription.stripe_subscription_id)

  if (error) {
    console.error('Error updating subscription:', error)
    throw new Error('Failed to update subscription status.')
  }

  return { success: true }
}
