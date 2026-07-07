# bingbingbingo 配置文档

> 版本：v2.0.0
> 更新日期：2026-07-07

---

## 一、配置架构

```
                     ┌──────────────────────────────────────┐
                     │  packages/shared/src/                │
                     │  ├── config.ts       业务参数         │
                     │  └── services-config.ts  外部服务 ★   │
                     │       (唯一配置来源)                   │
                     └──────┬──────────────┬────────────────┘
                            │              │
              ┌─────────────▼──┐  ┌────────▼──────────┐
              │  apps/api      │  │  apps/sse          │
              │  src/config.ts │  │  src/config.ts     │
              │  → 引用 shared │  │  → 引用 shared     │
              └────────────────┘  └───────────────────┘
                            │
              ┌─────────────▼──┐
              │  apps/web      │
              │  NEXT_PUBLIC_* │
              │  → 仅公开变量   │
              └────────────────┘
```

**核心原则**：
- `packages/shared/src/services-config.ts` 是所有外部服务的**唯一配置来源**
- 每个服务都有 `enabled` 开关，关闭时自动使用本地替代方案
- 生产环境通过 `.env` 覆盖，开发环境使用内置默认值
- 前端仅暴露 `NEXT_PUBLIC_*` 前缀的变量

---

## 二、配置文件清单

| 文件 | 说明 |
|------|------|
| `packages/shared/src/services-config.ts` | **★ 集中配置**：所有外部服务和 API |
| `packages/shared/src/config.ts` | 全局业务参数（分页数、长度限制等） |
| `apps/api/.env.example` | 后端环境变量模板 |
| `apps/sse/.env.example` | SSE 服务环境变量模板 |
| `apps/web/.env.example` | 前端环境变量模板 |
| `docker-compose.yml` | 本地开发基础设施 |
| `scripts/init-db.sql` | 数据库初始化脚本 |

---

## 三、外部服务配置（services-config.ts）

### 3.1 数据库 — PostgreSQL (Aliyun RDS)

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `DATABASE_URL` | `postgresql://bingbingbingo:bingbingbingo_dev@localhost:5432/bingbingbingo` | PostgreSQL 连接字符串 |
| `DB_POOL_MIN` | `2` | 连接池最小连接数 |
| `DB_POOL_MAX` | `10` | 连接池最大连接数 |
| `DB_SSL_MODE` | `prefer` | SSL 模式：`require` / `prefer` / `disable` |

**生产环境**：将 `DATABASE_URL` 改为 Aliyun RDS 地址，`DB_SSL_MODE=require`。

---

### 3.2 Redis — Upstash (Rate Limiting)

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `UPSTASH_REDIS_URL` | `redis://localhost:6379` | Redis 连接 URL |
| `UPSTASH_REDIS_TOKEN` | (空) | Upstash REST Token |
| `REDIS_ENABLED` | `false` | **开关**：`true` 启用 Upstash，`false` 用内存限流 |

**生产环境**：`REDIS_ENABLED=true`，填入 Upstash 控制台的 URL 和 Token。

---

### 3.3 OSS — Aliyun Object Storage (文件上传)

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `ALIBABA_ACCESS_KEY_ID` | (空) | 阿里云 AccessKey ID |
| `ALIBABA_ACCESS_KEY_SECRET` | (空) | 阿里云 AccessKey Secret |
| `OSS_BUCKET` | `bingbingbingo` | Bucket 名称 |
| `OSS_REGION` | `oss-cn-hangzhou` | OSS 区域 |
| `OSS_ENDPOINT` | `https://oss-cn-hangzhou.aliyuncs.com` | OSS Endpoint（内网上传） |
| `OSS_CDN_DOMAIN` | `https://cdn.bingbingbingo.cn` | CDN 加速域名（外网访问） |
| `OSS_STS_ROLE_ARN` | (空) | STS 临时凭证角色 ARN |
| `OSS_STS_DURATION` | `3600` | STS 凭证有效期（秒） |
| `OSS_MAX_FILE_SIZE` | `10485760` | 单文件大小上限（字节，默认 10MB） |
| `ALLOWED_UPLOAD_TYPES` | `image/jpeg,image/png,image/gif,image/webp,image/svg+xml` | 允许的文件类型 |
| `OSS_ENABLED` | `false` | **开关**：`true` 启用 OSS，`false` 用本地 MinIO |

