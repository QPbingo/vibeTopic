# bingbingbingo 配置文件说明

## 配置文件列表

| 文件 | 位置 | 说明 |
|------|------|------|
| 应用配置 | `packages/shared/src/config.ts` | 可配置的全局业务参数 |
| 环境变量-前端 | `apps/web/.env.example` | 前端环境变量模板 |
| 环境变量-后端 | `apps/api/.env.example` | 后端环境变量模板 |
| Docker Compose | `docker-compose.yml` | 本地开发环境 |

---

## 1. 全局业务配置（packages/shared/src/config.ts）

```typescript
/**
 * bingbingbingo 全局业务配置
 * 修改此文件后重新部署即可生效，无需改代码
 */
export const AppConfig = {
  /** 评论嵌套深度上限（0=不允许回复，1=仅一级回复，以此类推） */
  COMMENT_MAX_DEPTH: 2,

  /** 帖子标题最大字符数 */
  POST_TITLE_MAX_LENGTH: 200,

  /** 帖子正文最大字符数 */
  POST_CONTENT_MAX_LENGTH: 50000,

  /** 评论内容最大字符数 */
  COMMENT_CONTENT_MAX_LENGTH: 5000,

  /** 每帖最多标签数量 */
  POST_TAG_MAX_COUNT: 5,

  /** 标签名称最小字符数 */
  TAG_NAME_MIN_LENGTH: 2,

  /** 标签名称最大字符数 */
  TAG_NAME_MAX_LENGTH: 50,

  /** 每个用户最多作品数量 */
  PROJECT_MAX_PER_USER: 20,

  /** 作品标题最大字符数 */
  PROJECT_TITLE_MAX_LENGTH: 100,

  /** 个人简介最大字符数 */
  USER_BIO_MAX_LENGTH: 500,

  /** 用户名最小字符数 */
  USERNAME_MIN_LENGTH: 3,

  /** 用户名最大字符数 */
  USERNAME_MAX_LENGTH: 30,

  /** 密码最小字符数 */
  PASSWORD_MIN_LENGTH: 8,

  /** 首页信息流每页条数 */
  FEED_PAGE_SIZE: 20,

  /** 评论列表每页条数 */
  COMMENT_PAGE_SIZE: 30,

  /** 通知列表每页条数 */
  NOTIFICATION_PAGE_SIZE: 30,

  /** SSR 预热首页帖子数 */
  HOME_RECENT_POSTS_COUNT: 20,

  /** 搜索每页条数 */
  SEARCH_PAGE_SIZE: 20,

  /** 搜索关键词最小字符数 */
  SEARCH_KEYWORD_MIN_LENGTH: 2,
} as const;
```

---

## 2. 环境变量 — 前端（apps/web/.env.example）

```bash
# ============================
# 应用基础
# ============================
# 应用名称
NEXT_PUBLIC_APP_NAME=bingbingbingo
# 站点 URL（生产环境为 https://bingbingbingo.cn）
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ============================
# API 配置
# ============================
# 后端 API 基础 URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# ============================
# GitHub OAuth
# ============================
# GitHub OAuth App Client ID
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# ============================
# 阿里云 OSS
# ============================
# OSS Bucket 域名（CDN 加速域名）
NEXT_PUBLIC_OSS_BUCKET_DOMAIN=https://your-bucket.oss-cn-hangzhou.aliyuncs.com
# OSS Region
NEXT_PUBLIC_OSS_REGION=oss-cn-hangzhou

# ============================
# 站点配置
# ============================
# Google Analytics ID（可选）
NEXT_PUBLIC_GA_ID=
```

---

## 3. 环境变量 — 后端（apps/api/.env.example）

