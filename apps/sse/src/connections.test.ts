import type { Response } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { ConnectionPool } from './connections'

function response() {
  return { write: vi.fn(), writable: true, destroyed: false } as unknown as Response
}

describe('ConnectionPool', () => {
  it('enforces global and per-user limits before accepting a response', () => {
    const pool = new ConnectionPool({ maxConnections: 2, maxConnectionsPerUser: 1 })
    const first = response()
    const second = response()

    expect(pool.add('user-1', first)).toBe(true)
    expect(pool.add('user-1', second)).toBe(false)
    expect(pool.add('user-2', second)).toBe(true)
    expect(pool.add('user-3', response())).toBe(false)
  })

  it('writes an SSE id with each notification event', () => {
    const pool = new ConnectionPool({ maxConnections: 2, maxConnectionsPerUser: 2 })
    const res = response()
    pool.add('user-1', res)

    pool.sendToUser('user-1', 'notification', '{"ok":true}', 'notification-1')

    expect(res.write).toHaveBeenCalledWith('id: notification-1\n')
  })
})
