import type { Category } from '@/types/recording'

// Default categories for local storage
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

/**
 * Returns default categories
 * No longer requires authentication
 */
export function getCategories(): Category[] {
  return DEFAULT_CATEGORIES
}
