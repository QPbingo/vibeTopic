import type { ApiResponse } from '@bingo/shared'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'

// Access token stored in module-level variable (not localStorage, not accessible to XSS)
let accessToken: string | null = null

// Mutex for refresh token — prevents concurrent refresh attempts
let refreshPromise: Promise<boolean> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export class ApiError extends Error {
  code: number
  status: number

  constructor(code: number, message: string, status: number) {
    super(message)
    this.code = code
    this.status = status
    this.name = 'ApiError'
  }
}

async function refreshAccessToken(): Promise<boolean> {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) return false
      const json: ApiResponse<{ accessToken: string; expiresIn: number }> = await res.json()
      if (json.code === 0 && json.data) {
        setAccessToken(json.data.accessToken)
        return true
      }
      return false
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  // If 401, try refreshing token
  if (res.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`
      res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })
    }
  }

  const json: ApiResponse<T> = await res.json()

  if (json.code !== 0) {
    throw new ApiError(json.code, json.message || 'Unknown error', res.status)
  }

  return json
}

// Convenience methods
export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
}