**生产环境**：`OSS_ENABLED=true`，填入 AccessKey 和 STS Role ARN。
**本地开发**：docker-compose 启动 MinIO（端口 9000/9001），无需配置。

---

### 3.4 Content Safety — Aliyun Content Moderation (内容审核)

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `CONTENT_AUDIT_ACCESS_KEY_ID` | (空) | 内容安全 AccessKey（建议子账号） |
| `CONTENT_AUDIT_ACCESS_KEY_SECRET` | (空) | 内容安全 AccessKey Secret |
| `CONTENT_AUDIT_ENDPOINT` | `https://green.cn-shanghai.aliyuncs.com` | API Endpoint |
| `CONTENT_AUDIT_RETRY` | `3` | 审核失败重试次数 |
| `CONTENT_AUDIT_RETRY_DELAY` | `1000` | 重试间隔（毫秒） |
| `CONTENT_AUDIT_TIMEOUT` | `10000` | 审核超时（毫秒） |
| `CONTENT_AUDIT_ENABLED` | `false` | **开关**：`true` 启用机审，`false` 直接发布 |
| `CONTENT_AUDIT_FALLBACK_APPROVE` | `true` | 降级策略：API 不可用时是否自动放行 |

**生产环境**：`CONTENT_AUDIT_ENABLED=true`。
**本地开发**：关闭，帖子创建后直接 `published`。

---

### 3.5 Email — Aliyun DirectMail (邮件推送)

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `MAIL_FROM_ADDRESS` | `noreply@mail.bingbingbingo.cn` | 发信地址 |
| `MAIL_FROM_NAME` | `bingbingbingo` | 发信人名称 |
| `MAIL_SMTP_HOST` | `smtpdm.aliyun.com` | SMTP 服务器 |
| `MAIL_SMTP_PORT` | `465` | SMTP 端口 |
| `MAIL_SMTP_USERNAME` | (空) | SMTP 用户名 |
| `MAIL_SMTP_PASSWORD` | (空) | SMTP 密码 |
| `MAIL_SMTP_SECURE` | `true` | 是否启用 SSL |
| `MAIL_VERIFY_TOKEN_TTL` | `3600` | 邮箱验证 Token 有效期（秒） |
| `MAIL_RESET_TOKEN_TTL` | `1800` | 密码重置 Token 有效期（秒） |
| `MAIL_ENABLED` | `false` | **开关**：`true` 发送邮件，`false` 跳过验证 |

**生产环境**：`MAIL_ENABLED=true`，在阿里云 DirectMail 控制台获取 SMTP 用户名密码。
**本地开发**：关闭，注册后直接激活账号。

---

### 3.6 GitHub OAuth

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `GITHUB_CLIENT_ID` | (空) | OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | (空) | OAuth App Client Secret |
| `GITHUB_REDIRECT_URI` | `http://localhost:8080/api/v1/auth/github/callback` | 授权回调地址 |
| `GITHUB_OAUTH_ENABLED` | `false` | **开关**：`true` 显示 GitHub 登录 |

**生产环境**：`GITHUB_OAUTH_ENABLED=true`，在 GitHub Developer Settings 创建 OAuth App，回调地址设为 `https://bingbingbingo.cn/api/v1/auth/github/callback`。

---

### 3.7 SSE Push Service (ECS)

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `SSE_PUBLIC_URL` | `http://localhost:3001` | SSE 公网地址（前端连接用） |
| `SSE_SERVICE_URL` | `http://localhost:3001` | SSE 内网地址（FC 推送用） |
| `INTERNAL_PUSH_SECRET` | `dev-internal-push-secret` | 内网推送接口密钥 |
| `SSE_TICKET_SECRET` | `dev-sse-ticket-secret-at-least-32-chars` | Ticket 签名密钥（≥32字符） |
| `SSE_TICKET_EXPIRES_IN` | `60` | Ticket 有效期（秒） |
| `SSE_HEARTBEAT_INTERVAL` | `30` | 心跳间隔（秒） |
| `SSE_MAX_CONNECTIONS_PER_USER` | `5` | 单用户最大并发连接 |
| `SSE_MAX_CONNECTIONS` | `10000` | 全局最大连接数 |
| `SSE_PORT` | `3001` | SSE 服务端口 |

**生产环境**：
- `SSE_PUBLIC_URL=https://sse.bingbingbingo.cn`
- `SSE_SERVICE_URL=http://sse-service:3001`（VPC 内网）
- `SSE_TICKET_SECRET` 和 `INTERNAL_PUSH_SECRET` 使用强随机字符串

