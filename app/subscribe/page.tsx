'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles, Infinity, ArrowLeft } from 'lucide-react'
import styles from './subscribe.module.css'

type PlanType = 'monthly' | 'lifetime'

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('lifetime')

  const handleSubscribe = () => {
    // TODO: Implement actual payment processing
    alert(`Subscribing to ${selectedPlan} plan - Payment integration coming soon!`)
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

        <div className={styles.plansContainer}>
          {/* Monthly Plan */}
          <button
            className={`${styles.planCard} ${selectedPlan === 'monthly' ? styles.selected : ''}`}
            onClick={() => setSelectedPlan('monthly')}
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
              <li className={styles.feature}>
                <Check size={16} className={styles.checkIcon} />
                <span>All future updates</span>
              </li>
            </ul>
            <div className={styles.selectIndicator}>
              <div className={styles.radio}>
                {selectedPlan === 'lifetime' && <div className={styles.radioInner} />}
              </div>
            </div>
          </button>
        </div>

        <button className={styles.subscribeButton} onClick={handleSubscribe}>
          {selectedPlan === 'monthly' ? 'Subscribe for €2/month' : 'Get Lifetime Access for €10'}
        </button>

        <p className={styles.guarantee}>
          30-day money-back guarantee. No questions asked.
        </p>
      </div>
    </div>
  )
}
