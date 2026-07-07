# bingbingbingo UI 设计规范

> 版本：v1.4.0-MVP
> 更新日期：2026-07-07
> 风格：**激光镭射 × 古典马赛克街机** — 纯黑底 + 大块彩虹像素 + CRT 扫描线 + 漂浮粒子动画
> 技术栈：Next.js 15 + Tailwind CSS 4 + shadcn/ui + bytemd

---

## 一、设计理念

### 1.1 风格定位

| 维度 | 选择 |
|------|------|
| 主风格 | **现代像素（Modern Pixel）** — 16px 块面阴影、像素网格背景、大块面几何感 |
| 色彩方向 | **激光镭射彩虹** — 青/粉/紫/金多色像素阴影叠加，全息虹彩感 |
| 字体策略 | **双层字体系统** — UI 铬层（导航/Tab/按钮/标签/统计）走 Zpix，内容层（帖子正文 + 侧边栏全部）走 Inter |
| 参考 | Claude logo 块面美学、Hermès 像素丝巾、Vibe Island 大色块 |

### 1.2 核心原则

- **像素即风格，但不牺牲可读性**：16px 大块面阴影、像素网格纹理、像素字体仅用于 UI 标签。正文内容使用 Inter 保持阅读舒适。
- **彩虹镭射**：暗色模式下青→粉→紫三层偏移像素阴影，像激光打在黑色卡纸上。亮色模式下同色系变柔和半透明。
- **纯黑底暗色**：暗色模式用 `#000000` 纯黑底，不做紫黑/蓝黑染色。彩色由像素阴影和极光渐变提供。
- **双主题一等公民**：亮色/暗色同时设计，通过 `.light` class 切换，导航栏提供一键切换按钮。
- **内容优先**：帖子正文是核心。Hero 不存在——打开首页就是 feed 流。
- **侧边栏静默**：侧边栏全部使用 Inter 正常字体，无动画效果，作为信息辅助区不抢眼球。
- **古典街机动画**：仅 UI 铬层使用 `steps()` 阶梯动画、像素闪烁、CRT 扫描线、漂浮粒子。侧边栏和内容层保持静态。

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

### 2.3 彩虹像素阴影色板（阶梯式）

| 层级 | 暗色 | 用途 |
|------|------|------|
| L1 (4px) | `var(--cyan)` 实色青 | 第一层，紧贴元素 |
| L2 (8px) | `rgba(6,182,212,0.7)` 青 | 第二层，渐淡 |
| L3 (12px) | `rgba(244,63,94,0.45)` 粉 | 第三层，色彩切换 |
| L4 (16px) | `rgba(168,85,247,0.25)` 紫 | 第四层，收尾 |
| L5 (20px, hover only) | `rgba(6,182,212,0.1)` 青 | 第五层，最远处 |

亮色模式下各层透明度降低约 20%，以适应浅色背景。

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
/* UI 铬层：导航、Tab、按钮、标签、统计 — 像素字体 */
.tab, .pixel-btn, .pixel-tag, .nav-link,
.nav-brand, .post-card-time, .post-card-stats,
.bottom-nav a, .video-duration, .media-count-badge {
  font-family: 'Zpix', 'Space Grotesk', monospace;
  -webkit-font-smoothing: none;  /* 像素字体保持锐利 */
}
```

**不在此列的元素**（使用 Inter）：
- 帖子标题、正文、用户名 → 内容层
- 侧边栏全部（标题、排行、作者、标签、meta） → 辅助信息层
- 搜索输入框 → 用户输入

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

全局像素基准：**16px**。大块装饰使用 32px 网格，间距和偏移为 4px 的倍数。

```css
:root { --pixel: 16px; }
```

背景网格从 16px 升级为 **32px 粗线网格**，线条 2px，更适合 Hermès/Claude 式的大块面美学。

### 4.2 像素阴影（核心视觉特征）

用多层 `box-shadow` 实现彩虹镭射偏移效果。默认使用 **4 层阶梯阴影**，hover 时展开到 **5 层**，模拟街机像素块的纵深堆叠感。

```css
/* 卡片默认 — 4 层阶梯 */
.pixel-card {
  box-shadow:
    4px 4px 0 0 var(--cyan),
    8px 8px 0 0 rgba(6,182,212,0.4),
    12px 12px 0 0 rgba(6,182,212,0.2),
    0 0 0 1px rgba(255,255,255,0.08);
}