---

### 3.8 Turnstile — Cloudflare Captcha

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | (空) | Site Key（前端） |
| `TURNSTILE_SECRET_KEY` | (空) | Secret Key（后端校验） |
| `TURNSTILE_ENABLED` | `false` | **开关**：`true` 启用人机验证 |

**生产环境**：`TURNSTILE_ENABLED=true`，在 Cloudflare Turnstile 控制台获取密钥对。

---

### 3.9 JWT Authentication

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `JWT_SECRET` | `dev-jwt-secret-at-least-32-characters-long` | JWT 签名密钥（≥32字符） |
| `JWT_ACCESS_EXPIRES_IN` | `1800` | Access Token 有效期（秒，默认 30 分钟） |
| `JWT_REFRESH_EXPIRES_IN` | `604800` | Refresh Token 有效期（秒，默认 7 天） |
| `JWT_ISSUER` | `bingbingbingo` | JWT 签发者 |

**生产环境**：`JWT_SECRET` 使用 `openssl rand -hex 32` 生成强随机密钥。

---

### 3.10 Rate Limiting

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `RATE_LIMIT_GLOBAL_RPM` | `120` | 全局接口限流（次/分钟） |
| `RATE_LIMIT_LOGIN_RPM` | `10` | 登录接口限流 |
| `RATE_LIMIT_REGISTER_RPM` | `5` | 注册接口限流 |
| `RATE_LIMIT_CREATE_POST_RPM` | `10` | 发帖接口限流 |

---

### 3.11 Application Base

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `NEXT_PUBLIC_APP_NAME` | `bingbingbingo` | 应用名称 |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | 站点 URL |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080/api/v1` | API 基础 URL |
| `PORT` | `8080` | API 服务端口 |
| `NODE_ENV` | `development` | 环境：`development` / `production` / `test` |

---

## 四、业务参数配置（config.ts）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `COMMENT_MAX_DEPTH` | `2` | 评论嵌套深度上限 |
| `POST_TITLE_MAX_LENGTH` | `200` | 帖子标题最大字符数 |
| `POST_CONTENT_MAX_LENGTH` | `50000` | 帖子正文最大字符数 |
| `COMMENT_CONTENT_MAX_LENGTH` | `5000` | 评论内容最大字符数 |
| `POST_TAG_MAX_COUNT` | `5` | 每帖最多标签数 |
| `TAG_NAME_MIN_LENGTH` | `2` | 标签名最短字符数 |
| `TAG_NAME_MAX_LENGTH` | `50` | 标签名最长字符数 |
| `PROJECT_MAX_PER_USER` | `20` | 每用户最多作品数 |
| `PROJECT_TITLE_MAX_LENGTH` | `100` | 作品标题最大字符数 |
| `USER_BIO_MAX_LENGTH` | `500` | 个人简介最大字符数 |
| `USERNAME_MIN_LENGTH` | `3` | 用户名最短字符数 |
| `USERNAME_MAX_LENGTH` | `30` | 用户名最长字符数 |
| `PASSWORD_MIN_LENGTH` | `8` | 密码最短字符数 |
| `FEED_PAGE_SIZE` | `20` | 首页信息流每页条数 |
| `COMMENT_PAGE_SIZE` | `30` | 评论每页条数 |
| `NOTIFICATION_PAGE_SIZE` | `30` | 通知每页条数 |
| `SEARCH_PAGE_SIZE` | `20` | 搜索每页条数 |
| `SEARCH_KEYWORD_MIN_LENGTH` | `2` | 搜索关键词最少字符数 |
| `JWT_ACCESS_EXPIRES_IN` | `1800` | Access Token 有效期（秒） |
| `JWT_REFRESH_EXPIRES_IN` | `604800` | Refresh Token 有效期（秒） |
| `SSE_TICKET_EXPIRES_IN` | `60` | SSE Ticket 有效期（秒） |
| `SSE_HEARTBEAT_INTERVAL` | `30` | SSE 心跳间隔（秒） |
| `SSE_MAX_CONNECTIONS_PER_USER` | `5` | SSE 单用户最大连接数 |

---

## 五、各包使用的配置

### apps/api（后端）

```typescript
import { config } from './config.js'

