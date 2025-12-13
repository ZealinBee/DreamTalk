'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Sparkles, Infinity, ArrowLeft, Loader2, X } from 'lucide-react'
import { createCheckoutSession } from '@/lib/stripe/actions'
import { getUser } from '@/lib/auth/actions'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import styles from './subscribe.module.css'

type PlanType = 'monthly' | 'lifetime'

interface UserData {
  id: string
  email: string
  full_name?: string
}

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('lifetime')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getUser()
        setUser(userData)
      } catch (err) {
        console.error('Error checking auth:', err)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  const handleSubscribe = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { url } = await createCheckoutSession(selectedPlan, user.id)

      if (url) {
        window.location.href = url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Sparkles className={styles.headerIcon} />
          </div>
          <h1 className={styles.title}>Upgrade to Premium</h1>
          <p className={styles.subtitle}>
            Unlock unlimited recording time and capture every detail of your dreams
          </p>
        </div>

        {/* Signed in user info */}
        {user && (
          <div className={styles.userInfo}>
            <Check size={16} className={styles.userCheckIcon} />
            <span>Signed in as {user.email}</span>
          </div>
        )}

        <div className={styles.plansContainer}>
          {/* Monthly Plan */}
          <button
            className={`${styles.planCard} ${selectedPlan === 'monthly' ? styles.selected : ''}`}
            onClick={() => setSelectedPlan('monthly')}
            disabled={isLoading}
          >
            <div className={styles.planHeader}>
              <span className={styles.planName}>Monthly</span>
            </div>
            <div className={styles.priceWrapper}>
              <span className={styles.currency}>€</span>
              <span className={styles.price}>2</span>
              <span className={styles.period}>/month</span>
            </div>
            <ul className={styles.features}>
              <li className={styles.feature}>
                <Check size={16} className={styles.checkIcon} />
                <span>Unlimited recording time</span>
              </li>
              <li className={styles.feature}>
                <Check size={16} className={styles.checkIcon} />
                <span>Cancel anytime</span>
              </li>
              <li className={styles.feature}>
                <Check size={16} className={styles.checkIcon} />
                <span>Priority support</span>
              </li>
            </ul>
            <div className={styles.selectIndicator}>
              <div className={styles.radio}>
                {selectedPlan === 'monthly' && <div className={styles.radioInner} />}
              </div>
            </div>
          </button>

          {/* Lifetime Plan */}
          <button
            className={`${styles.planCard} ${styles.recommended} ${selectedPlan === 'lifetime' ? styles.selected : ''}`}
            onClick={() => setSelectedPlan('lifetime')}
            disabled={isLoading}
          >
            <div className={styles.badge}>Best Value</div>
            <div className={styles.planHeader}>
              <span className={styles.planName}>Lifetime</span>
              <Infinity size={20} className={styles.infinityIcon} />
            </div>
            <div className={styles.priceWrapper}>
              <span className={styles.currency}>€</span>
              <span className={styles.price}>10</span>
              <span className={styles.period}>one-time</span>
            </div>
            <ul className={styles.features}>
              <li className={styles.feature}>
                <Check size={16} className={styles.checkIcon} />
                <span>Unlimited recording time</span>
              </li>
              <li className={styles.feature}>
                <Check size={16} className={styles.checkIcon} />
                <span>Pay once, use forever</span>
              </li>
              <li className={styles.feature}>
                <Check size={16} className={styles.checkIcon} />
                <span>Priority support</span>
              </li>
            </ul>
            <div className={styles.selectIndicator}>
              <div className={styles.radio}>
                {selectedPlan === 'lifetime' && <div className={styles.radioInner} />}
              </div>
            </div>
          </button>
        </div>

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        <button
          className={styles.subscribeButton}
          onClick={handleSubscribe}
          disabled={isLoading || isCheckingAuth}
        >
          {isCheckingAuth ? (
            <>
              <Loader2 size={20} className={styles.spinner} />
              Loading...
            </>
          ) : isLoading ? (
            <>
              <Loader2 size={20} className={styles.spinner} />
              Redirecting to checkout...
            </>
          ) : (
            selectedPlan === 'monthly' ? 'Subscribe for €2/month' : 'Get Lifetime Access for €10'
          )}
        </button>

        <p className={styles.guarantee}>
          30-day money-back guarantee. No questions asked.
        </p>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowAuthModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className={styles.modalTitle}>Sign in to continue</h2>
            <p className={styles.modalSubtitle}>
              Create an account or sign in to complete your purchase
            </p>
            <GoogleSignInButton />
          </div>
        </div>
      )}
    </div>
  )
}
