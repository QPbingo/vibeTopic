// ============================================================
// bingbingbingo API — Configuration
// 所有外部服务配置集中在 @bingo/shared 的 ServiceConfig 中
// 本文件仅做 dotenv 加载和应用层组装
// ============================================================
import 'dotenv/config'
import {
  ServiceConfig,
  DatabaseConfig,
  RedisConfig,
  OSSConfig,
  ContentSafetyConfig,
  EmailConfig,
  GitHubOAuthConfig,
  SSEConfig,
  TurnstileConfig,
  JWTConfig,
  RateLimitConfig,
  AppBaseConfig,
} from '@bingo/shared'

export const config = {
  // Application
  port: AppBaseConfig.apiPort,
  nodeEnv: AppBaseConfig.nodeEnv,
  apiBaseUrl: AppBaseConfig.apiBaseUrl,
  isProduction: AppBaseConfig.isProduction,

  // Database
  database: DatabaseConfig,

  // JWT Auth
  jwt: JWTConfig,

  // GitHub OAuth
  github: GitHubOAuthConfig,

  // SSE Push Service
  sse: {
    publicUrl: SSEConfig.publicUrl,
    serviceUrl: SSEConfig.internalUrl,
    internalPushSecret: SSEConfig.internalPushSecret,
    ticketSecret: SSEConfig.ticketSecret,
    ticketExpiresIn: SSEConfig.ticketExpiresIn,
  },

  // Redis (rate limiting)
  redis: RedisConfig,

  // Rate Limiting
  rateLimit: RateLimitConfig,

  // OSS (file upload)
  oss: OSSConfig,

  // Content Safety (moderation)
  contentSafety: ContentSafetyConfig,

  // Email
  email: EmailConfig,

  // Turnstile
  turnstile: TurnstileConfig,

  // Full service config for direct access
  services: ServiceConfig,
} as const

if (config.isProduction) {
  const insecure: string[] = []
  if (config.jwt.secret.startsWith('dev-') || config.jwt.secret.length < 32) insecure.push('JWT_SECRET')
  if (config.sse.ticketSecret.startsWith('dev-') || config.sse.ticketSecret.length < 32) insecure.push('SSE_TICKET_SECRET')
  if (config.sse.internalPushSecret.startsWith('dev-') || config.sse.internalPushSecret.length < 32) insecure.push('INTERNAL_PUSH_SECRET')
  if (insecure.length > 0) throw new Error(`生产环境必须配置安全密钥: ${insecure.join(', ')}`)
}