config.port              // 服务端口
config.database.url      // 数据库连接
config.jwt.secret        // JWT 密钥
config.github.clientId   // GitHub OAuth
config.sse.serviceUrl    // SSE 内网地址
config.redis.url         // Redis 连接
config.rateLimit.globalRpm  // 限流参数
config.oss.bucket        // OSS Bucket
config.contentSafety.enabled  // 内容审核开关
config.email.enabled     // 邮件开关
config.turnstile.enabled // Turnstile 开关
```

### apps/sse（推送服务）

```typescript
import { config } from './config.js'

config.port              // 服务端口
config.ticketSecret      // Ticket 签名密钥
config.heartbeatInterval // 心跳间隔
config.maxConnections    // 最大连接数
```

### apps/web（前端，仅 `NEXT_PUBLIC_*`）

```typescript
// 前端只能读取 NEXT_PUBLIC_ 前缀的环境变量
process.env.NEXT_PUBLIC_API_BASE_URL   // API 地址
process.env.NEXT_PUBLIC_SSE_URL        // SSE 地址
process.env.NEXT_PUBLIC_SITE_URL       // 站点 URL
process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY  // Turnstile Site Key
```

---

## 六、快速切换：开发 → 生产

从本地开发切换到生产部署，只需在 `.env` 中设置以下变量：

```bash
# 必填（生产环境必须覆盖）
NODE_ENV=production
DATABASE_URL=postgresql://user:password@your-rds.aliyuncs.com:5432/bingbingbingo
DB_SSL_MODE=require
JWT_SECRET=<openssl rand -hex 32>

# 按需启用（根据实际接入的服务）
REDIS_ENABLED=true
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=xxx

OSS_ENABLED=true
ALIBABA_ACCESS_KEY_ID=xxx
ALIBABA_ACCESS_KEY_SECRET=xxx
OSS_STS_ROLE_ARN=acs:ram::xxx:role/oss-upload-role

CONTENT_AUDIT_ENABLED=true
CONTENT_AUDIT_ACCESS_KEY_ID=xxx
CONTENT_AUDIT_ACCESS_KEY_SECRET=xxx

MAIL_ENABLED=true
MAIL_SMTP_USERNAME=xxx
MAIL_SMTP_PASSWORD=xxx

GITHUB_OAUTH_ENABLED=true
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

TURNSTILE_ENABLED=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=xxx
TURNSTILE_SECRET_KEY=xxx

# SSE（生产地址）
SSE_PUBLIC_URL=https://sse.bingbingbingo.cn
SSE_SERVICE_URL=http://sse-service:3001
INTERNAL_PUSH_SECRET=<openssl rand -hex 32>
SSE_TICKET_SECRET=<openssl rand -hex 32>
```

---

## 七、Docker Compose 本地开发环境

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: bingbingbingo-pg
    environment:
      POSTGRES_USER: bingbingbingo
      POSTGRES_PASSWORD: bingbingbingo_dev
      POSTGRES_DB: bingbingbingo
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/01-init.sql

  minio:
    image: minio/minio:latest
    container_name: bingbingbingo-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - '9000:9000'
      - '9001:9001'
    volumes:
      - minio_data:/data

  redis:
    image: redis:7-alpine
    container_name: bingbingbingo-redis
    ports:
      - '6379:6379'

  sse:
    build:
      context: ./apps/sse
      dockerfile: Dockerfile
    container_name: bingbingbingo-sse
    ports:
      - '3001:3001'
    environment:
      PORT: '3001'
      NODE_ENV: development
      SSE_TICKET_SECRET: dev-sse-ticket-secret-at-least-32-chars
      SSE_TICKET_EXPIRES_IN: '60'
      INTERNAL_PUSH_SECRET: dev-internal-push-secret
      SSE_HEARTBEAT_INTERVAL: '30'
      SSE_MAX_CONNECTIONS_PER_USER: '5'
      SSE_MAX_CONNECTIONS: '10000'

volumes:
  postgres_data:
  minio_data:
```

---

## 八、本地开发启动步骤

```bash
# 1. 启动基础设施
docker-compose up -d postgres redis minio

# 2. 安装依赖 + 初始化数据库
pnpm install
pnpm db:setup

# 3. 复制环境变量
cp apps/api/.env.example apps/api/.env
cp apps/sse/.env.example apps/sse/.env
cp apps/web/.env.example apps/web/.env.local

# 4. 启动所有服务
pnpm dev:api    # http://localhost:8080
pnpm dev:sse    # http://localhost:3001
pnpm dev:web    # http://localhost:3000
```
