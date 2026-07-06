# bingbingbingo UI 设计规范

> 版本：v1.2.0-MVP
> 更新日期：2026-07-06
> 风格：**激光镭射 × 现代马赛克** — 纯黑底 + 彩虹像素块面美学
> 技术栈：Next.js 15 + Tailwind CSS 4 + shadcn/ui + bytemd

---

## 一、设计理念

### 1.1 风格定位

| 维度 | 选择 |
|------|------|
| 主风格 | **现代像素（Modern Pixel）** — 16px 块面阴影、像素网格背景、大块面几何感 |
| 色彩方向 | **激光镭射彩虹** — 青/粉/紫/金多色像素阴影叠加，全息虹彩感 |
| 字体策略 | **双层字体系统** — UI 铬层走 Zpix 像素字体，内容层走 Inter 现代无衬线 |
| 参考 | Claude logo 块面美学、Hermès 像素丝巾、Vibe Island 大色块 |

### 1.2 核心原则

- **像素即风格，但不牺牲可读性**：16px 大块面阴影、像素网格纹理、像素字体仅用于 UI 标签。正文内容使用 Inter 保持阅读舒适。
- **彩虹镭射**：暗色模式下青→粉→紫三层偏移像素阴影，像激光打在黑色卡纸上。亮色模式下同色系变柔和半透明。
- **纯黑底暗色**：暗色模式用 `#000000` 纯黑底，不做紫黑/蓝黑染色。彩色由像素阴影和极光渐变提供。
- **双主题一等公民**：亮色/暗色同时设计，通过 `.light` class 切换，导航栏提供一键切换按钮。
- **内容优先**：帖子正文是核心。Hero 不存在——打开首页就是 feed 流。

---

## 二、色彩系统

### 2.1 暗色模式（默认）

```css
:root {
  --bg: #000000;
  --card-bg: #0F0F0F;
  --muted-bg: #141414;
  --muted-text: #888888;
  --border-subtle: rgba(255, 255, 255, 0.08);
  /* 彩虹镭射色 */
  --cyan: #06B6D4;
  --pink: #F43F5E;
  --purple: #A855F7;
  --gold: #EAB308;
  --green: #10B981;
  --pixel: 16px;
}
```

### 2.2 亮色模式

```css
.light {
  --bg: #FAFAFA;
  --card-bg: #FFFFFF;
  --muted-bg: #F5F5F5;
  --muted-text: #777777;
  --border-subtle: rgba(0, 0, 0, 0.08);
  /* 彩虹色在亮底加深以保证对比度 */
  --cyan: #0891B2;
  --pink: #E11D48;
  --purple: #7C3AED;
  --gold: #CA8A04;
  --green: #059669;
}
```

### 2.3 彩虹像素阴影色板

| 用途 | 暗色 | 亮色 |
|------|------|------|
| 卡片默认 | `rgba(6,182,212,0.25)` 青 | `rgba(6,182,212,0.2)` 青 |
| 卡片 hover 第一层 | `rgba(6,182,212,0.7)` 青 16px | `rgba(6,182,212,0.5)` 青 16px |
| 卡片 hover 第二层 | `rgba(244,63,94,0.5)` 粉 32px | `rgba(244,63,94,0.35)` 粉 32px |
| 卡片 hover 第三层 | `rgba(168,85,247,0.3)` 紫 48px | `rgba(168,85,247,0.2)` 紫 48px |
| 导航底线 | 青4px + 粉10px + 紫16px 三层 | 同上 |
| 按钮主色 | `rgba(6,182,212,0.6)` 青 | `rgba(6,182,212,0.5)` 青 |
| 按钮强调 | `rgba(244,63,94,0.6)` 粉 | `rgba(244,63,94,0.5)` 粉 |

### 2.4 语义色使用规范

| 角色 | 颜色 | 用途 |
|------|------|------|
| 主交互 | 青 `#06B6D4` | 链接、按钮、Tab 激活、标题 hover |
| 强调 | 粉 `#F43F5E` | 点赞色、热榜第1名、CTA 按钮 |
| 装饰 | 紫 `#A855F7` | 像素阴影第三层、官方标签、收藏色 |
| 在线/成功 | 绿 `#10B981` | 在线状态、成功反馈 |
| 精选/精华 | 金 `#EAB308` | 精华标签、特别推荐 |

