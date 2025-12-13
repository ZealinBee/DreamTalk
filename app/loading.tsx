import styles from './loading.module.css'

export default function HomeLoading() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleSkeleton} />
          <div className={styles.subtitleSkeleton} />
        </div>

        <div className={styles.content}>
          <div className={styles.recordingButtonSkeleton} />
        </div>
      </main>

      <div className={styles.thoughtsButtonSkeleton} />
    </div>
  )
}
