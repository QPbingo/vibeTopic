# bingbingbingo 设计系统参考文档

> 风格：**激光镭射 × 古典马赛克街机**
> 版本：基于 2026-07-08 代码库实际状态
> 源文件：`apps/web/src/app/globals.css`（718 行）、`docs/ui-spec.md`
>
> **本文档是样式开发的唯一参考标准。任何视觉变更都应先更新本文档，再改代码。**

---

## 一、设计理念

### 1.1 七条核心原则

| # | 原则 | 说明 |
|---|------|------|
| 1 | **零圆角** | 全局 `border-radius: 0 !important`，所有元素都是锐利直角 |
| 2 | **双层字体** | UI 铬层用 Zpix 像素字体，内容层用 Inter。永不混用 |
| 3 | **阶梯阴影** | 所有可交互元素使用多层 box-shadow，4px 步进，青→粉→紫渐变 |
| 4 | **CRT 效果** | 全屏扫描线叠加 + 边缘暗角 + 随机闪烁，模拟老式显示器 |
| 5 | **steps() 动画** | 所有动画使用 `steps()` 阶梯函数，禁用 ease/linear 平滑过渡 |
| 6 | **八边形头像** | 统一 `clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)` |
| 7 | **暗色优先** | 默认暗色主题（纯黑 `#000000` 背景），亮色为 `.light` 类覆盖 |

### 1.2 DO/DON'T 速查

| ✅ DO | ❌ DON'T |
|-------|----------|
| 所有元素 `border-radius: 0` | 使用任何圆角（包括 Tailwind 的 rounded-*） |
| UI 铬层用 Zpix + `-webkit-font-smoothing: none` | 在按钮/标签/Tab 上用 Inter |
| 内容层用 Inter + `-webkit-font-smoothing: antialiased` | 在正文中用 Zpix |
| 动画用 `steps(n)` | 使用 `ease`、`ease-in-out`、`linear` 做 UI 过渡 |
| 新增颜色从现有令牌中选取 | 引入新的品牌色（除非经过设计评审） |
| 阴影遵循 4/8/12/16px 步进 | 使用单层模糊阴影（`box-shadow: 0 2px 8px rgba(...)`） |
| 侧边栏保持静态 | 给侧边栏加动画 |
| 所有新样式写入 `globals.css` | 创建新的 CSS module 或 CSS-in-JS 文件 |

---

## 二、设计令牌（CSS 自定义属性）

### 2.1 完整对照表

所有令牌定义在 `globals.css` 的 `:root` 和 `.light` 中。

| 令牌 | 暗色模式 (`:root`) | 亮色模式 (`.light`) | 用途 |
|------|-------------------|---------------------|------|
| `--bg` | `#000000` | `#FAFAFA` | 页面背景 |
| `--color` | `#E5E5E5` | `#1a1a2e` | 正文颜色 |
| `--card-bg` | `#0F0F0F` | `#FFFFFF` | 卡片/面板背景 |
| `--muted-bg` | `#141414` | `#F5F5F5` | 次级背景（输入框、骨架屏） |
| `--muted-text` | `#888888` | `#777777` | 次级文字（时间戳、meta） |
| `--border-subtle` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | 细分隔线/边框 |
| `--cyan` | `#06B6D4` | `#0891B2` | 主交互色（链接、Tab 激活、标题悬停） |
| `--cyan-dim` | `rgba(6,182,212,0.3)` | — | 半透明青色 |
| `--pink` | `#F43F5E` | `#E11D48` | 强调色（点赞、热榜 #1、CTA） |
| `--pink-dim` | `rgba(244,63,94,0.35)` | — | 半透明粉色 |
| `--pink-faint` | `rgba(244,63,94,0.08)` | — | 极淡粉色 |
| `--primary` | `#A855F7` | `#7C3AED` | 装饰色（阴影第三层、官方标签、收藏） |
| `--primary-dim` | `rgba(168,85,247,0.35)` | — | 半透明紫色 |
| `--primary-faint` | `rgba(168,85,247,0.1)` | — | 极淡紫色 |
| `--gold` | `#EAB308` | `#CA8A04` | 精选/精华/焦点轮廓 |
| `--green` | `#10B981` | `#059669` | 成功/在线状态 |
| `--green-dim` | `rgba(16,185,129,0.3)` | — | 半透明绿色 |
| `--pixel` | `16px` | — | 像素网格基准单位 |
| `--nav-h` | `64px` | — | 导航栏高度 |
| `--radius` | `0rem` | — | 全局圆角（始终为 0） |

### 2.2 语义色角色

| 颜色 | 交互 | 装饰 | 状态 |
|------|------|------|------|
| 青 `--cyan` | 链接、按钮、Tab 激活、标题悬停 | 阴影 L1/L2、Logo 主色 | 信息提示 |
| 粉 `--pink` | CTA 按钮、点赞按钮 | 阴影 L3、Logo 辅色、热榜 #1、媒体右下角标 | 错误/警告 |
| 紫 `--primary` | 收藏按钮、官方标签 | 阴影 L4、Logo 第三色 | — |
| 金 `--gold` | 焦点轮廓 | 精华标签 | 焦点可见 |
| 绿 `--green` | — | — | 成功/在线 |

---

## 三、字体系统

### 3.1 字体加载

```
Google Fonts：Inter (400/500/600/700) + Space Grotesk (500/600/700) + Noto Sans SC (400/500/700)
自托管 CDN：Zpix → https://cdn.jsdelivr.net/npm/zpix@3.1.0/dist/Zpix.woff2
```

Tailwind CSS 4 主题映射：
```css
@theme inline {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Zpix', monospace;
  --radius: 0rem;
}
```

### 3.2 双层字体分派表

**UI 铬层**（Zpix + Space Grotesk + monospace 回退，`-webkit-font-smoothing: none`）：

