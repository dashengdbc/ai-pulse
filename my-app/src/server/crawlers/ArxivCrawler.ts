import Parser from 'rss-parser';
import { BaseCrawler, Category, ParsedContent } from './BaseCrawler';

interface ArxivFeedItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet?: string;
  categories?: string[];
  creator?: string;
  'dc:creator'?: string;
  guid: string;
}

interface ArxivFeed {
  items: ArxivFeedItem[];
  feedUrl: string;
  title: string;
}

interface ArxivPaper {
  title: string;
  url: string;
  abstract: string;
  authors: string[];
  publishedAt: Date;
  arxivId: string;
  categories: string[];
  primaryCategory: string;
}

/**
 * arXiv 抓取器
 * 使用 RSS Parser 抓取 arXiv 的 AI、机器人、机器学习相关论文
 */
export class ArxivCrawler extends BaseCrawler {
  private readonly rssParser: Parser<ArxivFeed, ArxivFeedItem>;
  
  // arXiv RSS feeds for relevant categories
  private readonly feedUrls = [
    { url: 'http://export.arxiv.org/rss/cs.AI', category: Category.AI, name: 'Artificial Intelligence' },
    { url: 'http://export.arxiv.org/rss/cs.RO', category: Category.ROBOTICS, name: 'Robotics' },
    { url: 'http://export.arxiv.org/rss/cs.LG', category: Category.ML, name: 'Machine Learning' },
    { url: 'http://export.arxiv.org/rss/cs.CL', category: Category.NLP, name: 'Computation and Language' },
    { url: 'http://export.arxiv.org/rss/cs.CV', category: Category.VISION, name: 'Computer Vision' },
  ];

  constructor() {
    super({
      name: 'ArxivCrawler',
      baseUrl: 'https://arxiv.org',
      rateLimitMs: 3000, // arXiv RSS 需要更宽松的速率限制 (建议 3 秒)
      maxRetries: 3,
      circuitBreakerThreshold: 5,
      circuitBreakerResetTimeMs: 30 * 60 * 1000, // 30 分钟
    });

    this.rssParser = new Parser<ArxivFeed, ArxivFeedItem>({
      customFields: {
        item: [['dc:creator'], ['category']],
      },
    });
  }

  /**
   * 抓取所有配置的 RSS feeds
   */
  protected async fetch(): Promise<ArxivPaper[]> {
    const allPapers: ArxivPaper[] = [];

    for (const feedConfig of this.feedUrls) {
      try {
        await this.rateLimit();
        this.log(`Fetching RSS feed: ${feedConfig.name}`);

        const feed = await this.retryWithBackoff(() => 
          this.rssParser.parseURL(feedConfig.url)
        );

        const papers = this.parseFeedItems(feed.items, feedConfig.category);
        allPapers.push(...papers);

        this.log(`Fetched ${papers.length} papers from ${feedConfig.name}`);
      } catch (error) {
        this.log(
          `Failed to fetch feed ${feedConfig.name}: ${error instanceof Error ? error.message : String(error)}`,
          'warn'
        );
      }
    }

    return allPapers;
  }

  /**
   * 解析 RSS feed items 为 arXiv 论文格式
   */
  private parseFeedItems(items: ArxivFeedItem[], primaryCategory: Category): ArxivPaper[] {
    return items.map((item) => {
      // 提取 arXiv ID 从 URL
      const arxivId = this.extractArxivId(item.link);
      
      // 解析作者
      const authors = this.parseAuthors(item);
      
      // 清理摘要 (移除 arXiv 的版权信息)
      const abstract = this.cleanAbstract(item.contentSnippet || item.content || '');

      return {
        title: this.cleanTitle(item.title),
        url: item.link,
        abstract,
        authors,
        publishedAt: new Date(item.pubDate),
        arxivId,
        categories: item.categories || [],
        primaryCategory,
      };
    });
  }

  /**
   * 从 URL 提取 arXiv ID
   */
  private extractArxivId(url: string): string {
    const match = url.match(/arxiv\.org\/abs\/([\d.]+)/);
    return match ? match[1] : '';
  }

