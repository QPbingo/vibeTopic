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
  const generationRef = useRef(0)

  useEffect(() => {
    if (!enabled || !getAccessToken()) return

    const generation = ++generationRef.current
    let cancelled = false

    async function connect() {
      if (cancelled || generation !== generationRef.current) return
      try {
        const ticketRes = await api.post<{ ticket: string; sseUrl: string }>('/sse/token')
        if (!ticketRes.data || cancelled || generation !== generationRef.current) return

        const { ticket, sseUrl } = ticketRes.data
        const url = `${sseUrl}/sse/notifications?ticket=${encodeURIComponent(ticket)}`

        const es = new EventSource(url)
        eventSourceRef.current = es

        es.onopen = () => {
          if (generation === generationRef.current) setIsConnected(true)
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
          if (generation !== generationRef.current) {
            es.close()
            return
          }
          setIsConnected(false)
          es.close()
          if (!cancelled && generation === generationRef.current) {
            reconnectTimerRef.current = setTimeout(connect, 5000)
          }
        }
      } catch {
        if (!cancelled && generation === generationRef.current) {
          reconnectTimerRef.current = setTimeout(connect, 5000)
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      generationRef.current++
      eventSourceRef.current?.close()
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    }
  }, [enabled, onNotification])

  return { isConnected }
}