---

## 三、字体系统

### 3.1 双层字体策略

| 层 | 字体 | 用途 |
|----|------|------|
| **UI 铬层** | Zpix（中文像素） + Space Grotesk（英文几何） | Tab 标签、按钮、侧边栏标题、Badge、排名数字、导航链接 |
| **内容层** | Inter + Noto Sans SC（中文回退） | 帖子标题、正文、用户名、时间、摘要 |

**字体加载**：

```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');

/* Zpix — 自托管或 CDN */
@font-face {
  font-family: 'Zpix';
  src: url('/fonts/Zpix.woff2') format('woff2');
  font-display: swap;
}
```

### 3.2 UI 铬层启用

```css
.pixel-text, .tab, .pixel-btn, .sidebar-title, .pixel-tag, .nav-link, .sidebar-hot-rank {
  font-family: 'Zpix', 'Space Grotesk', monospace;
  -webkit-font-smoothing: none;  /* 像素字体保持锐利 */
}
```

### 3.3 排版层级

| 层级 | 字体 | 字号 | 字重 | 用途 |
|------|------|------|------|------|
| 品牌名 | Space Grotesk | 20px | 700 | 导航栏 Logo 文字 |
| 帖子标题 | Inter | 16px | 700 | Feed 卡片标题 |
| 正文 | Inter | 15px | 400 | 帖子正文、评论 |
| 摘要 | Inter | 14px | 400 | 卡片摘要（2行截断） |
| UI 标签 | Zpix | 12-13px | 400/600 | Tab、Badge、侧边栏标题 |
| 辅助 | Inter | 12px | 400 | 时间戳、meta 信息 |

---

## 四、像素系统

### 4.1 像素单位

全局像素基准：**16px**。所有间距、阴影偏移、网格都是 16px 的整数倍。

```css
:root { --pixel: 16px; }
```

### 4.2 像素阴影（核心视觉特征）

用多层 `box-shadow` 实现彩虹镭射偏移效果：

```css
/* 卡片默认 */
.pixel-card {
  box-shadow:
    16px 16px 0 0 rgba(6,182,212,0.25),   /* 青偏移 */
    0 0 0 1px rgba(255,255,255,0.08);      /* 边框 */
}

/* 卡片 hover — 三层彩虹偏移 */
.pixel-card:hover {
  box-shadow:
    16px 16px 0 0 rgba(6,182,212,0.7),     /* 青 16px */
    32px 32px 0 -16px rgba(244,63,94,0.5),  /* 粉 32px */
    48px 48px 0 -32px rgba(168,85,247,0.3); /* 紫 48px */
}
```

### 4.3 像素按钮

```css
.pixel-btn {
  box-shadow: 16px 16px 0 0 rgba(6,182,212,0.6);
  transition: transform 60ms, box-shadow 60ms;
}
.pixel-btn:active {
  transform: translate(16px, 16px);    /* 按下位移 */
  box-shadow: 0 0 0 0 rgba(6,182,212,0.6); /* 阴影消失 */
}
```

### 4.4 背景纹理

```css
body::before {
  /* 16px 像素网格 */
  background:
    repeating-linear-gradient(0deg, rgba(168,85,247,0.02) 0px, rgba(168,85,247,0.02) 1px, transparent 1px, transparent 16px),
    repeating-linear-gradient(90deg, rgba(168,85,247,0.02) 0px, rgba(168,85,247,0.02) 1px, transparent 1px, transparent 16px),
    /* 彩虹极光 */
    radial-gradient(ellipse 60% 40% at 15% 5%, rgba(6,182,212,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 55% 35% at 85% 10%, rgba(244,63,94,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 50% 35% at 50% 80%, rgba(168,85,247,0.05) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 75% 70%, rgba(234,179,8,0.04) 0%, transparent 60%);
}
```

