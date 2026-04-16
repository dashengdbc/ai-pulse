// 使用内存存储作为数据库兼容层
import { memoryStore } from './memory-store';

// 导出兼容 Prisma 风格的接口
export const prisma = {
  content: {
    findMany: async (args?: any) => {
      const all = Array.from(memoryStore.contents.values());
      let results = [...all];

      if (args?.where) {
        if (args.where.category) {
          results = results.filter(item => item.category === args.where.category);
        }
        if (args.where.source) {
          results = results.filter(item => item.source === args.where.source);
        }
        if (args.where.language) {
          results = results.filter(item => item.language === args.where.language);
        }
        if (args.where.status) {
          results = results.filter(item => item.status === args.where.status);
        }
      }

      if (args?.orderBy?.publishedAt === 'desc') {
        results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      }

      if (args?.take) {
        results = results.slice(0, args.take);
      }

      if (args?.skip) {
        results = results.slice(args.skip);
      }

      return results;
    },
    findUnique: async (args: any) => {
      if (args.where.id) {
        return memoryStore.getContentById(args.where.id);
      }
      if (args.where.url) {
        return Array.from(memoryStore.contents.values()).find(
          (item: any) => item.url === args.where.url
        ) || null;
      }
      return null;
    },
    create: async (args: any) => {
      return memoryStore.createContent(args.data);
    },
    createMany: async (args: any) => {
      const count = await memoryStore.batchCreate(args.data);
      return { count };
    },
    count: async (args?: any) => {
      if (args?.where) {
        let results = Array.from(memoryStore.contents.values());
        if (args.where.category) {
          results = results.filter((item: any) => item.category === args.where.category);
        }
        if (args.where.source) {
          results = results.filter((item: any) => item.source === args.where.source);
        }
        return results.length;
      }
      return memoryStore.contents.size;
    },
    deleteMany: async () => {
      const count = memoryStore.contents.size;
      memoryStore.contents.clear();
      return { count };
    },
  },
  $connect: async () => {
    console.log('✅ Memory store ready');
  },
  $disconnect: async () => {
    console.log('Memory store disconnect (no-op)');
  },
};

export async function testConnection() {
  console.log('✅ Memory store connected');
  return true;
}

export async function disconnect() {
  console.log('Memory store disconnect');
}

export default prisma;