```bash
# ============================
# 服务基础
# ============================
# 服务端口（本地开发用，FC 部署时忽略）
PORT=8080
# 环境标识：development / production
NODE_ENV=development
# 服务 Base URL
API_BASE_URL=http://localhost:8080

# ============================
# 数据库 — PostgreSQL
# ============================
DATABASE_URL=postgresql://user:password@localhost:5432/bingbingbingo

# ============================
# JWT 认证
# ============================
# JWT 签名密钥
JWT_SECRET=your-jwt-secret-at-least-32-chars
# Access Token 有效期（秒），默认 1800 = 30 分钟
JWT_ACCESS_EXPIRES_IN=1800
# Refresh Token 有效期（秒），默认 604800 = 7 天
JWT_REFRESH_EXPIRES_IN=604800
# JWT 签发者
JWT_ISSUER=bingbingbingo

# ============================
# GitHub OAuth
# ============================
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8080/api/v1/auth/github/callback

# ============================
# 阿里云 OSS — 对象存储
# ============================
# 阿里云 AccessKey ID
ALIBABA_ACCESS_KEY_ID=your_access_key_id
# 阿里云 AccessKey Secret
ALIBABA_ACCESS_KEY_SECRET=your_access_key_secret
# OSS Bucket 名称
OSS_BUCKET=bingbingbingo
# OSS Region
OSS_REGION=oss-cn-hangzhou
# OSS Endpoint（内网）
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
# OSS CDN 域名（外网访问用）
OSS_CDN_DOMAIN=https://cdn.bingbingbingo.cn
# STS 角色 ARN
OSS_STS_ROLE_ARN=acs:ram::xxx:role/oss-upload-role
# STS 临时凭证有效期（秒）
OSS_STS_DURATION=3600
# 上传文件大小上限（字节），默认 10MB
OSS_MAX_FILE_SIZE=10485760
# 允许上传的文件类型（逗号分隔）
ALLOWED_UPLOAD_TYPES=image/jpeg,image/png,image/gif,image/webp,image/svg+xml

# ============================
# 阿里云邮件推送 — DirectMail
# ============================
# 发信地址
MAIL_FROM_ADDRESS=noreply@mail.bingbingbingo.cn
# SMTP 用户名
MAIL_SMTP_USERNAME=your_smtp_username
# SMTP 密码
MAIL_SMTP_PASSWORD=your_smtp_password
# SMTP 服务器
MAIL_SMTP_HOST=smtpdm.aliyun.com
# SMTP 端口
MAIL_SMTP_PORT=465

# ============================
# 阿里云内容安全
# ============================
# 内容安全 AccessKey ID（可用子账号，最小权限原则）
CONTENT_AUDIT_ACCESS_KEY_ID=your_content_audit_key
# 内容安全 AccessKey Secret
CONTENT_AUDIT_ACCESS_KEY_SECRET=your_content_audit_secret

# ============================
# Redis（Upstash，用于限流）
# ============================
UPSTASH_REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_TOKEN=

# ============================
# 限流配置
# ============================
# 全局接口限流：每分钟最大请求数
RATE_LIMIT_GLOBAL_RPM=120
# 登录接口限流：每分钟最大请求数
RATE_LIMIT_LOGIN_RPM=10
# 注册接口限流：每分钟最大请求数
RATE_LIMIT_REGISTER_RPM=5
# 发帖接口限流：每分钟最大请求数
RATE_LIMIT_CREATE_POST_RPM=10
```

---

## 4. Docker Compose 本地开发环境（docker-compose.yml）

```yaml
version: '3.8'

services:
  # PostgreSQL 16
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
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U bingbingbingo']
      interval: 5s
      timeout: 5s
      retries: 5

  # MinIO（模拟 OSS）
  minio:
    image: minio/minio:latest
    container_name: bingbingbingo-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - '9000:9000'   # API
      - '9001:9001'   # Console
    volumes:
      - minio_data:/data

  # Redis（限流用）
  redis:
    image: redis:7-alpine
    container_name: bingbingbingo-redis
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  minio_data:
```

### 初始化 SQL（scripts/init-db.sql）

```sql
-- 启用所需扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_bigm";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 创建 pg_bigm 全文搜索配置（中文 2-gram 分词）
-- pg_bigm 默认已支持，无需额外配置
-- 测试：SELECT show_bigm('hello 你好世界');
```
