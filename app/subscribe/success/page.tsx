'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { getCheckoutSession } from '@/lib/stripe/actions'
import styles from './success.module.css'

type Status = 'loading' | 'success' | 'error'

export default function SubscribeSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<Status>('loading')
  const [plan, setPlan] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    const verifyPayment = async () => {
      try {
        const session = await getCheckoutSession(sessionId)

        if (session.status === 'paid') {
          setStatus('success')
          setPlan(session.plan || null)
          // Subscription is saved to DB via webhook - no localStorage needed
        } else {
          setStatus('error')
        }
      } catch (error) {
        console.error('Error verifying payment:', error)
        setStatus('error')
      }
    }

    verifyPayment()
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Loader2 size={48} className={styles.spinner} />
          <h1 className={styles.title}>Verifying your payment...</h1>
          <p className={styles.subtitle}>Please wait a moment</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.iconWrapperError}>
            <XCircle size={48} className={styles.errorIcon} />
          </div>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.subtitle}>
            We couldn&apos;t verify your payment. If you were charged, please contact support.
          </p>
          <Link href="/subscribe" className={styles.button}>
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <CheckCircle size={48} className={styles.successIcon} />
        </div>
        <h1 className={styles.title}>Welcome to Premium!</h1>
        <p className={styles.subtitle}>
          {plan === 'lifetime'
            ? 'You now have lifetime access to unlimited recording time.'
            : 'Your subscription is now active. Enjoy unlimited recording time!'}
        </p>
 
        <Link href="/" className={styles.button}>
          Start Recording
        </Link>
      </div>
    </div>
  )
}
