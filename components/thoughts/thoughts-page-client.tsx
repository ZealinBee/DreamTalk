'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Recording, Category } from '@/types/recording'
import { RecordingDetail } from './recording-detail'
import { getLocalRecordings } from '@/lib/storage/local-storage'
import { signOut } from '@/lib/auth/actions'
import styles from './thoughts-page.module.css'

interface ThoughtsPageClientProps {
  recordings: Recording[]
  categories: Category[]
}

export function ThoughtsPageClient({ recordings: initialRecordings, categories }: ThoughtsPageClientProps) {
  const [recordings, setRecordings] = useState<Recording[]>(initialRecordings)
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  // Load recordings from localStorage on mount
  useEffect(() => {
    const localRecordings = getLocalRecordings()
    setRecordings(localRecordings)
  }, [])

  // Filter recordings by category
  const filteredRecordings = useMemo(() => {
    if (selectedCategoryId === null) {
      // "All categories" - show all recordings
      return recordings
    }
    if (selectedCategoryId === 'uncategorized') {
      // Show only recordings with no category
      return recordings.filter(r => r.category_id === null)
    }
    // Show recordings with the selected category
    return recordings.filter(r => r.category_id === selectedCategoryId)
  }, [recordings, selectedCategoryId])

  const handleRecordingClick = (recording: Recording) => {
    setSelectedRecording(recording)
  }

  const handleClose = () => {
    setSelectedRecording(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backButton}>
            ← Back to Home
          </Link>
          <h1 className={styles.title}>Past Dreams</h1>
        </div>
      </div>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Categories</h2>
          <ul className={styles.categoryList}>
            <li>
              <button
                className={`${styles.categoryButton} ${selectedCategoryId === null ? styles.activeCategoryButton : ''}`}
                onClick={() => setSelectedCategoryId(null)}
              >
                All Categories
                <span className={styles.categoryCount}>({recordings.length})</span>
              </button>
            </li>
            <li>
              <button
                className={`${styles.categoryButton} ${selectedCategoryId === 'uncategorized' ? styles.activeCategoryButton : ''}`}
                onClick={() => setSelectedCategoryId('uncategorized')}
              >
                Uncategorized
                <span className={styles.categoryCount}>
                  ({recordings.filter(r => r.category_id === null).length})
                </span>
              </button>
            </li>
            {categories.map((category) => {
              const count = recordings.filter(r => r.category_id === category.id).length
              return (
                <li key={category.id}>
                  <button
                    className={`${styles.categoryButton} ${selectedCategoryId === category.id ? styles.activeCategoryButton : ''}`}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {category.name}
                    <span className={styles.categoryCount}>({count})</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <button onClick={() => signOut()} className={styles.logoutButton}>
            Sign Out
          </button>
        </aside>

        <main className={styles.main}>
          {filteredRecordings.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyMessage}>No recordings found</p>
            </div>
          ) : (
            <div className={styles.recordingGrid}>
              {filteredRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className={styles.recordingCard}
                  onClick={() => handleRecordingClick(recording)}
                >
                  <h3 className={styles.recordingName}>{recording.filename}</h3>
                  <p className={styles.recordingDate}>
                    {new Date(recording.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {recording.summarized_text && (
                    <p className={styles.recordingPreview}>
                      {recording.summarized_text.substring(0, 100)}
                      {recording.summarized_text.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedRecording && (
        <RecordingDetail
          recording={selectedRecording}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
