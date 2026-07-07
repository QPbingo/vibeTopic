'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      const nextPath = new URLSearchParams(globalThis.location.search).get('next')
      router.push(nextPath?.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 20px' }}>
      <div className="pixel-card">
        <h1 style={{
          fontFamily: 'Zpix, Space Grotesk, monospace', fontSize: 20, fontWeight: 700,
          color: 'var(--cyan)', marginBottom: 24, textAlign: 'center',
        }}>
          ▸ 登录
        </h1>

        {error && (
          <div style={{ padding: 12, marginBottom: 16, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', fontSize: 13, color: 'var(--pink)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="auth-input"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="pixel-btn"
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--muted-text)' }}>
          <Link href="/forgot-password" style={{ color: 'var(--cyan)' }}>
            忘记密码？
          </Link>
        </div>

        <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: 'var(--muted-text)' }}>
          还没有账号？
          <Link href="/register" style={{ color: 'var(--cyan)', marginLeft: 4 }}>
            立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}
