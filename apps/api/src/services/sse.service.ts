import { config } from '../config.js'

export async function pushNotification(userId: string, notificationId: string): Promise<void> {
  try {
    const response = await fetch(`${config.sse.serviceUrl}/internal/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notificationId, secret: config.sse.internalPushSecret }),
      signal: AbortSignal.timeout(3_000),
    })
    if (!response.ok) console.warn(`[SSE] Push failed with status ${response.status}`)
  } catch (error) {
    console.warn('[SSE] Push unavailable', error instanceof Error ? error.message : error)
  }
}
