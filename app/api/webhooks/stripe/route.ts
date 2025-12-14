import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/stripe'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  // 1. Verify the webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 2. Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('=== Payment Successful ===')
        console.log('Session ID:', session.id)
        console.log('Customer email:', session.customer_details?.email)
        console.log('Plan:', session.metadata?.plan)
        console.log('User ID:', session.metadata?.user_id)

        const userId = session.metadata?.user_id
        const plan = session.metadata?.plan as 'monthly' | 'lifetime'

        if (!userId || !plan) {
          console.error('Missing user_id or plan in session metadata')
          throw new Error('Missing user_id or plan in session metadata')
        }

        const supabase = getSupabaseAdmin()

        // Create subscription record
        const subscriptionData: Record<string, unknown> = {
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_session_id: session.id,
          plan: plan,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: plan === 'lifetime' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }

        // For subscriptions, we'll get the subscription ID from the session
        if (session.subscription) {
          subscriptionData.stripe_subscription_id = session.subscription as string
        }

        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert(subscriptionData)

        if (insertError) {
          console.error('Error inserting subscription:', insertError)
          throw new Error(`Failed to insert subscription: ${insertError.message}`)
        }

        console.log('Subscription created for user:', userId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        console.log('=== Subscription Updated ===')
        console.log('Subscription ID:', subscription.id)
        console.log('Status:', subscription.status)

        const supabase = getSupabaseAdmin()

        // Update subscription status
        const updateData: Record<string, unknown> = {
          status: subscription.status === 'active' ? 'active' : 'past_due',
        }

        // Add period dates if available
        if ('current_period_start' in subscription && typeof subscription.current_period_start === 'number') {
          updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString()
        }
        if ('current_period_end' in subscription && typeof subscription.current_period_end === 'number') {
          updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString()
        }

        const { error } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating subscription:', error)
          throw new Error(`Failed to update subscription: ${error.message}`)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('=== Subscription Cancelled ===')
        console.log('Subscription ID:', subscription.id)

        const supabase = getSupabaseAdmin()

        // Mark subscription as cancelled
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error cancelling subscription:', error)
          throw new Error(`Failed to cancel subscription: ${error.message}`)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log('=== Payment Failed ===')
        console.log('Invoice ID:', invoice.id)
        console.log('Customer:', invoice.customer)

        // Update subscription status to past_due
        const subscriptionId = 'subscription' in invoice ? invoice.subscription : null
        if (subscriptionId) {
          const supabase = getSupabaseAdmin()

          const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId as string)

          if (error) {
            console.error('Error updating subscription status:', error)
            throw new Error(`Failed to update subscription status: ${error.message}`)
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  // 3. Return 200 to acknowledge receipt
  return Response.json({ received: true })
}
