'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, FileAudio, Mic, Sparkles, Check } from 'lucide-react'
import styles from './save-recording-modal.module.css'
import type { Category } from '@/types/recording'
import { getCategories } from '@/lib/categories/actions'

export type SavingStep = 'idle' | 'transcribing' | 'summarizing' | 'saving' | 'complete'

interface SaveRecordingModalProps {
  isOpen: boolean
  audioBlob: Blob | null
  recordingDuration: number
  onClose: () => void
  onSave: (filename: string, categoryId: string | null) => void
  isSaving?: boolean
  savingStep?: SavingStep
}

const STEPS = [
  { key: 'transcribing', label: 'Transcribing', icon: Mic },
  { key: 'summarizing', label: 'Summarizing', icon: Sparkles },
  { key: 'saving', label: 'Saving', icon: Save },
] as const

function getStepIndex(step: SavingStep): number {
  if (step === 'idle') return -1
  if (step === 'complete') return STEPS.length
  return STEPS.findIndex(s => s.key === step)
}

function getProgressPercent(step: SavingStep): number {
  const index = getStepIndex(step)
  if (index === -1) return 0
  if (step === 'complete') return 100
  // Each step represents a third of the progress, show partial progress within each step
  return ((index + 0.5) / STEPS.length) * 100
}

export function SaveRecordingModal({
  isOpen,
  audioBlob,
  recordingDuration,
  onClose,
  onSave,
  isSaving = false,
  savingStep = 'idle'
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

        <AnimatePresence mode="wait">
          {isSaving ? (
            <motion.div
              key="progress"
              className={styles.progressContainer}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.progressSteps}>
                {STEPS.map((step, index) => {
                  const currentIndex = getStepIndex(savingStep)
                  const isComplete = index < currentIndex || savingStep === 'complete'
                  const isActive = step.key === savingStep
                  const Icon = step.icon

                  return (
                    <div
                      key={step.key}
                      className={`${styles.progressStep} ${isActive ? styles.progressStepActive : ''} ${isComplete ? styles.progressStepComplete : ''}`}
                    >
                      <div className={styles.progressStepIcon}>
                        {isComplete ? (
                          <Check className={styles.stepIcon} />
                        ) : (
                          <Icon className={styles.stepIcon} />
                        )}
                      </div>
                      <span className={styles.progressStepLabel}>{step.label}</span>
                    </div>
                  )
                })}
              </div>

              <div className={styles.progressBarContainer}>
                <motion.div
                  className={styles.progressBar}
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercent(savingStep)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              <p className={styles.progressHint}>
                {savingStep === 'transcribing' && 'Converting your voice to text...'}
                {savingStep === 'summarizing' && 'Creating a summary of your dream...'}
                {savingStep === 'saving' && 'Saving your recording...'}
                {savingStep === 'complete' && 'Done!'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="buttons"
              className={styles.footer}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
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
                Save Recording
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
