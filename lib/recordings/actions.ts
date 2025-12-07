'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { transcribeAudio } from '@/lib/transcription/elevenlabs'
import { summarizeText } from '@/lib/summarization/openai'

interface SaveRecordingParams {
  audioFile: File
  filename: string
  categoryId: string | null
}

export async function saveRecording({ audioFile, filename, categoryId }: SaveRecordingParams) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to save recordings'
      }
    }

    // Generate a unique file path: userId/timestamp-filename.webm
    const timestamp = Date.now()
    const fileExtension = audioFile.name.split('.').pop() || 'webm'
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '_')
    const filePath = `${user.id}/${timestamp}-${sanitizedFilename}.${fileExtension}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('audio')
      .upload(filePath, audioFile, {
        contentType: audioFile.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return {
        success: false,
        error: 'Failed to upload audio file. Please try again.'
      }
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('audio')
      .getPublicUrl(filePath)

    // Transcribe audio using Eleven Labs
    let rawText = ''
    let summarizedText = ''
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
      // Continue saving the recording even if transcription fails
      // The raw_text will be empty but the audio file is still saved
    }

    // Insert recording metadata into database
    const { data: recording, error: dbError } = await supabase
      .from('recordings')
      .insert({
        user_id: user.id,
        category_id: categoryId,
        filename: filename,
        audio_url: publicUrl,
        raw_text: rawText, // Transcribed text from Eleven Labs
        summarized_text: summarizedText // AI-generated bullet point summary
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)

      // Try to delete the uploaded file if database insert fails
      await supabase.storage.from('audio').remove([filePath])

      return {
        success: false,
        error: 'Failed to save recording to database. Please try again.'
      }
    }

    // Revalidate any pages that might display recordings
    revalidatePath('/')

    return {
      success: true,
      recording
    }

  } catch (error) {
    console.error('Unexpected error saving recording:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function getUserRecordings() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to view recordings',
        recordings: []
      }
    }

    // Fetch all recordings for this user, ordered by creation date (newest first)
    const { data: recordings, error: dbError } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
      return {
        success: false,
        error: 'Failed to fetch recordings',
        recordings: []
      }
    }

    return {
      success: true,
      recordings: recordings || []
    }

  } catch (error) {
    console.error('Unexpected error fetching recordings:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
      recordings: []
    }
  }
}
