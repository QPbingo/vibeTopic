import type { Response } from 'express'
import { config } from './config.js'

/**
 * Connection pool: Map<userId, Set<Response>>
 * Each user can have multiple connections (different devices/tabs).
 */
interface ConnectionLimits {
  maxConnections: number
  maxConnectionsPerUser: number
}

export class ConnectionPool {
  private connections = new Map<string, Set<Response>>()

  constructor(private readonly limits: ConnectionLimits) {}

  /** Add a connection for a user. Returns false if limits exceeded. */
  add(userId: string, res: Response): boolean {
    if (this.totalConnections >= this.limits.maxConnections) {
      return false
    }

    let userConns = this.connections.get(userId)
    if (!userConns) {
      userConns = new Set()
      this.connections.set(userId, userConns)
    }

    if (userConns.size >= this.limits.maxConnectionsPerUser) {
      return false
    }

    userConns.add(res)
    return true
  }

  /** Remove a connection */
  remove(userId: string, res: Response): void {
    const userConns = this.connections.get(userId)
    if (!userConns) return
    userConns.delete(res)
    if (userConns.size === 0) {
      this.connections.delete(userId)
    }
  }

  /** Send event to all connections of a user */
  sendToUser(userId: string, event: string, data: string, id?: string): void {
    const userConns = this.connections.get(userId)
    if (!userConns) return
    for (const res of userConns) {
      if (!res.writable || res.destroyed) {
        this.remove(userId, res)
        continue
      }
      try {
        if (id) res.write(`id: ${id}\n`)
        res.write(`event: ${event}\n`)
        res.write(`data: ${data}\n\n`)
      } catch {
        this.remove(userId, res)
      }
    }
  }

  get totalConnections(): number {
    let count = 0
    for (const conns of this.connections.values()) {
      count += conns.size
    }
    return count
  }

  get onlineUsers(): number {
    return this.connections.size
  }
}

export const pool = new ConnectionPool({
  maxConnections: config.maxConnections,
  maxConnectionsPerUser: config.maxConnectionsPerUser,
})
