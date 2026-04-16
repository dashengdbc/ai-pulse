"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Heart,
  Share2,
  ExternalLink,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type SourceType = "arxiv" | "github" | "ieee" | "science" | "huggingface";

interface ContentCardProps {
  id: string;
  title: string;
  originalTitle?: string;
  summary?: string;
  originalSummary?: string;
  source: SourceType;
  category: string;
  publishedAt: string;
  author?: string;
  isBreakthrough?: boolean;
  url?: string;
}

const sourceConfig: Record<
  SourceType,
  { label: string; color: string; bgClass: string }
> = {
  arxiv: {
    label: "arXiv",
    color: "#22c55e",
    bgClass: "bg-source-arxiv",
  },
  github: {
    label: "GitHub",
    color: "#a855f7",
    bgClass: "bg-source-github",
  },
  ieee: {
    label: "IEEE",
    color: "#3b82f6",
    bgClass: "bg-source-ieee",
  },
  science: {
    label: "Science",
    color: "#eab308",
    bgClass: "bg-source-science",
  },
  huggingface: {
    label: "Hugging Face",
    color: "#f97316",
    bgClass: "bg-source-huggingface",
  },
};

// 格式化发布时间
function formatPublishedAt(dateString: string, t: (key: string) => string | object): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return t("content.justNow") as string;
  if (diffMins < 60) return `${diffMins}${t("content.minutesAgo")}`;
  if (diffHours < 24) return `${diffHours}${t("content.hoursAgo")}`;
  if (diffDays < 7) return `${diffDays}${t("content.daysAgo")}`;
  return date.toLocaleDateString("zh-CN");
}

export function ContentCard({
  id,
  title,
  originalTitle,
  summary,
  originalSummary,
  source,
  category,
  publishedAt,
  author,
  isBreakthrough = false,
  url,
}: ContentCardProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTranslated, setShowTranslated] = useState(true); // 默认显示翻译
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const sourceInfo = sourceConfig[source];

  // 决定显示什么内容
  const displayTitle = showTranslated && title ? title : (originalTitle || title);
  const displaySummary = showTranslated && summary ? summary : (originalSummary || summary);
  const hasTranslation = !!(title && originalTitle && title !== originalTitle);

  // 处理分享
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/content/${id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
    >
      <Card
        className={`group relative overflow-hidden bg-[var(--bg-secondary)] border-[var(--border-secondary)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] ${
          isBreakthrough ? "breakthrough-glow" : ""
        }`}
      >
        {/* Breakthrough Badge */}
        {isBreakthrough && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 z-10"
          >
            <Badge
              variant="destructive"
              className="flex items-center gap-1 bg-[var(--accent-red)]/20 text-[var(--accent-red)] border-[var(--accent-red)]/30"
            >
              <Sparkles className="h-3 w-3" />
              {t("content.breakthrough") as string}
            </Badge>
          </motion.div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Source Badge */}
            <Badge
              variant="secondary"
              className={`${sourceInfo.bgClass} border-0 shrink-0`}
            >
              {sourceInfo.label}
            </Badge>

            {/* Category */}
            <Badge
              variant="outline"
              className="text-[var(--text-tertiary)] border-[var(--border-secondary)]"
            >
              {category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Title */}
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 line-clamp-2 group-hover:text-[var(--accent-orange)] transition-colors">
            {displayTitle}
          </h3>

          {/* Summary */}
          {displaySummary && (
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={showTranslated ? "translated" : "original"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`text-sm text-[var(--text-secondary)] leading-relaxed ${
                    !isExpanded ? "line-clamp-3" : ""
                  }`}
                >
                  {displaySummary}
                </motion.p>
              </AnimatePresence>
            </div>
          )}

          {/* Expand/Collapse Button */}
          {displaySummary && displaySummary.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 h-8 px-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  {t("content.collapse") as string}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  {t("content.expand") as string}
                </>
              )}
            </Button>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatPublishedAt(publishedAt, t)}</span>
            </div>
            {author && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{author}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-secondary)]">
            <div className="flex items-center gap-2">
              {/* Translation Toggle */}
              {hasTranslation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranslated(!showTranslated)}
                  className={`h-8 px-3 text-xs ${
                    showTranslated
                      ? "text-[var(--accent-orange)] bg-[var(--accent-orange)]/10"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {showTranslated ? (t("content.original") as string) : (t("content.translated") as string)}
                </Button>
              )}

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorited(!isFavorited)}
                className={`h-8 w-8 ${
                  isFavorited
                    ? "text-[var(--accent-red)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`}
                />
              </Button>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className={`h-8 w-8 transition-colors ${
                  isCopied
                    ? "text-[var(--accent-green)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isCopied ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* External Link */}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent-orange)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                {t("content.view") as string}
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