  /**
   * 解析作者信息
   */
  private parseAuthors(item: ArxivFeedItem): string[] {
    // 尝试从 dc:creator 获取
    const creator = item['dc:creator'] || item.creator;
    if (creator) {
      return creator.split(',').map(a => a.trim());
    }
    return [];
  }

  /**
   * 清理标题 (移除 arXiv ID 前缀)
   */
  private cleanTitle(title: string): string {
    return title.replace(/^arXiv:\d+\.\d+\s*\[.*?\]\s*/, '').trim();
  }

  /**
   * 清理摘要文本
   */
  private cleanAbstract(content: string): string {
    // 移除 HTML 标签
    const withoutHtml = content.replace(/<[^>]*>/g, ' ');
    // 移除 arXiv 版权信息
    const withoutCopyright = withoutHtml.replace(/\s*\\s*\(.*?arXiv.*\d{4}.*?\\s*\)\s*/gi, '');
    // 移除多余空白
    return withoutCopyright.replace(/\s+/g, ' ').trim();
  }

  /**
   * 提取论文标签
   */
  private extractPaperTags(paper: ArxivPaper): string[] {
    const tags: string[] = [];
    
    // 添加主要类别标签
    const categoryTags: Record<string, string[]> = {
      [Category.AI]: ['AI', 'Artificial Intelligence'],
      [Category.ROBOTICS]: ['Robotics', 'Robots'],
      [Category.ML]: ['Machine Learning', 'ML'],
      [Category.NLP]: ['NLP', 'Natural Language Processing'],
      [Category.VISION]: ['Computer Vision', 'CV'],
      [Category.OPEN_SOURCE]: [],
      [Category.RESEARCH]: ['Research', 'Academic'],
    };

    tags.push(...(categoryTags[paper.primaryCategory] || []));

    // 从 arXiv 类别中提取标签
    const categoryMappings: Record<string, string[]> = {
      'cs.AI': ['AI'],
      'cs.RO': ['Robotics'],
      'cs.LG': ['Machine Learning'],
      'cs.CL': ['NLP'],
      'cs.CV': ['Computer Vision'],
      'cs.IR': ['Information Retrieval'],
      'cs.DB': ['Database'],
      'cs.DC': ['Distributed Computing'],
      'cs.NE': ['Neural Networks'],
      'cs.SY': ['Systems'],
    };

    for (const cat of paper.categories) {
      if (categoryMappings[cat]) {
        tags.push(...categoryMappings[cat]);
      }
    }

    // 从标题和摘要中提取关键词
    const text = `${paper.title} ${paper.abstract}`.toLowerCase();
    
    const keywordMappings: Record<string, string[]> = {
      'transformer': ['Transformers'],
      'gpt': ['GPT', 'LLM'],
      'llm': ['LLM', 'Large Language Model'],
      'bert': ['BERT'],
      'diffusion': ['Diffusion Models'],
      'gan': ['GAN', 'Generative AI'],
      'reinforcement learning': ['RL', 'Reinforcement Learning'],
      'deep learning': ['Deep Learning'],
      'neural network': ['Neural Networks'],
      'slam': ['SLAM'],
      'autonomous': ['Autonomous Systems'],
      'humanoid': ['Humanoid Robots'],
      'manipulation': ['Robot Manipulation'],
      'grasping': ['Grasping'],
      'perception': ['Perception'],
    };

    for (const [keyword, tagList] of Object.entries(keywordMappings)) {
      if (text.includes(keyword)) {
        tags.push(...tagList);
      }
    }

    return [...new Set(tags)];
  }

  /**
   * 解析数据为标准格式
   */
  parse(raw: ArxivPaper[]): ParsedContent[] {
    return raw.map((paper) => ({
      sourceId: 'arxiv',
      url: paper.url,
      originalTitle: paper.title,
      originalAbstract: paper.abstract,
      originalLanguage: 'en',
      author: paper.authors.join(', '),
      publishedAt: paper.publishedAt,
      category: paper.primaryCategory as Category,
      tags: this.extractPaperTags(paper),
    }));
  }
}
