import { BaseCrawler, Category, ParsedContent } from './BaseCrawler';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  owner: {
    login: string;
  };
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

interface GitHubSearchResponse {
  items: GitHubRepo[];
  total_count: number;
}

interface SearchStrategy {
  q: string;
  sort: 'stars' | 'updated';
  per_page: number;
  name: string;
}

/**
 * GitHub 抓取器 - 多维度搜索策略
 * 抓取 AI/机器人相关的热门仓库
 *
 * 搜索策略：
 * 1. Topic + 高星标（确保覆盖有标签的热门仓库）
 * 2. 关键词 + 高星标（捕获无topic但有描述的热门仓库）
 * 3. 时间窗口 + 星标（捕获新兴热门项目）
 * 4. 多维度排序（按星标和更新时间分别搜索）
 */
export class GitHubCrawler extends BaseCrawler {
  private readonly apiToken: string | undefined;

  // AI/机器人相关的搜索策略（星标门槛 >20000）
  private readonly searchStrategies: SearchStrategy[] = [
    // ========== 策略1: Topic + 按星标排序（抓最热门的）==========
    { q: 'topic:llm stars:>20000', sort: 'stars', per_page: 50, name: 'LLM-hot' },
    { q: 'topic:ai-agents stars:>20000', sort: 'stars', per_page: 50, name: 'AI-Agents-hot' },
    { q: 'topic:artificial-intelligence stars:>20000', sort: 'stars', per_page: 50, name: 'AI-hot' },
    { q: 'topic:machine-learning stars:>20000', sort: 'stars', per_page: 50, name: 'ML-hot' },
    { q: 'topic:deep-learning stars:>20000', sort: 'stars', per_page: 50, name: 'DL-hot' },
    { q: 'topic:robotics stars:>20000', sort: 'stars', per_page: 50, name: 'Robotics-hot' },
    { q: 'topic:computer-vision stars:>20000', sort: 'stars', per_page: 50, name: 'CV-hot' },
    { q: 'topic:nlp stars:>20000', sort: 'stars', per_page: 50, name: 'NLP-hot' },
    { q: 'topic:openai stars:>20000', sort: 'stars', per_page: 50, name: 'OpenAI-hot' },
    { q: 'topic:anthropic stars:>20000', sort: 'stars', per_page: 50, name: 'Anthropic-hot' },
    { q: 'topic:claude stars:>20000', sort: 'stars', per_page: 50, name: 'Claude-hot' },
    { q: 'topic:mcp stars:>20000', sort: 'stars', per_page: 50, name: 'MCP-hot' },
    { q: 'topic:langchain stars:>20000', sort: 'stars', per_page: 50, name: 'LangChain-hot' },
    { q: 'topic:huggingface stars:>20000', sort: 'stars', per_page: 50, name: 'HF-hot' },
    { q: 'topic:autonomous-agents stars:>20000', sort: 'stars', per_page: 50, name: 'Autonomous-hot' },
    { q: 'topic:agentic-ai stars:>20000', sort: 'stars', per_page: 50, name: 'Agentic-hot' },
    { q: 'topic:tensorflow stars:>20000', sort: 'stars', per_page: 30, name: 'TensorFlow-hot' },
    { q: 'topic:pytorch stars:>20000', sort: 'stars', per_page: 30, name: 'PyTorch-hot' },
    { q: 'topic:transformers stars:>20000', sort: 'stars', per_page: 30, name: 'Transformers-hot' },
    { q: 'topic:generative-ai stars:>20000', sort: 'stars', per_page: 30, name: 'GenAI-hot' },
    { q: 'topic:diffusion stars:>20000', sort: 'stars', per_page: 30, name: 'Diffusion-hot' },
    { q: 'topic:llama stars:>20000', sort: 'stars', per_page: 30, name: 'Llama-hot' },
    { q: 'topic:gpt stars:>20000', sort: 'stars', per_page: 30, name: 'GPT-hot' },
    { q: 'topic:rag stars:>20000', sort: 'stars', per_page: 30, name: 'RAG-hot' },
    { q: 'topic:fine-tuning stars:>20000', sort: 'stars', per_page: 30, name: 'FineTuning-hot' },
    { q: 'topic:prompt-engineering stars:>20000', sort: 'stars', per_page: 30, name: 'Prompt-hot' },
    { q: 'topic:vector-database stars:>20000', sort: 'stars', per_page: 30, name: 'VectorDB-hot' },
    // 新增：AI Coding 相关 Topics
    { q: 'topic:cursor stars:>20000', sort: 'stars', per_page: 30, name: 'Cursor-hot' },
    { q: 'topic:vibe-coding stars:>20000', sort: 'stars', per_page: 30, name: 'VibeCoding-hot' },
    { q: 'topic:coding-agent stars:>20000', sort: 'stars', per_page: 30, name: 'CodingAgent-hot' },
    { q: 'topic:ai-coding stars:>20000', sort: 'stars', per_page: 30, name: 'AICoding-hot' },
    { q: 'topic:code-assistant stars:>20000', sort: 'stars', per_page: 30, name: 'CodeAssistant-hot' },

    // ========== 策略2: Topic + 按更新时间排序（抓最近活跃的）==========
    { q: 'topic:llm stars:>20000', sort: 'updated', per_page: 30, name: 'LLM-recent' },
    { q: 'topic:ai-agents stars:>20000', sort: 'updated', per_page: 30, name: 'AI-Agents-recent' },
    { q: 'topic:mcp stars:>20000', sort: 'updated', per_page: 30, name: 'MCP-recent' },

    // ========== 策略3: 关键词搜索（捕获无topic的热门仓库）==========
    { q: 'AI agent stars:>20000', sort: 'stars', per_page: 30, name: 'AI-Agent-keyword' },
    { q: 'LLM stars:>20000', sort: 'stars', per_page: 30, name: 'LLM-keyword' },
    { q: 'Claude Code stars:>20000', sort: 'stars', per_page: 30, name: 'ClaudeCode-keyword' },
    { q: 'OpenAI stars:>20000', sort: 'stars', per_page: 30, name: 'OpenAI-keyword' },
    { q: 'machine learning stars:>20000', sort: 'stars', per_page: 30, name: 'ML-keyword' },
    { q: 'robotics stars:>20000', sort: 'stars', per_page: 30, name: 'Robotics-keyword' },
    { q: 'neural network stars:>20000', sort: 'stars', per_page: 30, name: 'NN-keyword' },
    { q: 'deep learning stars:>20000', sort: 'stars', per_page: 30, name: 'DL-keyword' },
    { q: 'computer vision stars:>20000', sort: 'stars', per_page: 30, name: 'CV-keyword' },
    { q: 'NLP stars:>20000', sort: 'stars', per_page: 30, name: 'NLP-keyword' },
    { q: 'GPT stars:>20000', sort: 'stars', per_page: 30, name: 'GPT-keyword' },
    { q: 'generative AI stars:>20000', sort: 'stars', per_page: 30, name: 'GenAI-keyword' },
    { q: 'RAG stars:>20000', sort: 'stars', per_page: 30, name: 'RAG-keyword' },
    { q: 'embeddings stars:>20000', sort: 'stars', per_page: 30, name: 'Embeddings-keyword' },

    // ========== 策略4: 时间窗口 + 星标（抓新兴热门）==========
    { q: 'AI created:>2026-03-01 stars:>5000', sort: 'stars', per_page: 30, name: 'AI-new' },
    { q: 'LLM created:>2026-03-01 stars:>5000', sort: 'stars', per_page: 30, name: 'LLM-new' },
    { q: 'agent created:>2026-03-01 stars:>5000', sort: 'stars', per_page: 30, name: 'Agent-new' },
    { q: 'robotics created:>2026-03-01 stars:>5000', sort: 'stars', per_page: 30, name: 'Robotics-new' },

    // ========== 策略5: 特定语言 + AI关键词（热门技术栈）==========
    { q: 'AI language:TypeScript stars:>20000', sort: 'stars', per_page: 30, name: 'AI-TS' },
    { q: 'AI language:Python stars:>20000', sort: 'stars', per_page: 30, name: 'AI-Python' },
    { q: 'LLM language:TypeScript stars:>20000', sort: 'stars', per_page: 30, name: 'LLM-TS' },
    { q: 'LLM language:Rust stars:>20000', sort: 'stars', per_page: 30, name: 'LLM-Rust' },
    { q: 'agent language:TypeScript stars:>20000', sort: 'stars', per_page: 30, name: 'Agent-TS' },

    // ========== 策略6: 特定热门项目精准搜索（补充无topic的仓库）==========
    { q: 'oh-my-codex OR oh-my-code OR codex stars:>20000', sort: 'stars', per_page: 30, name: 'Codex-keyword' },
    { q: 'devin OR devika OR openinterpreter stars:>20000', sort: 'stars', per_page: 30, name: 'AI-Devs-keyword' },
    { q: 'cursor IDE editor AI stars:>20000', sort: 'stars', per_page: 30, name: 'Cursor-like' },
    { q: 'codeium OR windsurf stars:>20000', sort: 'stars', per_page: 30, name: 'Codeium-keyword' },
    { q: 'aider OR void OR pearl OR goose stars:>20000', sort: 'stars', per_page: 30, name: 'AI-Editors-keyword' },
    { q: 'sweep OR supermaven OR tabnine stars:>20000', sort: 'stars', per_page: 30, name: 'AI-Tools-keyword' },
    { q: 'dify OR fastgpt OR flowise stars:>20000', sort: 'stars', per_page: 30, name: 'AI-Platforms-keyword' },
    { q: 'lobe OR chatgpt-next-web OR chatgpt-web stars:>20000', sort: 'stars', per_page: 30, name: 'AI-Chat-Clients' },
    { q: 'imagen OR sdxl OR stable-diffusion-webui stars:>20000', sort: 'stars', per_page: 30, name: 'GenAI-Image' },
    { q: 'comfyui OR fooocus OR omost stars:>20000', sort: 'stars', per_page: 30, name: 'GenAI-UI' },
  ];

