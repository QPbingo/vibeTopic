# bingbingbingo 数据库设计文档

## 命名规范

- 表名使用小写字母 + 下划线（snake_case），复数形式
- 字段名使用 snake_case
- 主键统一使用 `id`（UUID v7，兼顾唯一性与时间有序性）
- 时间字段统一 `created_at`（创建时间）、`updated_at`（更新时间，由触发器自动维护）
- 所有表、字段均附带中文注释
- 枚举类型使用 `VARCHAR` 存储，注释中说明可取值

---

## 1. 用户体系

### 1.1 users — 用户表

存储所有注册用户的核心信息。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 用户唯一标识 |
| username | VARCHAR(30) | UNIQUE, NOT NULL | 用户名，3-30字符，只能包含字母数字下划线 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱地址 |
| password_hash | VARCHAR(255) | | 密码哈希值（邮箱注册用户），GitHub OAuth 用户为空 |
| avatar_url | VARCHAR(1024) | | 头像 OSS 地址 |
| bio | TEXT | | 个人简介，最大500字符 |
| github_id | VARCHAR(50) | UNIQUE | GitHub 用户 ID（GitHub OAuth 用户） |
| github_username | VARCHAR(39) | | GitHub 用户名 |
| github_url | VARCHAR(255) | | GitHub 个人主页 URL |
| refresh_token | TEXT | | JWT Refresh Token 哈希值 |
| refresh_token_expires_at | TIMESTAMPTZ | | Refresh Token 过期时间 |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'user' | 角色：`user`（普通用户）/ `admin`（管理员） |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | 状态：`active`（正常）/ `banned`（封禁）/ `deleted`（已注销） |
| last_login_at | TIMESTAMPTZ | | 最后登录时间 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 注册时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引**：
- `idx_users_username` ON (username)
- `idx_users_email` ON (email)
- `idx_users_github_id` ON (github_id)
- `idx_users_created_at` ON (created_at)

### 1.2 user_follows — 用户关注表

记录用户之间的关注关系（单向关注）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| follower_id | UUID | PK (联合), FK → users.id | 关注者用户 ID |
| followee_id | UUID | PK (联合), FK → users.id | 被关注者用户 ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 关注时间 |

**索引**：
- `idx_user_follows_followee` ON (followee_id) — 查询粉丝列表
- `idx_user_follows_follower` ON (follower_id) — 查询关注列表

**约束**：
- CHECK (follower_id != followee_id) — 不能关注自己

---

## 2. 帖子体系

### 2.1 posts — 帖子表

存储所有用户发布的帖子内容。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 帖子唯一标识 |
| title | VARCHAR(200) | NOT NULL | 帖子标题，1-200字符 |
| content_md | TEXT | NOT NULL | 帖子正文 Markdown 原始内容 |
| content_html | TEXT | NOT NULL | 帖子正文预渲染后的 HTML（加速前端展示） |
| slug | VARCHAR(250) | UNIQUE, NOT NULL | URL 友好的唯一标识（由标题自动生成 + 随机后缀） |
| user_id | UUID | FK → users.id, NOT NULL | 发帖用户 ID |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'published' | 状态：`published`（已发布）/ `hidden`（已隐藏）/ `deleted`（已删除） |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | 浏览次数 |
| like_count | INTEGER | NOT NULL, DEFAULT 0 | 点赞数（冗余字段，实际值从 likes 表计算） |
| comment_count | INTEGER | NOT NULL, DEFAULT 0 | 评论数（冗余字段，实际值从 comments 表计算） |
| bookmark_count | INTEGER | NOT NULL, DEFAULT 0 | 收藏数（冗余字段） |
| is_pinned | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否置顶（仅管理员可设置） |
| edited_at | TIMESTAMPTZ | | 最后编辑时间 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 发布时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引**：
- `idx_posts_user_id` ON (user_id)
- `idx_posts_status_created` ON (status, created_at DESC) — 首页信息流
- `idx_posts_slug` ON (slug)
- `idx_posts_fts` — GIN 索引，用于 PostgreSQL 全文搜索（content_md + title）