适用于以下 CSS 类：`.tab`, `.pixel-btn`, `.pixel-tag`, `.nav-link`, `.nav-brand`, `.post-card-time`, `.post-card-stats`, `.bottom-nav a`, `.video-duration`, `.media-count-badge`

**内容层**（Inter + system-ui + Noto Sans SC 回退，`-webkit-font-smoothing: antialiased`）：

适用于：帖子标题、帖子正文、用户名、摘要、侧边栏全部内容、搜索输入框、评论正文

### 3.3 排版速查表

| 元素 | 字体 | 字号 | 字重 | 行高 | 其他 |
|------|------|------|------|------|------|
| 品牌名 | Zpix / Space Grotesk | 18px | 700 | — | 光标 `▌` 闪烁 |
| 导航链接 | Zpix / Space Grotesk | — | — | — | 继承 UI 铬层 |
| 帖子标题 | Inter | 16px | 700 | 1.4 | `letter-spacing: -0.2px` |
| 帖子正文 | Inter | 15px | 400 | 1.6 | — |
| 帖子摘要 | Inter | 14px | 400 | 1.6 | 2 行截断 |
| 用户名（卡片内） | Inter | 14px | 600 | — | — |
| 按钮文字 | Zpix / Space Grotesk | 13px | 600 | 1 | `letter-spacing: 0.5px`, uppercase |
| Tab 标签 | Zpix / Space Grotesk | 13px | 600 | 1 | `letter-spacing: 0.3px` |
| 标签 (Tag) | Zpix / Space Grotesk | 12px | 500 | 1 | `letter-spacing: 0.3px` |
| 时间戳 | Zpix / Space Grotesk | 12px | 400 | — | — |
| 统计数字 | Zpix / Space Grotesk | 16px | 700 | — | — |
| 视频时长 | Zpix / Space Grotesk | 11px | — | — | — |
| 媒体角标 | Zpix | 11px | — | — | `letter-spacing: 0.5px` |
| 编辑器标签 | Zpix / Space Grotesk | 12px | — | — | `letter-spacing: 0.08em` |
| 编辑器状态文字 | Zpix / Space Grotesk | 11px | — | — | — |
| 侧边栏标题 | Inter | 14px | 600 | — | — |
| 侧边栏内容 | Inter | 13px | 500 | — | — |
| 侧边栏标签 | Inter | 12px | 500 | — | — |
| 认证页面标题 | Zpix / Space Grotesk | 20px | 700 | — | 居中对齐 |
| 认证输入框 | Inter | 14px | — | — | — |
| 页面标题 (h1) | Inter | 24-28px | 700 | 1.2 | — |
| 搜索输入框 | Inter | 14px | — | — | — |
| 评论作者 | Inter | 13px | 600 | — | — |
| 评论时间 | Inter | 11px | — | — | — |
| 评论正文 | Inter | 14px | — | 1.6 | — |

---

## 四、阶梯阴影系统（核心视觉特征）

### 4.1 阴影架构总览

所有阴影遵循 **4px 步进**，颜色从青 → 粉 → 紫渐变。悬停时增强饱和度并可能加入第 5 层。

### 4.2 卡片阴影（`.pixel-card`）

**默认态**（4 层 + 边框替代）：
```
4px  4px  0 0 var(--cyan)                           ← 青色实色
8px  8px  0 0 rgba(6,182,212,0.4)                   ← 青色 40%
12px 12px 0 0 rgba(6,182,212,0.2)                   ← 青色 20%
0    0    0 1px var(--border-subtle)                 ← 边框替代（无模糊阴影）
```

**悬停态**（5 层彩虹 + 边框发光 + 浮起）：
```
4px  4px  0 0 var(--cyan)
8px  8px  0 0 rgba(6,182,212,0.7)                   ← 青色加深
12px 12px 0 0 rgba(244,63,94,0.45)                  ← 切换粉色
16px 16px 0 0 rgba(168,85,247,0.25)                 ← 切换紫色
20px 20px 0 0 rgba(6,182,212,0.1)                   ← 最远淡青
0    0    0 1px rgba(6,182,212,0.3)                 ← 边框发光
transform: translate(-2px, -2px)                     ← 微微浮起
```

**悬停左侧彩虹条**（`::before` 伪元素，4px 宽）：
```
垂直分段色条：青(0-33%) → 透明(1px) → 紫(34-66%) → 透明(1px) → 粉(67-100%)
background-size: 4px 16px
默认 opacity: 0 → 悬停 opacity: 1
过渡：80ms steps(2)
```

### 4.3 按钮阴影（`.pixel-btn`）

**默认态**（4 层青色）：
```
4px  4px  0 0 var(--cyan)
8px  8px  0 0 rgba(6,182,212,0.6)
12px 12px 0 0 rgba(6,182,212,0.3)
16px 16px 0 0 rgba(6,182,212,0.1)
```

**悬停态**（彩虹过渡）：
```
4px  4px  0 0 var(--cyan)
8px  8px  0 0 rgba(6,182,212,0.8)
12px 12px 0 0 rgba(244,63,94,0.5)                   ← 粉色
16px 16px 0 0 rgba(168,85,247,0.3)                  ← 紫色
```

**按下态**（缩进）：
```
transform: translate(8px, 8px)                       ← 向阴影方向「按下去」
4px  4px  0 0 rgba(6,182,212,0.6)                   ← 阴影收拢为 2 层
8px  8px  0 0 rgba(6,182,212,0.2)
```

**交互参数**：`transition: transform 40ms steps(2), box-shadow 40ms steps(2)`

