// 简化的内容服务 - 直接使用内存存储
import { memoryStore } from '@/lib/memory-store';
import type { ParsedContent } from '../crawlers/BaseCrawler';

export interface ContentInput {
  sourceId: string;
  url: string;
  originalTitle: string;
  originalAbstract?: string;
  translatedTitle?: string;
  translatedAbstract?: string;
  originalLanguage: string;
  author?: string;
  publishedAt: Date;
  category: string;
  tags: string[];
}

function generateId(sourceId: string, url: string): string {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(sourceId + ':' + url).digest('hex');
}

export async function createContent(input: ContentInput): Promise<any> {
  const id = generateId(input.sourceId, input.url);
  const existing = await memoryStore.getContentById(id);
  if (existing) throw new Error('Content already exists: ' + id);

  const content = await memoryStore.createContent({ id, ...input });
  return content;
}

export async function getContentById(id: string): Promise<any | null> {
  return memoryStore.getContentById(id);
}

export async function getContents(options: { page?: number; limit?: number; category?: string; sourceId?: string } = {}) {
  return memoryStore.getContents(options);
}

export async function deleteContent(id: string): Promise<void> {
  memoryStore.contents.delete(id);
}

export async function checkDuplicate(url: string, sourceId: string): Promise<boolean> {
  const id = generateId(sourceId, url);
  const existing = await memoryStore.getContentById(id);
  return !!existing;
}

export async function deduplicateContents(inputs: ParsedContent[]): Promise<ParsedContent[]> {
  const unique: ParsedContent[] = [];
  for (const input of inputs) {
    if (!await checkDuplicate(input.url, input.sourceId)) unique.push(input);
  }
  return unique;
}