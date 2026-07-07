'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { PixelBackground } from '@/components/layout/PixelBackground'
import { RainbowStrip } from '@/components/layout/RainbowStrip'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
      <AuthProvider>
        <PixelBackground />
        <Navbar />
        <RainbowStrip />
        <main style={{ minHeight: 'calc(100vh - var(--nav-h) - 6px)' }}>{children}</main>
        <BottomNav />
      </AuthProvider>
    </ThemeProvider>
  )
}
