import styles from './loading.module.css'

export default function ThoughtsLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.backButtonSkeleton} />
          <div className={styles.titleSkeleton} />
        </div>
      </div>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitleSkeleton} />
          <div className={styles.categoryList}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.categorySkeleton} />
            ))}
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.recordingGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.cardSkeleton}>
                <div className={styles.cardTitleSkeleton} />
                <div className={styles.cardDateSkeleton} />
                <div className={styles.cardPreviewSkeleton} />
                <div className={styles.cardPreviewSkeleton} style={{ width: '60%' }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
