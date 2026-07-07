# MVP 实现状态（2026-07-07）

本文件对照 `PRD.md`、`ui-spec.md` 与当前代码，区分已验证能力和仍需实现的外部集成，避免把开发降级路径误当成生产能力。

## 已实现并有自动化/运行验证

- pnpm workspace 的安装、lint、TypeScript、生产构建与 Prisma schema 校验。
- 邮箱注册/登录、Access + Refresh Token、刷新轮换、登出吊销、封禁账号拦截。
- 帖子 Feed（最新/最热/精华）、详情 SSR、创建/编辑/软删除/重新提交、点赞与收藏。
- 服务端 Markdown 渲染与 HTML 净化；客户端提交的 HTML 不作为可信内容入库。
- 评论、嵌套深度限制、跨帖子父评论拦截、评论点赞。
- 标签、搜索、关注、作品 CRUD、通知历史与未读数。
- SSE 一次性 ticket、连接上限、心跳、通知推送和前端未读计数接入。
- `/posts/new` bytemd 发帖页面、`/posts/[slug]/edit` rejected 帖子编辑并重新提交页面；导航栏提供发布入口。
- `/forgot-password`、`/reset-password` 页面与后端 password_reset token 生命周期；本地开发会返回调试 token，生产邮件发送适配未伪装完成。
- 暗/亮主题、移动底栏、375/768/1024/1440 响应式布局、无横向溢出。
- 数据库初始化分为容器扩展阶段和 Prisma 建表后的触发器/全文索引阶段。

## 默认关闭的生产外部适配器

以下开关默认关闭时有安全的本地降级路径；当前仓库尚未包含对应云厂商 SDK 适配器，不能仅通过把开关改为 `true` 就宣称生产可用：

- `MAIL_ENABLED`：阿里云 DirectMail 邮箱验证/密码重置邮件；启用时密码重置请求会安全返回 503，直到真实邮件适配器接入。
- `GITHUB_OAUTH_ENABLED`：GitHub OAuth 回调流程。
- `TURNSTILE_ENABLED`：Cloudflare Turnstile 服务端校验。
- `CONTENT_AUDIT_ENABLED`：阿里云内容安全异步审核。
- `OSS_ENABLED`：阿里云 STS。启用时接口会安全地返回 503，不会泄露长期密钥。
- `REDIS_ENABLED`：Upstash 分布式限流；关闭时使用单进程内存限流。

## 尚未提供的 PRD 页面入口

- bytemd 图片粘贴/拖拽直传 OSS 交互（当前编辑器支持 Markdown 图片 URL；`OSS_ENABLED=true` 的生产 STS 适配仍未实现）。
- 邮箱验证页面与注册验证邮件流程。
- `/settings/account`、作品列表/编辑页、关注/粉丝列表页。
- 举报入口与管理员隐藏/封禁操作 UI。

这些是功能范围缺口，不属于本轮已通过的稳定性声明。完整数据库集成测试还需要可用的 PostgreSQL 16；当前执行环境没有 Docker、`psql` 或本地 PostgreSQL，因此只完成了 schema、SQL 阶段拆分和不依赖数据库的 API/SSE 运行烟测。
