'use client'

import { useState, useEffect } from 'react'
import { X, Save, FileAudio } from 'lucide-react'
import styles from './save-recording-modal.module.css'
import type { Category } from '@/types/recording'
import { getCategories } from '@/lib/categories/actions'

interface SaveRecordingModalProps {
  isOpen: boolean
  audioBlob: Blob | null
  recordingDuration: number
  onClose: () => void
  onSave: (filename: string, categoryId: string | null) => void
  isSaving?: boolean
}

export function SaveRecordingModal({
  isOpen,
  audioBlob,
  recordingDuration,
  onClose,
  onSave,
  isSaving = false
}: SaveRecordingModalProps) {
  const [filename, setFilename] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (isOpen) {
      // Generate default filename with timestamp
      const now = new Date()
      const defaultName = `Recording ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`

      // Fetch categories from Supabase
      const fetchCategories = async () => {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      }

      // Wrap setState in a timeout to avoid synchronous execution
      setTimeout(() => {
        setFilename(defaultName)
        fetchCategories()
      }, 0)
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!filename.trim()) {
      alert('Please enter a filename')
      return
    }

    await onSave(filename.trim(), categoryId)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (blob: Blob | null) => {
    if (!blob) return '0 KB'
    const kb = blob.size / 1024
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <FileAudio className={styles.headerIcon} />
            <h2>Save Recording</h2>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.recordingInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Duration:</span>
              <span className={styles.infoValue}>{formatDuration(recordingDuration)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Size:</span>
              <span className={styles.infoValue}>{formatFileSize(audioBlob)}</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="filename" className={styles.label}>
              Filename
            </label>
            <input
              id="filename"
              type="text"
              className={styles.input}
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter recording name"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Category (Optional)
            </label>
            <select
              id="category"
              className={styles.select}
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value || null)}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving || !filename.trim()}
          >
            <Save className={styles.buttonIcon} />
            {isSaving ? 'Transcribing & Saving...' : 'Save Recording'}
          </button>
        </div>
      </div>
    </div>
  )
}
