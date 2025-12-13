import { getCategories } from '@/lib/categories/actions'
import { getUser } from '@/lib/auth/actions'
import { ThoughtsPageClient } from '@/components/thoughts/thoughts-page-client'

export default async function ThoughtsPage() {
  const categories = getCategories()
  const user = await getUser()

  // Pass empty recordings - client will load from localStorage
  return <ThoughtsPageClient recordings={[]} categories={categories} user={user} />
}
