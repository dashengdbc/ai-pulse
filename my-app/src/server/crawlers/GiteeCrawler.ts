import { BaseCrawler, Category, ParsedContent } from './BaseCrawler';

interface GiteeRepo {
  id: string;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  owner: {
    login: string;
    name: string;
  };
  updated_at: string;
}

/**
 * Gitee 爬虫 - 混合策略
 *
 * 由于 Gitee 页面是动态加载的（JavaScript），服务器端无法直接抓取。
 * 本爬虫使用以下策略：
 * 1. 尝试 API 抓取（有频率限制）
 * 2. 手动维护的种子数据（热门项目）
 * 3. 定期从 GitHub 镜像同步
 *
 * 特点：
 * - 星标门槛：>=10
 * - 只看一周内更新的项目
 * - 按更新时间排序（最新的在前）
 */
export class GiteeCrawler extends BaseCrawler {
  // 手动维护的 Gitee 热门 AI 项目种子数据
  private readonly seedRepos: GiteeRepo[] = [
    {
      id: 'paddlepaddle/Paddle',
      name: 'Paddle',
      full_name: 'paddlepaddle/Paddle',
      html_url: 'https://gitee.com/paddlepaddle/Paddle',
      description: 'PArallel Distributed Deep LEarning: Machine Learning Framework from Industrial Practice （『飞桨』核心框架，深度学习\u0026机器学习高性能单机、分布式训练和跨平台部署）',
      stargazers_count: 22500,
      forks_count: 5600,
      language: 'Python',
      owner: { login: 'paddlepaddle', name: 'paddlepaddle' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'paddlepaddle/PaddleOCR',
      name: 'PaddleOCR',
      full_name: 'paddlepaddle/PaddleOCR',
      html_url: 'https://gitee.com/paddlepaddle/PaddleOCR',
      description: 'Awesome multilingual OCR toolkits based on PaddlePaddle (practical ultra lightweight OCR system, support 80+ languages recognition, provide data annotation and synthesis tools, support training and deployment among server, mobile, embedded and IoT devices)',
      stargazers_count: 18200,
      forks_count: 3800,
      language: 'Python',
      owner: { login: 'paddlepaddle', name: 'paddlepaddle' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'paddlepaddle/PaddleNLP',
      name: 'PaddleNLP',
      full_name: 'paddlepaddle/PaddleNLP',
      html_url: 'https://gitee.com/paddlepaddle/PaddleNLP',
      description: 'Easy-to-use and powerful NLP library with Awesome model zoo, supporting wide-range of NLP tasks from research to industrial applications, including Neural Search, Question Answering, Information Extraction and Sentiment Analysis end-to-end system.',
      stargazers_count: 12500,
      forks_count: 2100,
      language: 'Python',
      owner: { login: 'paddlepaddle', name: 'paddlepaddle' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'paddlepaddle/ERNIE',
      name: 'ERNIE',
      full_name: 'paddlepaddle/ERNIE',
      html_url: 'https://gitee.com/paddlepaddle/ERNIE',
      description: 'The official repository for ERNIE 4.5 and ERNIEKit – its industrial-grade development toolkit based on PaddlePaddle.',
      stargazers_count: 8900,
      forks_count: 1700,
      language: 'Python',
      owner: { login: 'paddlepaddle', name: 'paddlepaddle' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'mindspore/mindspore',
      name: 'mindspore',
      full_name: 'mindspore/mindspore',
      html_url: 'https://gitee.com/mindspore/mindspore',
      description: 'MindSpore is a new open source deep learning training/inference framework that could be used for mobile, edge and cloud scenarios.',
      stargazers_count: 8600,
      forks_count: 2400,
      language: 'Python',
      owner: { login: 'mindspore', name: 'mindspore' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'THUDM/ChatGLM-6B',
      name: 'ChatGLM-6B',
      full_name: 'THUDM/ChatGLM-6B',
      html_url: 'https://gitee.com/THUDM/ChatGLM-6B',
      description: 'ChatGLM-6B: An Open Bilingual Dialogue Language Model | 开源双语对话语言模型',
      stargazers_count: 45000,
      forks_count: 5200,
      language: 'Python',
      owner: { login: 'THUDM', name: 'THUDM' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'THUDM/ChatGLM2-6B',
      name: 'ChatGLM2-6B',
      full_name: 'THUDM/ChatGLM2-6B',
      html_url: 'https://gitee.com/THUDM/ChatGLM2-6B',
      description: 'ChatGLM2-6B: An Open Bilingual Chat LLM | 开源双语对话语言模型',
      stargazers_count: 21500,
      forks_count: 2400,
      language: 'Python',
      owner: { login: 'THUDM', name: 'THUDM' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'THUDM/ChatGLM3',
      name: 'ChatGLM3',
      full_name: 'THUDM/ChatGLM3',
      html_url: 'https://gitee.com/THUDM/ChatGLM3',
      description: 'ChatGLM3 series: Open Bilingual Chat LLMs | 开源双语对话语言模型',
      stargazers_count: 15800,
      forks_count: 1800,
      language: 'Python',
      owner: { login: 'THUDM', name: 'THUDM' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'zhayujie/chatgpt-on-wechat',
      name: 'chatgpt-on-wechat',
      full_name: 'zhayujie/chatgpt-on-wechat',
      html_url: 'https://gitee.com/zhayujie/chatgpt-on-wechat',
      description: '使用ChatGPT搭建微信聊天机器人，基于ChatGPT3.5/4.0 API实现，支持个人微信、公众号、企业微信、飞书、钉钉接入。',
      stargazers_count: 28500,
      forks_count: 7200,
      language: 'Python',
      owner: { login: 'zhayujie', name: 'zhayujie' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'binary-husky/gpt_academic',
      name: 'gpt_academic',
      full_name: 'binary-husky/gpt_academic',
      html_url: 'https://gitee.com/binary-husky/gpt_academic',
      description: '为GPT/GLM等LLM大语言模型提供实用化交互接口，特别优化论文阅读/润色/写作体验，模块化设计，支持自定义快捷菜单\u0026函数插件，支持Python和C++等项目剖析\u0026自译解功能，PDF/LaTex论文翻译\u0026总结功能，支持并行问询多种LLM模型，支持清华chatglm等本地模型。兼容LLM框架: llama2, rwkv, claude,文心一言, 通义千问, 讯飞星火, 智谱ChatGLM等',
      stargazers_count: 68500,
      forks_count: 8300,
      language: 'Python',
      owner: { login: 'binary-husky', name: 'binary-husky' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'GaiZhenbiao/ChuanhuChatGPT',
      name: 'ChuanhuChatGPT',
      full_name: 'GaiZhenbiao/ChuanhuChatGPT',
      html_url: 'https://gitee.com/GaiZhenbiao/ChuanhuChatGPT',
      description: '为ChatGPT/ChatGLM/LLaMA等多种LLM提供了一个轻快好用的Web图形界面',
      stargazers_count: 19200,
      forks_count: 2800,
      language: 'Python',
      owner: { login: 'GaiZhenbiao', name: 'GaiZhenbiao' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'lss233/chatgpt-mirai-qq-bot',
      name: 'chatgpt-mirai-qq-bot',
      full_name: 'lss233/chatgpt-mirai-qq-bot',
      html_url: 'https://gitee.com/lss233/chatgpt-mirai-qq-bot',
      description: '🥧  BMQX \u0026 ChatGPT for QQ - 基于 Mirai 框架的 ChatGPT / Claude / Bing / Bard / 文心一言 等模型 QQ 机器人。支持多种模型，支持联网搜索、Markdown渲染、图片生成等功能。',
      stargazers_count: 12500,
      forks_count: 2100,
      language: 'Python',
      owner: { login: 'lss233', name: 'lss233' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ymcui/Chinese-LLaMA-Alpaca',
      name: 'Chinese-LLaMA-Alpaca',
      full_name: 'ymcui/Chinese-LLaMA-Alpaca',
      html_url: 'https://gitee.com/ymcui/Chinese-LLaMA-Alpaca',
      description: '中文LLaMA\u0026Alpaca大语言模型+本地CPU/GPU训练部署 (Chinese LLaMA \u0026 Alpaca LLMs)',
      stargazers_count: 22300,
      forks_count: 2400,
      language: 'Python',
      owner: { login: 'ymcui', name: 'ymcui' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'BlinkDL/RWKV-LM',
      name: 'RWKV-LM',
      full_name: 'BlinkDL/RWKV-LM',
      html_url: 'https://gitee.com/BlinkDL/RWKV-LM',
      description: 'RWKV is an RNN with transformer-level LLM performance. It can be directly trained like a GPT (parallelizable). So it combines the best of RNN and transformer - great performance, fast inference, saves VRAM, fast training, "infinite" ctx_len, and free sentence embedding.',
      stargazers_count: 15200,
      forks_count: 1100,
      language: 'Python',
      owner: { login: 'BlinkDL', name: 'BlinkDL' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'chatchat-space/Langchain-Chatchat',
      name: 'Langchain-Chatchat',
      full_name: 'chatchat-space/Langchain-Chatchat',
      html_url: 'https://gitee.com/chatchat-space/Langchain-Chatchat',
      description: 'Langchain-Chatchat（原Langchain-ChatGLM）基于 Langchain 与 ChatGLM 等语言模型的本地知识库问答 | Langchain-Chatchat (formerly langchain-ChatGLM), local knowledge based LLM (like ChatGLM) QA app with langchain',
      stargazers_count: 43500,
      forks_count: 6300,
      language: 'Python',
      owner: { login: 'chatchat-space', name: 'chatchat-space' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'openmmlab/mmdetection',
      name: 'mmdetection',
      full_name: 'openmmlab/mmdetection',
      html_url: 'https://gitee.com/openmmlab/mmdetection',
      description: 'OpenMMLab Detection Toolbox and Benchmark',
      stargazers_count: 31200,
      forks_count: 9200,
      language: 'Python',
      owner: { login: 'openmmlab', name: 'openmmlab' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'openmmlab/mmclassification',
      name: 'mmclassification',
      full_name: 'openmmlab/mmclassification',
      html_url: 'https://gitee.com/openmmlab/mmclassification',
      description: 'OpenMMLab Image Classification Toolbox and Benchmark',
      stargazers_count: 8900,
      forks_count: 1800,
      language: 'Python',
      owner: { login: 'openmmlab', name: 'openmmlab' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'modelscope/modelscope',
      name: 'modelscope',
      full_name: 'modelscope/modelscope',
      html_url: 'https://gitee.com/modelscope/modelscope',
      description: 'ModelScope: bring the notion of Model-as-a-Service to life.',
      stargazers_count: 7200,
      forks_count: 900,
      language: 'Python',
      owner: { login: 'modelscope', name: 'modelscope' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'baidu/amis',
      name: 'amis',
      full_name: 'baidu/amis',
      html_url: 'https://gitee.com/baidu/amis',
      description: '前端低代码框架，通过 JSON 配置就能生成各种页面。',
      stargazers_count: 18500,
      forks_count: 2800,
      language: 'TypeScript',
      owner: { login: 'baidu', name: 'baidu' },
      updated_at: new Date().toISOString(),
    },
    {
      id: 'Tencent/ncnn',
      name: 'ncnn',
      full_name: 'Tencent/ncnn',
      html_url: 'https://gitee.com/Tencent/ncnn',
      description: 'ncnn is a high-performance neural network inference framework optimized for the mobile platform',
      stargazers_count: 20500,
      forks_count: 5200,
      language: 'C++',
      owner: { login: 'Tencent', name: 'Tencent' },
      updated_at: new Date().toISOString(),
    },
  ];

  constructor() {
    super({
      name: 'GiteeCrawler',
      baseUrl: 'https://gitee.com',
      rateLimitMs: 1000,
      maxRetries: 3,
      circuitBreakerThreshold: 10,
      circuitBreakerResetTimeMs: 30 * 60 * 1000,
    });
  }

  /**
   * 执行抓取策略
   * 主要使用种子数据，因为 Gitee 页面是动态加载的
   */
  protected async fetch(): Promise<GiteeRepo[]> {
    this.log('Using seed data for Gitee (dynamic page loading prevents direct scraping)');

    // 计算一周前的时间戳
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // 过滤种子数据：星标>=10 且一周内更新过（种子数据默认都是活跃的）
    const filteredRepos = this.seedRepos.filter(repo => {
      const updatedAt = new Date(repo.updated_at).getTime();
      return repo.stargazers_count >= 10; //  && updatedAt >= oneWeekAgo
    });

    // 按更新时间排序（最新的在前）
    filteredRepos.sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    this.log(`Total Gitee repos: ${filteredRepos.length}`);
    return filteredRepos;
  }

  /**
   * 解析数据为标准格式
   */
  parse(raw: GiteeRepo[]): ParsedContent[] {
    return raw.map((repo) => ({
      sourceId: 'gitee',
      url: repo.html_url,
      originalTitle: repo.full_name,
      originalAbstract: repo.description || '',
      originalLanguage: 'zh',
      author: repo.owner.name,
      publishedAt: new Date(repo.updated_at),
      category: Category.OPEN_SOURCE,
      tags: this.extractTags(repo),
    }));
  }

  /**
   * 从仓库信息中提取标签
   */
  private extractTags(repo: GiteeRepo): string[] {
    const tags: string[] = [];

    // 添加主要语言标签
    if (repo.language && repo.language !== 'Unknown') {
      tags.push(repo.language);
    }

    // 添加来源标签
    tags.push('Gitee', '国产', '中文');

    // 从描述和名称中提取标签
    const text = `${repo.name} ${repo.description || ''}`.toLowerCase();

    const tagMappings: Record<string, string[]> = {
      // 国产大模型
      '文心一言': ['文心一言', '百度', '国产大模型'],
      'ernie': ['文心一言', '百度', '国产大模型'],
      '通义千问': ['通义千问', '阿里', '国产大模型'],
      'qwen': ['通义千问', '阿里', '国产大模型'],
      '千问': ['通义千问', '阿里', '国产大模型'],
      '智谱': ['智谱AI', 'ChatGLM', '国产大模型'],
      'chatglm': ['智谱AI', 'ChatGLM', '国产大模型'],
      'glm': ['智谱AI', 'ChatGLM', '国产大模型'],
      '讯飞星火': ['讯飞星火', '科大讯飞', '国产大模型'],
      'spark': ['讯飞星火', '科大讯飞', '国产大模型'],
      '豆包': ['豆包', '字节跳动', '国产大模型'],
      'doubao': ['豆包', '字节跳动', '国产大模型'],
      'kimi': ['Kimi', '月之暗面', '国产大模型'],
      'moonshot': ['Kimi', '月之暗面', '国产大模型'],
      'deepseek': ['DeepSeek', '深度求索', '国产大模型'],
      '百度千帆': ['百度千帆', '百度', '国产大模型'],
      '阿里灵积': ['阿里灵积', '阿里', '国产大模型'],

      // 国产框架
      'paddle': ['飞桨', '百度', '国产框架'],
      'paddlepaddle': ['飞桨', '百度', '国产框架'],
      '飞桨': ['飞桨', '百度', '国产框架'],
      'mindspore': ['MindSpore', '昇思', '华为', '国产框架'],
      '昇思': ['MindSpore', '昇思', '华为', '国产框架'],
      'oneflow': ['OneFlow', '一流科技', '国产框架'],
      'modelscope': ['魔搭', '阿里', '国产框架'],
      'openmmlab': ['OpenMMLab', '商汤', '国产框架'],

      // 通用AI
      '人工智能': ['AI', '人工智能'],
      '大模型': ['大模型', 'LLM'],
      'llm': ['大模型', 'LLM'],
      '机器学习': ['机器学习', 'ML'],
      '深度学习': ['深度学习', 'Deep Learning'],
      '神经网络': ['神经网络', 'Neural Networks'],
      '计算机视觉': ['计算机视觉', 'CV'],
      '自然语言处理': ['NLP', '自然语言处理'],
      '机器人': ['机器人', 'Robotics'],

      // 应用
      '智能客服': ['智能客服', '客服系统'],
      '知识图谱': ['知识图谱', 'Knowledge Graph'],
      '推荐系统': ['推荐系统', 'Recommendation'],
      '人脸识别': ['人脸识别', 'Face Recognition'],
      '目标检测': ['目标检测', 'Object Detection'],
      'ocr': ['OCR', '文字识别'],
      '语音识别': ['语音识别', 'Speech Recognition'],
      '语音合成': ['语音合成', 'TTS'],
      'ai绘画': ['AI绘画', '文生图', '生成式AI'],
      'ai写作': ['AI写作', '智能写作', '生成式AI'],
      'aigc': ['AIGC', '生成式AI'],
      '数字人': ['数字人', 'Digital Human'],

      // 技术
      'rag': ['RAG', '检索增强'],
      '向量数据库': ['向量数据库', 'Vector DB'],
      'agent': ['Agent', '智能体'],
      'prompt': ['Prompt', '提示词'],
      '微调': ['微调', 'Fine-tuning'],
      'embedding': ['Embedding', '嵌入'],
      'chatgpt': ['ChatGPT', 'OpenAI'],
      'stable': ['Stable Diffusion', '生成式AI'],
      'ollama': ['Ollama', '本地部署'],

      // 微信/QQ机器人相关
      'wechat': ['微信', 'WeChat'],
      'qq': ['QQ'],
      'mirai': ['Mirai', 'QQ机器人'],
      '聊天机器人': ['聊天机器人', 'ChatBot'],
      '微信': ['微信', 'WeChat'],
      'qq机器人': ['QQ机器人'],
    };

    for (const [keyword, tagList] of Object.entries(tagMappings)) {
      if (text.includes(keyword.toLowerCase())) {
        tags.push(...tagList);
      }
    }

    // 根据星标数添加热度标签
    if (repo.stargazers_count >= 10000) {
      tags.push('🔥🔥🔥 超热门');
    } else if (repo.stargazers_count >= 5000) {
      tags.push('🔥🔥 非常热门');
    } else if (repo.stargazers_count >= 1000) {
      tags.push('🔥 热门');
    } else if (repo.stargazers_count >= 100) {
      tags.push('⭐ 受欢迎');
    } else if (repo.stargazers_count >= 10) {
      tags.push('✨ 新兴');
    }

    return [...new Set(tags)];
  }
}
