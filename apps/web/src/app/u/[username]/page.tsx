'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { PixelAvatar } from '@/components/ui/PixelAvatar'
import { PixelButton } from '@/components/ui/PixelButton'
import type { UserProfile } from '@bingo/shared'

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { isAuthenticated, user: currentUser } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        // Try to find user by username (search all users)
        const res = await api.get<UserProfile>(`/users/${username}`)
        if (res.data) {
          setProfile(res.data)
          setIsFollowing(res.data.isFollowing || false)
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [username])

  const [followError, setFollowError] = useState('')
  
  const handleFollow = async () => {
    if (!profile || !isAuthenticated) return
    setFollowError('')
    try {
      if (isFollowing) {
        await api.delete(`/follows/${profile.id}`)
        setIsFollowing(false)
        setProfile(prev => prev ? { ...prev, followerCount: Math.max(0, prev.followerCount - 1) } : prev)
      } else {
        await api.post('/follows', { targetUserId: profile.id })
        setIsFollowing(true)
        setProfile(prev => prev ? { ...prev, followerCount: prev.followerCount + 1 } : prev)
      }
    } catch {
      setFollowError('操作失败，请重试')
    }
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 20px' }}>
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
        <div style={{ color: 'var(--muted-text)' }}>用户不存在</div>
      </div>
    )
  }

  const isSelf = currentUser?.id === profile.id

  return (
    <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 20px' }}>
      <div className="pixel-card" style={{ textAlign: 'center' }}>
        <PixelAvatar username={profile.username} avatarUrl={profile.avatarUrl} size={80} />
        <h1 style={{
          fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700,
          marginTop: 12, color: 'var(--color)',
        }}>
          {profile.username}
        </h1>

        {profile.bio && (
          <p style={{ color: 'var(--muted-text)', fontSize: 14, marginTop: 8 }}>{profile.bio}</p>
        )}

        <div style={{
          display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16,
          fontFamily: 'Zpix, monospace', fontSize: 13, color: 'var(--muted-text)',
        }}>
          <span>帖子 {profile.postCount}</span>
          <span>关注 {profile.followingCount}</span>
          <span>粉丝 {profile.followerCount}</span>
          <span>作品 {profile.projectCount}</span>
        </div>

        {followError && (
          <div style={{ color: 'var(--pink)', fontSize: 12, marginTop: 8 }}>{followError}</div>
        )}
        {!isSelf && isAuthenticated && (
          <div style={{ marginTop: 16 }}>
            <PixelButton
              variant={isFollowing ? 'subtle' : 'accent'}
              onClick={handleFollow}
            >
              {isFollowing ? '已关注' : '+ 关注'}
            </PixelButton>
          </div>
        )}

        {isSelf && (
          <div style={{ marginTop: 16 }}>
            <PixelButton variant="subtle" href="/settings/profile">
              编辑资料
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  )
}
