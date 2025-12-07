'use server'

/**
 * Transcribe audio using Eleven Labs Speech-to-Text API
 * @param audioFile - The audio file to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      console.error('Eleven Labs API key not found')
      throw new Error('Eleven Labs API key not configured')
    }

    // Create form data for the API request
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model_id', 'scribe_v2')

    // Eleven Labs Speech-to-Text API endpoint
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Eleven Labs API error:', errorText)
      throw new Error(`Eleven Labs API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    // The API returns the transcription in the 'text' field
    return result.text || ''
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw error
  }
}
