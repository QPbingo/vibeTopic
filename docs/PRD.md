# bingbingbingo — 产品需求文档（PRD）

> 版本：v1.0.0-MVP  
> 更新日期：2026-07-03  
> 域名：https://bingbingbingo.cn  

---

## 一、产品概述

### 1.1 产品定位

bingbingbingo 是一个面向 **vibe coding 开发者** 的垂直技术社区。开发者在这里分享作品、交流技巧、讨论 AI 编程工具，用户和开发者之间可以更直接地沟通。社区兼顾项目展示和知识分享，也为想挖宝、学习的用户提供浏览优秀作品的渠道。

### 1.2 目标用户

- **主要用户**：使用 vibe coding / AI 辅助编程的国内开发者
- **次要用户**：对 vibe coding 感兴趣的学习者、项目挖掘者

### 1.3 初期规模预期

- MVP 阶段预期活跃用户数百人
- 架构设计支持扩展到数千至数万人，后期可平滑升级

### 1.4 差异化价值

短期以垂直社区属性建立忠诚度，长期逐步加入：
- 可交互的 App 预览
- 与 AI 编程工具的深度集成
- 快速 vibe 产物一键部署

---

## 二、MVP 功能范围

### 2.1 核心功能（Phase 1 必需）

| 模块 | 功能 | 优先级 |
|------|------|--------|
| 帖子 | 创建、编辑、删除、查看详情 | P0 |
| 帖子 | Markdown 编辑器（bytemd），支持代码高亮、图片、链接 | P0 |
| 帖子 | 首页信息流（最新/最热排序，cursor 分页） | P0 |
| 帖子 | 全文搜索（PostgreSQL FTS + pg_bigm + ILIKE） | P0 |
| 评论 | 嵌套回复，深度可配置（默认 2 层） | P0 |
| 点赞 | 帖子/评论点赞与取消 | P0 |
| 收藏 | 收藏帖子与取消 | P0 |
| 标签 | 混合模式：官方预置 + 用户自由创建，标签页浏览 | P0 |
| 用户 | GitHub OAuth 登录 + 邮箱注册 | P0 |
| 用户 | 个人主页（头像、简介、关注数/粉丝数） | P0 |
| 用户 | 关注/取关功能 | P0 |
| 作品 | 用户手动添加作品展示（名称、描述、链接、截图） | P0 |
| 通知 | SSE 实时推送（被点赞/评论/收藏/关注） + 消息中心历史 | P0 |
| 搜索 | 全站帖子搜索 | P0 |

### 2.2 安全与运营

| 模块 | 功能 | 优先级 |
|------|------|--------|
| 认证 | JWT（Access 30min + Refresh 7天） | P0 |
| 安全 | 注册验证码（Turnstile） | P0 |
| 安全 | 接口限流（Redis） | P0 |
| 审核 | 阿里云内容安全 API 自动审核 | P0 |
| 审核 | 用户举报机制 | P0 |
| 管理 | 管理员权限嵌入前端（隐藏/删除帖子评论） | P0 |

### 2.3 体验优化

| 模块 | 功能 | 优先级 |
|------|------|--------|
| UI | 响应式设计（支持移动端） | P0 |
| UI | 暗色模式 / 亮色模式切换 | P0 |
| SEO | 帖子详情页 SSR | P0 |
| 性能 | cursor-based 无限滚动分页 | P0 |

### 2.4 暂不纳入 Phase 1（后期规划）

- 个性化关注流信息流
- GitHub 作品自动导入
- 交互式 App 预览部署
- 邮件通知
- 独立管理后台页面
- 用户数据统计面板

---

## 三、技术架构

### 3.1 整体架构图

