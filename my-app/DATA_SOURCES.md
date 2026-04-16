# 真实数据源配置指南

## 当前状态
页面目前使用 `mockData` 模拟数据（位于 `src/app/page.tsx`），需要切换到真实API才能获取最新内容。

## 可用的真实数据源

### 1. arXiv API（免费）
- **URL**: https://export.arxiv.org/api/query
- **频率限制**: 每秒1个请求
- **配置**: 无需API Key
- **获取内容**: cs.AI, cs.CL, cs.CV, cs.RO 等分类的最新论文

### 2. GitHub API（免费）
- **URL**: https://api.github.com/search/repositories
- **频率限制**: 每小时60次（无Token）/ 5000次（有Token）
- **配置**: 需要 GitHub Token
- **获取内容**: AI/机器人相关的热门仓库

### 3. CrossRef API（免费）
- **URL**: https://api.crossref.org/works
- **频率限制**: 礼貌性限制，建议每秒1-2次
- **配置**: 需要邮箱标识
- **获取内容**: IEEE、Nature等期刊论文

## 启用真实数据抓取的步骤

### 步骤1: 配置环境变量
创建 `.env.local` 文件：

```bash
# 数据库
DATABASE_URL="postgresql://user:pass@localhost:5432/aipulse"

# Redis（用于队列和缓存）
REDIS_URL="redis://localhost:6379"

# MeiliSearch（用于全文搜索）
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="your-master-key"

# GitHub Token（用于提高API限制）
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"

# 抓取调度（每30分钟）
CRAWL_CRON_SCHEDULE="*/30 * * * *"
```

### 步骤2: 启动依赖服务
使用 Docker 启动必要服务：

```bash
cd my-app
docker-compose up -d
```

这会启动 PostgreSQL、Redis 和 MeiliSearch。

### 步骤3: 初始化数据库
```bash
npx prisma migrate dev
npx prisma db seed
```

### 步骤4: 手动触发抓取测试
```bash
curl -X POST http://localhost:3000/api/cron/crawl \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'
```

### 步骤5: 修改页面使用真实API
编辑 `src/app/page.tsx`，将 `fetchContents` 函数改为调用真实API：

```typescript
// 替换模拟数据获取
const fetchContents = async (page: number, category: string, source: string, timeRange: string) => {
  const params = new URLSearchParams({
    page: String(page),
    category,
    source,
    timeRange,
  });
  
  const res = await fetch(`/api/contents?${params}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};
```

## 获取最新2026年内容的方法

### 方法1: 手动添加（最快）
编辑 `src/app/page.tsx` 中的 `mockData`，替换为真实的2026年论文：

```typescript
const mockData: Content[] = [
  {
    id: "1",
    sourceId: "arxiv",
    originalTitle: "最新的2026年论文标题",
    translatedTitle: "翻译后的标题",
    // ... 真实数据
    publishedAt: "2026-04-15T10:00:00Z", // 真实的2026年日期
  },
  // ...
];
```

### 方法2: 配置自动抓取（推荐）
配置好后，系统会自动从arXiv、GitHub等源抓取最新内容。

### 方法3: 使用RSS订阅
配置RSS抓取器订阅以下源：
- arXiv RSS: https://rss.arxiv.org/rss/cs.AI
- Papers with Code: https://paperswithcode.com/rss
- Nature AI: https://www.nature.com/subjects/machine-learning.rss

## 注意事项

1. **不要频繁抓取**: 尊重源的速率限制，建议每30分钟到1小时抓取一次
2. **API Keys**: 生产环境需要配置各个源的API Key以提高限制
3. **翻译服务**: 如果需要自动翻译，需要配置 DeepL 或 Google Translate API Key

## 测试抓取

抓取器已配置在 `src/server/crawlers/`，支持：
- `ArxivCrawler.ts` - 抓取arXiv论文
- `GitHubCrawler.ts` - 抓取GitHub热门项目

要添加更多爬虫（如IEEE、Nature），继承 `BaseCrawler` 类实现即可。
