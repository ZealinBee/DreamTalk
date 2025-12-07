'use client'

import { useState } from 'react'
import { Recording } from '@/types/recording'
import styles from './recording-detail.module.css'

interface RecordingDetailProps {
  recording: Recording
  onClose: () => void
}

type Tab = 'raw_text' | 'summarized_text'

export function RecordingDetail({ recording, onClose }: RecordingDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('raw_text')

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{recording.filename}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'raw_text' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('raw_text')}
          >
            Raw Text
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'summarized_text' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('summarized_text')}
          >
            Summarized Text
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'raw_text' ? (
            <div className={styles.textContent}>
              {recording.raw_text || 'No transcription available'}
            </div>
          ) : (
            <div className={styles.textContent}>
              {recording.summarized_text || 'No summary available'}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p className={styles.date}>
            Created: {new Date(recording.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
