// 内存存储作为 Redis 兼容层
const memoryCache = new Map<string, string>();

export const redis = {
  get: async (key: string) => memoryCache.get(key) || null,
  set: async (key: string, value: string, ...args: any[]) => {
    memoryCache.set(key, value);
    return 'OK';
  },
  setex: async (key: string, seconds: number, value: string) => {
    memoryCache.set(key, value);
    setTimeout(() => memoryCache.delete(key), seconds * 1000);
    return 'OK';
  },
  del: async (key: string) => {
    memoryCache.delete(key);
    return 1;
  },
  exists: async (key: string) => memoryCache.has(key) ? 1 : 0,
  on: () => {}, // 模拟事件监听
};

export default redis;
