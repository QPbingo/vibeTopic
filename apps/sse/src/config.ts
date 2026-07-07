// ============================================================
// bingbingbingo SSE — Configuration
// 所有外部服务配置集中在 @bingo/shared 的 ServiceConfig 中
// ============================================================
import { SSEConfig, AppBaseConfig, JWTConfig } from '@bingo/shared'

export const config = {
  port: SSEConfig.port,
  nodeEnv: AppBaseConfig.nodeEnv,
  ticketSecret: SSEConfig.ticketSecret,
  ticketExpiresIn: SSEConfig.ticketExpiresIn,
  internalPushSecret: SSEConfig.internalPushSecret,
  heartbeatInterval: SSEConfig.heartbeatInterval,
  maxConnectionsPerUser: SSEConfig.maxConnectionsPerUser,
  maxConnections: SSEConfig.maxConnections,
  ticketIssuer: JWTConfig.issuer,
} as const

if (config.nodeEnv === 'production') {
  const insecure = [
    config.ticketSecret.startsWith('dev-') || config.ticketSecret.length < 32 ? 'SSE_TICKET_SECRET' : null,
    config.internalPushSecret.startsWith('dev-') || config.internalPushSecret.length < 32 ? 'INTERNAL_PUSH_SECRET' : null,
  ].filter(Boolean)
  if (insecure.length > 0) throw new Error(`生产环境必须配置安全密钥: ${insecure.join(', ')}`)
}
