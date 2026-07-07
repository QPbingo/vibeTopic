import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authServiceMock = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}))

vi.mock('../services/auth.service.js', () => ({ authService: authServiceMock }))

import { authRouter } from './auth.routes'

function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/auth', authRouter)
  return app
}

describe('auth password reset routes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('requests a password reset token', async () => {
    authServiceMock.requestPasswordReset.mockResolvedValue({
      success: true,
      data: { resetToken: 'dev-token' },
    })

    const response = await request(createApp())
      .post('/auth/forgot-password')
      .send({ email: 'me@example.com' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ code: 0, data: { resetToken: 'dev-token' }, message: 'ok' })
    expect(authServiceMock.requestPasswordReset).toHaveBeenCalledWith('me@example.com')
  })

  it('resets a password from a token', async () => {
    authServiceMock.resetPassword.mockResolvedValue({ success: true, data: null })

    const response = await request(createApp())
      .post('/auth/reset-password')
      .send({ token: 'dev-token', password: 'newPass123' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ code: 0, data: null, message: 'ok' })
    expect(authServiceMock.resetPassword).toHaveBeenCalledWith('dev-token', 'newPass123')
  })
})
