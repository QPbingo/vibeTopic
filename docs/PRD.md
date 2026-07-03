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
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                           │
│               bingbingbingo.cn (Vercel)                  │
└─────────┬───────────────────────────┬───────────────────┘
          │                           │
    静态资源 (HTML/JS/CSS)      REST API /api/v1/*
          │                           │
    ┌─────▼──────┐          ┌─────────▼──────────┐
    │   Vercel   │          │  阿里云 FC + API网关  │
    │  (Next.js)  │          │   (Node.js Server)  │
    └────────────┘          └─────────┬──────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              ┌─────▼─────┐   ┌──────▼──────┐   ┌──────▼──────┐
              │ 阿里云 RDS │   │  阿里云 OSS  │   │    Redis     │
              │ PostgreSQL│   │  (图片/CDN)  │   │  (Upstash)   │
              └───────────┘   └─────────────┘   └─────────────┘
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
| 项目结构 | pnpm workspace monorepo | apps/web + apps/api + packages/shared |

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
4. 发送验证邮件（阿里云邮件推送）
5. 用户点击邮件链接激活账号
6. 返回 JWT Access Token + Refresh Token

**GitHub OAuth 登录流程**：
1. 用户点击「GitHub 登录」按钮
2. 跳转 GitHub 授权页面
3. GitHub 回调，后端获取用户信息
4. 首次登录自动创建账号（username 默认使用 GitHub 用户名，如冲突加随机后缀）
5. 返回 JWT Access Token + Refresh Token

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
4. 选择/创建标签（最多 5 个）
5. 点击发布
6. 后端内容安全审核（调用阿里云内容安全 API）
   - 通过 → 直接发布，status = 'published'
   - 拦截 → 提示用户修改
7. 生成 slug（标题转拼音/英文 + 6位随机字符串）

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
- 按时间倒序排列

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
- 点赞操作：POST 点赞，再次调用取消（toggle 模式）
- 前端实时切换图标状态（实心/空心）
- 点赞数从数据库冗余字段读取（由触发器维护，避免 COUNT 查询）

---

### 4.5 收藏系统

- 收藏帖子：在帖子详情页 / 帖子卡片上点击收藏按钮
- 取消收藏：再次点击取消
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

#### 4.7.2 推送方式

- SSE (Server-Sent Events)：前端建立长连接，有新通知时服务端推送
- 导航栏显示未读通知数量红点
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
- Access Token 缓存时间：30 分钟
- Refresh Token 存储：数据库哈希后存储，前端通过 HTTP-Only Cookie 或 LocalStorage 存储（由 API 返回）
- 所有需要认证的接口检查 Authorization header

### 5.2 接口限流

- 基于 Upstash Redis 实现
- 全局限流：120 req/min
- 敏感接口单独限流：
  - 登录：10 req/min
  - 注册：5 req/min
  - 发帖：10 req/min

### 5.3 内容安全

- 发帖/评论时调用阿里云内容安全 API 自动机审
- 拦截违规内容，提示用户修改
- 用户举报：帖子详情页和评论卡片上的举报按钮
- 管理员可在前端直接隐藏/删除违规内容

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
    "cursor": "2026-07-01T12:00:00Z",
    "hasMore": true
  }
}
```

- 所有列表接口使用 cursor-based 分页（基于时间戳或自增 ID）
- 前端传递 `?cursor=xxx&limit=20` 参数

### 6.3 API 路由规划

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/v1/auth/register | 邮箱注册 | 否 |
| POST | /api/v1/auth/login | 邮箱登录 | 否 |
| POST | /api/v1/auth/refresh | 刷新 Token | 否 |
| GET | /api/v1/auth/github | GitHub OAuth 登录跳转 | 否 |
| GET | /api/v1/auth/github/callback | GitHub OAuth 回调 | 否 |
| GET | /api/v1/users/:id | 用户信息 | 否 |
| PATCH | /api/v1/users/me | 更新个人资料 | 是 |
| GET | /api/v1/users/me/notifications | 通知列表 | 是 |
| POST | /api/v1/users/me/notifications/read | 标记已读 | 是 |
| GET | /api/v1/posts | 帖子列表（首页信息流） | 否 |
| POST | /api/v1/posts | 发布帖子 | 是 |
| GET | /api/v1/posts/:slug | 帖子详情 | 否 |
| PATCH | /api/v1/posts/:id | 编辑帖子 | 是 |
| DELETE | /api/v1/posts/:id | 删除帖子 | 是 |
| POST | /api/v1/posts/:id/like | 点赞/取消帖子 | 是 |
| POST | /api/v1/posts/:id/bookmark | 收藏/取消帖子 | 是 |
| GET | /api/v1/posts/:id/comments | 帖子评论列表 | 否 |
| POST | /api/v1/posts/:id/comments | 发布评论 | 是 |
| DELETE | /api/v1/comments/:id | 删除评论 | 是 |
| POST | /api/v1/comments/:id/like | 点赞/取消评论 | 是 |
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
| GET | /api/v1/search | 全文搜索 | 否 |
| GET | /api/v1/sse/notifications | SSE 通知订阅 | 是 |

---

## 七、页面路由规划

| 路径 | 页面 | SSR | 说明 |
|------|------|-----|------|
| / | 首页 | SSG | 最新帖子信息流 |
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

### 8.3 基础设施

| 服务 | 区域 | 说明 |
|------|------|------|
| RDS PostgreSQL | 华东1 杭州 | 标准版，初期最低配 |
| OSS | 华东1 杭州 | 标准存储 + CDN 加速 |
| 函数计算 FC | 华东1 杭州 | 和 RDS/OSS 同区域 |
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
