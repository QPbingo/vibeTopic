import { config } from './config.js'

/**
 * Start heartbeat for an SSE connection.
 * Sends periodic :ping comments to keep the connection alive.
 */
export function startHeartbeat(onPing: () => void): NodeJS.Timeout {
  onPing()

  const timer = setInterval(() => {
    onPing()
  }, config.heartbeatInterval * 1000)

  return timer
}