/* 卡片 hover — 5 层彩虹阶梯 */
.pixel-card:hover {
  box-shadow:
    4px 4px 0 0 var(--cyan),
    8px 8px 0 0 rgba(6,182,212,0.7),
    12px 12px 0 0 rgba(244,63,94,0.45),
    16px 16px 0 0 rgba(168,85,247,0.25),
    20px 20px 0 0 rgba(6,182,212,0.1),
    0 0 0 1px rgba(6,182,212,0.3);
  transform: translate(-2px, -2px); /* 卡片微微浮起 */
}

/* hover 时显示左侧像素彩条 */
.pixel-card::before {
  content: '';
  background: linear-gradient(to bottom,
    var(--cyan) 0%, var(--cyan) 33%, transparent 33%, transparent 34%,
    var(--primary) 34%, var(--primary) 66%, transparent 66%, transparent 67%,
    var(--pink) 67%, var(--pink) 100%);
  background-size: 4px 16px;
  opacity: 0; /* 默认隐藏，hover 显示 */
}
.pixel-card:hover::before { opacity: 1; }
```

### 4.3 像素按钮

```css
.pixel-btn {
  /* 4 层阶梯阴影 */
  box-shadow:
    4px 4px 0 0 var(--cyan),
    8px 8px 0 0 rgba(6,182,212,0.6),
    12px 12px 0 0 rgba(6,182,212,0.3),
    16px 16px 0 0 rgba(6,182,212,0.1);
  transition: transform 40ms steps(2), box-shadow 40ms steps(2);
}
.pixel-btn:hover {
  /* hover 增强 */
  box-shadow:
    4px 4px 0 0 var(--cyan),
    8px 8px 0 0 rgba(6,182,212,0.8),
    12px 12px 0 0 rgba(244,63,94,0.5),
    16px 16px 0 0 rgba(168,85,247,0.3);
}
.pixel-btn:active {
  transform: translate(8px, 8px);       /* 阶梯缩进 */
  box-shadow:
    4px 4px 0 0 rgba(6,182,212,0.6),
    8px 8px 0 0 rgba(6,182,212,0.2);
}
.pixel-btn-accent {
  /* 粉红色调版本 */
  box-shadow: 4px 4px 0 0 var(--pink), 8px 8px 0 0 rgba(244,63,94,0.6), ...;
}
```

### 4.4 彩虹阴影色板

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

### 4.5 导航栏彩虹底线（动态轮换）

```css
.pixel-nav {
  box-shadow:
    0 4px 0 0 rgba(6,182,212,0.6),    /* 青 4px */
    0 8px 0 0 rgba(244,63,94,0.4),    /* 粉 8px */
    0 12px 0 0 rgba(168,85,247,0.2);  /* 紫 12px */
  animation: navShadowWave 4s steps(4) infinite;
}
@keyframes navShadowWave {
  0%,100% { /* 青→粉→紫 */ }
  50%    { /* 粉→紫→青，三色轮换 */ }
}
```

### 4.6 背景纹理（像素网格 + CRT 扫描线 + 暗角）

```css
/* body 暗角 — CRT 边缘渐暗效果 */
body {
  box-shadow: inset 0 0 120px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.3);
}

