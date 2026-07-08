'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import type { Project } from '@bingo/shared'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { PixelAvatar } from '@/components/ui/PixelAvatar'
import { PixelButton } from '@/components/ui/PixelButton'
import { PostCard } from '@/components/feed/PostCard'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import type { UserProfile, PostCard as PostCardType, PaginatedResponse } from '@bingo/shared'

type ProfileTab = 'posts' | 'projects'

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { isAuthenticated, user: currentUser } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [tab, setTab] = useState<ProfileTab>('posts')

  useEffect(() => {
    async function load() {
      try {
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

  const joinedDate = profile ? new Date(profile.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long',
  }) : ''

  if (isLoading) {
    return (
      <div className="page-layout" style={{ marginTop: 24 }}>
        <div style={{ flex: 1, maxWidth: 800 }}>
          <div className="skeleton" style={{ height: 200, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 300 }} />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page-layout" style={{ marginTop: 24 }}>
        <div style={{ flex: 1, maxWidth: 800, textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
          <div style={{ color: 'var(--muted-text)' }}>用户不存在</div>
        </div>
      </div>
    )
  }

  const isSelf = currentUser?.id === profile.id

  return (
    <div className="page-layout" style={{ marginTop: 24 }}>
      <div style={{ flex: 1, minWidth: 0, maxWidth: 800 }}>
        {/* Profile Header */}
        <div className="pixel-card" style={{ marginBottom: 24 }}>
          <div className="profile-header" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <PixelAvatar username={profile.username} avatarUrl={profile.avatarUrl} size={80} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 className="profile-username" style={{
                fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 700,
                color: 'var(--color)', marginBottom: 4,
              }}>
                {profile.username}
              </h1>
              {profile.bio && (
                <p className="profile-bio" style={{ color: 'var(--muted-text)', fontSize: 14, marginBottom: 8 }}>{profile.bio}</p>
              )}
              <p className="profile-joined" style={{ color: 'var(--muted-text)', fontSize: 12, fontFamily: 'Zpix, monospace' }}>
                加入于 {joinedDate}
              </p>

              <div className="profile-stats" style={{
                display: 'flex', gap: 20, marginTop: 14,
                fontFamily: 'Zpix, monospace', fontSize: 13, color: 'var(--muted-text)',
              }}>
                <span><strong style={{ color: 'var(--color)' }}>{profile.postCount}</strong> 帖子</span>
                <span><strong style={{ color: 'var(--color)' }}>{profile.followingCount}</strong> 关注</span>
                <span><strong style={{ color: 'var(--color)' }}>{profile.followerCount}</strong> 粉丝</span>
                <span><strong style={{ color: 'var(--color)' }}>{profile.projectCount}</strong> 作品</span>
              </div>
            </div>

            <div className="profile-actions" style={{ flexShrink: 0 }}>
              {!isSelf && isAuthenticated && (
                <PixelButton variant={isFollowing ? 'subtle' : 'accent'} onClick={handleFollow}>
                  {isFollowing ? '已关注' : '+ 关注'}
                </PixelButton>
              )}
              {isSelf && (
                <PixelButton variant="subtle" href="/settings/profile">
                  编辑资料
                </PixelButton>
              )}
            </div>
          </div>
          {followError && (
            <div style={{ color: 'var(--pink)', fontSize: 12, marginTop: 12 }}>{followError}</div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          <button
            className={`tab ${tab === 'posts' ? 'active' : ''}`}
            onClick={() => setTab('posts')}
          >
            ■ 帖子
          </button>
          <button
            className={`tab ${tab === 'projects' ? 'active' : ''}`}
            onClick={() => setTab('projects')}
          >
            ◆ 作品
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'posts' && (
          <UserPostsTab userId={profile.id} />
        )}
        {tab === 'projects' && (
          <UserProjectsTab userId={profile.id} />
        )}
      </div>
    </div>
  )
}

function UserPostsTab({ userId }: { userId: string }) {
  const fetchPosts = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams()
    if (cursor) params.set('cursor', cursor)
    params.set('limit', '20')
    // userId could be username or UUID — API handles both
    const res = await api.get<PaginatedResponse<PostCardType>>(`/users/${userId}/posts?${params.toString()}`)
    return res.data ?? { items: [], cursor: null, hasMore: false }
  }, [userId])

  const { items, isLoading, hasMore, error, loaderRef } = useInfiniteScroll<PostCardType>({
    fetchFn: fetchPosts,
    enabled: true,
  })

  if (isLoading && items.length === 0) {
    return (
      <div>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, marginBottom: 16 }} />
        ))}
      </div>
    )
  }

  if (items.length === 0 && !error) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted-text)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
        <div style={{ fontSize: 16, fontFamily: 'Zpix, monospace' }}>该用户还没有发布帖子</div>
      </div>
    )
  }

  return (
    <div className="post-feed">
      {items.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      {error && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--pink)', fontSize: 13 }}>
          加载失败，请刷新页面重试
        </div>
      )}
      {hasMore && <div ref={loaderRef} style={{ height: 1 }} />}
      {!hasMore && items.length > 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted-text)', fontSize: 12 }}>
          — 已经到底了 —
        </div>
      )}
    </div>
  )
}

function UserProjectsTab({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<Project[]>(`/users/${userId}/projects`)
        if (res.data) setProjects(res.data)
      } catch {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  if (isLoading) {
    return <div className="skeleton" style={{ height: 120 }} />
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--pink)', fontSize: 13 }}>
        加载失败，请刷新重试
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted-text)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
        <div style={{ fontSize: 16, fontFamily: 'Zpix, monospace' }}>该用户还没有添加作品</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {projects.map(project => (
        <div key={project.id} className="pixel-card">
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--color)', marginBottom: 8 }}>
            {project.title}
          </h3>
          {project.description && (
            <p style={{ fontSize: 14, color: 'var(--muted-text)', marginBottom: 8 }}>{project.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}
