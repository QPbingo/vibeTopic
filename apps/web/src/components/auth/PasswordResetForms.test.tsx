// @vitest-environment jsdom
import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ForgotPasswordForm, ResetPasswordForm } from './PasswordResetForms'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  apiPost: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('../../lib/api', () => ({
  api: { post: mocks.apiPost },
}))

describe('password reset forms', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  beforeEach(() => {
    mocks.push.mockReset()
    mocks.apiPost.mockReset()
  })

  it('requests a reset link and renders the local debug reset link', async () => {
    mocks.apiPost.mockResolvedValue({ data: { resetToken: 'dev-token' } })

    render(<ForgotPasswordForm />)

    fireEvent.change(screen.getByLabelText('注册邮箱'), { target: { value: 'me@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: '发送重置链接' }))

    await waitFor(() => {
      expect(mocks.apiPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'me@example.com' })
    })
    expect(screen.getByRole('link', { name: '打开重置密码页面' }).getAttribute('href')).toBe('/reset-password?token=dev-token')
  })

  it('resets the password and returns to login', async () => {
    vi.useFakeTimers()
    mocks.apiPost.mockResolvedValue({ data: null })

    render(<ResetPasswordForm token="dev-token" />)

    fireEvent.change(screen.getByLabelText('新密码'), { target: { value: 'newPass123' } })
    fireEvent.click(screen.getByRole('button', { name: '重置密码' }))

    // Advance timers to flush the async API call and state updates
    await act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mocks.apiPost).toHaveBeenCalledWith('/auth/reset-password', { token: 'dev-token', password: 'newPass123' })

    // Advance 1500ms for the redirect setTimeout
    await act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(mocks.push).toHaveBeenCalledWith('/login')
    vi.useRealTimers()
  })
})
