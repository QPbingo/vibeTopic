import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@bingo/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
