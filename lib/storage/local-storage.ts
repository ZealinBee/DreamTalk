import type { Recording, Category } from '@/types/recording'

const RECORDINGS_KEY = 'dreamtalk_recordings'
const CATEGORIES_KEY = 'dreamtalk_categories'

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'default-sleep',
    name: 'sleep',
    user_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'default-shower',
    name: 'shower',
    user_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export function getLocalRecordings(): Recording[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(RECORDINGS_KEY)
    if (!data) return []
    return JSON.parse(data) as Recording[]
  } catch (error) {
    console.error('Error reading recordings from localStorage:', error)
    return []
  }
}

export function saveLocalRecording(recording: Recording): void {
  if (typeof window === 'undefined') return

  try {
    const recordings = getLocalRecordings()
    recordings.unshift(recording) // Add to beginning (newest first)
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings))
  } catch (error) {
    console.error('Error saving recording to localStorage:', error)
    throw error
  }
}

export function deleteLocalRecording(recordingId: string): void {
  if (typeof window === 'undefined') return

  try {
    const recordings = getLocalRecordings()
    const filtered = recordings.filter(r => r.id !== recordingId)
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting recording from localStorage:', error)
    throw error
  }
}

export function getLocalCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES

  try {
    const data = localStorage.getItem(CATEGORIES_KEY)
    if (!data) {
      // Initialize with default categories
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES))
      return DEFAULT_CATEGORIES
    }
    return JSON.parse(data) as Category[]
  } catch (error) {
    console.error('Error reading categories from localStorage:', error)
    return DEFAULT_CATEGORIES
  }
}

export function saveLocalCategory(category: Category): void {
  if (typeof window === 'undefined') return

  try {
    const categories = getLocalCategories()
    categories.push(category)
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
  } catch (error) {
    console.error('Error saving category to localStorage:', error)
    throw error
  }
}

// Convert blob to base64 for storage
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Convert base64 back to blob
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'audio/webm'
  const bstr = atob(parts[1])
  const n = bstr.length
  const u8arr = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }

  return new Blob([u8arr], { type: mime })
}

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}
