# AI/机器人新闻聚合平台 - 项目计划书

## 项目概述

### 项目目标
构建一个实时聚合全球 AI 和机器人领域最新资讯的交互式平台，仿照 [immersivetranslate](https://iran.immersivetranslate.com/zh-CN/) 的设计风格，提供自动翻译、时间线展示和智能分类功能。

### 核心定位
**专业科研聚合平台** - 强调实时性、多语言、信息透明度，以内容为核心，避免过度装饰。

---

## 视觉设计规范

### 色彩系统

```css
/* 背景色 */
--bg-primary: #0d0d0d;      /* 主背景 */
--bg-secondary: #1a1a1a;    /* 卡片背景 */
--bg-tertiary: #262626;     /* 悬浮层背景 */

/* 文字色 */
--text-primary: #ffffff;    /* 主文字 */
--text-secondary: #a3a3a3;  /* 次要文字 */
--text-tertiary: #737373;   /* 辅助文字 */

/* 强调色 */
--accent-red: #ff4444;      /* 突破性成果 */
--accent-orange: #ff6b35;   /* 高亮状态 */

/* 来源标签色 */
--source-arxiv: #22c55e;           /* 绿色 */
--source-github: #a855f7;          /* 紫色 */
--source-ieee: #3b82f6;            /* 蓝色 */
--source-science: #eab308;         /* 金色 */
--source-huggingface: #f97316;     /* 橙色 */

/* 边框与分割 */
--border-primary: #404040;
--border-secondary: #262626;
```

### 字体规范

| 场景 | 中文字体 | 英文字体 | 字号 | 字重 |
|------|----------|----------|------|------|
| 大标题 | system-ui, -apple-system | Inter, SF Pro | 48px | 700 |
| 副标题 | system-ui | Inter | 18px | 400 |
| 卡片标题 | system-ui | Inter | 16px | 600 |
| 正文 | system-ui | Inter | 14px | 400 |
| 标签 | system-ui | Inter | 12px | 500 |
| 时间戳 | system-ui | Inter Mono | 12px | 400 |

### 间距系统

```css
/* 基础单位 4px */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### 圆角与阴影

```css
/* 圆角 */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;

/* 阴影 */
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-card-hover: 0 8px 30px rgba(0, 0, 0, 0.5);
--shadow-dropdown: 0 10px 40px rgba(0, 0, 0, 0.6);
```

---

## 动效规范

### 缓动函数
```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 过渡时长
| 场景 | 时长 |
|------|------|
| 快速反馈 | 150ms |
| 标准过渡 | 200-300ms |
| 复杂动画 | 400-500ms |
| 页面切换 | 300ms |

### 动画效果
```css
/* 卡片悬停 */
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
  transition: all 300ms var(--ease-default);
}

/* 按钮点击 */
.button:active {
  transform: scale(0.98);
  transition: transform 150ms var(--ease-default);
}

/* 新内容滑入 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 脉冲加载 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 数字滚动 */
@keyframes countUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

---

## 页面结构设计

### 整体布局

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 顶部导航栏 (固定)                                                              │
│ Logo │ 语言切换(中/英/日/德) │ 实时时间戳 │ 夜间模式切换 │ 用户菜单            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 主标题区                                                                      │
│ "AI与机器人前沿追踪"                                                          │
│ "聚合全球科研动态，打破信息时差"                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 核心数据看板                                                                   │
│ [本周新论文数] [开源项目更新数] [突破性成果计数]                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 自动刷新指示器 (进度条/旋转图标)                                                │
├─────────────────────────────────────────────────────────────────────────────┤
┌──────────┬──────────────────────────────────────────────────────┬──────────┐
│          │                                                      │          │
│  侧边栏   │                    主内容区                          │  小部件   │
│          │                                                      │          │
│ 技术趋势  │  ┌────────────────────────────────────────────────┐  │  热门标签  │
│ 热度图    │  │  时间轴 - 重大技术突破                            │  │          │
│          │  │  ● 2024.04.15  GPT-5架构更新 [突破]               │  │  来源筛选  │
│ 热门研究  │  │  │                                             │  │          │
│ 方向标签  │  └────────────────────────────────────────────────┘  │  快捷操作  │
│          │                                                      │          │
│ 来源筛选  │  ┌────────────────────────────────────────────────┐  │          │
│          │  │  新闻流 - 瀑布流布局                              │  │          │
│ • arXiv  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │  │          │
│ • GitHub │  │  │   卡片 1    │ │   卡片 2    │ │   卡片 3    │  │  │          │
│ • IEEE   │  │  │   [arXiv]   │ │  [GitHub]   │ │   [IEEE]    │  │  │          │
│ • ...    │  │  └─────────────┘ └─────────────┘ └─────────────┘  │  │          │
│          │  └────────────────────────────────────────────────┘  │          │
└──────────┴──────────────────────────────────────────────────────┴──────────┘
```

### 响应式断点

| 断点 | 宽度 | 布局 | 时间轴方向 |
|------|------|------|------------|
| Mobile | < 768px | 单列 | 横向滑动 |
| Tablet | 768px - 1024px | 双列 | 垂直 |
| Desktop | > 1024px | 三列 | 垂直 |

---

## 组件详细设计

### 1. 顶部导航栏 (Header)

```typescript
interface HeaderProps {
  currentLang: 'zh' | 'en' | 'ja' | 'de';
  onLangChange: (lang: string) => void;
  currentTime: string;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}
```

**视觉规范：**
- 背景：透明 → 滚动后 `bg-primary/80 backdrop-blur-md`
- 高度：64px
- 固定定位，z-index: 50

### 2. 主标题区 (Hero)

```typescript
interface HeroProps {
  title: string;
  subtitle: string;
}
```

**视觉规范：**
- 主标题：48px, font-bold, text-primary
- 副标题：18px, text-secondary, mt-4
- 内边距：py-16

### 3. 核心数据看板 (StatsDashboard)

```typescript
interface StatsDashboardProps {
  weeklyPapers: number;
  weeklyProjects: number;
  breakthroughCount: number;
}
```

**视觉规范：**
- 卡片布局：3列网格，gap-6
- 数字：36px, font-bold, gradient text (accent-orange)
- 标签：14px, text-secondary
- 动画：数字滚动计数效果

### 4. 自动刷新指示器 (AutoRefreshIndicator)

```typescript
interface AutoRefreshIndicatorProps {
  lastUpdateTime: Date;
  nextUpdateIn: number; // 秒
  isUpdating: boolean;
}
```

**视觉规范：**
- 顶部进度条：高度 2px, 颜色 accent-orange
- 或旋转图标：20px, 颜色 accent-orange
- 位置：固定顶部
- 动画：progress 从 100% → 0% (300秒)

### 5. 时间轴组件 (Timeline)

```typescript
interface TimelineProps {
  breakthroughs: BreakthroughItem[];
  onItemClick: (item: BreakthroughItem) => void;
}

interface BreakthroughItem {
  id: string;
  date: string;
  title: string;
  source: 'arxiv' | 'github' | 'ieee' | 'science';
  isMajor: boolean;
  description: string;
}
```

**视觉规范：**
- 垂直时间线：2px 宽度，border-secondary
- 节点：12px 圆点，source 对应颜色
- 重大突破：红色光晕效果 `shadow-[0_0_20px_rgba(255,68,68,0.5)]`
- 展开动画：手风琴效果，height 0 → auto

### 6. 内容卡片 (ContentCard)

```typescript
interface ContentCardProps {
  content: {
    id: string;
    source: 'arxiv' | 'github' | 'ieee' | 'science' | 'huggingface';
    title: string;
    translatedTitle?: string;
    abstract: string;
    translatedAbstract?: string;
    author: string;
    publishedAt: Date;
    isBreakthrough: boolean;
    tags: string[];
  };
  showTranslation: boolean;
  onToggleTranslation: () => void;
  onFavorite: () => void;
  onShare: () => void;
}
```

**视觉规范：**
- 背景：bg-secondary
- 圆角：radius-lg (16px)
- 内边距：p-6
- 阴影：shadow-card
- 悬停：translateY(-4px), shadow-card-hover

**内容结构：**
```
┌─────────────────────────────────────┐
│ [来源标签] [时间]              [收藏] │
├─────────────────────────────────────┤
│ 标题 (支持中英文切换)                  │
├─────────────────────────────────────┤
│ 摘要/简介 (支持中英文切换)             │
├─────────────────────────────────────┤
│ 作者 · 标签1 · 标签2 · 标签3          │
├─────────────────────────────────────┤
│ [翻译切换] [分享]                    │
└─────────────────────────────────────┘
```

**来源标签样式：**
| 来源 | 背景色 | 文字色 |
|------|--------|--------|
| arXiv | bg-green-500/20 | text-green-400 |
| GitHub | bg-purple-500/20 | text-purple-400 |
| IEEE | bg-blue-500/20 | text-blue-400 |
| Science Robotics | bg-yellow-500/20 | text-yellow-400 |
| Hugging Face | bg-orange-500/20 | text-orange-400 |

**突破性成果标记：**
- 红色边框：`border-2 border-accent-red`
- 角标：`[突破]` 或 `[SOTA]`
- 发光效果：`shadow-[0_0_30px_rgba(255,68,68,0.3)]`

### 7. 侧边栏组件

#### 技术趋势热度图 (TrendHeatmap)
```typescript
interface TrendHeatmapProps {
  trends: {
    name: string;
    heat: number; // 0-100
    change: number; // 周环比
  }[];
}
```

**视觉规范：**
- 高度图形式展示
- 热度用颜色深度表示：绿色(低) → 黄色(中) → 红色(高)

#### 热门研究方向标签 (ResearchTags)
```typescript
interface ResearchTagsProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}
```

**预设标签：**
- LLM / 大语言模型
- 人形机器人 / Humanoid
- 具身智能 / Embodied AI
- 多模态 / Multimodal
- 强化学习 / RL
- 计算机视觉 / CV
- 自动驾驶 / Autonomous Driving
- 机器人学习 / Robot Learning

#### 来源筛选 (SourceFilter)
```typescript
interface SourceFilterProps {
  sources: Source[];
  selectedSources: string[];
  onSourceToggle: (sourceId: string) => void;
}
```

### 8. 翻译切换按钮 (TranslationToggle)

```typescript
interface TranslationToggleProps {
  isTranslated: boolean;
  originalLang: string;
  onToggle: () => void;
}
```

**视觉规范：**
- 样式：小按钮，图标 + 文字
- 图标：🌐 或 翻译符号
- 文字："原文" / "译文"
- 动画：滑动切换，背景色变化

### 9. 分享按钮 (ShareButton)

```typescript
interface ShareButtonProps {
  url: string;
  title: string;
}
```

**交互：**
- 悬停显示下拉菜单
- 选项：复制链接、Twitter、微信
- 复制成功：toast 提示

### 10. 骨架屏 (SkeletonCard)

**视觉规范：**
- 背景：bg-secondary 带 pulse 动画
- 结构：标题条 + 3行正文条 + 底部信息条
- 动画：shimmer 效果从左到右

---

## 数据源配置

### 抓取源详细配置

| 来源 | 抓取内容 | 频率 | 分类标记 | API/方式 |
|------|----------|------|----------|----------|
| **GitHub Trending** | 热门仓库 | 5分钟 | OPEN_SOURCE | 页面解析 |
| **GitHub Topics** | AI/robotics项目 | 10分钟 | OPEN_SOURCE | GraphQL API |
| **arXiv cs.RO** | 机器人学论文 | 10分钟 | ROBOTICS_RESEARCH | RSS/API |
| **arXiv cs.AI** | 人工智能论文 | 10分钟 | AI_RESEARCH | RSS/API |
| **arXiv cs.LG** | 机器学习论文 | 10分钟 | AI_RESEARCH | RSS/API |
| **arXiv cs.CV** | 计算机视觉论文 | 15分钟 | AI_RESEARCH | RSS/API |
| **IEEE Xplore** | 机器人学期刊 | 30分钟 | ROBOTICS_RESEARCH | API |
| **Science Robotics** | 顶级期刊 | 30分钟 | ROBOTICS_RESEARCH | RSS+解析 |
| **Hugging Face** | 热门模型 | 15分钟 | OPEN_SOURCE | API |
| **Hacker News** | AI相关讨论 | 15分钟 | INDUSTRY_NEWS | API |

### 突破性成果判定规则

**自动标记条件：**
- 标题包含关键词：SOTA, breakthrough, state-of-the-art, novel architecture
- GitHub: 24小时内 stars 增长 > 1000
- arXiv: 被引用数增长异常（需要数据支持）
- 人工审核：管理员手动标记

---

## 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户层 (Client Layer)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Next.js 14 App                    │  动画: Framer Motion                   │
│  - React 18 Server Components      │  - 卡片动效                             │
│  - Tailwind CSS 深色主题            │  - 页面过渡                             │
│  - shadcn/ui 组件库                 │  - 数字滚动                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API 层 (Next.js API Routes)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  - /api/contents      内容列表/筛选                                          │
│  - /api/search        全文搜索                                               │
│  - /api/translate     翻译服务                                               │
│  - /api/cron          定时任务触发                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           服务层 (Service Layer)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  内容服务  │  翻译服务  │  抓取服务  │  用户服务  │  通知服务                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           数据层 (Data Layer)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis (缓存/队列)  │  Meilisearch (搜索)                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 技术栈选型

#### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14+ | React 框架，App Router |
| React | 18+ | UI 库，Server Components |
| TypeScript | 5+ | 类型安全 |
| Tailwind CSS | 3.4+ | 原子化 CSS，深色主题 |
| shadcn/ui | latest | 无头 UI 组件 |
| Framer Motion | 10+ | 动画效果 |
| TanStack Query | 5+ | 数据获取与缓存 |
| Zustand | 4+ | 状态管理 |
| date-fns | latest | 日期处理 |

#### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 20 LTS | 运行时 |
| Prisma | 5+ | ORM 数据库操作 |
| BullMQ | latest | 队列与定时任务 |
| ioredis | latest | Redis 客户端 |
| Zod | 3+ | 数据验证 |

#### 数据存储
| 技术 | 用途 |
|------|------|
| PostgreSQL | 主数据库 |
| Redis | 缓存、会话、任务队列 |
| Meilisearch | 全文搜索引擎 |

#### 外部服务
| 服务 | 用途 |
|------|------|
| DeepL API | 主要翻译引擎 |
| GitHub API | 抓取开源项目 |
| arXiv RSS | 获取学术论文 |

---

## 核心模块设计

### 模块 1: 内容抓取引擎

#### 抓取器基类
```typescript
abstract class BaseCrawler {
  abstract readonly sourceId: string;
  abstract readonly name: string;
  abstract readonly interval: number; // 毫秒
  abstract readonly category: Category;
  
  abstract fetch(): Promise<RawContent[]>;
  abstract parse(raw: RawContent): ParsedContent;
  
  async run(): Promise<void> {
    try {
      const raw = await this.fetch();
      const contents = raw.map(r => this.parse(r));
      await this.save(contents);
    } catch (error) {
      await this.handleError(error);
    }
  }
}
```

#### 去重策略
1. URL 去重 - 数据库唯一索引
2. SimHash 去重 - 检测内容相似度 (>0.9 视为重复)
3. 标题模糊匹配 - Levenshtein 距离 < 0.85

### 模块 2: AI 翻译服务

#### 翻译流程
```
内容入库
    ↓
语言检测 (franc.js)
    ↓
英文? ──→ 是 → 跳过翻译
    ↓ 否
检查缓存 (Redis)
    ↓
已缓存? ──→ 是 → 使用缓存
    ↓ 否
加入翻译队列 (BullMQ)
    ↓
批量翻译 (每批 50 条)
    ↓
存储结果 (DB + Redis)
```

#### 翻译引擎配置
| 引擎 | 优先级 | 用途 |
|------|--------|------|
| DeepL API | 首选 | 绝大多数内容 |
| Google Translate | 备用 | DeepL 不支持的语言 |
| OpenAI GPT-4 | 备选 | 复杂语境优化 |

### 模块 3: 数据模型

```prisma
// Content 内容表
model Content {
  id                String          @id @default(cuid())
  sourceId          String          // github, arxiv, ieee, science, huggingface
  externalId        String?         // 外部 ID
  url               String          @unique
  
  // 原文内容
  originalTitle     String
  originalAbstract  String?         @db.Text
  originalLanguage  String          @default("en")
  
  // 翻译内容
  translatedTitle   String?
  translatedAbstract String?        @db.Text
  
  // 元数据
  author            String?
  authorUrl         String?
  imageUrl          String?
  publishedAt       DateTime
  fetchedAt         DateTime        @default(now())
  
  // 分类与标签
  category          Category
  tags              Tag[]
  
  // 统计
  viewCount         Int             @default(0)
  likeCount         Int             @default(0)
  
  // 状态与标记
  status            ContentStatus   @default(PENDING)
  isBreakthrough    Boolean         @default(false)  // 突破性成果
  
  // 关联
  favorites         Favorite[]
  
  @@index([publishedAt])
  @@index([category])
  @@index([sourceId])
  @@index([status])
  @@index([isBreakthrough])
}

enum Category {
  AI_RESEARCH
  ROBOTICS_RESEARCH
  OPEN_SOURCE
  INDUSTRY_NEWS
  TUTORIAL
  TOOL
}

enum ContentStatus {
  PENDING
  TRANSLATING
  PUBLISHED
  HIDDEN
  ERROR
}

model Tag {
  id          String    @id @default(cuid())
  name        String    @unique
  contents    Content[]
}

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String?
  avatar        String?
  preferences   Json?       // 语言偏好、主题等
  createdAt     DateTime    @default(now())
  favorites     Favorite[]
}

model Favorite {
  id          String    @id @default(cuid())
  userId      String
  contentId   String
  createdAt   DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  content     Content   @relation(fields: [contentId], references: [id], onDelete: Cascade)
  
  @@unique([userId, contentId])
}
```

---

## 项目目录结构

```
my-app/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── layout.tsx              # 主布局 (含导航栏)
│   │   │   ├── page.tsx                # 首页
│   │   │   ├── category/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   ├── content/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── favorites/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── contents/
│   │   │   │   └── route.ts
│   │   │   ├── search/
│   │   │   │   └── route.ts
│   │   │   ├── translate/
│   │   │   │   └── route.ts
│   │   │   └── cron/
│   │   │       └── route.ts
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui 组件
│   │   ├── layout/
│   │   │   ├── Header.tsx              # 顶部导航栏
│   │   │   ├── Sidebar.tsx             # 侧边栏
│   │   │   └── Footer.tsx
│   │   ├── features/
│   │   │   ├── Hero.tsx                # 主标题区
│   │   │   ├── StatsDashboard.tsx      # 数据看板
│   │   │   ├── AutoRefreshIndicator.tsx # 刷新指示器
│   │   │   ├── Timeline.tsx            # 时间轴
│   │   │   ├── ContentCard.tsx         # 内容卡片
│   │   │   ├── ContentGrid.tsx         # 瀑布流网格
│   │   │   ├── FilterBar.tsx           # 筛选栏
│   │   │   ├── SearchBox.tsx           # 搜索框
│   │   │   ├── TranslationToggle.tsx   # 翻译切换
│   │   │   ├── ShareButton.tsx         # 分享按钮
│   │   │   ├── TrendHeatmap.tsx        # 趋势热度图
│   │   │   ├── ResearchTags.tsx        # 研究方向标签
│   │   │   ├── SourceFilter.tsx        # 来源筛选
│   │   │   ├── SkeletonCard.tsx        # 骨架屏
│   │   │   └── LanguageSwitch.tsx      # 语言切换
│   │   └── providers/
│   │       ├── QueryProvider.tsx
│   │       └── ThemeProvider.tsx
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── redis.ts
│   │   ├── meilisearch.ts
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── animations.ts               # 动画配置
│   │
│   ├── server/
│   │   ├── services/
│   │   │   ├── content.service.ts
│   │   │   ├── translate.service.ts
│   │   │   └── user.service.ts
│   │   ├── crawlers/
│   │   │   ├── BaseCrawler.ts
│   │   │   ├── GitHubCrawler.ts
│   │   │   ├── ArxivCrawler.ts
│   │   │   ├── IEEECrawler.ts
│   │   │   ├── ScienceRoboticsCrawler.ts
│   │   │   ├── HuggingFaceCrawler.ts
│   │   │   └── index.ts
│   │   └── jobs/
│   │       ├── crawl.scheduler.ts
│   │       └── translate.worker.ts
│   │
│   ├── hooks/
│   │   ├── useContents.ts
│   │   ├── useSearch.ts
│   │   ├── useFavorites.ts
│   │   ├── useTranslation.ts
│   │   └── useScrollPosition.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── styles/
│       └── globals.css
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── docker-compose.yml
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 开发路线图

### Phase 1: MVP (预计 3-4 周)

#### Week 1: 基础架构
- [ ] 初始化 Next.js 14 项目
- [ ] 配置 Tailwind CSS 深色主题
- [ ] 配置 shadcn/ui 组件库
- [ ] 设置 PostgreSQL + Prisma
- [ ] 配置 Redis + Meilisearch
- [ ] Docker Compose 开发环境
- [ ] 全局样式与动画配置

#### Week 2: 核心组件
- [ ] Header 导航栏 (含语言切换、主题切换)
- [ ] Hero 主标题区
- [ ] StatsDashboard 数据看板
- [ ] AutoRefreshIndicator 刷新指示器
- [ ] ContentCard 内容卡片
- [ ] Timeline 时间轴
- [ ] Sidebar 侧边栏 (趋势图、标签、筛选)

#### Week 3: 数据与抓取
- [ ] 数据库模型实现
- [ ] GitHub Crawler 实现
- [ ] arXiv Crawler 实现
- [ ] 抓取调度器 (BullMQ)
- [ ] 内容去重逻辑
- [ ] 数据看板 API

#### Week 4: 翻译与搜索
- [ ] DeepL API 集成
- [ ] 翻译缓存逻辑
- [ ] Meilisearch 集成
- [ ] 搜索功能
- [ ] 翻译切换功能
- [ ] 响应式优化
- [ ] 性能优化

### Phase 2: 功能完善 (预计 2-3 周)

- [ ] 用户系统 (NextAuth)
- [ ] 收藏功能
- [ ] 更多数据源 (IEEE, Science Robotics, Hugging Face)
- [ ] 突破性成果自动标记
- [ ] 邮件订阅
- [ ] PWA 支持
- [ ] 分享功能

### Phase 3: 运营功能 (预计 2 周)

- [ ] 管理后台
- [ ] 数据分析面板
- [ ] 内容审核
- [ ] RSS 输出
- [ ] 性能监控

---

## 环境变量配置

```bash
# 应用
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/aipulse"

# Redis
REDIS_URL="redis://localhost:6379"

# Meilisearch
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="your-api-key"

# 翻译 API
DEEPL_API_KEY="your-deepl-api-key"
GOOGLE_TRANSLATE_API_KEY="your-google-api-key"

# GitHub
GITHUB_TOKEN="your-github-token"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 成本估算

### 开发阶段
- 本地 Docker：免费

### 生产部署

| 服务 | 预估月费用 | 说明 |
|------|-----------|------|
| Vercel Pro | $20 | 前端托管 |
| Railway/Supabase | $25-50 | PostgreSQL |
| Upstash Redis | $10-30 | Redis |
| Meilisearch Cloud | $0-29 | 搜索 |
| DeepL API | $0-20 | 翻译 |
| **总计** | **$55-150** | 起步阶段 |

---

## 附录

### 颜色 Token 参考

```css
/* Tailwind 自定义配置 */
module.exports = {
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0d0d0d',
          secondary: '#1a1a1a',
          tertiary: '#262626',
        },
        foreground: {
          DEFAULT: '#ffffff',
          secondary: '#a3a3a3',
          tertiary: '#737373',
        },
        accent: {
          red: '#ff4444',
          orange: '#ff6b35',
        },
        source: {
          arxiv: '#22c55e',
          github: '#a855f7',
          ieee: '#3b82f6',
          science: '#eab308',
          huggingface: '#f97316',
        },
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
}
```

### 动画配置参考

```typescript
// lib/animations.ts
export const animations = {
  card: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  slideIn: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  hover: {
    y: -4,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  press: {
    scale: 0.98,
    transition: { duration: 0.15 }
  }
};
```

---

**文档版本**: v1.0  
**创建日期**: 2026-04-15  
**更新记录**: 
- 2026-04-15: 初始版本，包含完整视觉设计规范、动效规范、组件设计