**.pixel-btn-accent（强调变体）**：
- 默认阴影从粉色开始：`var(--pink)` → `rgba(244,63,94,0.6)` → `rgba(244,63,94,0.3)` → `rgba(244,63,94,0.1)`
- 悬停切换为：粉 → 粉(0.8) → 紫(0.5) → 青(0.3)

**.pixel-btn-subtle（微妙变体）**：
- 仅 3 层阴影，颜色更浅
- 默认：`rgba(6,182,212,0.5)` → `rgba(6,182,212,0.3)` → `rgba(6,182,212,0.15)`
- 悬停切换：青(0.7) → 粉(0.4) → 紫(0.2)

### 4.4 导航栏阴影（`.pixel-nav`）

向下延伸的 3 层阴影，带颜色轮换动画：
```
0 4px  0 0 rgba(6,182,212,0.6)                      ← 青色 4px 下
0 8px  0 0 rgba(244,63,94,0.4)                      ← 粉色 8px 下
0 12px 0 0 rgba(168,85,247,0.2)                     ← 紫色 12px 下
```

`navShadowWave` 动画（4s steps(4)）在 50% 处轮换为：
```
0 4px  0 0 rgba(244,63,94,0.6)                      ← 粉到第一层
0 8px  0 0 rgba(168,85,247,0.4)
0 12px 0 0 rgba(6,182,212,0.2)
```

### 4.5 底部导航阴影（`.bottom-nav`）

向上延伸，与顶部导航镜像：
```
0 -4px  0 0 rgba(6,182,212,0.4)
0 -8px  0 0 rgba(244,63,94,0.2)
```
同样使用 `navShadowWave` 动画。

### 4.6 Tab 阴影（`.tab`）

单层阴影，简化版：
```
默认：3px 3px 0 0 rgba(6,182,212,0.3)
悬停：3px 3px 0 0 rgba(6,182,212,0.6)
激活：3px 3px 0 0 rgba(6,182,212,0.8)，背景变实心青，文字变黑
按下：translate(2px, 2px)，阴影收为 1px
```

### 4.7 媒体阴影（`.post-media`）

```
默认：4px 4px 0 0 rgba(6,182,212,0.3)
卡片悬停时增强：6px 6px 0 0 rgba(6,182,212,0.5) + 10px 10px 0 0 rgba(244,63,94,0.25)
```

### 4.8 编辑器卡片阴影（`.editor-card`）

独立于 `.pixel-card` 的阴影定义：
```
4px  4px  0 0 var(--cyan)
8px  8px  0 0 rgba(6,182,212,0.4)
12px 12px 0 0 rgba(244,63,94,0.25)
16px 16px 0 0 rgba(168,85,247,0.15)
```
编辑器卡片无悬停阴影变化（非交互容器）。

### 4.9 主题切换按钮阴影（`.theme-toggle`）

```
默认：3px 3px 0 0 rgba(6,182,212,0.3)
悬停：3px 3px 0 0 rgba(6,182,212,0.7)
按下：translate(2px, 2px)，阴影收为 1px
过渡：40ms steps(1)
```

---

## 五、动画系统

### 5.1 核心原则

- **仅 `steps()` 缓动**：所有 UI 动画使用 `steps(n)`，绝不用 `ease`/`ease-in-out`/`linear`
- **仅 UI 铬层动**：导航、按钮、标签、Logo、粒子可以有动画；侧边栏和正文内容保持静态
- **尊重用户偏好**：`prefers-reduced-motion: reduce` 时所有动画压缩到 1ms

### 5.2 关键帧动画清单

| 动画名 | 时长 | steps | 作用元素 | 效果 |
|--------|------|-------|---------|------|
| `crtFlicker` | 8s | `steps(1)` | `body::after` | CRT 扫描线随机瞬间变暗（99%→97%→100%→98%→100%） |
| `floatUp` | 10-18s | `steps(60)` | `.pixel-particle` ×10 | 彩色方块从底部旋升消失（rotate 720°） |
| `blink` | 1s | `steps(1)` | `.nav-brand::after` | 光标 `▌` 硬切闪烁 |
| `glitchText` | 0.3s | `steps(2)` | `.nav-brand:hover` | RGB 色散 text-shadow 偏移，4 帧循环 |
| `pixelLogoGlow` | 2s | `steps(4)` | `.px.on` | 青色呼吸：`#06B6D4` ↔ `#22D3EE` + 6px 发光 |
| `pixelLogoGlow2` | 2s | `steps(4)` + 0.5s | `.px.on2` | 粉色呼吸：`#F43F5E` ↔ `#FB7185` + 6px 发光 |
| `pixelLogoGlow3` | 2s | `steps(4)` + 1s | `.px.on3` | 紫色呼吸：`#A855F7` ↔ `#C084FC` + 6px 发光 |
| `decorBlink` | 2s | `steps(1)` | `.blk` ×5 | 卡片装饰块独立闪烁（opacity 0.9↔0.2，延迟 0/0.3/0.6/0.9/1.2s） |
| `navShadowWave` | 4s | `steps(4)` | `.pixel-nav`, `.bottom-nav` | 阴影颜色顺序轮换（青粉紫 ↔ 粉紫青） |
| `rainbowShift` | 3s | `steps(8)` | `.rainbow-strip` | 色相旋转 0°→360° |
| `rankGlow` | 1.5s | `steps(2)` | `.rank-1` | 热榜 #1 粉色 text-shadow 脉冲（4px ↔ 12px） |
| `skeletonPulse` | 1.5s | `steps(4)` | `.skeleton` | 骨架屏 opacity 1↔0.5 脉冲 |

### 5.3 过渡时间规范

| 元素 | 时长 | 缓动 |
|------|------|------|
| 按钮按下/弹起 | `40ms` | `steps(2)` |
| 卡片悬停 | `80ms` | `steps(2)` |
| Tab 切换 | `40ms` | `steps(1)` |
| 主题切换按钮 | `40ms` | `steps(1)` |
| 卡片左侧彩条出现 | `80ms` | `steps(2)` |
| 媒体阴影增强 | `80ms` | `steps(2)` |

