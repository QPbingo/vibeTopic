import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from './index'

describe('API shell', () => {
  it('serves health without touching the database', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
  })

  it('returns the documented error for malformed JSON', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ code: 10006, data: null, message: '请求体格式错误' })
  })
})
