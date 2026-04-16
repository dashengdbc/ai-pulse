import Parser from 'rss-parser';
import { BaseCrawler, Category, ParsedContent } from './BaseCrawler';

interface IeeeFeedItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet?: string;
  guid: string;
  creator?: string;
  'dc:creator'?: string;
  categories?: string[];
}

interface IeeePaper {
  title: string;
  url: string;
  abstract: string;
  authors: string[];
  publishedAt: Date;
  doi?: string;
  journal?: string;
  keywords: string[];
}

/**
 * IEEE Xplore 抓取器
 * 抓取 IEEE Transactions on Robotics 和 IEEE/RSJ IROS 相关论文
 * 使用 RSS feeds 和替代数据源
 */
export class IeeeCrawler extends BaseCrawler {
  private readonly rssParser: Parser;

  // IEEE 相关 RSS feeds
  private readonly feedUrls = [
    {
      url: 'https://ieeexplore.ieee.org/rss/TOC/8860/1',
      name: 'IEEE Transactions on Robotics',
      category: Category.ROBOTICS,
    },
    {
      url: 'https://ieeexplore.ieee.org/rss/TOC/34/1',
      name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
      category: Category.AI,
    },
  ];

  // 替代数据源：Google Scholar 机器人相关的 RSS
  private readonly altFeedUrls = [
    {
      url: 'https://www.mdpi.com/rss/journal/robotics',
      name: 'MDPI Robotics',
      category: Category.ROBOTICS,
    },
    {
      url: 'https://www.frontiersin.org/journals/robotics-and-ai/rss',
      name: 'Frontiers in Robotics and AI',
      category: Category.ROBOTICS,
    },
    {
      url: 'https://direct.mit.edu/rss/site_6100053/3136.xml',
      name: 'Journal of Field Robotics',
      category: Category.ROBOTICS,
    },
  ];

  constructor() {
    super({
      name: 'IeeeCrawler',
      baseUrl: 'https://ieeexplore.ieee.org',
      rateLimitMs: 3000,
      maxRetries: 3,
      circuitBreakerThreshold: 5,
      circuitBreakerResetTimeMs: 30 * 60 * 1000,
    });

    this.rssParser = new Parser({
      customFields: {
        item: [['dc:creator'], ['category'], ['prism:publicationName']],
      },
    });
  }

  /**
   * 抓取所有可用的 RSS feeds
   */
  protected async fetch(): Promise<IeeePaper[]> {
    const allPapers: IeeePaper[] = [];
    const seenTitles = new Set<string>();

    // 尝试抓取 IEEE feeds
    for (const feedConfig of this.feedUrls) {
      try {
        await this.rateLimit();
        this.log(`Fetching: ${feedConfig.name}`);

        const feed = await this.retryWithBackoff(() =>
          this.rssParser.parseURL(feedConfig.url)
        );

        const papers = this.parseFeedItems(feed.items as IeeeFeedItem[], feedConfig.category);

        for (const paper of papers) {
          if (!seenTitles.has(paper.title)) {
            seenTitles.add(paper.title);
            allPapers.push(paper);
          }
        }

        this.log(`Fetched ${papers.length} papers from ${feedConfig.name}`);
      } catch (error) {
        this.log(
          `Failed to fetch ${feedConfig.name}: ${error instanceof Error ? error.message : String(error)}`,
          'warn'
        );
      }
    }

    // 尝试抓取替代数据源
    for (const feedConfig of this.altFeedUrls) {
      try {
        await this.rateLimit();
        this.log(`Fetching alternative source: ${feedConfig.name}`);

        const feed = await this.retryWithBackoff(() =>
          this.rssParser.parseURL(feedConfig.url)
        );

        const papers = this.parseFeedItems(feed.items as IeeeFeedItem[], feedConfig.category);

        for (const paper of papers) {
          if (!seenTitles.has(paper.title)) {
            seenTitles.add(paper.title);
            allPapers.push(paper);
          }
        }

        this.log(`Fetched ${papers.length} papers from ${feedConfig.name}`);
      } catch (error) {
        this.log(
          `Failed to fetch ${feedConfig.name}: ${error instanceof Error ? error.message : String(error)}`,
          'warn'
        );
      }
    }

    return allPapers;
  }

  /**
   * 解析 RSS feed items
   */
  private parseFeedItems(items: IeeeFeedItem[], category: Category): IeeePaper[] {
    return items.map((item) => {
      // 解析作者
      const authors = this.parseAuthors(item);

      // 清理摘要
      const abstract = this.cleanAbstract(item.contentSnippet || item.content || '');

      return {
        title: this.cleanTitle(item.title),
        url: item.link,
        abstract,
        authors,
        publishedAt: new Date(item.pubDate),
        doi: item.guid,
        keywords: item.categories || [],
      };
    });
  }

  /**
   * 解析作者信息
   */
  private parseAuthors(item: IeeeFeedItem): string[] {
    const creator = item['dc:creator'] || item.creator;
    if (creator) {
      return creator.split(/[,;]/).map((a) => a.trim()).filter(Boolean);
    }
    return [];
  }

  /**
   * 清理标题
   */
  private cleanTitle(title: string): string {
    return title.replace(/\s+/g, ' ').trim();
  }

  /**
   * 清理摘要文本
   */
  private cleanAbstract(content: string): string {
    // 移除 HTML 标签
    const withoutHtml = content.replace(/<[^>]*>/g, ' ');
    // 移除多余空白
    return withoutHtml.replace(/\s+/g, ' ').trim();
  }

  /**
   * 提取标签
   */
  private extractTags(paper: IeeePaper): string[] {
    const tags: string[] = [];

    // 添加期刊/会议标签
    if (paper.journal) {
      tags.push(paper.journal);
    }

    // 基础类别标签
    tags.push('IEEE', 'Research', 'Academic');

    // 从标题和摘要中提取关键词
    const text = `${paper.title} ${paper.abstract}`.toLowerCase();

    const keywordMappings: Record<string, string[]> = {
      'robot': ['Robotics', 'Robots'],
      'robotic': ['Robotics'],
      'manipulation': ['Robot Manipulation'],
      'grasping': ['Grasping', 'Manipulation'],
      'locomotion': ['Locomotion'],
      'navigation': ['Navigation', 'SLAM'],
      'slam': ['SLAM', 'Navigation'],
      'autonomous': ['Autonomous Systems'],
      'humanoid': ['Humanoid Robots'],
      'mobile robot': ['Mobile Robots'],
      'swarm': ['Swarm Robotics'],
      'control': ['Control Systems'],
      'planning': ['Motion Planning'],
      'perception': ['Perception', 'Computer Vision'],
      'computer vision': ['Computer Vision', 'CV'],
      'deep learning': ['Deep Learning'],
      'reinforcement learning': ['RL', 'Reinforcement Learning'],
      'machine learning': ['Machine Learning', 'ML'],
      'neural network': ['Neural Networks'],
      'sensor': ['Sensors'],
      'actuator': ['Actuators'],
      'hri': ['Human-Robot Interaction', 'HRI'],
      'human-robot': ['Human-Robot Interaction'],
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
  parse(raw: IeeePaper[]): ParsedContent[] {
    return raw.map((paper) => ({
      sourceId: 'ieee',
      url: paper.url,
      originalTitle: paper.title,
      originalAbstract: paper.abstract,
      originalLanguage: 'en',
      author: paper.authors.join(', '),
      publishedAt: paper.publishedAt,
      category: Category.ROBOTICS,
      tags: this.extractTags(paper),
    }));
  }
}