```
┌──────────────────────────────────────────────────────────────────┐
│                           用户浏览器                               │
│                    bingbingbingo.cn (Vercel)                       │
└──────┬────────────────────┬──────────────────────┬────────────────┘
       │                    │                      │
 静态资源 (HTML/JS/CSS)  REST API /api/v1/*   SSE /sse/notifications
       │                    │                      │
 ┌─────▼──────┐   ┌─────────▼──────────┐   ┌──────▼───────────┐
 │   Vercel   │   │ 阿里云 FC + API网关  │   │  ECS (Node.js)   │
 │  (Next.js)  │   │  (主业务服务)        │   │  (SSE 推送服务)    │
 └────────────┘   └─────────┬──────────┘   └──────┬───────────┘
                            │                      ▲
                            │  POST /internal/push │
                            │  (内网通知推送)        │
                            ├──────────────────────┘
                            │
              ┌─────────────┼─────────────────┐
              │             │                 │
        ┌─────▼─────┐ ┌─────▼──────┐   ┌──────▼──────┐
        │ 阿里云 RDS │ │ 阿里云 OSS  │   │    Redis     │
        │ PostgreSQL│ │ (图片/CDN)  │   │  (Upstash)   │
        └───────────┘ └────────────┘   └─────────────┘

组件职责：
  - FC 主业务服务：处理所有 REST API，产生通知时通知 ECS SSE 服务
  - ECS SSE 服务：仅维护浏览器长连接并推送事件，不访问数据库，无业务逻辑
  - 内网通信：FC → ECS 通过阿里云 VPC 内网 HTTP 调用
```

### 3.2 技术栈明细

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 前端框架 | Next.js 15 + TypeScript | SSR/SSG 支持 |
| UI 框架 | Tailwind CSS 4 + shadcn/ui | 响应式 + 暗色模式内置 |
| Markdown 编辑器 | bytemd | 掘金同款，轻量好用 |
| HTTP 客户端 | fetch (原生) + React Query (TanStack Query) | 前后端分离，纯 HTTP 通信 |
| 后端运行时 | Node.js 22 | 部署在阿里云 FC |
| API 风格 | REST，`/api/v1/` 版本前缀 | 前后端严格分离 |
| 数据库 | PostgreSQL 16 (阿里云 RDS) | 关系型，支持 FTS 扩展 |
| ORM | Prisma | 类型安全 |
| 全文搜索 | PostgreSQL tsvector + pg_bigm | 中文 2-gram 分词 |
| 对象存储 | 阿里云 OSS + CDN | STS 前端直传 |
| 限流 | @upstash/ratelimit + Redis | Vercel 同生态 |
| 认证 | JWT (jsonwebtoken) | Access + Refresh 双 token |
| 邮件 | 阿里云邮件推送 (DirectMail) | 每天免费 200 封 |
| 内容审核 | 阿里云内容安全 API | 图文自动审核 |
| 测试 | Vitest + Supertest | 关键 API 集成测试 |
| 部署-前端 | Vercel (Git 自动部署) | 免费层 |
| 部署-后端 | 阿里云 FC + API 网关 | GitHub Actions CI/CD |
| 部署-推送 | 阿里云 ECS (1C1G) | SSE 长连接推送服务 |
| 项目结构 | pnpm workspace monorepo | apps/web + apps/api + apps/sse + packages/shared |

### 3.3 项目目录结构

```
bingbingbingo/
├── apps/
│   ├── web/                    # Next.js 前端
│   │   ├── src/
│   │   │   ├── app/            # App Router 路由
│   │   │   ├── components/     # React 组件
│   │   │   ├── hooks/          # 自定义 Hook
│   │   │   ├── lib/            # 工具函数
│   │   │   └── services/       # API 调用层
│   │   ├── public/             # 静态资源
│   │   ├── .env.example
│   │   └── package.json
│   └── api/                    # 后端服务
│       ├── src/
│       │   ├── routes/         # 路由定义
│       │   ├── controllers/    # 请求处理
│       │   ├── services/       # 业务逻辑
│       │   ├── middleware/      # 中间件（auth/ratelimit/cors）
│       │   ├── validators/     # 参数校验
│       │   └── utils/          # 工具函数
│       ├── .env.example
│       └── package.json
│   └── sse/                    # SSE 推送服务（部署在 ECS）
│       ├── src/
│       │   ├── index.ts        # 服务入口
│       │   ├── connections.ts  # 连接池管理
│       │   ├── auth.ts         # SSE Token 校验
│       │   └── heartbeat.ts    # 心跳保持
│       ├── .env.example
│       └── package.json
├── packages/
│   └── shared/                 # 共享代码
│       ├── src/
│       │   ├── types.ts        # TypeScript 类型定义
│       │   ├── error-codes.ts  # 错误码常量
│       │   └── config.ts       # 全局业务配置
│       └── package.json
├── docs/                       # 项目文档
│   ├── PRD.md                  # 本文件
│   ├── database.md             # 数据表设计
│   ├── error-codes.md          # 错误码清单
│   └── config.md               # 配置文件说明
├── docker-compose.yml          # 本地开发环境
├── pnpm-workspace.yaml
├── package.json
└── .gitignore
```

