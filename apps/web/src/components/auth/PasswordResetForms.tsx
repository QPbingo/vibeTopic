'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '../../lib/api'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setResetToken('')
    setIsLoading(true)
    try {
      const response = await api.post<{ resetToken?: string }>('/auth/forgot-password', { email })
      setResetToken(response.data?.resetToken ?? '')
      setMessage(response.data?.resetToken ? '本地开发模式已生成重置链接。' : '如果邮件服务已配置，重置链接会发送到你的邮箱。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pixel-card">
      <h1 className="auth-title">▸ 忘记密码</h1>
      {error && <div className="auth-alert" role="alert">{error}</div>}
      {message && <div className="auth-alert auth-alert-success">{message}</div>}
      {resetToken && (
        <div style={{ marginBottom: 16, fontSize: 13 }}>
          <Link href={`/reset-password?token=${encodeURIComponent(resetToken)}`} style={{ color: 'var(--cyan)' }}>
            打开重置密码页面
          </Link>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="forgot-email">注册邮箱</label>
        <input
          id="forgot-email"
          aria-label="注册邮箱"
          type="email"
          className="auth-input"
          placeholder="注册邮箱"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          required
        />
        <button className="pixel-btn" type="submit" disabled={isLoading} style={{ width: '100%' }}>
          {isLoading ? '发送中...' : '发送重置链接'}
        </button>
      </form>
    </div>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!token) { setError('重置链接缺少 token'); return }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('密码必须包含字母和数字')
      return
    }
    setIsLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : '重置失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pixel-card">
      <h1 className="auth-title">▸ 重置密码</h1>
      {error && <div className="auth-alert" role="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="reset-password">新密码</label>
        <input
          id="reset-password"
          aria-label="新密码"
          type="password"
          className="auth-input"
          placeholder="新密码（至少8位，包含字母和数字）"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          required
          minLength={8}
        />
        <button className="pixel-btn pixel-btn-accent" type="submit" disabled={isLoading || !token} style={{ width: '100%' }}>
          {isLoading ? '重置中...' : '重置密码'}
        </button>
      </form>
    </div>
  )
}
