/**
 * 爬虫定时任务 API 路由
 * 用于 Vercel Cron 自动触发爬虫
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAllCrawlers } from '@/server/crawlers';
import { memoryStore } from '@/lib/memory-store';

/**
 * GET /api/cron/crawl
 * Vercel Cron 自动触发爬虫
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 验证 Cron Secret（如果是 Vercel Cron 调用，可以跳过验证）
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    // 生产环境需要验证
    if (process.env.NODE_ENV === 'production' && secret) {
      const token = authHeader?.replace('Bearer ', '');
      if (token !== secret) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('[Cron] Starting automatic crawl...');

    // 执行爬虫
    const items = await runAllCrawlers();

    // 保存到内存存储
    let added = 0;
    if (items.length > 0) {
      added = await memoryStore.batchCreate(items);
    }

    const stats = memoryStore.getStats();

    console.log(`[Cron] Crawl completed: ${items.length} crawled, ${added} added`);

    return NextResponse.json({
      success: true,
      crawled: items.length,
      added,
      store: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Crawl failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Crawl failed',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/crawl
 * 手动触发爬虫（需要验证）
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return GET(request);
}