### 5.4 静态区域规则

侧边栏（`.sidebar-section`）及所有子元素强制禁用动画：
```css
.sidebar-section, .sidebar-section * { animation: none !important; }
```

### 5.5 无障碍动画覆盖

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
```

---

## 六、背景系统（4 层叠加）

### 6.1 z-index 堆叠图

```
z-index: 9999  →  body::after（CRT 扫描线，覆盖所有内容）
z-index: 100   →  导航栏 / 底部导航
z-index: 0     →  .pixel-particles（浮动粒子容器）
z-index: -1    →  body::before（像素网格 + 极光辉光）
（body 自身）  →  box-shadow: inset ...（CRT 暗角晕影）
```

### 6.2 像素网格（`body::before`）

- 水平线：2px 青色 `rgba(6,182,212,0.05)`，32px 间距
- 垂直线：2px 紫色 `rgba(168,85,247,0.05)`，32px 间距

### 6.3 极光辉光（`body::before` 中的 radial-gradient）

| 位置 | 颜色 | 大小 | 透明度 |
|------|------|------|--------|
| 15% 左, 5% 上 | 青色 | 60%×40% | 0.12→透明(55%) |
| 85% 左, 10% 上 | 粉色 | 55%×35% | 0.1→透明(55%) |
| 50% 左, 80% 上 | 紫色 | 50%×35% | 0.1→透明(55%) |
| 75% 左, 70% 上 | 金色 | 40%×30% | 0.06→透明(55%) |

### 6.4 CRT 扫描线（`body::after`）

- 2px 透明 → 2px `rgba(0,0,0,0.03)` 重复水平条纹
- 暗色模式：`rgba(0,0,0,0.03)`；亮色模式：`rgba(0,0,0,0.015)`
- `z-index: 9999`，`pointer-events: none`（不可交互）
- `crtFlicker` 动画模拟随机闪烁

### 6.5 CRT 暗角（body）

```css
box-shadow: inset 0 0 120px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.3);
```

### 6.6 浮动粒子系统

10 个正方形粒子，尺寸 8-16px，颜色循环（青→紫→粉→青→紫→粉→青→紫→粉→青）。

| 粒子 # | 左侧位置 | 尺寸 | 时长 | 延迟 | 颜色 |
|--------|---------|------|------|------|------|
| 1 | 5% | 12px | 12s | 0s | cyan |
| 2 | 12% | 16px | 15s | 2s | purple |
| 3 | 22% | 10px | 10s | 4s | pink |
| 4 | 35% | 14px | 18s | 1s | cyan |
| 5 | 48% | 8px | 13s | 6s | purple |
| 6 | 55% | 12px | 16s | 3s | pink |
| 7 | 68% | 16px | 11s | 7s | cyan |
| 8 | 78% | 10px | 14s | 5s | purple |
| 9 | 88% | 14px | 17s | 8s | pink |
| 10 | 95% | 12px | 12s | 9s | cyan |

动画：`translateY(105vh) rotate(0deg)` → `translateY(-10vh) rotate(720deg)`，opacity 0→0.8→0.6→0。

---

## 七、布局系统

### 7.1 主布局类

```css
.page-layout   { display: flex; gap: 32px; max-width: 1120px; margin: 0 auto; padding: 0 20px 64px; }
.feed-col      { flex: 1; min-width: 0; }
.sidebar-col   { width: 280px; flex-shrink: 0; }
```

### 7.2 页面宽度规格

| 页面 | 最大宽度 | 边距 | 特殊布局 |
|------|---------|------|---------|
| 首页 Feed | 1120px | `0 20px 64px` | `.page-layout` 双栏 |
| 标签页 | 1120px | 同首页 | `.page-layout` 双栏 |
| 帖子详情 | 800px | 同首页 | `.page-layout` 单栏（flex:1，无侧边栏） |
| 搜索页 | 1120px | 同首页 | `.page-layout` 单栏（flex:1，无侧边栏） |
| 帖子编辑器 | `min(980px, calc(100% - 32px))` | `32px auto 96px` | `.editor-page` 自居中 |
| 用户资料 | 600px | `24px auto, 0 20px` | 单列居中 |
| 通知页 | 600px | `24px auto, 0 20px` | 单列居中 |
| 设置页 | 500px | `24px auto, 0 20px` | 单列居中 |
| 认证页 | 400px | `60px auto, 0 20px` | 单列居中 |

### 7.3 间距速查

| 令牌 | 值 | 用途 |
|------|-----|------|
| 页面左右内边距 | 20px（桌面）/ 12px（移动） | `.page-layout` padding |
| 双栏间距 | 32px | `.page-layout` gap |
| Feed 卡片间距 | 20px | `.post-feed` gap |
| 卡片内边距 | 24px | `.pixel-card` padding |
| 编辑器卡片内边距 | 28px | `.editor-card` padding |
| 侧边栏模块内边距 | 20px | `.sidebar-section` padding |
| 侧边栏模块间距 | 20px | `.sidebar-section` margin-bottom |
| 卡片内容行间距 | 16px | `.post-card-row` gap |
| 标签间距 | 6px | `.post-card-tags` gap |
| 导航栏高度 | 64px | `var(--nav-h)` |
| 导航栏左右内边距 | 24px（桌面）/ 12px（移动） | `.pixel-nav` padding |
| 彩虹条高度 | 6px | `.rainbow-strip` height |
| 底部导航（移动端）内边距 | — | 固定底部，左右 0 |
| main 最小高度 | `calc(100vh - var(--nav-h) - 6px)` | 减去导航栏和彩虹条 |

### 7.4 响应式断点（768px）

```
@media (max-width: 768px) {
  .sidebar-col     → display: none（隐藏侧边栏）
  .page-layout     → padding: 0 12px 80px（缩窄 + 底部为导航留空间）
  .bottom-nav      → display: flex（显示底部导航）
  .pixel-nav       → padding: 0 12px
  .pixel-nav > form → display: none !important（隐藏搜索框）
  .nav-actions     → gap: 0 !important
  .nav-actions > :not(.theme-toggle) → display: none !important（仅保留主题切换）
}

