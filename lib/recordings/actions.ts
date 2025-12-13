'use server'

import { transcribeAudio } from '@/lib/transcription/elevenlabs'
import { summarizeText } from '@/lib/summarization/openai'

interface ProcessRecordingParams {
  audioFile: File
}

/**
 * Server action to transcribe and summarize audio
 * Does not require authentication - processes audio and returns text
 */
export async function processRecording({ audioFile }: ProcessRecordingParams) {
  try {
    let rawText = ''
    let summarizedText = ''

    // Transcribe audio using Eleven Labs
    try {
      rawText = await transcribeAudio(audioFile)
      console.log('Transcription completed:', rawText.substring(0, 100) + '...')

      // Summarize the transcribed text using OpenAI
      if (rawText) {
        try {
          summarizedText = await summarizeText(rawText)
          console.log('Summarization completed:', summarizedText.substring(0, 100) + '...')
        } catch (summarizationError) {
          console.error('Summarization failed:', summarizationError)
          // Continue even if summarization fails
        }
      }
    } catch (transcriptionError) {
      console.error('Transcription failed:', transcriptionError)
      // Continue even if transcription fails
    }

    return {
      success: true,
      rawText,
      summarizedText
    }

  } catch (error) {
    console.error('Unexpected error processing recording:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      rawText: '',
      summarizedText: ''
    }
  }
}