---

## 四、功能详细设计

### 4.1 用户系统

#### 4.1.1 注册与登录

**邮箱注册流程**：
1. 用户填写：用户名、邮箱、密码
2. 前端 Turnstile 验证码校验
3. 后端校验：用户名唯一性、邮箱唯一性、密码复杂度（最少 8 位，含字母和数字）
4. 生成验证 token（存入 user_tokens 表，type = `email_verify`，有效期 1 小时），发送验证邮件（阿里云邮件推送）
5. 用户点击邮件链接（`/verify-email?token=xxx`），前端调 API 激活账号
6. 激活成功后自动登录，返回 JWT Access Token（httpOnly Cookie）+ Refresh Token（httpOnly Cookie）

**密码重置流程**：
1. 用户点击「忘记密码」，输入注册邮箱
2. 后端校验邮箱存在，生成重置 token（存入 user_tokens 表，type = `password_reset`，有效期 30 分钟），发送重置邮件
3. 用户点击邮件链接（`/reset-password?token=xxx`），进入重置密码页面
4. 用户输入新密码（需满足复杂度要求），提交后后端校验 token 有效性并更新密码
5. 重置成功后，该 token 立即标记为已使用，同时吊销该用户所有 Refresh Token

**GitHub OAuth 登录流程**：
1. 用户点击「GitHub 登录」按钮
2. 跳转 GitHub 授权页面
3. GitHub 回调，后端获取用户信息
4. 首次登录自动创建账号（username 默认使用 GitHub 用户名，如冲突加随机后缀）
5. 返回 JWT Access Token（httpOnly Cookie）+ Refresh Token（httpOnly Cookie）

**Token 刷新**：
- Access Token 有效期 30 分钟
- Refresh Token 有效期 7 天
- 前端拦截器自动在 401 时尝试刷新

#### 4.1.2 用户主页

展示信息：
- 头像、用户名、个人简介
- 关注数、粉丝数（可点击查看列表）
- 作品列表（封面缩略图）
- 最近发帖列表

访客可执行操作：
- 关注/取消关注
- 查看作品详情

本人可执行操作：
- 编辑个人资料
- 添加/编辑/删除作品

#### 4.1.3 管理员角色

- role 字段为 `admin` 的用户拥有管理权限
- 前端根据 role 显示管理按钮（隐藏帖子/评论、删除帖子/评论、封禁用户等）
- 后端所有管理接口需校验 role === 'admin'

---

### 4.2 帖子系统

#### 4.2.1 发布帖子

1. 用户填写标题（必填，1-200 字符）
2. 使用 bytemd Markdown 编辑器撰写正文
3. 支持功能：
   - Markdown 语法（标题、列表、引用、链接等）
   - 代码块 + 语法高亮
   - 图片插入（粘贴上传 / 拖拽上传 → 前端直传 OSS，返回 URL 插入编辑器）
   - OSS 直传安全策略：STS Token 限制上传路径为 `users/{userId}/{timestamp}-{random8}.{ext}`，禁止覆盖已有文件，单文件上限 10MB