/* 编辑器移动端 */
@media (max-width: 768px) {
  .editor-page     → width: calc(100% - 24px); margin-top: 24px
  .editor-card     → padding: 18px
  .editor-header   → flex-direction: column
  .editor-header .pixel-btn → width: 100%
  .editor-row      → flex-direction: column; gap: 4px
  .bytemd          → height: 70vh
}
```

---

## 八、组件样式模式

### 8.1 组件速查表

| 组件 | CSS 类 | TSX 文件 | 变体/状态 |
|------|--------|---------|-----------|
| 帖子卡片 | `.pixel-card` | `components/feed/PostCard.tsx` | 默认、悬停、左侧彩条 |
| 按钮 | `.pixel-btn` | `components/ui/PixelButton.tsx` | default, accent, subtle, disabled |
| 标签 (Feed) | `.pixel-tag` | `components/ui/PixelTag.tsx` | default（青）, official（紫） |
| 标签 (侧边栏) | `.sidebar-tag` | — | default（灰）, official（紫） |
| 头像 | `.avatar-block` | `components/ui/PixelAvatar.tsx` | 44px(默认)/36px(评论)/32px(侧边栏) |
| Logo | `.pixel-logo` | `components/ui/PixelLogo.tsx` | 5×5 网格，三色动画 |
| 导航栏 | `.pixel-nav` | `components/layout/Navbar.tsx` | sticky, shadowWave |
| 侧边栏 | `.sidebar-section` | `components/layout/Sidebar.tsx` | 热榜/推荐作者/热门标签 |
| 彩虹条 | `.rainbow-strip` | `components/layout/RainbowStrip.tsx` | 8 色，色相旋转 |
| 底部导航 | `.bottom-nav` | `components/layout/BottomNav.tsx` | 仅移动端可见 |
| 粒子背景 | `.pixel-particles` | `components/layout/PixelBackground.tsx` | 10 粒子 |
| 统计按钮 | `.stat-like/.stat-comment/.stat-bookmark` | `components/ui/StatIcons.tsx` | 未点/已点 |
| 主题切换 | `.theme-toggle` | `components/ui/ThemeToggle.tsx` | ☀/☾ |
| 评论卡片 | `.comment-card` | `components/comments/CommentCard.tsx` | 嵌套缩进 |
| 媒体容器 | `.post-media` | `components/feed/PostMedia.tsx` | 单图/双图/三图/视频 |
| 骨架屏 | `.skeleton` | 各页面内联 | 脉冲动画 |
| 认证输入 | `.auth-input` | 各认证页面 | 默认、焦点、错误 |
| 认证告警 | `.auth-alert` | 各认证页面 | error（粉）, success（绿） |
| 搜索输入 | `.search-input` | Navbar.tsx | 默认、焦点 |
| 编辑器容器 | `.editor-card` | `components/posts/PostEditorForm.tsx` | — |
| 编辑器输入 | `.editor-input` | 同上 | 默认、焦点 |

### 8.2 按钮交互状态

```
默认：灰色文字 #F5F0EB，card-bg 背景，4 层青色阴影
悬停：青色不变，第 3 层切换为粉色，第 4 层切换为紫色
按下：位移 8px 向阴影方向，阴影收为 2 层
禁用：opacity 0.55，cursor not-allowed，阴影不变
```

按钮基础样式：`display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 24px; text-transform: uppercase; user-select: none`

### 8.3 卡片装饰块（`.pixel-card-decor`）

每个卡片可选 5 个 12×12px 装饰色块，位于卡片左上角区域：
- 块 1 (0,0)：青色，延迟 0s
- 块 2 (16px,0)：紫色，延迟 0.3s
- 块 3 (32px,0)：粉色，延迟 0.6s
- 块 4 (0,16px)：紫色，延迟 0.9s
- 块 5 (16px,16px)：粉色，延迟 1.2s

所有块使用 `decorBlink` 动画（opacity 0.9↔0.2, 2s steps(1)）。

### 8.4 统计按钮

| 统计 | 类名 | 颜色 | 背景 | 已点背景 |
|------|------|------|------|---------|
| 点赞 ♥ | `.stat-like` | `#F43F5E` | `rgba(244,63,94,0.1)` | `rgba(244,63,94,0.25)` |
| 评论 ◆ | `.stat-comment` | `#06B6D4` | `rgba(6,182,212,0.1)` | — |
| 收藏 ★ | `.stat-bookmark` | `#A855F7` | `rgba(168,85,247,0.1)` | `rgba(168,85,247,0.25)` |

统一样式：`display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; min-width: 72px; line-height: 1`

### 8.5 头像渐变

5 种渐变背景，基于用户名字符串哈希选择：
```
1. linear-gradient(135deg, #06B6D4, #0891B2)    ← 青
2. linear-gradient(135deg, #A855F7, #7C3AED)    ← 紫
3. linear-gradient(135deg, #F43F5E, #E11D48)    ← 粉
4. linear-gradient(135deg, #10B981, #059669)    ← 绿
5. linear-gradient(135deg, #EAB308, #CA8A04)    ← 金
```

### 8.6 Logo 像素网格

