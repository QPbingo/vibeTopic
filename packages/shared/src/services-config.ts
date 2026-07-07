// ============================================================
// bingbingbingo — External Services Configuration
// ============================================================
// 本文件是所有外部服务和 API 的集中配置文件。
// 生产环境通过环境变量注入，开发环境使用内置默认值。
// 修改此文件即可全局切换服务配置，无需改动业务代码。
// ============================================================

// ---- Helper: read env with fallback ----
function env(key: string, fallback: string): string {
  return typeof process !== 'undefined' && process.env[key] ? process.env[key]! : fallback
}
function envInt(key: string, fallback: number): number {
  const v = env(key, '')
  return v ? parseInt(v, 10) : fallback
}
function envBool(key: string, fallback: boolean): boolean {
  const v = env(key, '')
  return v ? v === 'true' || v === '1' : fallback
}

// ============================================================
// 1. Database — PostgreSQL (Aliyun RDS)
// ============================================================
export const DatabaseConfig = {
  /** PostgreSQL 连接字符串 */
  url: env('DATABASE_URL', 'postgresql://bingbingbingo:bingbingbingo_dev@localhost:5432/bingbingbingo'),
  /** 连接池最小连接数 */
  poolMin: envInt('DB_POOL_MIN', 2),
  /** 连接池最大连接数 */
  poolMax: envInt('DB_POOL_MAX', 10),
  /** SSL 模式 (require | prefer | disable) */
  sslMode: env('DB_SSL_MODE', 'prefer') as 'require' | 'prefer' | 'disable',
} as const

// ============================================================
// 2. Redis — Upstash (Rate Limiting)
// ============================================================
export const RedisConfig = {
  /** Redis 连接 URL */
  url: env('UPSTASH_REDIS_URL', 'redis://localhost:6379'),
  /** Upstash REST Token（REST API 模式下使用） */
  token: env('UPSTASH_REDIS_TOKEN', ''),
  /** 是否启用 Redis 限流（关闭时使用内存限流） */
  enabled: envBool('REDIS_ENABLED', false),
} as const