4. 选择/创建标签（最多 5 个）
5. 生成 slug（标题转拼音/英文 + 6位随机字符串）
6. 点击发布 → 后端**立即保存**帖子，status = `pending_review`，返回帖子 ID 并提示「审核中，审核通过后公开可见」
7. 后端**异步**调用阿里云内容安全 API：
   - 通过 → status 自动更新为 `published`，帖子公开可见
   - 不通过 → status 自动更新为 `rejected`，通过通知系统告知用户违规原因
8. 用户在「我的帖子」中可查看审核状态，`rejected` 的帖子可修改后重新提交审核（调 `POST /api/v1/posts/:id/resubmit`）

**异步审核状态机**：

```
用户提交 → pending_review ──┬── 机审通过 ──► published（公开可见）
  (仅作者可见)              │
                            └── 机审不通过 ──► rejected（通知作者修改）
                                                    │
                                         用户修改后 resubmit
                                                    │
                                                    ▼
                                              pending_review（重新审核）
```

**降级策略**：若内容安全 API 不可用（超时/错误），3 次重试后仍失败 → 自动降级为 `published` 并记录告警日志，事后人工抽检。

**resubmit 流程**：
1. 用户在「我的帖子」中看到 `rejected` 帖子，点击编辑
2. 调 `PATCH /api/v1/posts/:id` 修改内容（仅 `rejected` 状态可编辑，`pending_review` 不可编辑）
3. 修改完成后调 `POST /api/v1/posts/:id/resubmit`，状态重置为 `pending_review`，重新触发异步审核

**pending_review / rejected 帖子的交互边界**：
- 仅作者本人可查看（通过「我的帖子」API），其他用户访问返回 404
- `pending_review` 状态下：不可编辑、不可评论、不可点赞、不可收藏
- `rejected` 状态下：可编辑内容，但不可评论/点赞/收藏
- 不在首页信息流、搜索、标签页、RSS 中露出

#### 4.2.2 帖子详情页

展示内容：
- 标题
- 作者（头像 + 用户名，可点击进入主页）
- 发布时间
- 帖子正文（Markdown 渲染为 HTML）
- 标签列表（可点击进入标签页）
- 点赞数、评论数、收藏数、浏览数

用户可操作：
- 点赞/取消点赞
- 收藏/取消收藏
- 查看评论区（嵌套展示）
- 发表评论

作者/管理员可操作：
- 编辑帖子
- 删除/隐藏帖子

#### 4.2.3 首页信息流

- 默认排序：按发布时间倒序（最新）
- 可选排序：按热度（点赞数 + 评论数权重降序）
- 分页方式：cursor-based 无限滚动
- 每页 20 条
- 帖子卡片展示：标题、摘要（前 200 字符）、标签、作者、点赞/评论数、发布时间

#### 4.2.4 标签页

- 展示某标签下的所有帖子
- 排序方式与首页信息流一致
- URL 格式：`/tags/:slug`
- 标签页展示标签描述、帖子总数

#### 4.2.5 搜索

- 搜索入口：顶部导航栏搜索框
- 输入关键词（最少 2 字符）
- 搜索范围：帖子标题 + 正文
- 默认全文搜索（tsvector），降级到 ILIKE 模糊匹配
- 搜索结果页：`/search?q=关键词`
- 按时间倒序排列（cursor-based 分页依赖时间排序，若后续改为相关性排序需切换为 offset 分页）

---

### 4.3 评论系统

#### 4.3.1 评论结构

- 顶级评论：直接回复帖子
- 子评论：回复某条评论，形成嵌套
- 最大嵌套深度：由 `COMMENT_MAX_DEPTH` 配置（默认 2）

#### 4.3.2 评论展示

- 顶级评论按时间正序排列（最早的在前）
- 子评论按时间正序排列
- 评论卡片：作者头像、用户名、内容、时间、点赞数、回复按钮
- 当嵌套深度已达上限时，不显示「回复」按钮，仅显示「@」引用

#### 4.3.3 评论操作

- 发布评论/回复
- 点赞评论/取消点赞
- 作者/管理员可删除评论（软删除，status = 'deleted'，内容显示为「该评论已被删除」）

---

### 4.4 点赞系统

