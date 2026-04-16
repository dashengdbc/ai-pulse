/**
 * 爬虫调度器 - 内存存储版本（无需 Docker）
 */

import { runAllCrawlers, runCrawler, getAvailableCrawlers, type CrawlerType } from '@/server/crawlers';
import { memoryStore } from '@/lib/memory-store';

interface CrawlJobData {
  type: 'all' | CrawlerType;
  triggeredAt: string;
  manual?: boolean;
}

interface CrawlJobResult {
  success: boolean;
  crawlerType: string;
  itemCount: number;
  duration: number;
  error?: string;
}

// Simple in-memory queue
const jobQueue: Array<{ id: string; data: CrawlJobData; running: boolean }> = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || jobQueue.length === 0) return;

  isProcessing = true;
  const job = jobQueue.shift();
  if (!job) {
    isProcessing = false;
    return;
  }

  const startTime = Date.now();
  const { type } = job.data;

  console.log(`[CrawlWorker] Processing job ${job.id}: ${type}`);

  try {
    let items: any[] = [];

    if (type === 'all') {
      items = await runAllCrawlers();
    } else {
      items = await runCrawler(type);
    }

    // Save to memory store
    const added = await memoryStore.batchCreate(items);
    const duration = Date.now() - startTime;

    console.log(`[CrawlWorker] Job ${job.id} completed: ${added}/${items.length} items in ${duration}ms`);

    return {
      success: true,
      crawlerType: type,
      itemCount: added,
      duration,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[CrawlWorker] Job ${job.id} failed:`, errorMsg);
    throw error;
  } finally {
    isProcessing = false;
    // Process next job
    setTimeout(processQueue, 100);
  }
}

export async function triggerManualCrawl() {
  const jobId = 'manual-' + Date.now();
  const job = {
    id: jobId,
    data: {
      type: 'all' as const,
      triggeredAt: new Date().toISOString(),
      manual: true,
    },
    running: false,
  };

  jobQueue.push(job);

  // Start processing
  processQueue();

  console.log(`[Scheduler] Manual crawl triggered: job ${jobId}`);
  return { id: jobId };
}

export async function triggerCrawler(type: CrawlerType) {
  if (!getAvailableCrawlers().includes(type)) {
    throw new Error(`Invalid crawler type: ${type}`);
  }

  const jobId = `manual-${type}-` + Date.now();
  const job = {
    id: jobId,
    data: {
      type,
      triggeredAt: new Date().toISOString(),
      manual: true,
    },
    running: false,
  };

  jobQueue.push(job);
  processQueue();

  console.log(`[Scheduler] Manual crawl triggered for ${type}: job ${jobId}`);
  return { id: jobId };
}

export async function getQueueStatus() {
  return {
    waiting: jobQueue.length,
    active: isProcessing ? 1 : 0,
    completed: 0,
    failed: 0,
    delayed: 0,
  };
}

export async function getRecentJobs(_status = 'completed', _count = 10) {
  return [];
}

// Auto-crawl on startup (optional)
let autoCrawlInterval: NodeJS.Timeout | null = null;

export function startAutoCrawl(intervalMinutes = 30) {
  if (autoCrawlInterval) {
    clearInterval(autoCrawlInterval);
  }

  autoCrawlInterval = setInterval(() => {
    console.log('[Scheduler] Auto-triggering crawl...');
    triggerManualCrawl();
  }, intervalMinutes * 60 * 1000);

  console.log(`[Scheduler] Auto-crawl started: every ${intervalMinutes} minutes`);
}

export function stopAutoCrawl() {
  if (autoCrawlInterval) {
    clearInterval(autoCrawlInterval);
    autoCrawlInterval = null;
  }
}

// Export store stats for debugging
export function getStoreStats() {
  return memoryStore.getStats();
}
