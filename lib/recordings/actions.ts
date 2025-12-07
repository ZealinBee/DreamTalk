'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

    // Insert recording metadata into database
    const { data: recording, error: dbError } = await supabase
      .from('recordings')
      .insert({
        user_id: user.id,
        category_id: categoryId,
        filename: filename,
        audio_url: publicUrl,
        raw_text: '', // Placeholder for future transcription
        summarized_text: '' // Placeholder for future summarization
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
