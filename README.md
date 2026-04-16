# AI Pulse - AI/机器人新闻聚合平台

实时聚合全球 AI 和机器人领域最新资讯，无需注册登录即可访问。

## 特性

- **多源数据**: GitHub、Gitee、arXiv、IEEE
- **自动抓取**: 每6小时自动更新
- **智能分类**: AI研究、机器人、开源项目
- **中文支持**: 国产大模型和框架
- **响应式设计**: 支持移动端访问

## 数据源

| 来源 | 类型 | 数量 |
|------|------|------|
| GitHub | 国际AI开源 | 276+ |
| Gitee | 国产AI开源 | 20+ |
| arXiv | AI论文 | 787+ |
| IEEE | 机器人论文 | 20+ |

## 技术栈

- **前端**: Next.js 16 + React 19 + Tailwind CSS
- **后端**: Next.js API Routes
- **存储**: 内存存储（无需数据库）
- **部署**: Vercel

## 本地开发

```bash
cd my-app
npm install
npm run dev
```

访问 http://localhost:3000

## 部署

详见 [DEPLOY.md](./DEPLOY.md)

一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 许可证

MIT