  constructor() {
    super({
      name: 'GitHubCrawler',
      baseUrl: 'https://api.github.com',
      rateLimitMs: 1500, // 稍微降低速率限制以获取更多数据
      maxRetries: 3,
      circuitBreakerThreshold: 10,
      circuitBreakerResetTimeMs: 30 * 60 * 1000,
    });

    this.apiToken = process.env.GITHUB_TOKEN;
    if (!this.apiToken) {
      this.log('No GITHUB_TOKEN found, using unauthenticated requests (60 req/hour limit)', 'warn');
    }
  }

  /**
   * 执行所有搜索策略
   */
  protected async fetch(): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = [];
    const seenIds = new Set<number>();
    let strategyCount = 0;

    for (const strategy of this.searchStrategies) {
      strategyCount++;
      try {
        await this.rateLimit();
        this.log(`[${strategyCount}/${this.searchStrategies.length}] Searching: ${strategy.name}`);

        const repos = await this.searchRepositories(strategy.q, strategy.sort, strategy.per_page);

        for (const repo of repos) {
          if (!seenIds.has(repo.id)) {
            seenIds.add(repo.id);
            allRepos.push(repo);
          }
        }

        this.log(`Found ${repos.length} repos for ${strategy.name} (total unique: ${allRepos.length})`);
      } catch (error) {
        this.log(
          `Failed to search ${strategy.name}: ${error instanceof Error ? error.message : String(error)}`,
          'warn'
        );
      }
    }

