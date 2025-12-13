import { RecordingButton } from '@/components/recording/recording-button'
import Link from 'next/link'
import styles from './home.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            DreamTalk
          </h1>
          <p className={styles.subtitle}>
            Record your Dream and go Back to Them Later
          </p>
        </div>

        <div className={styles.content}>
          <RecordingButton />
        </div>
      </main>

      <Link href="/thoughts" className={styles.thoughtsButton}>
        Past Dreams
      </Link>
    </div>
  )
}
