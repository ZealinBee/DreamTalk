import { getUser } from '@/lib/auth/actions'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { RecordingButton } from '@/components/recording/recording-button'
import Link from 'next/link'
import styles from './home.module.css'

export default async function Home() {
  const user = await getUser()

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            DreamTalk
          </h1>
          <p className={styles.subtitle}>
            Welcome to DreamTalk
          </p>
        </div>

        <div className={styles.content}>
          {user ? (
            <>
              <RecordingButton />
            </>
          ) : (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                Sign in to continue
              </h2>
              <GoogleSignInButton />
            </div>
          )}
        </div>
      </main>

      {user && (
        <Link href="/thoughts" className={styles.thoughtsButton}>
          Thoughts
        </Link>
      )}
    </div>
  )
}