5×5 CSS Grid，每格 10px + 3px 间距，整体约 62×62px。像素块颜色：
- `.px.on`：青色（`#06B6D4`↔`#22D3EE`），无延迟
- `.px.on2`：粉色（`#F43F5E`↔`#FB7185`），0.5s 延迟
- `.px.on3`：紫色（`#A855F7`↔`#C084FC`），1s 延迟

---

## 九、媒体系统

### 9.1 图片数量与布局

| 图片数 | CSS 类 | Grid 配置 | 图高 |
|--------|--------|-----------|------|
| 1 张 | `.post-media-single` | 块级，`width: 100%` | 140px |
| 2 张 | `.post-media-grid.col2` | `1fr 1fr` | 110px |
| 3 张 | `.post-media-grid.col3` | `1fr 1fr 1fr` | 110px |

所有网格 `gap: 2px`，图片 `object-fit: cover`。

### 9.2 视频缩略图

- 封面：160px 高，`object-fit: cover`
- 播放按钮：56×56px，八边形 clip-path，半透明黑底
- 播放三角：CSS border 三角形（14px），青色
- 悬停效果：播放按钮 `scale(1.12)` + 背景变为 `rgba(6,182,212,0.3)`
- 时长标签：右下角，Zpix 11px，`rgba(0,0,0,0.85)` 背景

### 9.3 媒体角标装饰

- `::before`：左上角 14×14px 青色块
- `::after`：右下角 14×14px 粉色块

### 9.4 占位图（`.media-ph-1` ～ `.media-ph-6`）

| 类 | 暗色渐变 | 亮色渐变 |
|----|---------|---------|
| `media-ph-1` | `#0F172A → #1E1B4B → #312E81 → #1E1B4B` | `#E0E7FF → #DDD6FE → #C4B5FD` |
| `media-ph-2` | `#18181B → #27272A → #18181B` | `#F3F4F6 → #E5E7EB → #F3F4F6` |
| `media-ph-3` | `#0C0A1E → #1A1030 → #0F172A` | `#F5F3FF → #EDE9FE → #DDD6FE` |
| `media-ph-4` | `#0F1729 → #1A2744 → #0F1729` | `#E0F2FE → #BAE6FD → #E0F2FE` |
| `media-ph-5` | `#1A1028 → #281842 → #1A1028` | `#FDF2F8 → #FBCFE8 → #FDF2F8` |
| `media-ph-6` | `#0A1628 → #162240` | `#ECFEFF → #CFFAFE → #ECFEFF` |

---

## 十、状态模式

### 10.1 状态速查表

| 状态 | CSS 模式 | 示例页面 |
|------|---------|---------|
| **加载中** | `.skeleton` 类，`muted-bg` 背景，`skeletonPulse` 动画 | 所有列表页 |
| **空状态** | 居中 flex 列，大 emoji + Zpix 消息，`muted-text` 颜色 | 首页、通知、搜索 |
| **错误** | `.auth-alert` 样式：粉色边框 `rgba(244,63,94,0.3)` + 粉色背景 `rgba(244,63,94,0.1)` + `--pink` 文字 | 所有表单页 |
| **成功** | `.auth-alert-success`：绿色边框 `rgba(16,185,129,0.3)` + 绿色背景 `rgba(16,185,129,0.1)` + `--green` 文字 | 认证页 |
| **列表末尾** | 居中 `-- 已经到底了 --`，`muted-text`，12px | Feed 页 |
| **认证守卫** | 居中 48px emoji + 消息 + PixelButton 链接 | 设置页、通知页 |
| **禁用** | `opacity: 0.55; cursor: not-allowed !important` | 所有按钮 |
| **焦点可见** | `outline: 3px solid var(--gold); outline-offset: 3px` | 全局 |
| **未读** | opacity 1 | 通知页 |
| **已读** | opacity 0.7 | 通知页 |
| **排名高亮** | `.rank-1`：粉色文字 + `rankGlow` 动画（粉色 text-shadow 脉冲） | 侧边栏热榜 |

### 10.2 骨架屏规范

```css
.skeleton {
  background: var(--muted-bg);
  animation: skeletonPulse 1.5s steps(4) infinite;
}
@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
```

使用方式：占位 div 近似实际内容高度，通常同时显示 2-5 个。

### 10.3 空状态示例

```
结构：
  <div style="text-align:center; padding:60px 20px; color:var(--muted-text)">
    <div style="fontSize:48px; marginBottom:16px">{emoji}</div>
    <p style="fontFamily:Zpix...; fontSize:14px">{message}</p>
    {可选操作按钮}
  </div>

常用 emoji：⚡（无帖子）、👤（用户不存在）、🔍（搜索无结果）、📭（无通知）
```

---

## 十一、输入与表单模式

### 11.1 输入类型速查

| 类型 | CSS 类 | 字体 | 边框 | 焦点效果 |
|------|--------|------|------|---------|
| 认证输入 | `.auth-input` | Inter 14px | `2px solid var(--border-subtle)` | `border-color: var(--cyan)` + `3px 3px 0 0 rgba(6,182,212,0.3)` 阴影 |
| 搜索输入 | `.search-input` | Inter 14px | `1px var(--border-subtle)`（via box-shadow） | `box-shadow: 0 0 0 2px var(--primary)` |
| 编辑器输入 | `.editor-input` | Inter 500 15px | `1px solid var(--border-subtle)` | `0 0 0 2px var(--cyan)` + `4px 4px 0 0 rgba(6,182,212,0.35)` |
| 评论区 textarea | `.auth-input` | Inter 14px | 同上认证输入 | 同认证输入，min-height: 80px, resize: vertical |

### 11.2 表单告警

