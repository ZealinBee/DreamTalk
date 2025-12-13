import type { Metadata } from "next";
import { getCategories } from '@/lib/categories/actions'
import { getUser } from '@/lib/auth/actions'
import { ThoughtsPageClient } from '@/components/thoughts/thoughts-page-client'

export const metadata: Metadata = {
  title: "Your Dreams",
  description:
    "Browse and revisit your recorded dreams. Search, filter, and explore your dream journal entries.",
  openGraph: {
    title: "Your Dreams | WakeAndTalk",
    description:
      "Browse and revisit your recorded dreams. Search, filter, and explore your dream journal entries.",
  },
};

export default async function ThoughtsPage() {
  const categories = getCategories()
  const user = await getUser()

  // Pass empty recordings - client will load from localStorage
  return <ThoughtsPageClient recordings={[]} categories={categories} user={user} />
}