- 统一点赞逻辑，支持按 `target_type` 区分帖子/评论
- 点赞操作：`POST /api/v1/posts/:id/like` 点赞（已点赞返回 15001），`DELETE /api/v1/posts/:id/like` 取消点赞（未点赞返回 15002）
- 前端实时切换图标状态（实心/空心）
- 点赞数从数据库冗余字段读取（由触发器维护，避免 COUNT 查询）

---

### 4.5 收藏系统

- 收藏帖子：`POST /api/v1/posts/:id/bookmark`（已收藏返回 16001）
- 取消收藏：`DELETE /api/v1/posts/:id/bookmark`（未收藏返回 16002）
- 收藏列表：用户可在个人中心查看自己的收藏列表
- 收藏数从帖子冗余字段读取

---

### 4.6 标签系统

- 混合模式：
  - 官方标签：管理员在系统初始化时预置的标签（如 #vibe-coding, #AI工具, #作品展示, #技术讨论, #求助），`is_official = true`
  - 用户标签：用户发帖时自由创建，`is_official = false`
- 标签创建：用户在发帖时输入标签名，若不存在则自动创建
- 标签名称规范：2-50 字符
- 每帖最多 5 个标签

---

### 4.7 通知系统

#### 4.7.1 通知类型

| 类型 | 触发条件 | 通知内容 |
|------|---------|---------|
| `like` | 有人点赞了我的帖子/评论 | "xxx 点赞了你的帖子/评论" |
| `comment` | 有人评论了我的帖子 | "xxx 评论了你的帖子" |
| `reply` | 有人回复了我的评论 | "xxx 回复了你的评论" |
| `bookmark` | 有人收藏了我的帖子 | "xxx 收藏了你的帖子" |
| `follow` | 有人关注了我 | "xxx 关注了你" |
| `system` | 系统通知（审核结果等） | "你的帖子「xxx」审核未通过：违规原因" |

#### 4.7.2 推送方式

架构采用 **ECS 托管 SSE 推送服务**，与 FC 主业务服务分离：

**推送流程**：
1. 前端先调 `POST /api/v1/sse/token`（REST，走 Authorization Header），获取短期 SSE 连接票据（有效期 60s）
2. 前端用票据连接 ECS 上的 SSE 服务：`GET /sse/notifications?ticket=xxx`，**必须直连独立子域 `sse.bingbingbingo.cn`**，不可经过 Vercel 反向代理（Vercel 对长连接有 60s 超时限制，会切断 SSE）
3. ECS SSE 服务校验 ticket → 建立连接，加入连接池，发送初始 `:ok` 事件
4. FC 主业务产生通知时：写入 notifications 表 → 通过 VPC 内网调 `POST http://sse-service:3001/internal/push`，传递 `{ userId, notificationId }`
5. ECS SSE 服务查询连接池 → 若用户在线则推送事件；不在线则忽略（用户下次打开页面时从 REST API 拉取历史）
6. FC 调 ECS 失败不影响主流程（通知已写入 DB 落盘），仅丢失实时推送，用户刷新后可见

**连接管理**：
- ECS SSE 服务维持连接池 `Map<userId, Set<Response>>`，同一用户多设备各有独立连接
- 心跳：每 30s 发送 `:ping` 注释行，防止代理/负载均衡超时断连
- 前端 EventSource 自动重连，重连时携带 `Last-Event-Id` 头，ECS 据此补推漏掉的通知
- ECS 服务无数据库访问，无业务逻辑，仅做「接收 push → 查找连接 → 推送事件」

**短期 SSE Token 设计**：
- 目的：解决 EventSource API 不支持自定义 Header 的问题
- 前端调 REST API 获取一次性 ticket（60s 有效，随机 32 位字符串）
- ticket 仅用于 SSE 连接鉴权，连接建立后即失效
- 即使 ticket 在 URL 中泄露，有效期极短且一次性使用，风险可控

