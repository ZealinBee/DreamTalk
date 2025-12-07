'use server'

import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types/recording'

/**
 * Fetches all categories available to the current user
 * Includes default categories (user_id IS NULL) and user's own categories
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}
