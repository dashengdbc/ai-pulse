// 使用内存存储作为数据库兼容层
import { memoryStore } from './memory-store';

// 导出兼容 Prisma 风格的接口
export const prisma = {
  content: {
    findMany: async (args?: any) => {
      const all = memoryStore.getAll();
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
        return memoryStore.getById(args.where.id) || null;
      }
      if (args.where.url) {
        return memoryStore.getByUrl(args.where.url) || null;
      }
      return null;
    },
    create: async (args: any) => {
      memoryStore.add(args.data);
      return args.data;
    },
    createMany: async (args: any) => {
      for (const item of args.data) {
        memoryStore.add(item);
      }
      return { count: args.data.length };
    },
    count: async (args?: any) => {
      if (args?.where) {
        let results = memoryStore.getAll();
        if (args.where.category) {
          results = results.filter(item => item.category === args.where.category);
        }
        if (args.where.source) {
          results = results.filter(item => item.source === args.where.source);
        }
        return results.length;
      }
      return memoryStore.count();
    },
    deleteMany: async () => {
      const count = memoryStore.count();
      memoryStore.clear();
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
