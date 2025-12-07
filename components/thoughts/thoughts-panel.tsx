'use client'

import { useState } from 'react'
import { Recording } from '@/types/recording'
import { RecordingDetail } from './recording-detail'
import styles from './thoughts-panel.module.css'

interface ThoughtsPanelProps {
  recordings: Recording[]
}

export function ThoughtsPanel({ recordings }: ThoughtsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)

  const handleRecordingClick = (recording: Recording) => {
    setSelectedRecording(recording)
  }

  const handleClose = () => {
    setSelectedRecording(null)
  }

  return (
    <>
      <div className={styles.thoughtsTab}>
        <button
          className={styles.thoughtsButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          Thoughts {isOpen ? '▼' : '▲'}
        </button>

        {isOpen && (
          <div className={styles.thoughtsPanel}>
            <h3 className={styles.panelTitle}>Your Thoughts</h3>
            {recordings.length === 0 ? (
              <p className={styles.emptyMessage}>No recordings yet</p>
            ) : (
              <ul className={styles.recordingList}>
                {recordings.map((recording) => (
                  <li
                    key={recording.id}
                    className={styles.recordingItem}
                    onClick={() => handleRecordingClick(recording)}
                  >
                    <div className={styles.recordingName}>
                      {recording.filename}
                    </div>
                    <div className={styles.recordingDate}>
                      {new Date(recording.created_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {selectedRecording && (
        <RecordingDetail
          recording={selectedRecording}
          onClose={handleClose}
        />
      )}
    </>
  )
}