/* CRT 扫描线 — 固定叠加层，带闪烁动画 */
body::after {
  content: '';
  position: fixed; inset: 0; z-index: 9999; pointer-events: none;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px
  );
  animation: crtFlicker 8s infinite steps(1);
}
@keyframes crtFlicker {
  0%,99.9%,100% { opacity: 1; }
  50%           { opacity: 0.97; }   /* 瞬间变暗 */
  50.2%         { opacity: 1; }      /* 瞬间恢复 */
  75%           { opacity: 0.98; }
  75.1%         { opacity: 1; }
}
```

### 4.7 像素品牌 Logo（5×5 网格 + 三色流光动画）

5×5 网格，8px 方块 + 2px 间距。青/粉/紫三色像素块各自有呼吸发光动画，错开延迟：

```css
.pixel-logo .px.on  { animation: pixelLogoGlow  2s steps(4) infinite; }      /* 青 */
.pixel-logo .px.on2 { animation: pixelLogoGlow2 2s steps(4) infinite 0.5s; } /* 粉 */
.pixel-logo .px.on3 { animation: pixelLogoGlow3 2s steps(4) infinite 1s; }   /* 紫 */
@keyframes pixelLogoGlow {
  0%,100% { background: #06B6D4; }
  50%     { background: #22D3EE; box-shadow: 0 0 6px rgba(6,182,212,0.6); }
}
```

---

## 五、动画系统

所有 UI 动画遵循 **街机美学**：使用 `steps()` 阶梯函数、无平滑缓动、跳跃式闪烁。动画仅作用于 UI 铬层，不干扰内容阅读。

### 5.1 全局动画清单

| 动画名 | 应用位置 | 时长 | 函数 | 效果 |
|--------|---------|------|------|------|
| `crtFlicker` | `body::after` 扫描线 | 8s | `steps(1)` | CRT 屏幕随机闪烁 |
| `floatUp` | 背景漂浮粒子 (×10) | 10~18s | `linear` | 像素块从底部旋升消失 |
| `blink` | 品牌名后光标 `▌` | 1s | `steps(1)` | 硬切闪烁 |
| `glitchText` | `.nav-brand:hover` | 0.3s | `steps(2)` | RGB 色散偏移 |
| `pixelLogoGlow` | Logo 青色块 | 2s | `steps(4)` | 呼吸发光 |
| `pixelLogoGlow2` | Logo 粉色块 | 2s | `steps(4)` + 0.5s | 错峰呼吸发光 |
| `pixelLogoGlow3` | Logo 紫色块 | 2s | `steps(4)` + 1s | 错峰呼吸发光 |
| `cornerPulse` | 像素角标 | 3s | `steps(2)` | 明暗脉冲闪烁 |
| `sepShift` | 像素分割线 | 4s | `steps(8)` | 色块水平滚动 |
| `decorBlink` | 卡片装饰块 (×5) | 2s | `steps(1)` | 随机闪烁 |
| `navShadowWave` | 导航栏 + 底部导航 | 4s | `steps(4)` | 青→粉→紫阴影轮换 |
| `tagDot` | 标签左上角点 | 2s | `steps(2)` | 像素点闪烁 |
| `rankGlow` | 热榜 #1 名次 | 1.5s | `steps(2)` | 红色发光脉冲 |

### 5.2 品牌交互动画

**闪烁光标**：品牌名后跟青色 `▌` 字符，1s `steps(1)` 硬切闪烁。

```css
.nav-brand::after { content: '▌'; color: var(--cyan); animation: blink 1s steps(1) infinite; }
```

**Glitch 悬停**：鼠标悬停品牌名时触发 RGB 色散 + 偏移：

```css
.nav-brand:hover { animation: glitchText 0.3s steps(2) infinite; }
@keyframes glitchText {
  0%   { text-shadow: 2px 0 var(--pink), -2px 0 var(--cyan); transform: translate(0); }
  25%  { text-shadow: -2px 0 var(--pink), 2px 0 var(--cyan); transform: translate(-1px,1px); }
  50%  { text-shadow: 2px -1px var(--pink), -2px 1px var(--cyan); transform: translate(1px,-1px); }
  75%  { text-shadow: -1px 1px var(--pink), 1px -1px var(--cyan); transform: translate(0); }
  100% { text-shadow: 1px 0 var(--pink), -1px 0 var(--cyan); transform: translate(0); }
}
```

### 5.3 像素漂浮粒子系统

10 个绝对定位的彩色方块（4~8px），从视口底部旋转上升到顶部消失。不同尺寸、颜色、速度的粒子错开分布。

```css
.pixel-particle {
  position: absolute;
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0%   { transform: translateY(105vh) rotate(0deg); opacity: 0; }
  10%  { opacity: 0.8; }
  90%  { opacity: 0.6; }
  100% { transform: translateY(-10vh) rotate(720deg); opacity: 0; }
}
```

### 5.4 像素装饰动画

**卡片装饰块**：每个卡片左上角可有 5 个 8×8px 色块（青/紫/粉），各自延迟 `steps(1)` 闪烁。

**像素角标**：4 个 12×12px 角标（青/粉/紫），明暗脉冲 `steps(2)`，带 `box-shadow` 发光。

**侧边栏角标**：每个 sidebar section 右下角 12×12px 紫块，脉冲闪烁。

**侧边栏标题装饰**：每个标题后跟 8×8px 青色方块，带呼吸发光。

**标签角点**：每个 Tag 左上角 5×5px 青色/紫色点，`steps(2)` 闪烁。

**像素分割线**：水平方向色块滚动 `sepShift` 动画。

---

## 六、帖子媒体系统

帖子支持嵌入图片和视频。每种媒体类型都采用像素边框 + 彩虹阶梯阴影 + 像素角标装饰，与整体街机风格一致。**每帖最多 3 张图，同时展示在网格中（无轮播）。**

### 6.1 媒体容器

```css
.post-media {
  margin: 10px 0;                    /* 紧凑间距，不抢占正文 */
  border: 2px solid var(--border-subtle);
  box-shadow: 4px 4px 0 0 rgba(6,182,212,0.3);
  transition: box-shadow 80ms steps(2);
}
.pixel-card:hover .post-media {
  box-shadow: 6px 6px 0 0 rgba(6,182,212,0.5),
              10px 10px 0 0 rgba(244,63,94,0.25);
}
/* 像素角标：左上青、右下粉 */
.post-media::before { /* 10×10px 青色块，左上角 */ }
.post-media::after  { /* 10×10px 粉色块，右下角 */ }
```

### 6.2 单图展示

一张图占满卡片宽度，高度 130–140px，适合截图、架构图等。

| CSS 类 | 布局 | 高度 |
|--------|------|------|
| `.post-media-single` | `width:100%` 块级 | **140px** |

### 6.3 多图网格（最多 3 张）

三张图同时展示，使用 CSS Grid 等宽排列，中间 2px 间隙。右上角叠加「N 张」计数角标。

| CSS 类 | 列数 | 图高 | 场景 |
|--------|------|------|------|
| `.post-media-grid.col2` | 2 列 `1fr 1fr` | **110px** | 两张截图/前后对比 |
| `.post-media-grid.col3` | 3 列 `1fr 1fr 1fr` | **110px** | 三张过程展示（设计稿→代码→上线） |

```css
.post-media-grid { display: grid; gap: 2px; }
.col2 { grid-template-columns: 1fr 1fr; grid-auto-rows: 110px; }
.col3 { grid-template-columns: 1fr 1fr 1fr; grid-auto-rows: 110px; }
```

**图片计数角标**：

```css
.media-count-badge {
  position: absolute; top: 8px; right: 8px; z-index: 3;
  background: rgba(0,0,0,0.8); color: #FFF;
  font-family: 'Zpix', monospace; font-size: 11px;
  padding: 3px 8px;
}
```

### 6.4 视频缩略图

视频封面 + 八边形播放按钮 + 时长标签，与头像 `clip-path` 风格统一。

| 元素 | 描述 |
|------|------|
| 封面 | 160px 高渐变占位图 |
| 播放按钮 | 56×56px 八边形，`clip-path` 切割，悬停放大 1.12× + 青色发光 |
| 播放三角 | 14px CSS 三角 (`border-left`) |
| 时长标签 | 右下角 Zpix 字体 `24:18` 格式 |
| 直播角标 (可选) | 左上角红色 `LIVE` + `livePulse` 脉冲动画 |

```css
.video-play-btn {
  width: 56px; height: 56px;
  background: rgba(0,0,0,0.8);
  clip-path: polygon(20% 0%,80% 0%,100% 20%,100% 80%,80% 100%,20% 100%,0% 80%,0% 20%);
}
.post-media-video:hover .video-play-btn {
  transform: scale(1.12);
  background: rgba(6,182,212,0.3);
}
```

### 6.5 占位图系统（纯 CSS 渐变）

6 种 CSS 渐变占位图（`media-ph-1` ~ `media-ph-6`），模拟不同内容类型的截图，纯 CSS 无外部依赖。

| 类名 | 模拟内容 | 渐变特点 |
|------|---------|---------|
| `media-ph-1` | 像素画板 | 深蓝紫底 + 像素网格叠加 + 六边形符号 |
| `media-ph-2` | UI 组件截图 | 暗灰底 + 顶部彩虹色条 + 水平扫线 |
| `media-ph-3` | Dashboard 图表 | 深紫底 + 柱状渐变色块 + 条纹纹理 |
| `media-ph-4` | 视频封面 | 深蓝底 + 发光圆 + 播放符号水印 |
| `media-ph-5` | UI 组件截图 | 深紫渐底 + 双色径向光斑 |
| `media-ph-6` | 架构流程图 | 深蓝底 + 圆锥渐变圆环 + 虚线框 |

### 6.6 媒体配置示例

| 帖子 | 图片数 | 布局 | 说明 |
|------|--------|------|------|
| 像素画板作品 | 1 张 | `post-media-single` | 单张大图 |
| Dashboard 求助 | 1 张 | `post-media-single` | 仪表盘截图 |
| CSS 组件库 | 2 张 | `post-media-grid col2` | 并排展示 +「2 张」角标 |
| 设计师转行 | 3 张 | `post-media-grid col3` | 三列展示 +「3 张」角标 |
| 工具对比 | 视频 | `post-media-video` | 播放键 + 时长 24:18 |
| 部署流水线 | 1 张 | `post-media-single` | 架构图 |

---

## 七、布局系统

### 7.1 双栏布局

```
┌──────────────────────────────────────────────────────┐
│  [NAV]  像素Logo  品牌名▌ 搜索框   ☀  登录           │ 64px
├══════════════════════════════════════════════════════┤
│  ▓▓▓▓▓▓▓▓  彩虹像素块分隔带 (8色)  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │ 6px
├────────────────────────────────┬─────────────────────┤
│  [最新] [最热] [精华]           │  ■■ 热榜            │
│                                │  1. 帖子标题...      │
│  ┌──────────────────────────┐  │  2. 帖子标题...      │
│  │ [头像] 用户名 · 2h ago   │  │  ◇◇ 推荐作者        │
│  │ 帖子标题                  │  │  [头像] TerminalFan  │
│  │ 摘要摘要摘要...           │  │  [头像] RetroDev     │
│  │ ┌────────────────────┐   │  │  ## 热门标签         │
│  │ │ [图片/视频/网格]    │   │  │  #AI #vibe #React    │
│  │ └────────────────────┘   │  │                      │
│  │ #tag #tag    ┌─────────┐ │  │                      │
│  │              │ ♥ ◆ ★  │ │  │                      │
│  └──────────────└─────────┘─┘  │                      │
│        [加载更多]              │                      │
├────────────────────────────────┴─────────────────────┤
│  [首页]  [标签]  [通知]  [我的]          (移动端底部) │
└──────────────────────────────────────────────────────┘
```

| 断点 | 布局 |
|------|------|
| < 768px | 单列 Feed + 隐藏侧边栏 + 底部导航 |
| >= 768px | 双栏：Feed (flex:1) + 侧边栏 (280px) |

### 7.2 间距

| Token | 值 | 用途 |
|------|-----|------|
| Card gap | 20px | Feed 卡片间距 |
| Sidebar gap | 32px | 双栏间距 |
| Card padding | 24px | 卡片内边距 |
| Sidebar padding | 20px | 侧边栏模块内边距 |
| Page padding | 20px (desktop) / 12px (mobile) | 页面两侧留白 |

---

## 八、组件规范

### 8.1 shadcn/ui 像素化配置

```css
@theme inline {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Zpix', monospace;
  --radius: 0rem;  /* 全局关闭圆角 */
}
```

### 8.2 核心组件映射

| 场景 | 组件 | 像素化改造 |
|------|------|-----------|
| 帖子卡片 | `Card` | `pixel-card`, 4层阶梯阴影, hover 5层展开 + 微浮起 |
| 帖子图片 | 自定义 `.post-media` | 像素边框 + 阶梯阴影 + 青/粉角标, 单图/双图/三图网格 |
| 帖子视频 | 自定义 `.post-media-video` | 八边形播放按钮 + 时长标签 + 封面渐变 |
| 统计图标 | 自定义 `.stat-*` | `inline-flex` 居中, 各自底色块, 帖子卡片右下角固定 |
| 按钮 | `Button` | `pixel-btn`, 4层阶梯阴影, hover 色彩增强, 按下 8px 缩进 |
| 标签 (Feed) | `Badge` | `.pixel-tag` + `.pixel-tag-official` 共享基础尺寸, 仅颜色不同 |
| 标签 (侧边栏) | `Badge` | Inter 字体, 浅灰底色, official 紫色文字 |
| Tab | `Tabs` | `inline-flex` 居中, 阶梯阴影 + 按下缩进 |
| 头像 | 八边形 `clip-path` | Zpix 字体字母, 渐变背景 |
| 主题切换 | ☀ 按钮 | 36×36px 方块, 像素阶梯阴影, 按下缩进 |
| 漂浮粒子 | 纯 CSS `pixel-particle` | 10 个大块 (8–16px) 旋升动画 |
| 彩虹分隔带 | 纯装饰 `.pixel-rainbow-strip` | 8 色块条, 闪烁动画 |
| 底部像素块 | 纯装饰 `.pixel-footer-blocks` | 5 个大块 (24px) 闪烁 |

### 8.3 侧边栏模块

侧边栏全部使用 Inter 字体，无动画效果，作为安静的辅助信息区。

| 模块 | 标题 | 内容 |
|------|------|------|
| 热榜 | `■■ 热榜` (Inter, 600, 青色) | TOP5 帖子, 带 ♥ ◆ 统计 |
| 推荐作者 | `◇◇ 推荐作者` (Inter, 600, 青色) | 4位作者, 八边形头像 + 用户名 + 小字标签 |
| 热门标签 | `## 热门标签` (Inter, 600, 青色) | 标签云, Inter 字体, 浅灰底, official 紫色 |

> 已移除「关于」模块。侧边栏仅保留 3 个模块。
| 关于 | `?? 关于` | 社区简介 + 在线/帖子/用户统计数 |

---

## 九、交互规范

### 9.1 像素动画

所有动画遵循 **街机美学**：使用 `steps()` 阶梯函数、无平滑缓动、跳跃式闪烁。详情见 [五、动画系统](#五动画系统)。

| 场景 | 时长 | 方式 |
|------|------|------|
| 按钮按下 | 40ms steps(2) | 阶梯缩进 8px + 阴影收拢 |
| 卡片 hover | 80ms steps(2) | 阴影 4→5 层阶梯展开 + 左侧彩条出现 |
| 链接 hover | 即时 | 颜色切换到青 |
| CRT 闪烁 | 8s steps(1) | 扫描线瞬间明暗 |
| Logo 呼吸 | 2s steps(4) | 三色错峰发光 |

### 9.2 状态反馈

| 状态 | 表现 |
|------|------|
| Hover | 青色调变亮 + 阴影增强 |
| Press | 按钮位移 16px（真的「按下去」） |
| Focus | 2px 青 `outline`, 2px offset |
| Disabled | `opacity-50` + `cursor-not-allowed` |
| Loading | 骨架屏（Skeleton），非空白 spinner |

### 9.3 主题切换

- 使用 `next-themes` ThemeProvider
- 导航栏 ☀/☾ 图标按钮
- 点击 toggle `<html>` 的 `.light` class
- 首次访问跟随 `prefers-color-scheme`
- 选择持久化 localStorage

---

## 十、页面路由 UI 描述

| 路径 | 核心 UI |
|------|--------|
| `/` | 双栏 Feed + 侧边栏，Tab 切换（最新/最热/精华），cursor 无限滚动 |
| `/posts/:slug` | 帖子详情 SSR，像素标题 + Markdown 正文 + 评论区 |
| `/u/:username` | 八边形头像 + 用户信息 + Tab（帖子/作品） |
| `/tags/:slug` | 标签信息 + 帖子 Feed |
| `/notifications` | 通知列表，未读高亮 |
| `/search?q=` | 搜索结果 Feed |

---

## 十一、实现检查清单

### 基础

- [ ] Zpix + Inter + Space Grotesk + Noto Sans SC 字体加载
- [ ] `--radius: 0rem` 全局覆盖 shadcn/ui
- [ ] `:root` 暗色变量 + `.light` 亮色变量
- [ ] `next-themes` ThemeProvider 集成
- [ ] 导航栏 ☀/☾ 切换按钮

### 像素系统

- [ ] 4 层阶梯阴影（4/8/12/16px），hover 展开 5 层（+20px）+ 卡片微浮起
- [ ] 按钮：4 层阶梯阴影 + hover 色彩增强 + 按下 8px 缩进
- [ ] 导航：三层彩虹底线 + navShadowWave 轮换动画
- [ ] 背景：32px 粗线网格 + 四角彩虹极光 + CRT 扫描线 + 暗角
- [ ] 5×5 像素 Logo (10px 块) + 三色流光呼吸动画
- [ ] 主题切换按钮：36×36px 方块 + 阶梯阴影 + 按下缩进
- [ ] 彩虹像素块分隔带 (8 色) + 底部方块装饰 (5 大块)
- [ ] 卡片装饰块 (12px) + 媒体角标 (14px)

### 动画系统

- [ ] CRT 扫描线闪烁 crtFlicker
- [ ] 10 个漂浮像素粒子 (8–16px) floatUp
- [ ] 品牌闪烁光标 blink + Glitch 悬停 glitchText
- [ ] Logo 三色流光 pixelLogoGlow ×3
- [ ] 卡片装饰块闪烁 decorBlink
- [ ] 导航阴影轮换 navShadowWave
- [ ] 彩虹分隔带闪烁 rainbowShift
- [ ] 直播角标脉冲 livePulse
- [ ] 所有动画使用 steps()，禁用 ease
- [ ] 侧边栏全部无动画

### 媒体系统

- [ ] 单图：`.post-media-single`，130–140px 高
- [ ] 双图网格：`.post-media-grid.col2` + `grid-auto-rows:110px`
- [ ] 三图网格：`.post-media-grid.col3` + `grid-auto-rows:110px`
- [ ] 图片计数角标（Zxpix 像素字体）
- [ ] 视频：160px 封面 + 八边形播放按钮 + 时长标签
- [ ] 媒体像素边框 + 阶梯阴影 + 青/粉 14px 角标
- [ ] 6 种 CSS 渐变占位图
- [ ] 卡片 hover 时媒体阴影增强

### 标签系统

- [ ] `.pixel-tag` 和 `.pixel-tag-official` 共享基础尺寸规则
- [ ] Feed 标签：Zpix 字体, 2px 彩色边框
- [ ] 侧边栏标签：Inter 字体, 1px 浅灰边框, official 紫色文字
- [ ] 所有标签 `inline-flex` + `align-items:center` + `justify-content:center` + `line-height:1`

### 统计图标

- [ ] ♥ ◆ ★ 16px 加粗, `inline-flex` 居中, 各带半透明底色块
- [ ] `min-width:72px` 统一最小宽度
- [ ] 帖子卡片右下角固定 (`margin-top:auto` + `align-self:flex-end`)

### 双主题验证

- [ ] 暗色模式：纯黑底 `#000000`
- [ ] 亮色模式：近白底 `#FAFAFA`
- [ ] 所有文字对比度 >= 4.5:1
- [ ] 像素阴影双主题下都可见
- [ ] 扫描线双主题下可见
- [ ] 占位图色彩双主题协调
- [ ] 主题切换按钮双主题正常
- [ ] 375px / 768px / 1024px / 1440px 测试

### 字体分层

- [ ] UI 铬层（品牌名、Tab、按钮、标签、时间、统计、底部导航）使用 Zpix + Space Grotesk
- [ ] 内容层（帖子标题/正文/用户名）使用 Inter
- [ ] 辅助层（侧边栏全部：标题、排行、作者、标签、meta）使用 Inter
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
