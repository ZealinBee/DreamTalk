'use client'

import { signOut } from '@/lib/auth/actions'
import { User } from '@/types/user'
import Image from 'next/image'
import styles from './user-profile.module.css'

interface UserProfileProps {
  user: User
}

export function UserProfile({ user }: UserProfileProps) {
  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className={styles.container}>
      {user.avatar_url && (
        <Image
          src={user.avatar_url}
          alt={user.full_name || 'User avatar'}
          width={48}
          height={48}
          className={styles.avatar}
        />
      )}
      <div className={styles.info}>
        <p className={styles.name}>
          {user.full_name || 'Anonymous User'}
        </p>
        <p className={styles.email}>{user.email}</p>
      </div>
      <button
        onClick={handleSignOut}
        className={styles.signOutButton}
      >
        Sign Out
      </button>
    </div>
  )
}
