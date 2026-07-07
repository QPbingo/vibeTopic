import jwt from 'jsonwebtoken'
import { config } from './config.js'

interface TicketPayload {
  sub: string
  type: string
  jti: string
  iat: number
  exp: number
  iss: string
}

const consumedTickets = new Map<string, number>()

/**
 * Verify SSE ticket from query parameter.
 * Returns userId if valid, null otherwise.
 */
export function verifyTicket(ticket: string): string | null {
  try {
    const payload = jwt.verify(ticket, config.ticketSecret, {
      issuer: config.ticketIssuer,
    }) as TicketPayload

    if (payload.type !== 'sse_ticket' || !payload.jti || consumedTickets.has(payload.jti)) {
      return null
    }

    const now = Math.floor(Date.now() / 1000)
    for (const [jti, expiresAt] of consumedTickets) {
      if (expiresAt <= now) consumedTickets.delete(jti)
    }
    consumedTickets.set(payload.jti, payload.exp)

    return payload.sub
  } catch {
    return null
  }
}
