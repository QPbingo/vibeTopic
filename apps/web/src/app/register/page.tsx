'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('密码至少需要 8 个字符')
      return
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('密码必须包含字母和数字')
      return
    }

    setIsLoading(true)
    try {
      await register(username, email, password)
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败')
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
          ▸ 注册
        </h1>

        {error && (
          <div style={{ padding: 12, marginBottom: 16, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', fontSize: 13, color: 'var(--pink)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="auth-input"
            placeholder="用户名（3-30字符，字母数字下划线）"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
          />
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
            placeholder="密码（至少8位，包含字母和数字）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <button
            type="submit"
            className="pixel-btn pixel-btn-accent"
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--muted-text)' }}>
          已有账号？
          <Link href="/login" style={{ color: 'var(--cyan)', marginLeft: 4 }}>
            立即登录
          </Link>
        </div>
      </div>
    </div>
  )
}
