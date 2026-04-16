// 内存搜索作为 Meilisearch 兼容层
import { memoryStore } from './memory-store';

export const meiliSearch = {
  index: (name: string) => ({
    search: async (query: string, options?: any) => {
      const all = memoryStore.getAll();
      const results = all.filter(item =>
        item.translatedTitle?.includes(query) ||
        item.translatedAbstract?.includes(query) ||
        item.originalTitle?.includes(query) ||
        item.tags?.some((tag: string) => tag.includes(query))
      );
      return { hits: results.slice(0, options?.limit || 20) };
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
