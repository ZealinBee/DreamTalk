import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Price IDs from your Stripe Dashboard
// TODO: Replace these with your actual price IDs from Stripe Dashboard
export const PRICE_IDS = {
  monthly: 'price_1SdrQWQ2C9bT6XP3GQsATMJH', // Replace with actual price ID
  lifetime: 'price_1SdrQWQ2C9bT6XP3GQsATMJH', // Replace with actual price ID
}
