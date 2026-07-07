'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { PixelButton } from '@/components/ui/PixelButton'

export const dynamic = 'force-dynamic'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setBio(user.bio || '')
    }
  }, [user])

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace('/login')
  }, [isAuthLoading, isAuthenticated, router])

  if (isAuthLoading || !isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      await api.patch('/users/me', { username, bio })
      setMessage('保存成功！')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : '保存失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '24px auto', padding: '0 20px' }}>
      <div className="pixel-card">
        <h1 style={{
          fontFamily: 'Zpix, monospace', fontSize: 16, fontWeight: 600,
          color: 'var(--cyan)', marginBottom: 20,
        }}>
          ▸ 编辑资料
        </h1>

        {message && (
          <div style={{
            padding: 12, marginBottom: 16, fontSize: 13,
            background: message.includes('成功') ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
            border: `1px solid ${message.includes('成功') ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
            color: message.includes('成功') ? 'var(--green)' : 'var(--pink)',
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, color: 'var(--muted-text)', display: 'block', marginBottom: 4 }}>
            用户名
          </label>
          <input
            type="text"
            className="auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={30}
          />

          <label style={{ fontSize: 13, color: 'var(--muted-text)', display: 'block', marginBottom: 4 }}>
            个人简介
          </label>
          <textarea
            className="auth-input"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            style={{ resize: 'vertical' }}
          />

          <PixelButton type="submit" variant="accent" disabled={isLoading}>
            {isLoading ? '保存中...' : '保存'}
          </PixelButton>
        </form>
      </div>
    </div>
  )
}
