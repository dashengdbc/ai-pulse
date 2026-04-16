# AI Pulse - 部署指南

## 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-pulse)

## 手动部署步骤

### 1. 准备工作

- 注册 [Vercel](https://vercel.com) 账号
- 注册 [GitHub](https://github.com) 账号
- 安装 [Git](https://git-scm.com/)

### 2. 推送代码到 GitHub

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit for deployment"

# 创建 GitHub 仓库并推送
git remote add origin https://github.com/yourusername/ai-pulse.git
git branch -M main
git push -u origin main
```

### 3. 在 Vercel 部署

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `my-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. 添加环境变量：
   ```
   CRON_SECRET=your-random-secret-key
   NEXT_PUBLIC_APP_NAME=AI Pulse
   ```

6. 点击 "Deploy"

### 4. 配置自动抓取（Cron Job）

部署后，在 Vercel Dashboard 中：

1. 进入项目设置
2. 找到 "Cron Jobs"
3. 添加定时任务：
   - **Path**: `/api/cron/crawl`
   - **Schedule**: `0 */6 * * *`（每6小时一次）
   - **Region**: 选择 `HKG1`（香港，国内访问快）

### 5. 配置自定义域名（可选）

1. 在 Vercel 项目设置中找到 "Domains"
2. 添加你的域名
3. 按提示配置 DNS 记录

### 6. 手动触发首次抓取

部署完成后，访问以下 URL 触发首次数据抓取：

```
https://your-domain.vercel.app/api/cron/crawl
```

或在终端执行：

```bash
curl -X POST https://your-domain.vercel.app/api/cron/crawl \
  -H "Authorization: Bearer your-cron-secret"
```

## 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 首页显示内容
- [ ] 分类筛选正常
- [ ] 定时任务已配置
- [ ] 首次数据已抓取

## 故障排查

### 构建失败

检查 `next.config.ts` 配置是否正确。

### 数据未显示

1. 检查定时任务是否执行
2. 手动触发 `/api/cron/crawl`
3. 查看 Vercel Functions 日志

### API 限制

如果 GitHub API 限流，添加 `GITHUB_TOKEN` 环境变量。

## 更新部署

每次代码更新后，推送到 GitHub，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update features"
git push
```