```css
/* 错误 */
.auth-alert {
  padding: 12px; margin-bottom: 16px;
  background: rgba(244,63,94,0.1);
  border: 1px solid rgba(244,63,94,0.3);
  font-size: 13px; color: var(--pink);
}
/* 成功 */
.auth-alert-success {
  background: rgba(16,185,129,0.1);
  border-color: rgba(16,185,129,0.3);
  color: var(--green);
}
/* 表单级错误（编辑器） */
.form-error {
  margin-bottom: 16px; padding: 10px 12px;
  border: 1px solid rgba(244,63,94,0.45);
  background: rgba(244,63,94,0.1);
  color: var(--pink);
}
```

### 11.3 认证页面标题

```css
.auth-title {
  font-family: 'Zpix', 'Space Grotesk', monospace;
  font-size: 20px; font-weight: 700;
  color: var(--cyan);
  margin-bottom: 24px;
  text-align: center;
}
```

---

## 十二、图标与 Unicode 系统

### 12.1 符号映射

| 符号 | Unicode | 用途 | 渲染颜色 |
|------|---------|------|---------|
| ♥ | `♥` | 空心点赞（未点） | `#F43F5E`（粉） |
| ◆ | `◆` | 评论 | `#06B6D4`（青） |
| ★ | `★` | 实心收藏（已收） | `#A855F7`（紫） |
| ♡ | `♡` | 空心收藏（未收） | `var(--muted-text)` |
| ☆ | `☆` | 空心收藏 | `var(--muted-text)` |
| ▌ | `▌` | 品牌名光标 | `var(--cyan)` |
| ☀ | `☀` | 亮色主题图标 | `var(--muted-text)` |
| ☾ | `☾` | 暗色主题图标 | `var(--muted-text)` |
| ■ | `■` | 侧边栏热榜标题装饰 | — |
| ◇ | `◇` | 侧边栏推荐作者标题装饰 | — |
| # | `#` | 侧边栏热门标签标题装饰 | — |

### 12.2 底部导航图标

底部导航使用内联 SVG（非 Unicode），尺寸 18px。四个图标：首页、发现、通知、我的。

---

## 十三、无障碍规范

### 13.1 焦点指示器

```css
button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 3px solid var(--gold);
  outline-offset: 3px;
}
```

### 13.2 禁用状态

```css
button:disabled { cursor: not-allowed !important; opacity: 0.55; }
```

### 13.3 屏幕阅读器专用

```css
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
```

### 13.4 颜色对比度注意事项

- 暗色模式正文 `#E5E5E5` 在 `#000000` 上 → 对比度 18.4:1 ✅
- 暗色模式 `--muted-text` `#888888` 在 `#000000` 上 → 对比度 5.4:1 ⚠️（不用于大段正文）
- 亮色模式正文 `#1a1a2e` 在 `#FAFAFA` 上 → 对比度 15.2:1 ✅
- 亮色模式 `--muted-text` `#777777` 在 `#FAFAFA` 上 → 对比度 4.8:1 ⚠️

---

## 十四、如何添加新组件（12 步检查清单）

按顺序逐项检查：

1. **[ ] 字体层级**：确认组件属于 UI 铬层还是内容层，使用对应字体
2. **[ ] 全局圆角**：确保没有 `border-radius`（会被全局规则强制覆盖，但不要依赖它）
3. **[ ] 设计令牌**：所有颜色使用 `var(--xxx)` 变量，避免硬编码色值
4. **[ ] 阴影系统**：如需阴影，遵循 4px 步进 + 青→粉→紫渐变
5. **[ ] CSS 位置**：新样式写入 `globals.css` 对应章节，不创建新 CSS 文件
6. **[ ] 亮色/暗色**：测试两种主题下的颜色、阴影、边框可见性
7. **[ ] 状态覆盖**：至少处理 default、hover、active/focus、disabled、loading、empty、error
8. **[ ] 响应式**：在 `< 768px` 下测试，可能需要调整内边距/字号/隐藏
9. **[ ] 动画**：如需动画，使用 `steps()`；如不需要，考虑是否需要 `animation: none`
10. **[ ] 过渡时间**：遵循 40ms（按钮）/ 80ms（卡片）规范
11. **[ ] 无障碍**：焦点可见（金色轮廓）、禁用态、语义化 HTML
12. **[ ] 模式一致性**：与现有同类组件（如 PixelButton、PixelTag）保持样式一致

---

## 十五、常见陷阱（DO/DON'T 速查表）

| # | ✅ DO | ❌ DON'T |
|---|-------|----------|
| 1 | `border-radius: 0` 全部直角 | 使用 `rounded-lg`、`border-radius: 8px` |
| 2 | 动画 `steps(2)` / `steps(4)` | 动画 `ease-in-out`、`cubic-bezier(...)` |
| 3 | UI 铬层用 `Zpix` + `-webkit-font-smoothing: none` | 按钮/Tab/标签用 Inter |
| 4 | 内容层用 `Inter` + `-webkit-font-smoothing: antialiased` | 帖子正文用 Zpix |
| 5 | 阴影 `box-shadow: Xpx Xpx 0 0 color`（硬边偏移） | `box-shadow: 0 4px 12px rgba(...)`（模糊阴影） |
| 6 | 颜色用 `var(--cyan)` / `var(--pink)` | 硬编码 `#06B6D4` / `#F43F5E` |
| 7 | 新 CSS 写入 `globals.css` 对应章节 | 创建 `.module.css` 或 CSS-in-JS |
| 8 | 侧边栏保持静态（`animation: none`） | 给侧边栏加动画 |
| 9 | 按钮按下 `translate(8px,8px)` | 按钮按下用 `scale(0.95)` |
| 10 | 过渡 `40ms steps(2)` 或 `80ms steps(2)` | 过渡 `200ms ease` |
| 11 | 头像用八边形 `clip-path: polygon(...)` | 头像用 `border-radius: 50%` |
| 12 | 背景网格 32px 间距 | 用图案/图片做背景 |
| 13 | 扫描线 `z-index: 9999` `pointer-events: none` | 扫描线可交互或 z-index 太低 |
| 14 | `<html>` 通过 `.light` class 切换主题 | 用 `data-theme` 或其他属性切换 |
| 15 | 品牌色从青/粉/紫/金/绿 5 色中选 | 新增第 6 种品牌色 |
| 16 | 媒体最多 3 张图 | 做轮播或 4+ 张网格 |

