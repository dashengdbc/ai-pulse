"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "zh" | "en";

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  zh: {
    header: {
      title: "AI Pulse",
      subtitle: "AI与机器人前沿追踪",
    },
    hero: {
      title: "探索 AI 与机器人的",
      titleHighlight: "最前沿",
      subtitle: "实时聚合全球顶尖科研成果，让每一次技术突破触手可及",
      stats: {
        papers: "今日论文",
        repos: "开源项目",
        breakthroughs: "突破性成果",
      },
    },
    filter: {
      title: "筛选",
      category: "分类",
      source: "来源",
      timeRange: {
        today: "今日",
        week: "本周",
        month: "本月",
        year: "今年",
      },
      clear: "清除筛选",
    },
    categories: {
      all: "全部",
      llm: "大语言模型",
      vision: "计算机视觉",
      robotics: "机器人",
      nlp: "自然语言处理",
      ml: "机器学习",
      multimodal: "多模态",
    },
    sources: {
      all: "全部来源",
      arxiv: "arXiv",
      github: "GitHub",
      ieee: "IEEE",
      science: "Science",
    },
    content: {
      latest: "最新动态",
      subtitle: "来自全球顶级来源的最新研究成果",
      empty: "暂无内容",
      error: "加载失败，请稍后重试",
      loadMore: "加载更多",
      loading: "加载中...",
      breakthrough: "突破性成果",
      translated: "翻译",
      original: "原文",
      collapse: "收起",
      expand: "展开",
      view: "查看",
      justNow: "刚刚",
      minutesAgo: "分钟前",
      hoursAgo: "小时前",
      daysAgo: "天前",
    },
    timeline: {
      title: "突破性成果时间线",
      subtitle: "追踪改变游戏规则的里程碑式研究",
    },
    footer: {
      copyright: "© 2024 AI Pulse. All rights reserved.",
    },
  },
  en: {
    header: {
      title: "AI Pulse",
      subtitle: "AI & Robotics Tracker",
    },
    hero: {
      title: "Explore the",
      titleHighlight: "Cutting Edge",
      titleEnd: "of AI & Robotics",
      subtitle: "Real-time aggregation of top global research, making every breakthrough accessible",
      stats: {
        papers: "Today's Papers",
        repos: "Open Source",
        breakthroughs: "Breakthroughs",
      },
    },
    filter: {
      title: "Filter",
      category: "Category",
      source: "Source",
      timeRange: {
        today: "Today",
        week: "This Week",
        month: "This Month",
        year: "This Year",
      },
      clear: "Clear Filters",
    },
    categories: {
      all: "All",
      llm: "Large Language Models",
      vision: "Computer Vision",
      robotics: "Robotics",
      nlp: "Natural Language Processing",
      ml: "Machine Learning",
      multimodal: "Multimodal",
    },
    sources: {
      all: "All Sources",
      arxiv: "arXiv",
      github: "GitHub",
      ieee: "IEEE",
      science: "Science",
    },
    content: {
      latest: "Latest Updates",
      subtitle: "Latest research from top global sources",
      empty: "No content available",
      error: "Failed to load, please try again later",
      loadMore: "Load More",
      loading: "Loading...",
      breakthrough: "Breakthrough",
      translated: "Translated",
      original: "Original",
      collapse: "Collapse",
      expand: "Expand",
      view: "View",
      justNow: "Just now",
      minutesAgo: "minutes ago",
      hoursAgo: "hours ago",
      daysAgo: "days ago",
    },
    timeline: {
      title: "Breakthrough Timeline",
      subtitle: "Tracking game-changing milestone research",
    },
    footer: {
      copyright: "© 2024 AI Pulse. All rights reserved.",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string | Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("language") as Language | null;
    if (savedLang && (savedLang === "zh" || savedLang === "en")) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("language", language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string | Translations => {
    const keys = key.split(".");
    let value: Translations | string = translations[language];

    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
