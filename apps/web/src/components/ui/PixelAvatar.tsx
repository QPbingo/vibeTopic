'use client'

import { useState } from 'react'

interface PixelAvatarProps {
  username: string
  avatarUrl?: string | null
  size?: number
  className?: string
}

const AVATAR_COLORS = [
  'linear-gradient(135deg, #06B6D4, #0891B2)',
  'linear-gradient(135deg, #A855F7, #7C3AED)',
  'linear-gradient(135deg, #F43F5E, #E11D48)',
  'linear-gradient(135deg, #10B981, #059669)',
  'linear-gradient(135deg, #EAB308, #CA8A04)',
]

function getColorForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}

export function PixelAvatar({ username, avatarUrl, size = 44, className = '' }: PixelAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const initial = username.charAt(0).toUpperCase()

  if (avatarUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- plain <img> for uploaded avatars
      <img
        src={avatarUrl}
        alt={`${username} 的头像`}
        width={size}
        height={size}
        className={`avatar-block ${className}`}
        style={{ objectFit: 'cover' }}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`avatar-block ${className}`}
      style={{
        width: size,
        height: size,
        background: getColorForName(username),
        fontSize: size * 0.36,
      }}
      aria-label={`${username} 的头像`}
    >
      {initial}
    </div>
  )
}
