'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Mic, Square, Pause, Play } from 'lucide-react'
import styles from './recording-button.module.css'
import { SaveRecordingModal, type SavingStep } from './save-recording-modal'
import { processRecording } from '@/lib/recordings/actions'
import { saveLocalRecording, blobToBase64, generateId } from '@/lib/storage/local-storage'
import { getUserSubscription } from '@/lib/stripe/actions'
import type { Recording } from '@/types/recording'

type RecordingState = 'idle' | 'requesting-permission' | 'recording' | 'paused'

export function RecordingButton() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savingStep, setSavingStep] = useState<SavingStep>('idle')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    getUserSubscription().then(({ hasSubscription: hasSub }) => {
      setHasSubscription(hasSub)
    })
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setRecordingState('requesting-permission')

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const recordingBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())

        // Show modal to save recording
        setAudioBlob(recordingBlob)
        setShowModal(true)
        setRecordingState('idle')
      }

      mediaRecorder.start()
      setRecordingState('recording')

      // Start timer with auto-cutoff at 2 minutes (only for non-subscribers)
      const MAX_RECORDING_SECONDS = 120
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (!hasSubscription && newTime >= MAX_RECORDING_SECONDS) {
            // Auto-stop recording at 2 minutes for non-subscribers
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop()
            }
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
          }
          return newTime
        })
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)

      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        alert('Microphone permission denied. Please allow microphone access in your browser settings.')
      } else {
        alert('Failed to access microphone. Please check your browser settings.')
      }

      setRecordingState('idle')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
      mediaRecorderRef.current.stop()

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState('recording')

      // Restart timer
      const MAX_RECORDING_SECONDS = 120
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (!hasSubscription && newTime >= MAX_RECORDING_SECONDS) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop()
            }
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
          }
          return newTime
        })
      }, 1000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSaveRecording = async (filename: string, categoryId: string | null) => {
    if (!audioBlob) {
      alert('No recording available to save.')
      return
    }

    setIsSaving(true)
    setSavingStep('transcribing')

    try {
      // Convert Blob to File for transcription
      const audioFile = new File([audioBlob], `${filename}.webm`, { type: 'audio/webm' })

      // Start processing and simulate step progression
      // Since processRecording handles both transcription and summarization,
      // we'll advance to "summarizing" after a reasonable delay
      const stepProgressionTimer = setTimeout(() => {
        setSavingStep('summarizing')
      }, 3000) // Move to summarizing after 3 seconds

      // Call server action to transcribe and summarize
      const result = await processRecording({ audioFile })

      // Clear the timer in case it hasn't fired yet
      clearTimeout(stepProgressionTimer)

      // After processRecording, both transcription and summarization are done
      setSavingStep('saving')

      // Convert audio blob to base64 for localStorage storage
      const audioBase64 = await blobToBase64(audioBlob)

      // Create recording object
      const recording: Recording = {
        id: generateId(),
        user_id: 'local', // No user, stored locally
        category_id: categoryId,
        filename: filename,
        audio_url: audioBase64, // Store as base64 data URL
        raw_text: result.rawText || '',
        summarized_text: result.summarizedText || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Save to localStorage
      saveLocalRecording(recording)

      // Show complete briefly
      setSavingStep('complete')
      await new Promise(resolve => setTimeout(resolve, 500))

      // Success! Reset everything
      setAudioBlob(null)
      setRecordingTime(0)
      setShowModal(false)
      setSavingStep('idle')

      // Optional: Show success message
      alert('Recording saved successfully!')

    } catch (error) {
      console.error('Error saving recording:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
      setSavingStep('idle')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setAudioBlob(null)
    setRecordingTime(0)
  }

  const isRecording = recordingState === 'recording'
  const isPaused = recordingState === 'paused'
  const isActiveRecording = isRecording || isPaused
  const isRequestingPermission = recordingState === 'requesting-permission'

  return (
    <>
      <div className={styles.container}>
        {!isActiveRecording ? (
          <button
            className={styles.recordButton}
            onClick={startRecording}
            disabled={isRequestingPermission}
            aria-label="Start recording"
          >
            <Mic className={styles.icon} />
          </button>
        ) : (
          <div className={styles.recordingControls}>
            <button
              className={`${styles.controlButton} ${styles.pauseButton}`}
              onClick={isPaused ? resumeRecording : pauseRecording}
              aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
            >
              {isPaused ? (
                <Play className={styles.controlIcon} />
              ) : (
                <Pause className={styles.controlIcon} />
              )}
            </button>
            <button
              className={`${styles.controlButton} ${styles.stopButton}`}
              onClick={stopRecording}
              aria-label="Stop recording"
            >
              <Square className={styles.controlIcon} />
            </button>
          </div>
        )}

        {isActiveRecording && (
          <div className={styles.recordingInfo}>
            <span className={`${styles.recordingDot} ${isPaused ? styles.paused : ''}`} />
            <span className={styles.recordingTime}>
              {formatTime(recordingTime)}{hasSubscription === false && ' / 2:00'}
            </span>
            {isPaused && <span className={styles.pausedLabel}>Paused</span>}
          </div>
        )}

        {isRequestingPermission && (
          <p className={styles.hint}>Requesting microphone permission...</p>
        )}

        {!isActiveRecording && !isRequestingPermission && (
          <p className={styles.hint}>
            {hasSubscription === null
              ? 'Tap to start recording'
              : hasSubscription
                ? 'Tap to start recording'
                : 'Tap to start recording (2 min max)'}
          </p>
        )}

        {!isActiveRecording && !isRequestingPermission && hasSubscription === false && (
          <p className={styles.upgradeHint}>
            Want unlimited recording time?{' '}
            <Link href="/subscribe" className={styles.upgradeLink}>
              Subscribe here
            </Link>
          </p>
        )}
      </div>

      <SaveRecordingModal
        isOpen={showModal}
        audioBlob={audioBlob}
        recordingDuration={recordingTime}
        onClose={handleCloseModal}
        onSave={handleSaveRecording}
        isSaving={isSaving}
        savingStep={savingStep}
      />
    </>
  )
}
