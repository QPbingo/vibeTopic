'use client'

import { useEffect, useRef, useState } from 'react'
import { api, getAccessToken } from '@/lib/api'

interface UseSSEOptions {
  enabled?: boolean
  onNotification?: (data: { notificationId: string }) => void
}

export function useSSE({ enabled = false, onNotification }: UseSSEOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!enabled || !getAccessToken()) return

    async function connect() {
      try {
        // Get SSE ticket
        const ticketRes = await api.post<{ ticket: string; sseUrl: string }>('/sse/token')
        if (!ticketRes.data) return

        const { ticket, sseUrl } = ticketRes.data
        const url = `${sseUrl}/sse/notifications?ticket=${encodeURIComponent(ticket)}`

        const es = new EventSource(url)
        eventSourceRef.current = es

        es.onopen = () => {
          setIsConnected(true)
        }

        es.addEventListener('notification', (e) => {
          try {
            const data = JSON.parse(e.data)
            onNotification?.(data)
          } catch {
            // ignore parse errors
          }
        })

        es.onerror = () => {
          setIsConnected(false)
          es.close()
          // Reconnect after 5s
          reconnectTimerRef.current = setTimeout(connect, 5000)
        }
      } catch {
        // Retry after 5s
        reconnectTimerRef.current = setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      eventSourceRef.current?.close()
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    }
  }, [enabled, onNotification])

  return { isConnected }
}
