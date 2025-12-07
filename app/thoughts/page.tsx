import { getUserRecordings } from '@/lib/recordings/actions'
import { getCategories } from '@/lib/categories/actions'
import { ThoughtsPageClient } from '@/components/thoughts/thoughts-page-client'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/actions'

export default async function ThoughtsPage() {
  const user = await getUser()

  if (!user) {
    redirect('/')
  }

  const { recordings } = await getUserRecordings()
  const categories = await getCategories()

  return <ThoughtsPageClient recordings={recordings} categories={categories} />
}
