import { NextResponse } from 'next/server';
import { runAllCrawlers } from '@/server/crawlers';
import { memoryStore } from '@/lib/memory-store';

export async function GET() {
  try {
    console.log('[TestCrawl] Starting crawl...');
    const items = await runAllCrawlers();
    console.log(`[TestCrawl] Crawled ${items.length} items`);

    if (items.length > 0) {
      const added = await memoryStore.batchCreate(items);
      console.log(`[TestCrawl] Added ${added} items to store`);
    }

    const stats = memoryStore.getStats();

    return NextResponse.json({
      success: true,
      crawled: items.length,
      store: stats,
      sample: items.slice(0, 3)
    });
  } catch (error) {
    console.error('[TestCrawl] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
