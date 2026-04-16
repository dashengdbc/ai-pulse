# AI Pulse - 快速启动指南

## 目标
无需注册登录的 AI 内容聚合网站，自动抓取 arXiv、GitHub 等源的最新研究。

## 系统要求
- Docker & Docker Compose
- Node.js 20+
- GitHub Token（可选，用于提高 API 限制）

## 启动步骤

### 1. 启动依赖服务
```bash
cd my-app
docker-compose up -d
```
这会启动：
- PostgreSQL (端口 5432)
- Redis (端口 6379)
- MeiliSearch (端口 7700)

### 2. 配置环境变量
```bash
cp .env.example .env.local
```
编辑 `.env.local`，至少配置：
```bash
DATABASE_URL="postgresql://aipulse:aipulse123@localhost:5432/aipulse"
REDIS_URL="redis://localhost:6379"
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="aipulse-master-key"
CRAWL_CRON_SCHEDULE="*/30 * * * *"  # 每30分钟抓取一次
```

### 3. 初始化数据库
```bash
npx prisma migrate dev
```

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 触发首次数据抓取（重要！）
打开新终端：
```bash
curl -X POST http://localhost:3000/api/cron/crawl \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'
```

等待 1-2 分钟让爬虫完成，然后刷新 http://localhost:3000

## 查看抓取状态
```bash
curl http://localhost:3000/api/cron/crawl/status
```

## 数据源
- **arXiv**: cs.AI, cs.CL, cs.CV, cs.RO, cs.LG 等分类的最新论文
- **GitHub**: AI/机器人相关的热门仓库

## 自动抓取
系统已配置定时任务，默认每 30 分钟自动抓取一次新内容。

## 生产部署
### Vercel 部署
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 添加环境变量
4. 配置外部数据库 (Supabase/Railway)
5. 配置 MeiliSearch Cloud

### 数据库迁移
```bash
npx prisma migrate deploy
```

## 故障排除
### 数据库连接失败
检查 Docker 容器是否运行：
```bash
docker-compose ps
```

### 没有数据显示
1. 检查爬虫是否运行：`curl http://localhost:3000/api/cron/crawl/status`
2. 手动触发抓取：`curl -X POST http://localhost:3000/api/cron/crawl`
3. 检查数据库是否有数据：
   ```bash
   docker exec -it aipulse-postgres psql -U aipulse -c "SELECT COUNT(*) FROM Content;"
   ```

### 抓取失败
- 检查网络连接
- 添加 GitHub Token 到 `.env.local` 以提高限制
