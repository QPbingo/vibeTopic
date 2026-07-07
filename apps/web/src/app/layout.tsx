import type { Metadata } from 'next'
import './globals.css'
import { ClientLayout } from './layout-client'

export const metadata: Metadata = {
  title: 'bingbingbingo — Vibe Coding 开发者社区',
  description: '面向 vibe coding 开发者的垂直技术社区',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
