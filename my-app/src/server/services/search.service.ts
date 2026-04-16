// 简化的搜索服务 - 直接使用内存存储
import { memoryStore } from '@/lib/memory-store';

export interface ContentDocument {
  id: string;
  sourceId: string;
  url: string;
  originalTitle: string;
  originalAbstract?: string;
  translatedTitle?: string;
  translatedAbstract?: string;
  originalLanguage: string;
  author?: string;
  publishedAt: number;
  category: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface SearchFilters {
  category?: string[];
  sourceId?: string[];
  originalLanguage?: string[];
  tags?: string[];
  publishedAfter?: Date;
  publishedBefore?: Date;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  highlight?: boolean;
}

export interface SearchResult {
  hits: ContentDocument[];
  estimatedTotalHits: number;
  totalHits?: number;
  offset: number;
  limit: number;
  page: number;
  totalPages: number;
  processingTimeMs: number;
  query: string;
}

export async function searchContents(options: SearchOptions): Promise<SearchResult> {
  const { query, filters, page = 1, limit = 20 } = options;
  const all = Array.from(memoryStore.contents.values());

  // 过滤和搜索
  let results = all.filter((item: any) => {
    // 文本搜索
    if (query) {
      const match = item.translatedTitle?.includes(query) ||
        item.translatedAbstract?.includes(query) ||
        item.originalTitle?.includes(query) ||
        item.tags?.some((tag: string) => tag.includes(query));
      if (!match) return false;
    }

    // 分类过滤
    if (filters?.category?.length && !filters.category.includes(item.category)) {
      return false;
    }

    // 来源过滤
    if (filters?.sourceId?.length && !filters.sourceId.includes(item.sourceId)) {
      return false;
    }

    return true;
  });

  // 排序
  results.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const total = results.length;
  const offset = (page - 1) * limit;
  const hits = results.slice(offset, offset + limit);

  return {
    hits: hits as ContentDocument[],
    estimatedTotalHits: total,
    totalHits: total,
    offset,
    limit,
    page,
    totalPages: Math.ceil(total / limit),
    processingTimeMs: 1,
    query,
  };
}

export async function getContentById(id: string): Promise<ContentDocument | null> {
  const doc = await memoryStore.getContentById(id);
  return doc as ContentDocument | null;
}

export async function indexDocuments(docs: ContentDocument[]): Promise<void> {
  // 数据已在 memoryStore 中，无需额外操作
  console.log(`Indexed ${docs.length} documents`);
}

export async function deleteDocument(id: string): Promise<void> {
  memoryStore.contents.delete(id);
}