**全文搜索**：
- 搜索列：`tsv_content`（GENERATED ALWAYS AS to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content_md,'')) STORED）
- GIN 索引：`idx_posts_tsv_content` ON USING GIN (tsv_content)

### 2.2 tags — 标签表

存储所有标签信息，混合模式：官方预置 + 用户可自由创建。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 标签唯一标识 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 标签显示名称（如 "Vibe Coding"） |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL 友好的英文标识（如 "vibe-coding"） |
| description | TEXT | | 标签描述 |
| is_official | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否官方标签：`true`（管理员创建）/ `false`（用户创建） |
| post_count | INTEGER | NOT NULL, DEFAULT 0 | 关联帖子数量（冗余字段） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引**：
- `idx_tags_slug` ON (slug)
- `idx_tags_name` ON (name)

### 2.3 post_tags — 帖子标签关联表

帖子与标签的多对多中间表。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| post_id | UUID | PK (联合), FK → posts.id | 帖子 ID |
| tag_id | UUID | PK (联合), FK → tags.id | 标签 ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 关联时间 |

**索引**：
- `idx_post_tags_tag` ON (tag_id) — 查询某标签下的所有帖子

---

## 3. 互动体系

### 3.1 comments — 评论表

存储帖子下的评论，支持嵌套回复，嵌套深度由配置文件控制。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 评论唯一标识 |
| post_id | UUID | FK → posts.id, NOT NULL | 所属帖子 ID |
| user_id | UUID | FK → users.id, NOT NULL | 评论用户 ID |
| parent_id | UUID | FK → comments.id | 回复的父评论 ID，NULL 表示顶级评论 |
| root_id | UUID | FK → comments.id | 顶级评论 ID（辅助快速查询评论树），NULL 表示自身为顶级评论 |
| content_md | TEXT | NOT NULL | 评论 Markdown 原始内容 |
| content_html | TEXT | NOT NULL | 评论预渲染后的 HTML |
| depth | INTEGER | NOT NULL, DEFAULT 0 | 嵌套深度：0=顶级评论，1=一级回复，2=二级回复... |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'published' | 状态：`published`（已发布）/ `hidden`（已隐藏）/ `deleted`（已删除） |
| like_count | INTEGER | NOT NULL, DEFAULT 0 | 点赞数（冗余字段） |
| edited_at | TIMESTAMPTZ | | 最后编辑时间 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 评论时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引**：
- `idx_comments_post_root` ON (post_id, root_id, created_at ASC) — 查询帖子下评论树
- `idx_comments_user_id` ON (user_id) — 查询用户评论历史

### 3.2 likes — 点赞表

统一的点赞记录表，通过 target_type 区分点赞对象类型。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 点赞唯一标识 |
| user_id | UUID | FK → users.id, NOT NULL | 点赞用户 ID |
| target_type | VARCHAR(10) | NOT NULL | 目标类型：`post`（帖子）/ `comment`（评论） |
| target_id | UUID | NOT NULL | 目标 ID（帖子 ID 或 评论 ID） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 点赞时间 |

**索引**：
- `uq_likes_user_target` UNIQUE (user_id, target_type, target_id) — 同一用户对同一目标只能点赞一次
- `idx_likes_target` ON (target_type, target_id) — 查询某目标的点赞列表

### 3.3 bookmarks — 收藏表

记录用户收藏的帖子。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 收藏唯一标识 |
| user_id | UUID | FK → users.id, NOT NULL | 收藏用户 ID |
| post_id | UUID | FK → posts.id, NOT NULL | 被收藏帖子 ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 收藏时间 |

**索引**：
- `uq_bookmarks_user_post` UNIQUE (user_id, post_id)
- `idx_bookmarks_user` ON (user_id, created_at DESC) — 用户收藏列表

---

## 4. 通知体系

### 4.1 notifications — 通知表