**前端表现**：
- 导航栏显示未读通知数量红点（SSE 实时更新 + 页面加载时从 API 拉取初始值）
- 消息中心页面：`/notifications`，展示历史通知列表
- 标记已读：进入消息中心页面时批量标记已读（前端自动调用 API）

#### 4.7.3 通知去重

- 同一用户对同一目标的相同操作不重复通知（如多次点赞只通知一次，仅有/无状态切换）

---

### 4.8 作品展示

#### 4.8.1 添加作品

- 入口：用户个人主页 → 「添加作品」
- 填写信息：名称（必填）、描述、链接、封面图、多张截图
- 图片上传：前端直传 OSS
- 每个用户最多 20 个作品（`PROJECT_MAX_PER_USER` 可配置）

#### 4.8.2 作品来源扩展设计

`source_type` 字段预留三种来源：
- `manual`：手动填写（MVP 实现）
- `github`：从 GitHub 导入（后期实现）
  - source_meta: `{ "repoId", "repoName", "commitHash" }`
- `deploy`：交互式预览部署（后期实现）
  - source_meta: `{ "deployId", "deployUrl", "previewUrl" }`

MVP 阶段仅支持 `manual` 模式，数据模型已为扩展做好准备。

---

### 4.9 关注系统

- 单向关注：A 关注 B，无需 B 确认
- 用户主页展示关注数和粉丝数
- 关注列表：按关注时间倒序
- 粉丝列表：按关注时间倒序
- 首页暂不做个性化关注流（Phase 2 实现）

---

## 五、安全性设计

### 5.1 认证与授权

- JWT 双 Token 模式
- Access Token 有效期：30 分钟
- Refresh Token 有效期：7 天
- Token 存储方式：
  - Access Token：内存变量（前端 JS 闭包），不持久化，避免 XSS 窃取
  - Refresh Token：httpOnly, Secure, SameSite=Lax Cookie，由后端 Set-Cookie 写入，前端不可读
- Token 刷新：前端拦截器在 401 时调 `/api/v1/auth/refresh`，后端从 Cookie 读取 Refresh Token 并颁发新 Token 对
- 所有需要认证的接口检查 Authorization header（`Bearer <access_token>`）
- **MVP 限制**：Refresh Token 存储在 users 表单字段中，同一时刻仅支持单设备登录。新设备登录会覆盖旧设备的 Refresh Token。后期可拆分为独立表 `user_refresh_tokens` 支持多设备。

### 5.2 接口限流

- 基于 Upstash Redis 实现
- 全局限流：120 req/min
- 敏感接口单独限流：
  - 登录：10 req/min
  - 注册：5 req/min
  - 发帖：10 req/min

### 5.3 内容安全

**自动机审（异步）**：
- 发帖时：帖子先保存为 `pending_review` 状态（仅作者可见），异步调阿里云内容安全 API 审核
- 通过 → 自动发布（`published`）；不通过 → 标记 `rejected`，通知用户违规原因
- 评论发布：同步调内容安全 API（评论体量小，响应快），通过则发布，拦截则提示
- 降级：API 不可用时，3 次重试后自动放行 + 告警日志，事后人工抽检

**用户举报**：
- 帖子详情页和评论卡片上的「举报」按钮
- 举报后管理员在消息中心收到通知，可从通知跳转到目标内容
- 举报记录留存（后期可在 admin_logs 中追踪）

**管理员操作**：
- 管理员可在前端直接隐藏/删除违规内容
- 管理操作需校验 `role === 'admin'`

### 5.4 数据安全

- 密码使用 bcrypt 哈希
- JWT Secret 通过环境变量注入
- 数据库连接使用 SSL
- 用户软删除（status = 'deleted'），不物理删除数据

---

## 六、API 设计规范

### 6.1 响应格式

所有 API 接口返回统一格式：

```json
{
  "code": 0,
  "data": { ... },
  "message": "ok"
}
```

- `code: 0` — 成功
- `code: 非0` — 错误（详见 [error-codes.md](./error-codes.md)）
- `data` — 成功时返回数据体，失败时为 `null`
- `message` — 错误时返回中文提示，成功时为 "ok"

