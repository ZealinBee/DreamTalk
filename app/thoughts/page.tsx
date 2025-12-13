import { getCategories } from '@/lib/categories/actions'
import { ThoughtsPageClient } from '@/components/thoughts/thoughts-page-client'

export default function ThoughtsPage() {
  const categories = getCategories()

  // Pass empty recordings - client will load from localStorage
  return <ThoughtsPageClient recordings={[]} categories={categories} />
}