// ============================================================
// 3. OSS — Aliyun Object Storage + CDN
// ============================================================
export const OSSConfig = {
  /** AccessKey ID */
  accessKeyId: env('ALIBABA_ACCESS_KEY_ID', ''),
  /** AccessKey Secret */
  accessKeySecret: env('ALIBABA_ACCESS_KEY_SECRET', ''),
  /** Bucket 名称 */
  bucket: env('OSS_BUCKET', 'bingbingbingo'),
  /** OSS Region */
  region: env('OSS_REGION', 'oss-cn-hangzhou'),
  /** OSS Endpoint（内网上传） */
  endpoint: env('OSS_ENDPOINT', 'https://oss-cn-hangzhou.aliyuncs.com'),
  /** CDN 加速域名（外网访问） */
  cdnDomain: env('OSS_CDN_DOMAIN', 'https://cdn.bingbingbingo.cn'),
  /** STS 角色 ARN（临时凭证） */
  stsRoleArn: env('OSS_STS_ROLE_ARN', ''),
  /** STS 临时凭证有效期（秒） */
  stsDuration: envInt('OSS_STS_DURATION', 3600),
  /** 上传文件大小上限（字节），默认 10MB */
  maxFileSize: envInt('OSS_MAX_FILE_SIZE', 10 * 1024 * 1024),
  /** 允许上传的文件类型 */
  allowedTypes: env('ALLOWED_UPLOAD_TYPES', 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml').split(','),
  /** 是否启用（关闭时使用本地 MinIO） */
  enabled: envBool('OSS_ENABLED', false),
} as const

// ============================================================
// 4. Content Safety — Aliyun Content Moderation API
// ============================================================
export const ContentSafetyConfig = {
  /** AccessKey ID（建议使用子账号，最小权限） */
  accessKeyId: env('CONTENT_AUDIT_ACCESS_KEY_ID', ''),
  /** AccessKey Secret */
  accessKeySecret: env('CONTENT_AUDIT_ACCESS_KEY_SECRET', ''),
  /** API Endpoint */
  endpoint: env('CONTENT_AUDIT_ENDPOINT', 'https://green.cn-shanghai.aliyuncs.com'),
  /** 审核失败重试次数 */
  retryCount: envInt('CONTENT_AUDIT_RETRY', 3),
  /** 重试间隔（毫秒） */
  retryDelay: envInt('CONTENT_AUDIT_RETRY_DELAY', 1000),
  /** 审核超时时间（毫秒） */
  timeout: envInt('CONTENT_AUDIT_TIMEOUT', 10000),
  /** 是否启用（关闭时帖子直接发布） */
  enabled: envBool('CONTENT_AUDIT_ENABLED', false),
  /** 降级策略：API 不可用时是否自动放行 */
  autoApproveOnFailure: envBool('CONTENT_AUDIT_FALLBACK_APPROVE', true),
} as const

// ============================================================
// 5. Email — Aliyun DirectMail
// ============================================================
export const EmailConfig = {
  /** 发信地址 */
  fromAddress: env('MAIL_FROM_ADDRESS', 'noreply@mail.bingbingbingo.cn'),
  /** 发信人名称 */
  fromName: env('MAIL_FROM_NAME', 'bingbingbingo'),
  /** SMTP 服务器 */
  smtpHost: env('MAIL_SMTP_HOST', 'smtpdm.aliyun.com'),
  /** SMTP 端口 */
  smtpPort: envInt('MAIL_SMTP_PORT', 465),
  /** SMTP 用户名 */
  smtpUsername: env('MAIL_SMTP_USERNAME', ''),
  /** SMTP 密码 */
  smtpPassword: env('MAIL_SMTP_PASSWORD', ''),
  /** 是否启用 SSL */
  smtpSecure: envBool('MAIL_SMTP_SECURE', true),
  /** 邮箱验证令牌有效期（秒） */
  verifyTokenTTL: envInt('MAIL_VERIFY_TOKEN_TTL', 3600),
  /** 密码重置令牌有效期（秒） */
  resetTokenTTL: envInt('MAIL_RESET_TOKEN_TTL', 1800),
  /** 是否启用（关闭时跳过邮箱验证） */
  enabled: envBool('MAIL_ENABLED', false),
} as const

// ============================================================
// 6. GitHub OAuth
// ============================================================
export const GitHubOAuthConfig = {
  /** OAuth App Client ID */
  clientId: env('GITHUB_CLIENT_ID', ''),
  /** OAuth App Client Secret */
  clientSecret: env('GITHUB_CLIENT_SECRET', ''),
  /** 授权回调地址 */
  redirectUri: env('GITHUB_REDIRECT_URI', 'http://localhost:8080/api/v1/auth/github/callback'),
  /** GitHub 授权页面 URL */
  authorizeUrl: 'https://github.com/login/oauth/authorize',
  /** GitHub Token 换取 URL */
  tokenUrl: 'https://github.com/login/oauth/access_token',
  /** GitHub 用户信息 API */
  userApiUrl: 'https://api.github.com/user',
  /** 是否启用 */
  enabled: envBool('GITHUB_OAUTH_ENABLED', false),
} as const

// ============================================================
// 7. SSE Push Service (Deployed on Aliyun ECS)
// ============================================================
export const SSEConfig = {
  /** SSE 服务地址（前端 EventSource 连接用） */
  publicUrl: env('NEXT_PUBLIC_SSE_URL', env('SSE_PUBLIC_URL', 'http://localhost:3001')),
  /** SSE 服务内网地址（FC → ECS 内网推送用） */
  internalUrl: env('SSE_SERVICE_URL', 'http://localhost:3001'),
  /** 内网推送接口密钥（FC 与 ECS 共享） */
  internalPushSecret: env('INTERNAL_PUSH_SECRET', 'dev-internal-push-secret'),
  /** SSE Ticket 签名密钥（FC 与 ECS 共享，至少 32 字符） */
  ticketSecret: env('SSE_TICKET_SECRET', 'dev-sse-ticket-secret-at-least-32-chars'),
  /** Ticket 有效期（秒） */
  ticketExpiresIn: envInt('SSE_TICKET_EXPIRES_IN', 60),
  /** 心跳间隔（秒） */
  heartbeatInterval: envInt('SSE_HEARTBEAT_INTERVAL', 30),
  /** 单用户最大并发连接数 */
  maxConnectionsPerUser: envInt('SSE_MAX_CONNECTIONS_PER_USER', 5),
  /** 全局最大连接数 */
  maxConnections: envInt('SSE_MAX_CONNECTIONS', 10000),
  /** SSE 服务端口 */
  port: envInt('SSE_PORT', 3001),
} as const

// ============================================================
// 8. Turnstile — Cloudflare Captcha
// ============================================================
export const TurnstileConfig = {
  /** Site Key（前端使用） */
  siteKey: env('NEXT_PUBLIC_TURNSTILE_SITE_KEY', ''),
  /** Secret Key（后端校验） */
  secretKey: env('TURNSTILE_SECRET_KEY', ''),
  /** 校验 API 地址 */
  verifyUrl: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  /** 是否启用 */
  enabled: envBool('TURNSTILE_ENABLED', false),
} as const

// ============================================================
// 9. JWT Authentication
// ============================================================
export const JWTConfig = {
  /** JWT 签名密钥（至少 32 字符） */
  secret: env('JWT_SECRET', 'dev-jwt-secret-at-least-32-characters-long'),
  /** Access Token 有效期（秒），默认 30 分钟 */
  accessExpiresIn: envInt('JWT_ACCESS_EXPIRES_IN', 1800),
  /** Refresh Token 有效期（秒），默认 7 天 */
  refreshExpiresIn: envInt('JWT_REFRESH_EXPIRES_IN', 604800),
  /** JWT 签发者 */
  issuer: env('JWT_ISSUER', 'bingbingbingo'),
} as const

// ============================================================
// 10. Rate Limiting
// ============================================================
export const RateLimitConfig = {
  /** 全局接口限流（次/分钟） */
  globalRpm: envInt('RATE_LIMIT_GLOBAL_RPM', 120),
  /** 登录接口限流（次/分钟） */
  loginRpm: envInt('RATE_LIMIT_LOGIN_RPM', 10),
  /** 注册接口限流（次/分钟） */
  registerRpm: envInt('RATE_LIMIT_REGISTER_RPM', 5),
  /** 发帖接口限流（次/分钟） */
  createPostRpm: envInt('RATE_LIMIT_CREATE_POST_RPM', 10),
} as const

// ============================================================
// 11. Application Base
// ============================================================
export const AppBaseConfig = {
  /** 应用名称 */
  name: env('NEXT_PUBLIC_APP_NAME', 'bingbingbingo'),
  /** 站点 URL */
  siteUrl: env('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
  /** API 基础 URL */
  apiBaseUrl: env('NEXT_PUBLIC_API_BASE_URL', env('API_BASE_URL', 'http://localhost:8080/api/v1')),
  /** API 服务端口 */
  apiPort: envInt('PORT', 8080),
  /** 运行环境 */
  nodeEnv: env('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  /** 是否为生产环境 */
  isProduction: env('NODE_ENV', 'development') === 'production',
} as const

// ============================================================
// Aggregate: All external service configs in one place
// ============================================================
export const ServiceConfig = {
  database: DatabaseConfig,
  redis: RedisConfig,
  oss: OSSConfig,
  contentSafety: ContentSafetyConfig,
  email: EmailConfig,
  githubOAuth: GitHubOAuthConfig,
  sse: SSEConfig,
  turnstile: TurnstileConfig,
  jwt: JWTConfig,
  rateLimit: RateLimitConfig,
  app: AppBaseConfig,
} as const

export type ServiceConfigType = typeof ServiceConfig
