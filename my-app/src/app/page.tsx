"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/features/Header";
import { Hero } from "@/components/features/Hero";
import { StatsDashboard } from "@/components/features/StatsDashboard";
import { ContentCard } from "@/components/features/ContentCard";
import { Timeline } from "@/components/features/Timeline";
import { FilterBar } from "@/components/features/FilterBar";
import { SkeletonCard } from "@/components/features/SkeletonCard";
import { useLanguage } from "@/components/providers/LanguageProvider";

// 内容类型定义
interface Content {
  id: string;
  sourceId: string;
  originalTitle: string;
  translatedTitle?: string;
  originalAbstract?: string;
  translatedAbstract?: string;
  author?: string;
  publishedAt: string;
  category: string;
  tags: string[];
  isBreakthrough: boolean;
  url: string;
}

// 真实API数据获取
const fetchContents = async (page: number, category: string, source: string, timeRange: string) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: '12',
    category: category === 'all' ? '' : category,
    source: source === 'all' ? '' : source,
    timeRange,
  });

  const res = await fetch(`/api/contents?${params}`);
  if (!res.ok) {
    throw new Error('Failed to fetch contents');
  }
  return res.json();
};

export default function Home() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("week");
  const [allContents, setAllContents] = useState<Content[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 初始加载
  const { isLoading, isError } = useQuery({
    queryKey: ["contents", selectedCategory, selectedSource, selectedTimeRange],
    queryFn: async () => {
      const data = await fetchContents(1, selectedCategory, selectedSource, selectedTimeRange);
      setAllContents(data.contents);
      setHasMore(data.hasMore);
      setPage(1);
      return data;
    },
  });

  // 加载更多
  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchContents(nextPage, selectedCategory, selectedSource, selectedTimeRange);
      setAllContents(prev => [...prev, ...data.contents]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 处理筛选变化
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
  };

  const handleTimeRangeChange = (timeRange: string) => {
    setSelectedTimeRange(timeRange);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />

      <main className="pt-16">
        <Hero />

        <StatsDashboard />

        <FilterBar
          selectedCategory={selectedCategory}
          selectedSource={selectedSource}
          selectedTimeRange={selectedTimeRange}
          onCategoryChange={handleCategoryChange}
          onSourceChange={handleSourceChange}
          onTimeRangeChange={handleTimeRangeChange}
        />

        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {t("content.latest") as string}
              </h2>
              <p className="text-[var(--text-secondary)]">
                {t("content.subtitle") as string}
              </p>
            </motion.div>

            {isLoading ? (
              // 加载骨架屏
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : isError ? (
              // 错误状态
              <div className="text-center py-20">
                <p className="text-[var(--text-secondary)]">{t("content.error") as string}</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-2">
                  请确保已启动数据库和爬虫服务
                </p>
              </div>
            ) : allContents.length === 0 ? (
              // 空状态
              <div className="text-center py-20">
                <p className="text-[var(--text-secondary)]">{t("content.empty") as string}</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-2">
                  数据正在抓取中，请稍后再试
                </p>
              </div>
            ) : (
              // 内容列表
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {allContents.map((content, index) => (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        layout
                      >
                        <ContentCard
                          id={content.id}
                          title={content.translatedTitle || content.originalTitle}
                          originalTitle={content.originalTitle}
                          summary={content.translatedAbstract || content.originalAbstract}
                          originalSummary={content.originalAbstract}
                          source={content.sourceId as "arxiv" | "github" | "ieee" | "science" | "huggingface"}
                          category={content.category}
                          publishedAt={content.publishedAt}
                          author={content.author}
                          isBreakthrough={content.isBreakthrough}
                          url={content.url}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* 加载更多按钮 */}
                {(hasMore || isLoadingMore) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-12 text-center"
                  >
                    <button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="px-8 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-orange)]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingMore ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {t("content.loading") as string}
                        </span>
                      ) : (
                        t("content.loadMore") as string
                      )}
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>

        <Timeline />

        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-secondary)]">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-red)]">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-bold text-[var(--text-primary)]">AI Pulse</span>
                  <p className="text-xs text-[var(--text-tertiary)]">追踪 AI 与机器人前沿</p>
                </div>
              </div>

              <p className="text-sm text-[var(--text-tertiary)]">
                {t("footer.copyright") as string}
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