    // 按热度分数排序（星标数 × 时间因子）
    allRepos.sort((a, b) => {
      const scoreA = this.calculateHotScore(a);
      const scoreB = this.calculateHotScore(b);
      return scoreB - scoreA;
    });

    this.log(`Total unique repos collected: ${allRepos.length}`);
    return allRepos;
  }

  /**
   * 计算热度分数
   * 热度 = 星标数 × 时间衰减因子
   * 最近更新的仓库时间衰减接近1，很久未更新的衰减接近0
   */
  private calculateHotScore(repo: GitHubRepo): number {
    const now = Date.now();
    const updatedAt = new Date(repo.updated_at).getTime();
    const daysSinceUpdate = (now - updatedAt) / (1000 * 60 * 60 * 24);

    // 时间衰减：一周内几乎不衰减，超过30天严重衰减
    let timeDecay: number;
    if (daysSinceUpdate <= 7) {
      timeDecay = 1;
    } else if (daysSinceUpdate <= 30) {
      timeDecay = 0.8;
    } else if (daysSinceUpdate <= 90) {
      timeDecay = 0.5;
    } else {
      timeDecay = 0.3;
    }

    return repo.stargazers_count * timeDecay;
  }

  /**
   * 调用 GitHub API 搜索仓库
   */
  private async searchRepositories(
    query: string,
    sort: 'stars' | 'updated',
    perPage: number
  ): Promise<GitHubRepo[]> {
    const url = `${this.config.baseUrl}/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=${perPage}`;

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Pulse-App',
    };

    if (this.apiToken) {
      headers['Authorization'] = `token ${this.apiToken}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');
        if (rateLimitRemaining === '0' && rateLimitReset) {
          const resetDate = new Date(parseInt(rateLimitReset) * 1000);
          this.log(`Rate limited. Resets at: ${resetDate.toISOString()}`, 'warn');
        }
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: GitHubSearchResponse = await response.json();
    return data.items || [];
  }

  /**
   * 解析数据为标准格式
   */
  parse(raw: GitHubRepo[]): ParsedContent[] {
    return raw.map((repo) => ({
      sourceId: 'github',
      url: repo.html_url,
      originalTitle: repo.full_name,
      originalAbstract: repo.description || '',
      originalLanguage: 'en',
      author: repo.owner.login,
      publishedAt: new Date(repo.pushed_at || repo.updated_at), // 用推送时间代替创建时间
      category: Category.OPEN_SOURCE,
      tags: this.extractTags(repo),
    }));
  }

  /**
   * 从仓库信息中提取标签
   */
  private extractTags(repo: GitHubRepo): string[] {
    const tags: string[] = [];

    // 添加主要语言标签
    if (repo.language) {
      tags.push(repo.language);
    }

    // 添加 GitHub topics 作为标签
    if (repo.topics && repo.topics.length > 0) {
      tags.push(...repo.topics.slice(0, 8));
    }

    // 从描述和名称中提取 AI 相关标签
    const text = `${repo.name} ${repo.description || ''}`.toLowerCase();

    const tagMappings: Record<string, string[]> = {
      'ai': ['AI', 'Artificial Intelligence'],
      'artificial intelligence': ['AI', 'Artificial Intelligence'],
      'machine learning': ['ML', 'Machine Learning'],
      'deep learning': ['Deep Learning', 'Neural Networks'],
      'neural network': ['Neural Networks', 'Deep Learning'],
      'nlp': ['NLP', 'Natural Language Processing'],
      'natural language': ['NLP', 'Natural Language Processing'],
      'computer vision': ['Computer Vision', 'CV'],
      'vision': ['Computer Vision', 'CV'],
      'robotics': ['Robotics', 'Robots'],
      'robot': ['Robotics', 'Robots'],
      'autonomous': ['Autonomous Systems', 'Robotics'],
      'llm': ['LLM', 'Large Language Model'],
      'language model': ['LLM', 'Language Model'],
      'gpt': ['GPT', 'OpenAI'],
      'transformer': ['Transformers', 'Deep Learning'],
      'tensorflow': ['TensorFlow', 'Google'],
      'pytorch': ['PyTorch', 'Meta'],
      'huggingface': ['Hugging Face', 'Transformers'],
      'langchain': ['LangChain', 'LLM Framework'],
      'openai': ['OpenAI', 'GPT'],
      'anthropic': ['Anthropic', 'Claude'],
      'claude': ['Claude', 'Anthropic'],
      'generative': ['Generative AI', 'GenAI'],
      'diffusion': ['Diffusion Models', 'Generative AI'],
      'stable diffusion': ['Stable Diffusion', 'Generative AI'],
      'agent': ['AI Agent', 'Autonomous Agent'],
      'agents': ['AI Agents', 'Multi-Agent'],
      'mcp': ['MCP', 'Model Context Protocol'],
      'rag': ['RAG', 'Retrieval Augmented Generation'],
      'embeddings': ['Embeddings', 'Vector Search'],
      'fine-tune': ['Fine-tuning', 'Training'],
      'prompt': ['Prompt Engineering'],
      'codex': ['Codex', 'AI Coding'],
      'copilot': ['Copilot', 'AI Assistant'],
      'assistant': ['AI Assistant'],
    };

    for (const [keyword, tagList] of Object.entries(tagMappings)) {
      if (text.includes(keyword)) {
        tags.push(...tagList);
      }
    }

    // 根据星标数添加热度标签
    if (repo.stargazers_count > 100000) {
      tags.push('🔥🔥🔥 Mega Hot');
    } else if (repo.stargazers_count > 50000) {
      tags.push('🔥🔥 Super Hot');
    } else if (repo.stargazers_count > 20000) {
      tags.push('🔥 Hot');
    }

    return [...new Set(tags)];
  }
}
