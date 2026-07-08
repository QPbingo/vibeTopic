// ============================================================
// bingbingbingo — Database Seed Script
// Run: pnpm db:seed
// ============================================================

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

const prisma = new PrismaClient()

function renderMarkdown(markdown: string): string {
  const rendered = marked.parse(markdown, { async: false, gfm: true, breaks: true }) as string
  return sanitizeHtml(rendered, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'del', 'blockquote', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'a', 'img',
      'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'rel'],
      img: ['src', 'alt', 'title'],
      code: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_tagName: string, attribs: Record<string, string>) => ({
        tagName: 'a',
        attribs: { ...attribs, rel: 'noopener noreferrer' },
      }),
    },
  })
}

function generateSlug(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100)
  if (!base) return `post-${Math.random().toString(36).slice(2, 8)}`
  return `${base}-${Math.random().toString(36).slice(2, 8)}`
}

function createExcerpt(contentMd: string, maxLen = 200): string {
  const plain = contentMd
    .replace(/#{1,6}\s/g, '').replace(/\*\*?|__?|~~|`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '[图片]')
    .replace(/```[\s\S]*?```/g, '[代码块]').replace(/`[^`]*`/g, '[代码]')
    .replace(/\n+/g, ' ').trim()
  return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain
}

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bingbingbingo.cn' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@bingbingbingo.cn',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      status: 'active',
      bio: '社区管理员',
    },
  })
  console.log(`  ✅ Admin user: ${admin.username}`)

  // 2. Create demo users
  const demoUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'viber@example.com' },
      update: {},
      create: {
        username: 'VibeMaster',
        email: 'viber@example.com',
        passwordHash: bcrypt.hashSync('demo1234', 10),
        role: 'user',
        status: 'active',
        bio: '热爱 Vibe Coding 的全栈开发者，专注 AI 辅助编程',
      },
    }),
    prisma.user.upsert({
      where: { email: 'retro@example.com' },
      update: {},
      create: {
        username: 'RetroDev',
        email: 'retro@example.com',
        passwordHash: bcrypt.hashSync('demo1234', 10),
        role: 'user',
        status: 'active',
        bio: '独立开发者 | 像素艺术爱好者 | 游戏开发',
      },
    }),
    prisma.user.upsert({
      where: { email: 'terminal@example.com' },
      update: {},
      create: {
        username: 'TerminalFan',
        email: 'terminal@example.com',
        passwordHash: bcrypt.hashSync('demo1234', 10),
        role: 'user',
        status: 'active',
        bio: 'CLI 工具狂魔 · 开源贡献者',
      },
    }),
    prisma.user.upsert({
      where: { email: 'pixel@example.com' },
      update: {},
      create: {
        username: 'PixelArtist',
        email: 'pixel@example.com',
        passwordHash: bcrypt.hashSync('demo1234', 10),
        role: 'user',
        status: 'active',
        bio: '设计师转前端，喜欢用 AI 实现像素级设计',
      },
    }),
  ])
  console.log(`  ✅ ${demoUsers.length} demo users created`)

  // 3. Create official tags
  const officialTags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'vibe-coding' }, update: {}, create: { name: 'Vibe Coding', slug: 'vibe-coding', description: 'AI 辅助编程、vibe coding 相关讨论', isOfficial: true } }),
    prisma.tag.upsert({ where: { slug: 'ai-tools' }, update: {}, create: { name: 'AI工具', slug: 'ai-tools', description: 'Cursor、Claude Code、Copilot 等 AI 编程工具', isOfficial: true } }),
    prisma.tag.upsert({ where: { slug: 'showcase' }, update: {}, create: { name: '作品展示', slug: 'showcase', description: '展示你的 vibe coding 作品', isOfficial: true } }),
    prisma.tag.upsert({ where: { slug: 'tech-discussion' }, update: {}, create: { name: '技术讨论', slug: 'tech-discussion', description: '技术问题讨论与交流', isOfficial: true } }),
    prisma.tag.upsert({ where: { slug: 'help' }, update: {}, create: { name: '求助', slug: 'help', description: '遇到问题？来这里求助', isOfficial: true } }),
  ])
  console.log(`  ✅ ${officialTags.length} official tags`)

  // 4. Create user-created tags
  const userTags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'next-js' }, update: {}, create: { name: 'Next.js', slug: 'next-js', isOfficial: false } }),
    prisma.tag.upsert({ where: { slug: 'react' }, update: {}, create: { name: 'React', slug: 'react', isOfficial: false } }),
    prisma.tag.upsert({ where: { slug: 'typescript' }, update: {}, create: { name: 'TypeScript', slug: 'typescript', isOfficial: false } }),
    prisma.tag.upsert({ where: { slug: 'tailwind-css' }, update: {}, create: { name: 'Tailwind CSS', slug: 'tailwind-css', isOfficial: false } }),
    prisma.tag.upsert({ where: { slug: 'claude-code' }, update: {}, create: { name: 'Claude Code', slug: 'claude-code', isOfficial: false } }),
  ])
  console.log(`  ✅ ${userTags.length} user tags`)

  const allTags = [...officialTags, ...userTags]

  // 5. Create sample posts (idempotent — skip if slug already exists)
  const samplePosts = [
    {
      title: '用 Claude Code 3 小时搭建了一个完整的 SaaS 原型',
      contentMd: `## 背景\n\n最近在用 Claude Code 做 side project，发现效率真的惊人。\n\n## 做了什么\n\n一个完整的 SaaS 原型，包括：\n\n- 用户注册/登录\n- Dashboard 数据面板\n- 支付集成\n- Admin 后台\n\n## 关键技巧\n\n\`\`\`bash\n# 用 Claude Code 的 plan mode 先设计架构\nclaude plan "build a saas boilerplate with next.js"\n\`\`\`\n\n## 总结\n\nClaude Code 最强大的地方是能理解上下文并进行多步骤重构。`,
      tags: ['vibe-coding', 'claude-code', 'showcase'],
    },
    {
      title: '像素风 UI 组件库开源 — pixel-ui 1.0 发布',
      contentMd: `## pixel-ui 1.0\n\n一个面向 vibe coding 时代的像素风组件库。\n\n## 特性\n\n- 🎮 纯 CSS 像素阴影系统\n- 🌈 彩虹镭射色彩方案\n- 🖥 CRT 扫描线效果\n- 🌓 暗色/亮色双主题\n\n## 安装\n\n\`\`\`bash\npnpm add pixel-ui\n\`\`\`\n\n## 链接\n\nGitHub: https://github.com/example/pixel-ui`,
      tags: ['showcase', 'react', 'tailwind-css'],
    },
    {
      title: '从零到一：我的 AI 辅助开发工作流分享',
      contentMd: `## 我的工具链\n\n1. **Cursor** — 日常编码\n2. **Claude Code** — 复杂重构和架构设计\n3. **v0** — 快速 UI 原型\n4. **GitHub Copilot** — 代码补全\n\n## 工作流程\n\n### 第一步：需求分析\n\n用 Claude 分析需求，生成 PRD 文档。\n\n### 第二步：UI 设计\n\n用 v0 快速出原型，再手动调整细节。\n\n### 第三步：核心开发\n\nCursor + Copilot 写业务代码，Claude Code 做代码审查。\n\n## 效率对比\n\n| 方式 | 时间 |\n|------|------|\n| 传统开发 | 40h |\n| AI 辅助 | 12h |\n\n效率提升约 **70%**！`,
      tags: ['vibe-coding', 'ai-tools', 'tech-discussion'],
    },
    {
      title: '求助：Next.js 15 + Prisma 的事务处理最佳实践',
      contentMd: `## 问题描述\n\n在 Next.js 15 中使用 Prisma 处理复杂事务时遇到了并发问题。\n\n## 场景\n\n用户下订单时需要同时：\n1. 扣减库存\n2. 创建订单\n3. 生成支付记录\n\n## 当前代码\n\n\`\`\`typescript\nconst result = await prisma.$transaction(async (tx) => {\n  const inventory = await tx.inventory.update(...)\n  const order = await tx.order.create(...)\n  const payment = await tx.payment.create(...)\n  return { inventory, order, payment }\n})\n\`\`\`\n\n## 问题\n\n并发情况下会出现库存负数。有什么好的解决方案吗？`,
      tags: ['help', 'next-js', 'typescript'],
    },
    {
      title: 'Tailwind CSS 4 升级指南 — 从 v3 迁移的注意事项',
      contentMd: `## Tailwind CSS 4 变化\n\n### CSS-first 配置\n\nv4 使用 CSS 进行配置，不再需要 tailwind.config.js：\n\n\`\`\`css\n@import "tailwindcss";\n\n@theme {\n  --color-primary: #06B6D4;\n}\n\`\`\`\n\n### 性能提升\n\n- 构建速度提升 5x\n- 零 JavaScript 运行时\n- 更好的浏览器兼容性\n\n### 迁移步骤\n\n1. 安装 v4\n2. 删除 tailwind.config.js\n3. 用 @theme 重写配置\n4. 测试所有页面\n\n## 总结\n\nv4 是一次重大升级，但迁移成本不高，值得升级。`,
      tags: ['tailwind-css', 'tech-discussion', 'next-js'],
    },
  ]

  for (const postData of samplePosts) {
    const author = demoUsers[Math.floor(Math.random() * demoUsers.length)]!
    const slug = generateSlug(postData.title)

    const existingPost = await prisma.post.findUnique({ where: { slug } })
    if (existingPost) {
      console.log(`  ⏭ Post already exists: ${postData.title.slice(0, 40)}...`)
      continue
    }

    const contentHtml = renderMarkdown(postData.contentMd)

    const post = await prisma.post.create({
      data: {
        title: postData.title,
        contentMd: postData.contentMd,
        contentHtml,
        slug,
        userId: author.id,
        status: 'published',
        postTags: {
          create: await Promise.all(
            postData.tags.map(async (tagSlug) => {
              const tag = allTags.find(t => t.slug === tagSlug)!
              return { tagId: tag.id }
            })
          ),
        },
      },
    })
    console.log(`  ✅ Post: ${post.title.slice(0, 40)}...`)
  }

  // 6. Create some follows (idempotent — upsert by composite key)
  for (let i = 0; i < demoUsers.length; i++) {
    for (let j = i + 1; j < demoUsers.length; j++) {
      await prisma.userFollow.upsert({
        where: { followerId_followeeId: { followerId: demoUsers[i]!.id, followeeId: demoUsers[j]!.id } },
        update: {},
        create: { followerId: demoUsers[i]!.id, followeeId: demoUsers[j]!.id },
      }).catch(() => {})
    }
  }
  console.log('  ✅ Follow relationships created')

  // 7. Create some likes and bookmarks (idempotent)
  const posts = await prisma.post.findMany({ where: { status: 'published' }, take: 5 })
  for (const post of posts) {
    const user = demoUsers[Math.floor(Math.random() * demoUsers.length)]!
    await prisma.like.upsert({
      where: { userId_targetType_targetId: { userId: user.id, targetType: 'post', targetId: post.id } },
      update: {},
      create: { userId: user.id, targetType: 'post', targetId: post.id },
    }).catch(() => {})
    await prisma.bookmark.upsert({
      where: { userId_postId: { userId: user.id, postId: post.id } },
      update: {},
      create: { userId: user.id, postId: post.id },
    }).catch(() => {})
  }
  console.log('  ✅ Sample likes & bookmarks created')

  // 8. Recompute counters explicitly (application layer is single source of truth)
  console.log('  🔄 Recomputing counters...')

  // Recompute like counts on published posts
  const allPublishedPosts = await prisma.post.findMany({
    where: { status: 'published' },
    select: { id: true },
  })
  for (const p of allPublishedPosts) {
    const count = await prisma.like.count({
      where: { targetType: 'post', targetId: p.id },
    })
    await prisma.post.update({
      where: { id: p.id },
      data: { likeCount: count },
    })
  }

  // Recompute bookmark counts
  for (const p of allPublishedPosts) {
    const count = await prisma.bookmark.count({
      where: { postId: p.id },
    })
    await prisma.post.update({
      where: { id: p.id },
      data: { bookmarkCount: count },
    })
  }

  // Recompute comment counts
  for (const p of allPublishedPosts) {
    const count = await prisma.comment.count({
      where: { postId: p.id, status: 'published' },
    })
    await prisma.post.update({
      where: { id: p.id },
      data: { commentCount: count },
    })
  }

  // Recompute tag postCount
  const allTagsWithCounts = await prisma.tag.findMany({ select: { id: true } })
  for (const tag of allTagsWithCounts) {
    const count = await prisma.postTag.count({
      where: { tagId: tag.id, post: { status: 'published' } },
    })
    await prisma.tag.update({
      where: { id: tag.id },
      data: { postCount: count },
    })
  }
  console.log('  ✅ Counters recomputed')

  console.log('\n🎉 Seed complete!')
  console.log('   Login with: admin@bingbingbingo.cn / admin123')
  console.log('   Demo users: viber@example.com / demo1234')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
