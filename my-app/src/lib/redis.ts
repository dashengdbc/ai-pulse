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
  del: async (...keys: string[]) => {
    let count = 0;
    for (const key of keys) {
      // 支持 pattern 匹配删除 (如 'content:list:*')
      if (key.includes('*')) {
        const pattern = key.replace('*', '.*');
        const regex = new RegExp('^' + pattern + '$');
        for (const [k] of memoryCache) {
          if (regex.test(k)) {
            memoryCache.delete(k);
            count++;
          }
        }
      } else if (memoryCache.has(key)) {
        memoryCache.delete(key);
        count++;
      }
    }
    return count;
  },
  exists: async (key: string) => memoryCache.has(key) ? 1 : 0,
  keys: async (pattern: string) => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(memoryCache.keys()).filter(k => regex.test(k));
  },
  on: () => {}, // 模拟事件监听
};

export default redis;
