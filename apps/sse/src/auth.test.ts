import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { describe, expect, it } from 'vitest'
import { verifyTicket } from './auth'
import { config } from './config'

describe('verifyTicket', () => {
  it('accepts a valid ticket only once', () => {
    const ticket = jwt.sign({
      sub: 'user-1', type: 'sse_ticket', jti: crypto.randomUUID(),
    }, config.ticketSecret, { expiresIn: 60, issuer: 'bingbingbingo' })

    expect(verifyTicket(ticket)).toBe('user-1')
    expect(verifyTicket(ticket)).toBeNull()
  })
})
