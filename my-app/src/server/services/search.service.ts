import { meiliSearch, CONTENT_INDEX } from '@/lib/meilisearch';
import type { SearchParams } from 'meilisearch';

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

function buildFilterString(filters?: SearchFilters): string | undefined {
  if (!filters) return undefined;
  const parts: string[] = [];
  if (filters.category?.length) {
    parts.push(`category IN [${filters.category.map(c => `"${c}"`).join(', ')}]`);
  }
  if (filters.sourceId?.length) {
    parts.push(`sourceId IN [${filters.sourceId.map(s => `"${s}"`).join(', ')}]`);
  }
  if (filters.tags?.length) {
    parts.push(`(${filters.tags.map(t => `tags = "${t}"`).join(' OR ')})`);
  }
  if (filters.publishedAfter) {
    parts.push(`publishedAt >= ${Math.floor(filters.publishedAfter.getTime() / 1000)}`);
  }
  if (filters.publishedBefore) {
    parts.push(`publishedAt <= ${Math.floor(filters.publishedBefore.getTime() / 1000)}`);
  }
  return parts.length ? parts.join(' AND ') : undefined;
}

function buildSortArray(sortBy: SearchOptions['sortBy'] = 'relevance', sortOrder: SearchOptions['sortOrder'] = 'desc'): string[] {
  if (sortBy === 'date') return [`publishedAt:${sortOrder}`];
  return [];
}

export async function searchContents(options: SearchOptions): Promise<SearchResult> {
  const { query, filters, sortBy = 'relevance', sortOrder = 'desc', page = 1, limit = 20, highlight = true } = options;
  const index = meiliSearch.index(CONTENT_INDEX);
  const searchParams: SearchParams = {
    q: query,
    offset: (page - 1) * limit,
    limit,
    filter: buildFilterString(filters),
    sort: buildSortArray(sortBy, sortOrder),
    attributesToHighlight: highlight ? ['translatedTitle', 'translatedAbstract'] : undefined,
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    facets: ['category', 'originalLanguage', 'sourceId'],
  };
  const response = await index.search(query, searchParams);
  const hits = response.hits as unknown as ContentDocument[];
  const total = response.estimatedTotalHits || 0;
  return {
    hits,
    estimatedTotalHits: response.estimatedTotalHits || 0,
    totalHits: response.hits.length,
    offset: response.offset || 0,
    limit: response.limit || limit,
    page,
    totalPages: Math.ceil(total / limit),
    processingTimeMs: response.processingTimeMs || 0,
    query: response.query,
  };
}

export async function getContentById(id: string): Promise<ContentDocument | null> {
  try {
    const doc = await meiliSearch.index(CONTENT_INDEX).getDocument(id);
    return doc as unknown as ContentDocument;
  } catch { return null; }
}

export async function indexDocuments(docs: ContentDocument[]): Promise<void> {
  if (docs.length) await meiliSearch.index(CONTENT_INDEX).addDocuments(docs);
}

export async function deleteDocument(id: string): Promise<void> {
  await meiliSearch.index(CONTENT_INDEX).deleteDocument(id);
}