存储所有用户通知，通过 SSE 推送到前端。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 通知唯一标识 |
| user_id | UUID | FK → users.id, NOT NULL | 通知接收者用户 ID |
| type | VARCHAR(20) | NOT NULL | 通知类型：`like`（被点赞）/ `comment`（被评论）/ `reply`（评论被回复）/ `bookmark`（被收藏）/ `follow`（被关注） |
| actor_id | UUID | FK → users.id, NOT NULL | 触发通知的用户 ID |
| target_type | VARCHAR(10) | | 关联目标类型：`post` / `comment` |
| target_id | UUID | | 关联目标 ID |
| content | VARCHAR(500) | | 通知摘要文本（如 "xxx 评论了你的帖子"） |
| is_read | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否已读 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 通知时间 |

**索引**：
- `idx_notifications_user_unread` ON (user_id, is_read, created_at DESC) — 查询未读通知
- `idx_notifications_user_created` ON (user_id, created_at DESC) — 通知中心列表

---

## 5. 作品展示

### 5.1 projects — 作品表

用户主页展示的作品。source_type + source_meta 为后续 GitHub 导入和交互预览预留扩展。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 作品唯一标识 |
| user_id | UUID | FK → users.id, NOT NULL | 所属用户 ID |
| title | VARCHAR(100) | NOT NULL | 作品名称 |
| description | TEXT | | 作品描述 |
| cover_image | VARCHAR(1024) | | 封面图 OSS 地址 |
| images | JSONB | DEFAULT '[]' | 多张截图列表，存储为 OSS 地址的 JSON 数组 |
| source_type | VARCHAR(20) | NOT NULL, DEFAULT 'manual' | 作品来源：`manual`（手动填写）/ `github`（从 GitHub 导入）/ `deploy`（交互预览部署） |
| source_url | VARCHAR(1024) | | 作品链接（部署 URL 或 GitHub URL） |
| source_meta | JSONB | DEFAULT '{}' | 扩展元数据，按 source_type 存储不同结构：<br/>- `manual`: `{}`<br/>- `github`: `{ "repoId": "xxx", "repoName": "xxx", "commitHash": "xxx" }`<br/>- `deploy`: `{ "deployId": "xxx", "deployUrl": "xxx", "previewUrl": "xxx" }` |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | 排序权重，数字越大越靠前 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'published' | 状态：`published` / `hidden` |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引**：
- `idx_projects_user_sort` ON (user_id, sort_order DESC, created_at DESC)

---

## 6. 文件管理

### 6.1 media_files — 上传文件记录表

记录所有通过 OSS 上传的文件，方便追溯和管理。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 文件唯一标识 |
| user_id | UUID | FK → users.id, NOT NULL | 上传用户 ID |
| file_url | VARCHAR(1024) | NOT NULL | 文件公开访问 URL（OSS CDN 地址） |
| file_type | VARCHAR(20) | NOT NULL | 文件类型：`image`（图片）/ `other`（其他） |
| file_size | BIGINT | NOT NULL | 文件大小（字节） |
| mime_type | VARCHAR(100) | | MIME 类型（如 image/png） |
| original_name | VARCHAR(500) | | 原始文件名 |
| oss_object_key | VARCHAR(500) | NOT NULL | OSS 对象 Key（用于删除和管理） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 上传时间 |

**索引**：
- `idx_media_files_user` ON (user_id, created_at DESC)

---

## 7. 外挂索引 - 辅助表

### 7.1 search_history — 搜索历史表（选做，后期添加）

可选，用于提供用户搜索建议。

### 7.2 admin_logs — 管理员操作日志表（选做，后期添加）

可选，用于追踪管理操作审计。

---

## 触发器说明

以下冗余计数器字段由数据库触发器自动同步，不直接在应用层修改：

- `posts.like_count` ← 监听 `likes` 表的 INSERT/DELETE
- `posts.comment_count` ← 监听 `comments` 表的 INSERT/DELETE（仅 status='published'）
- `posts.bookmark_count` ← 监听 `bookmarks` 表的 INSERT/DELETE
- `comments.like_count` ← 监听 `likes` 表的 INSERT/DELETE（target_type='comment'）
- `tags.post_count` ← 监听 `post_tags` 表的 INSERT/DELETE
- `posts.updated_at` ← 任意字段变更时自动更新时间
