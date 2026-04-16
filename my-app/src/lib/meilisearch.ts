// 内存搜索作为 Meilisearch 兼容层
import { memoryStore } from './memory-store';

export const meiliSearch = {
  index: (name: string) => ({
    search: async (query: string, options?: any) => {
      const all = Array.from(memoryStore.contents.values());
      const results = all.filter((item: any) =>
        item.translatedTitle?.includes(query) ||
        item.translatedAbstract?.includes(query) ||
        item.originalTitle?.includes(query) ||
        item.tags?.some((tag: string) => tag.includes(query))
      );
      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      const hits = results.slice(offset, offset + limit);
      return {
        hits,
        estimatedTotalHits: results.length,
        offset,
        limit
      };
    },
    addDocuments: async (docs: any[]) => {
      // 数据已在 memoryStore 中
      return { taskUid: 1 };
    },
    updateSettings: async () => ({
      taskUid: 1
    }),
  }),
};

export const CONTENT_INDEX = 'contents';

export async function initializeIndexes(): Promise<void> {
  console.log('Memory search indexes initialized');
}

export default meiliSearch;
