'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, setAccessToken } from './api'
import type { ApiResponse } from '@bingo/shared'

interface User {
  id: string
  username: string
  email?: string
  avatarUrl: string | null
  bio: string | null
  role: string
  createdAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshMe: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Try to refresh token on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
          { method: 'POST', credentials: 'include' },
        )
        const json: ApiResponse<{ accessToken: string }> = await res.json()
        if (json.code === 0 && json.data) {
          setAccessToken(json.data.accessToken)
          // Fetch user profile
          const meRes = await api.get<User>('/auth/me')
          if (meRes.data) {
            setUser(meRes.data)
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ user: User; accessToken: string }>('/auth/login', { email, password })
    if (res.data) {
      setAccessToken(res.data.accessToken)
      setUser(res.data.user)
    } else {
      throw new Error(res.message || '登录失败，请重试')
    }
  }, [])

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await api.post<{ user: User; accessToken: string }>('/auth/register', { username, email, password })
    if (res.data) {
      setAccessToken(res.data.accessToken)
      setUser(res.data.user)
    } else {
      throw new Error(res.message || '注册失败，请重试')
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    }
    setAccessToken(null)
    setUser(null)
  }, [])

  const refreshMe = useCallback(async () => {
    try {
      const meRes = await api.get<User>('/auth/me')
      if (meRes.data) {
        setUser(meRes.data)
      }
    } catch {
      // ignore
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
