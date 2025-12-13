'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Mic, Square } from 'lucide-react'
import styles from './recording-button.module.css'
import { SaveRecordingModal } from './save-recording-modal'
import { processRecording } from '@/lib/recordings/actions'
import { saveLocalRecording, blobToBase64, generateId } from '@/lib/storage/local-storage'
import { getUserSubscription } from '@/lib/stripe/actions'
import type { Recording } from '@/types/recording'

type RecordingState = 'idle' | 'requesting-permission' | 'recording'

export function RecordingButton() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isSaving, setIsSaving] = useState(false)
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
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

    try {
      // Convert Blob to File for transcription
      const audioFile = new File([audioBlob], `${filename}.webm`, { type: 'audio/webm' })

      // Call server action to transcribe and summarize
      const result = await processRecording({ audioFile })

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

      // Success! Reset everything
      setAudioBlob(null)
      setRecordingTime(0)
      setShowModal(false)

      // Optional: Show success message
      alert('Recording saved successfully!')

    } catch (error) {
      console.error('Error saving recording:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setAudioBlob(null)
    setRecordingTime(0)
  }

  const isRecording = recordingState === 'recording'
  const isRequestingPermission = recordingState === 'requesting-permission'

  return (
    <>
      <div className={styles.container}>
        <button
          className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isRequestingPermission}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <Square className={styles.icon} />
          ) : (
            <Mic className={styles.icon} />
          )}
        </button>

        {isRecording && (
          <div className={styles.recordingInfo}>
            <span className={styles.recordingDot} />
            <span className={styles.recordingTime}>
              {formatTime(recordingTime)}{hasSubscription === false && ' / 2:00'}
            </span>
          </div>
        )}

        {isRequestingPermission && (
          <p className={styles.hint}>Requesting microphone permission...</p>
        )}

        {!isRecording && !isRequestingPermission && (
          <p className={styles.hint}>
            {hasSubscription === null
              ? 'Tap to start recording'
              : hasSubscription
                ? 'Tap to start recording'
                : 'Tap to start recording (2 min max)'}
          </p>
        )}

        {!isRecording && !isRequestingPermission && hasSubscription === false && (
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
      />
    </>
  )
}
