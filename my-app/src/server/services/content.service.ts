import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { indexDocuments, deleteDocument } from './search.service';
import type { ContentDocument } from './search.service';
import type { ParsedContent } from '../crawlers/BaseCrawler';

const CACHE_TTL = 3600;

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

function toDoc(data: Record<string, unknown>): ContentDocument {
  return {
    id: String(data.id),
    sourceId: String(data.sourceId),
    url: String(data.url),
    originalTitle: String(data.originalTitle),
    originalAbstract: data.originalAbstract ? String(data.originalAbstract) : undefined,
    translatedTitle: data.translatedTitle ? String(data.translatedTitle) : undefined,
    translatedAbstract: data.translatedAbstract ? String(data.translatedAbstract) : undefined,
    originalLanguage: String(data.originalLanguage),
    author: data.author ? String(data.author) : undefined,
    publishedAt: Math.floor(new Date(String(data.publishedAt)).getTime() / 1000),
    category: String(data.category),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    createdAt: Math.floor(new Date(String(data.createdAt)).getTime() / 1000),
    updatedAt: Math.floor(new Date(String(data.updatedAt)).getTime() / 1000),
  };
}

export async function createContent(input: ContentInput): Promise<ContentDocument> {
  const id = generateId(input.sourceId, input.url);
  const existing = await prisma.content.findUnique({ where: { id } });
  if (existing) throw new Error('Content already exists: ' + id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = await prisma.content.create({
    data: { id, ...input } as any,
  });

  const doc = toDoc(content);
  await indexDocuments([doc]);
  await redis.del('content:list:*');
  return doc;
}

export async function getContentById(id: string): Promise<ContentDocument | null> {
  const cached = await redis.get('content:' + id);
  if (cached) return JSON.parse(cached);

  const content = await prisma.content.findUnique({ where: { id } });
  if (!content) return null;

  const doc = toDoc(content);
  await redis.setex('content:' + id, CACHE_TTL, JSON.stringify(doc));
  return doc;
}

export async function getContents(options: { page?: number; limit?: number; category?: string; sourceId?: string } = {}) {
  const { page = 1, limit = 20, category, sourceId } = options;
  const cacheKey = 'content:list:' + JSON.stringify(options);
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (sourceId) where.sourceId = sourceId;

  const [contents, total] = await Promise.all([
    prisma.content.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { publishedAt: 'desc' } }),
    prisma.content.count({ where }),
  ]);

  const result = {
    items: contents.map(toDoc),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  return result;
}

export async function deleteContent(id: string): Promise<void> {
  await prisma.content.delete({ where: { id } });
  await deleteDocument(id);
  await redis.del('content:' + id, 'content:list:*');
}

export async function checkDuplicate(url: string, sourceId: string): Promise<boolean> {
  const id = generateId(sourceId, url);
  const existing = await prisma.content.findUnique({ where: { id }, select: { id: true } });
  return !!existing;
}

export async function deduplicateContents(inputs: ParsedContent[]): Promise<ParsedContent[]> {
  const unique: ParsedContent[] = [];
  for (const input of inputs) {
    if (!await checkDuplicate(input.url, input.sourceId)) unique.push(input);
  }
  return unique;
}