### 6.2 分页格式

```json
{
  "code": 0,
  "data": {
    "items": [...],
    "cursor": "0193c1e8-7f6a-7000-8000-000000000000",
    "hasMore": true
  }
}
```

- 所有列表接口使用 cursor-based 分页（基于 UUID v7 主键，天然按时间有序）
- 前端传递 `?cursor=0193c1e8-xxxx&limit=20` 参数，首次请求不传 cursor

### 6.3 API 路由规划

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/v1/auth/register | 邮箱注册 | 否 |
| POST | /api/v1/auth/login | 邮箱登录 | 否 |
| POST | /api/v1/auth/refresh | 刷新 Token（从 Cookie 读取 Refresh Token） | 否 |
| POST | /api/v1/auth/verify-email | 邮箱激活（token 参数） | 否 |
| POST | /api/v1/auth/forgot-password | 发送重置密码邮件 | 否 |
| POST | /api/v1/auth/reset-password | 重置密码（token + 新密码） | 否 |
| GET | /api/v1/auth/github | GitHub OAuth 登录跳转 | 否 |
| GET | /api/v1/auth/github/callback | GitHub OAuth 回调 | 否 |
| GET | /api/v1/users/:id | 用户信息 | 否 |
| PATCH | /api/v1/users/me | 更新个人资料 | 是 |
| GET | /api/v1/users/me/posts | 「我的帖子」列表（含 pending_review/rejected 状态） | 是 |
| GET | /api/v1/users/me/notifications | 通知列表 | 是 |
| POST | /api/v1/users/me/notifications/read | 标记已读 | 是 |
| GET | /api/v1/posts | 帖子列表（首页信息流） | 否 |
| POST | /api/v1/posts | 发布帖子 | 是 |
| GET | /api/v1/posts/:slug | 帖子详情 | 否 |
| PATCH | /api/v1/posts/:id | 编辑帖子 | 是 |
| DELETE | /api/v1/posts/:id | 删除帖子（软删除，status='deleted'） | 是 |
| POST | /api/v1/posts/:id/resubmit | 修改后重新提交审核（仅 rejected 状态可用） | 是 |
| POST | /api/v1/posts/:id/like | 点赞帖子 | 是 |
| DELETE | /api/v1/posts/:id/like | 取消点赞帖子 | 是 |
| POST | /api/v1/posts/:id/bookmark | 收藏帖子 | 是 |
| DELETE | /api/v1/posts/:id/bookmark | 取消收藏帖子 | 是 |
| GET | /api/v1/posts/:id/comments | 帖子评论列表 | 否 |
| POST | /api/v1/posts/:id/comments | 发布评论 | 是 |
| DELETE | /api/v1/comments/:id | 删除评论（软删除，status='deleted'） | 是 |
| POST | /api/v1/comments/:id/like | 点赞评论 | 是 |
| DELETE | /api/v1/comments/:id/like | 取消点赞评论 | 是 |
| GET | /api/v1/tags | 标签列表 | 否 |
| GET | /api/v1/tags/:slug | 标签详情 + 帖子列表 | 否 |
| POST | /api/v1/follows | 关注用户 | 是 |
| DELETE | /api/v1/follows/:userId | 取消关注 | 是 |
| GET | /api/v1/users/:id/followers | 粉丝列表 | 否 |
| GET | /api/v1/users/:id/following | 关注列表 | 否 |
| GET | /api/v1/users/:id/projects | 用户作品列表 | 否 |
| POST | /api/v1/projects | 添加作品 | 是 |
| PATCH | /api/v1/projects/:id | 编辑作品 | 是 |
| DELETE | /api/v1/projects/:id | 删除作品 | 是 |
| POST | /api/v1/media/upload-credential | 获取 OSS 上传凭证 | 是 |
| POST | /api/v1/sse/token | 获取短期 SSE 连接票据（60s 有效） | 是 |
| GET | /api/v1/search | 全文搜索 | 否 |

