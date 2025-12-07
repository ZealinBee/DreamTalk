'use server'

/**
 * Summarize text using OpenAI API
 * @param text - The text to summarize
 * @returns The bullet point summary
 */
export async function summarizeText(text: string): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error('OpenAI API key not found')
      throw new Error('OpenAI API key not configured')
    }

    if (!text || text.trim().length === 0) {
      return ''
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Smallest and cheapest GPT-4 model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise bullet point summaries.'
          },
          {
            role: 'user',
            content: `Make the following text into a bullet point summary:\n\n${text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    // Extract the summary from the response
    const summary = result.choices?.[0]?.message?.content || ''
    return summary.trim()
  } catch (error) {
    console.error('Error summarizing text:', error)
    throw error
  }
}