---

## 十六、附录

### A. CSS 类名索引

| 类别 | 类名 |
|------|------|
| 布局 | `.page-layout`, `.feed-col`, `.sidebar-col`, `.editor-page` |
| 卡片 | `.pixel-card`, `.editor-card`, `.comment-card` |
| 按钮 | `.pixel-btn`, `.pixel-btn-accent`, `.pixel-btn-subtle`, `.theme-toggle` |
| 导航 | `.pixel-nav`, `.nav-brand`, `.nav-link`, `.nav-actions`, `.bottom-nav` |
| 标签 | `.pixel-tag`, `.pixel-tag-official`, `.sidebar-tag`, `.sidebar-tag-official` |
| Tab | `.tab`, `.tab.active` |
| 输入 | `.auth-input`, `.search-input`, `.editor-input` |
| 表单 | `.auth-title`, `.auth-alert`, `.auth-alert-success`, `.form-error`, `.field-label` |
| 媒体 | `.post-media`, `.post-media-single`, `.post-media-grid`, `.post-media-video`, `.video-play-btn`, `.video-duration`, `.media-count-badge` |
| 占位图 | `.media-ph-1` ~ `.media-ph-6` |
| 统计 | `.stat-like`, `.stat-comment`, `.stat-bookmark`, `.post-card-stats` |
| 内容 | `.post-card-row`, `.post-card-body`, `.post-card-user`, `.post-card-title`, `.post-card-excerpt`, `.post-card-tags`, `.post-card-time` |
| 头像 | `.avatar-block` |
| Logo | `.pixel-logo`, `.px`, `.px.on`, `.px.on2`, `.px.on3` |
| 背景 | `.pixel-particles`, `.pixel-particle`, `.rainbow-strip` |
| 装饰 | `.pixel-card-decor`, `.blk` |
| 状态 | `.skeleton`, `.rank-1`, `.sr-only` |
| 文章 | `.post-detail-content`, `.post-feed` |
| 评论 | `.comment-thread` |
| 编辑器 | `.editor-header`, `.editor-row`, `.editor-kicker`, `.bytemd-shell` |
| 侧边栏 | `.sidebar-section` |

### B. CSS 变量速查

```
--bg, --color, --card-bg, --muted-bg, --muted-text, --border-subtle
--cyan, --cyan-dim
--pink, --pink-dim, --pink-faint
--primary, --primary-dim, --primary-faint
--gold, --green, --green-dim
--pixel: 16px
--nav-h: 64px
--radius: 0rem
```

### C. 关键帧动画索引

```
crtFlicker    → 8s, steps(1)
floatUp       → 10-18s, steps(60)
blink         → 1s, steps(1)
glitchText    → 0.3s, steps(2)
pixelLogoGlow → 2s, steps(4)       [青]
pixelLogoGlow2→ 2s, steps(4), 0.5s [粉]
pixelLogoGlow3→ 2s, steps(4), 1s   [紫]
decorBlink    → 2s, steps(1)
navShadowWave → 4s, steps(4)
rainbowShift  → 3s, steps(8)
rankGlow      → 1.5s, steps(2)
skeletonPulse → 1.5s, steps(4)
```

### D. 组件文件映射

```
components/layout/Navbar.tsx         → 导航栏 + 搜索
components/layout/Sidebar.tsx        → 侧边栏（热榜/作者/标签）
components/layout/RainbowStrip.tsx   → 彩虹分隔条
components/layout/PixelBackground.tsx→ 粒子背景
components/layout/BottomNav.tsx      → 移动端底部导航
components/ui/PixelButton.tsx        → 按钮（default/accent/subtle）
components/ui/PixelTag.tsx           → 标签（default/official）
components/ui/PixelAvatar.tsx        → 八边形头像
components/ui/PixelLogo.tsx          → 5×5 像素 Logo
components/ui/StatIcons.tsx          → ♥◆★ 统计按钮
components/ui/ThemeToggle.tsx        → ☀/☾ 主题切换
components/feed/PostCard.tsx         → 帖子卡片
components/feed/PostMedia.tsx        → 媒体容器（图片/视频）
components/comments/CommentCard.tsx  → 评论卡片
components/comments/CommentSection.tsx→ 评论区
components/posts/PostEditorForm.tsx  → 文章编辑器
components/auth/PasswordResetForms.tsx→ 密码重置表单
```

### E. 页面宽度速查

```
 400px → 登录、注册、忘记密码、重置密码
 500px → 设置/资料
 600px → 用户资料、通知
 800px → 帖子详情
 980px → 帖子编辑器
1120px → 首页 Feed、标签页、搜索页
```

### F. 颜色角色反向查找

```
需要主交互色       → var(--cyan)
需要强调/CTA       → var(--pink)
需要装饰/收藏      → var(--primary)
需要精选/焦点      → var(--gold)
需要成功/在线      → var(--green)
需要正文           → var(--color)（暗色 #E5E5E5 / 亮色 #1a1a2e）
需要次级文字       → var(--muted-text)
需要背景           → var(--bg)
需要卡片背景       → var(--card-bg)
需要输入框背景     → var(--muted-bg)
需要细分隔线       → var(--border-subtle)
```

---

> **维护规则**：任何对 `globals.css` 的视觉变更，都应同步更新本文档对应章节。新增 CSS 类需添加到附录 A。