**SSE 专用端点（部署在 ECS，非 FC）**：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /sse/notifications?ticket=xxx | SSE 长连接，ticket 校验后建立 |
| POST | /internal/push | FC 内网回调推送 `{ userId, notificationId }` |

---

## 七、页面路由规划

| 路径 | 页面 | SSR | 说明 |
|------|------|-----|------|
| / | 首页 | ISR (revalidate: 60s) | 最新帖子信息流，60 秒增量再生成 |
| /login | 登录页 | CSR | 邮箱登录 + GitHub OAuth 按钮 |
| /register | 注册页 | CSR | 邮箱注册表单 |
| /posts/:slug | 帖子详情 | SSR | 帖子内容 + 评论区 |
| /search | 搜索结果 | CSR | `?q=关键词` |
| /tags/:slug | 标签页 | CSR | 标签下帖子列表 |
| /u/:username | 用户主页 | CSR | 作品展示 + 最近帖子 |
| /u/:username/projects | 作品列表 | CSR | 用户所有作品 |
| /notifications | 通知中心 | CSR | 历史通知列表（需登录） |
| /settings/profile | 个人设置 | CSR | 编辑个人资料（需登录） |
| /settings/account | 账号设置 | CSR | 密码修改、GitHub 绑定（需登录） |

---

## 八、部署方案

### 8.1 前端（apps/web）

- 平台：Vercel
- 域名：bingbingbingo.cn（自定义域名绑定到 Vercel）
- SSL：Vercel 自动签发
- 部署触发：推送到 `main` 分支自动部署
- 预览环境：PR 自动创建预览 URL

### 8.2 后端（apps/api）

- 平台：阿里云函数计算（FC） + API 网关
- 区域：与 RDS 和 OSS 同区域（如 华东1 杭州）
- 构建：GitHub Actions
- 部署触发：推送到 `main` 分支自动构建并部署到 FC

### 8.3 SSE 推送服务（apps/sse）

- 平台：阿里云 ECS
- 规格：1C 1G（ecs.e-c1m1.large），初期最低配即可支撑数千并发连接
- 操作系统：Alibaba Cloud Linux 3 或 Ubuntu 22.04
- 运行时：Node.js 22
- 网络：与 FC / RDS / OSS 同 VPC，仅内网暴露 3001 端口；对外通过 SLB + 域名暴露 SSE 端点
- 域名：`sse.bingbingbingo.cn`（SSL 通过阿里云免费证书或 SLB 终结）
- 构建/部署：GitHub Actions，构建 Docker 镜像 → 推送阿里云容器镜像服务 → ECS 拉取并重启
- 健康检查：`GET /health`，SLB 每 10s 检测，异常自动摘除
- 监控：云监控（CPU / 内存 / 连接数），连接数异常告警

### 8.4 基础设施

| 服务 | 区域 | 说明 |
|------|------|------|
| RDS PostgreSQL | 华东1 杭州 | 标准版，初期最低配 |
| OSS | 华东1 杭州 | 标准存储 + CDN 加速 |
| 函数计算 FC | 华东1 杭州 | 和 RDS/OSS 同区域 |
| ECS | 华东1 杭州 | SSE 推送服务，同 VPC 内网互通 |
| Redis | Upstash 新加坡 | 仅用于限流，延迟可接受 |

---

## 九、后续版本规划

### Phase 2（待规划）

- 个性化关注流：首页支持「关注的人」动态
- GitHub 作品自动导入
- 独立管理后台
- 邮件通知可选推送
- 用户数据统计仪表盘
- 更精细的权限管理

### Phase 3（远景）

- 可交互 App 预览（iframe 嵌入）
- AI 编程工具深度集成（一键分享 prompt/结果）
- 快速 vibe 产物一键部署
- 自定义域名绑定
- API 开放平台

---

## 十、参考文档

| 文档 | 路径 |
|------|------|
| 数据表设计 | [database.md](./database.md) |
| 错误码清单 | [error-codes.md](./error-codes.md) |
| 配置文件说明 | [config.md](./config.md) |
| UI 设计规范 | [ui-spec.md](./ui-spec.md) |
