import { franc } from 'franc';

export enum Category {
  AI = 'AI',
  ROBOTICS = 'ROBOTICS',
  ML = 'ML',
  NLP = 'NLP',
  VISION = 'VISION',
  OPEN_SOURCE = 'OPEN_SOURCE',
  RESEARCH = 'RESEARCH',
}

export interface ParsedContent {
  sourceId: string;
  url: string;
  originalTitle: string;
  originalAbstract?: string;
  originalLanguage: string;
  author?: string;
  publishedAt: Date;
  category: Category;
  tags: string[];
}

export interface CrawlerConfig {
  name: string;
  baseUrl: string;
  rateLimitMs: number;
  maxRetries: number;
  circuitBreakerThreshold: number;
  circuitBreakerResetTimeMs: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number | null;
  isOpen: boolean;
}

export abstract class BaseCrawler {
  protected config: CrawlerConfig;
  private circuitBreaker: CircuitBreakerState;
  private lastRequestTime: number = 0;

  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = {
      name: 'BaseCrawler',
      baseUrl: '',
      rateLimitMs: 1000,
      maxRetries: 3,
      circuitBreakerThreshold: 10,
      circuitBreakerResetTimeMs: 60 * 60 * 1000, // 1 hour
      ...config,
    };

    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: null,
      isOpen: false,
    };
  }

  /**
   * 熔断器检查
   * 如果失败次数达到阈值，且距离上次失败时间小于重置时间，则熔断器打开
   */
  protected isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreaker.isOpen) {
      if (this.circuitBreaker.failures >= this.config.circuitBreakerThreshold) {
        const now = Date.now();
        if (
          this.circuitBreaker.lastFailureTime &&
          now - this.circuitBreaker.lastFailureTime < this.config.circuitBreakerResetTimeMs
        ) {
          this.circuitBreaker.isOpen = true;
          this.log(
            `Circuit breaker opened for ${this.config.name}. Will reset in 1 hour.`,
            'error'
          );
        } else if (
          this.circuitBreaker.lastFailureTime &&
          now - this.circuitBreaker.lastFailureTime >= this.config.circuitBreakerResetTimeMs
        ) {
          // 重置熔断器
          this.resetCircuitBreaker();
        }
      }
    }
    return this.circuitBreaker.isOpen;
  }

  /**
   * 记录失败，增加熔断器计数
   */
  protected recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();
    this.log(
      `Failure recorded for ${this.config.name}. Count: ${this.circuitBreaker.failures}`,
      'warn'
    );
  }

  /**
   * 重置熔断器
   */
  protected resetCircuitBreaker(): void {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailureTime = null;
    this.circuitBreaker.isOpen = false;
    this.log(`Circuit breaker reset for ${this.config.name}`, 'info');
  }

  /**
   * 记录成功，重置熔断器
   */
  protected recordSuccess(): void {
    if (this.circuitBreaker.failures > 0) {
      this.resetCircuitBreaker();
    }
  }

  /**
   * 速率限制：确保请求间隔
   */
  protected async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.config.rateLimitMs) {
      await this.sleep(this.config.rateLimitMs - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * 指数退避重试机制
   * @param fn 要执行的函数
   * @param retries 剩余重试次数
   * @param delay 当前延迟时间
   */
  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.config.maxRetries,
    delay: number = 1000
  ): Promise<T> {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }

      this.log(
        `Retry attempt ${this.config.maxRetries - retries + 1} for ${this.config.name} after ${delay}ms`,
        'warn'
      );

      await this.sleep(delay);
      return this.retryWithBackoff(fn, retries - 1, delay * 2);
    }
  }

  /**
   * 休眠函数
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 日志记录
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.config.name}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      default:
        console.log(prefix, message);
    }
  }

  /**
   * 检测文本语言
   */
  protected detectLanguage(text: string): string {
    const langCode = franc(text);
    // franc 返回 ISO 639-3 代码，转换为 ISO 639-1
    const langMap: Record<string, string> = {
      'cmn': 'zh',
      'eng': 'en',
      'jpn': 'ja',
      'kor': 'ko',
      'fra': 'fr',
      'deu': 'de',
      'spa': 'es',
      'rus': 'ru',
    };
    return langMap[langCode] || langCode.substring(0, 2) || 'unknown';
  }

  /**
   * 主抓取方法
   * 包含熔断器检查、速率限制和错误处理
   */
  public async crawl(): Promise<ParsedContent[]> {
    if (this.isCircuitBreakerOpen()) {
      this.log(`Circuit breaker is open for ${this.config.name}, skipping crawl`, 'warn');
      return [];
    }

    try {
      await this.rateLimit();
      this.log(`Starting crawl for ${this.config.name}`);

      const rawData = await this.retryWithBackoff(() => this.fetch());
      const parsedData = this.parse(rawData);

      this.recordSuccess();
      this.log(`Successfully crawled ${parsedData.length} items from ${this.config.name}`);

      return parsedData;
    } catch (error) {
      this.recordFailure();
      this.log(
        `Failed to crawl ${this.config.name}: ${error instanceof Error ? error.message : String(error)}`,
        'error'
      );
      return [];
    }
  }

  /**
   * 抽象方法：获取原始数据
   * 子类必须实现
   */
  protected abstract fetch(): Promise<unknown>;

  /**
   * 抽象方法：解析数据
   * 子类必须实现
   */
  protected abstract parse(rawData: unknown): ParsedContent[];
}