### 4.5 导航栏彩虹底线

```css
.pixel-nav {
  box-shadow:
    0 4px 0 0 rgba(6,182,212,0.6),    /* 青 4px */
    0 10px 0 0 rgba(244,63,94,0.4),    /* 粉 10px */
    0 16px 0 0 rgba(168,85,247,0.2);   /* 紫 16px */
}
```

### 4.6 像素品牌 Logo

5×5 网格，8px 方块 + 2px 间距 = 50px 总宽。青/粉/紫三色混搭的像素「B」字。

```html
<span class="pixel-logo">
  <span class="px"></span><span class="px on"></span>...
</span>
```

```css
.pixel-logo { display:grid; grid-template-columns:repeat(5,8px); grid-template-rows:repeat(5,8px); gap:2px; }
.pixel-logo .px { width:8px; height:8px; }
.pixel-logo .px.on  { background:#06B6D4; }  /* 青 */
.pixel-logo .px.on2 { background:#F43F5E; }  /* 粉 */
.pixel-logo .px.on3 { background:#A855F7; }  /* 紫 */
```

---

## 五、布局系统

### 5.1 双栏布局

```
┌──────────────────────────────────────────────────────┐
│  [NAV]  像素Logo  品牌名  搜索框  ☀切换  登录        │ 64px
├────────────────────────────────┬─────────────────────┤
│  [最新] [最热] [精华]  在线128  │  ■■ 热榜            │
│                                │  1. 帖子标题...      │
│  ┌──────────────────────────┐  │  2. 帖子标题...      │
│  │ [头像] 用户名 · 2h ago   │  │  ◇◇ 推荐作者        │
│  │ 帖子标题                  │  │  [头像] TerminalFan  │
│  │ 摘要摘要摘要...           │  │  [头像] RetroDev     │
│  │ #tag #tag ♥42 ◆12 ★8   │  │  ## 热门标签         │
│  └──────────────────────────┘  │  #AI #vibe #React    │
│  ┌──────────────────────────┐  │  ?? 关于             │
│  │ ...                       │  │  社区简介...         │
│  └──────────────────────────┘  │                      │
│        [加载更多]              │                      │
├────────────────────────────────┴─────────────────────┤
│  [首页]  [标签]  [通知]  [我的]          (移动端底部) │
└──────────────────────────────────────────────────────┘
```

| 断点 | 布局 |
|------|------|
| < 768px | 单列 Feed + 隐藏侧边栏 + 底部导航 |
| >= 768px | 双栏：Feed (flex:1) + 侧边栏 (280px) |

### 5.2 间距

| Token | 值 | 用途 |
|------|-----|------|
| Card gap | 20px | Feed 卡片间距 |
| Sidebar gap | 32px | 双栏间距 |
| Card padding | 24px | 卡片内边距 |
| Sidebar padding | 20px | 侧边栏模块内边距 |
| Page padding | 20px (desktop) / 12px (mobile) | 页面两侧留白 |

---

## 六、组件规范

### 6.1 shadcn/ui 像素化配置

```css
@theme inline {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Zpix', monospace;
  --radius: 0rem;  /* 全局关闭圆角 */
}
```

### 6.2 核心组件映射

| 场景 | 组件 | 像素化改造 |
|------|------|-----------|
| 帖子卡片 | `Card` | `pixel-card` class, 16px 彩虹偏移阴影 |
| 按钮 | `Button` | `pixel-btn`, 按下 16px 位移 |
| 标签 | `Badge` | `pixel-tag`, Zpix 字体, 0 radius |
| Tab | `Tabs` | 0 radius, 激活态青底黑字 |
| 头像 | 八边形 `clip-path` | 渐变填充（青→紫 / 粉→紫） |
| Toast | Sonner | 0 radius, 16px 阴影 |
| 搜索 | `Command` | 0 radius 输入框 |
| 下拉菜单 | `DropdownMenu` | 0 radius |
| 主题切换 | 自定义 ☀ 按钮 | toggle `.light` class on `<html>` |

### 6.3 侧边栏模块

