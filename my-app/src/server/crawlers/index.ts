/**
 * 爬虫模块统一导出
 * 
 * 使用示例:
 * ```typescript
 * import { GitHubCrawler, ArxivCrawler, runAllCrawlers } from '@/server/crawlers';
 * 
 * // 单独使用某个爬虫
 * const github = new GitHubCrawler();
 * const contents = await github.crawl();
 * 
 * // 运行所有爬虫
 * const allContents = await runAllCrawlers();
 * ```
 */

export { BaseCrawler, Category, type ParsedContent, type CrawlerConfig } from './BaseCrawler';
export { GitHubCrawler } from './GitHubCrawler';
export { ArxivCrawler } from './ArxivCrawler';
export { IeeeCrawler } from './IeeeCrawler';
export { GiteeCrawler } from './GiteeCrawler';

import { GitHubCrawler } from './GitHubCrawler';
import { ArxivCrawler } from './ArxivCrawler';
import { IeeeCrawler } from './IeeeCrawler';
import { GiteeCrawler } from './GiteeCrawler';
import { ParsedContent } from './BaseCrawler';

// 爬虫实例映射
const crawlerInstances = {
  github: () => new GitHubCrawler(),
  arxiv: () => new ArxivCrawler(),
  ieee: () => new IeeeCrawler(),
  gitee: () => new GiteeCrawler(),
};

export type CrawlerType = keyof typeof crawlerInstances;

/**
 * 获取所有可用的爬虫类型
 */
export function getAvailableCrawlers(): CrawlerType[] {
  return Object.keys(crawlerInstances) as CrawlerType[];
}

/**
 * 创建爬虫实例
 */
export function createCrawler(type: CrawlerType) {
  const factory = crawlerInstances[type];
  if (!factory) {
    throw new Error(`Unknown crawler type: ${type}. Available: ${getAvailableCrawlers().join(', ')}`);
  }
  return factory();
}

/**
 * 运行单个爬虫
 * @param type 爬虫类型
 * @returns 抓取的内容列表
 */
export async function runCrawler(type: CrawlerType): Promise<ParsedContent[]> {
  const crawler = createCrawler(type);
  return crawler.crawl();
}

/**
 * 运行所有爬虫
 * @returns 所有爬虫抓取的内容列表
 */
export async function runAllCrawlers(): Promise<ParsedContent[]> {
  const results: ParsedContent[] = [];
  const errors: Array<{ type: CrawlerType; error: string }> = [];

  for (const type of getAvailableCrawlers()) {
    try {
      console.log(`[CrawlerManager] Starting ${type} crawler...`);
      const contents = await runCrawler(type);
      results.push(...contents);
      console.log(`[CrawlerManager] ${type} crawler completed: ${contents.length} items`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[CrawlerManager] ${type} crawler failed:`, errorMsg);
      errors.push({ type, error: errorMsg });
    }
  }

  if (errors.length > 0) {
    console.warn(`[CrawlerManager] Completed with ${errors.length} errors:`, errors);
  }

  console.log(`[CrawlerManager] Total items crawled: ${results.length}`);
  return results;
}

/**
 * 并行运行所有爬虫 (更快但可能触发速率限制)
 * @returns 所有爬虫抓取的内容列表
 */
export async function runAllCrawlersParallel(): Promise<ParsedContent[]> {
  const crawlerPromises = getAvailableCrawlers().map(async (type) => {
    try {
      console.log(`[CrawlerManager] Starting ${type} crawler...`);
      const contents = await runCrawler(type);
      console.log(`[CrawlerManager] ${type} crawler completed: ${contents.length} items`);
      return contents;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[CrawlerManager] ${type} crawler failed:`, errorMsg);
      return [];
    }
  });

  const results = await Promise.all(crawlerPromises);
  const allContents = results.flat();
  
  console.log(`[CrawlerManager] Total items crawled: ${allContents.length}`);
  return allContents;
}
