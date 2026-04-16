// 内存存储 - 用于无Docker环境快速测试
export const memoryStore = {
  contents: new Map<string, any>(),

  async getContents(options: { page?: number; limit?: number; category?: string; sourceId?: string } = {}) {
    const { page = 1, limit = 20, category, sourceId } = options;

    let items = Array.from(this.contents.values());

    if (category) {
      items = items.filter((item: any) => item.category === category);
    }
    if (sourceId) {
      items = items.filter((item: any) => item.sourceId === sourceId);
    }

    // Sort by publishedAt desc
    items.sort((a: any, b: any) => b.publishedAt - a.publishedAt);

    const total = items.length;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return {
      items: paginatedItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: start + limit < total,
    };
  },

  async createContent(data: any) {
    const id = data.id || String(Date.now());
    const content = { ...data, id, fetchedAt: new Date() };
    this.contents.set(id, content);
    return content;
  },

  async getContentById(id: string) {
    return this.contents.get(id) || null;
  },

  async checkDuplicate(url: string, sourceId: string) {
    const id = String(sourceId + ':' + url);
    return this.contents.has(id);
  },

  // For crawlers to batch insert
  async batchCreate(items: any[]) {
    let added = 0;
    for (const item of items) {
      const id = item.sourceId + ':' + item.url;
      if (!this.contents.has(id)) {
        this.contents.set(id, { ...item, id, fetchedAt: new Date() });
        added++;
      }
    }
    return added;
  },

  getStats() {
    return {
      total: this.contents.size,
      bySource: Array.from(this.contents.values()).reduce((acc: any, item: any) => {
        acc[item.sourceId] = (acc[item.sourceId] || 0) + 1;
        return acc;
      }, {}),
    };
  },
};