| 模块 | 标题样式 | 内容 |
|------|---------|------|
| 热榜 | `■■ 热榜` | TOP5 帖子，排名数字 Space Grotesk, 前3名青/粉/紫色 |
| 推荐作者 | `◇◇ 推荐作者` | 4位作者，八边形头像 + 用户名 + 标签 |
| 热门标签 | `## 热门标签` | 像素 Badge 云 |
| 关于 | `?? 关于` | 社区简介 + 在线/帖子/用户统计数 |

---

## 七、交互规范

### 7.1 像素动画

| 场景 | 时长 | 方式 |
|------|------|------|
| 按钮按下 | 60ms | 瞬间位移 16px + 阴影消失 |
| 卡片 hover | 150ms | 阴影色彩增强 + 多层展开 |
| 链接 hover | 150ms | 颜色切换到青 |

所有动画禁用平滑缓动，保持像素级的干脆感。

### 7.2 状态反馈

| 状态 | 表现 |
|------|------|
| Hover | 青色调变亮 + 阴影增强 |
| Press | 按钮位移 16px（真的「按下去」） |
| Focus | 2px 青 `outline`, 2px offset |
| Disabled | `opacity-50` + `cursor-not-allowed` |
| Loading | 骨架屏（Skeleton），非空白 spinner |

### 7.3 主题切换

- 使用 `next-themes` ThemeProvider
- 导航栏 ☀/☾ 图标按钮
- 点击 toggle `<html>` 的 `.light` class
- 首次访问跟随 `prefers-color-scheme`
- 选择持久化 localStorage

---

## 八、页面路由 UI 描述

| 路径 | 核心 UI |
|------|--------|
| `/` | 双栏 Feed + 侧边栏，Tab 切换（最新/最热/精华），cursor 无限滚动 |
| `/posts/:slug` | 帖子详情 SSR，像素标题 + Markdown 正文 + 评论区 |
| `/u/:username` | 八边形头像 + 用户信息 + Tab（帖子/作品） |
| `/tags/:slug` | 标签信息 + 帖子 Feed |
| `/notifications` | 通知列表，未读高亮 |
| `/search?q=` | 搜索结果 Feed |

---

## 九、实现检查清单

### 基础

- [ ] Zpix + Inter + Space Grotesk + Noto Sans SC 字体加载
- [ ] `--radius: 0rem` 全局覆盖 shadcn/ui
- [ ] `:root` 暗色变量 + `.light` 亮色变量
- [ ] `next-themes` ThemeProvider 集成
- [ ] 导航栏 ☀/☾ 切换按钮

### 像素系统

- [ ] 16px 像素单位 CSS 变量
- [ ] 卡片：16px 青偏移 + hover 三层彩虹
- [ ] 按钮：16px 阴影 + 按下 16px 位移
- [ ] 导航：三层彩虹底线（青4 + 粉10 + 紫16）
- [ ] 背景：16px 网格 + 四角彩虹极光
- [ ] 5×5 像素 Logo

### 双主题验证

- [ ] 暗色模式：纯黑底 `#000000`
- [ ] 亮色模式：近白底 `#FAFAFA`
- [ ] 所有文字对比度 >= 4.5:1
- [ ] 像素阴影双主题下都可见
- [ ] Zpix 中文字体加载正常
- [ ] 375px / 768px / 1024px / 1440px 测试

### 字体分层

- [ ] UI 铬层（Tab/按钮/Badge/侧边栏标题）使用 Zpix + Space Grotesk
- [ ] 内容层（帖子标题/正文/用户名）使用 Inter
- [ ] Zpix 设置 `-webkit-font-smoothing: none`
- [ ] Inter 设置 `-webkit-font-smoothing: antialiased`

---

## 参考文件

| 文件 | 说明 |
|------|------|
| `preview.html` | 完整双主题预览页面，可直接浏览器打开 |
| `docs/PRD.md` | 产品需求文档 |
| `docs/database.md` | 数据库设计 |
| `docs/error-codes.md` | 错误码清单 |
| `docs/config.md` | 配置文件说明 |
