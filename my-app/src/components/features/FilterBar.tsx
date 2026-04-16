"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Filter,
  ChevronDown,
  Clock,
  Tag,
  Database,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

const getCategories = (t: (key: string) => string | object) => [
  { id: "all", label: t("categories.all") as string },
  { id: "llm", label: t("categories.llm") as string },
  { id: "vision", label: t("categories.vision") as string },
  { id: "robotics", label: t("categories.robotics") as string },
  { id: "nlp", label: t("categories.nlp") as string },
  { id: "ml", label: t("categories.ml") as string },
  { id: "multimodal", label: t("categories.multimodal") as string },
];

const sources = [
  { id: "all", labelKey: "sources.all" },
  { id: "arxiv", labelKey: "sources.arxiv", color: "#22c55e" },
  { id: "github", labelKey: "sources.github", color: "#a855f7" },
  { id: "ieee", labelKey: "sources.ieee", color: "#3b82f6" },
  { id: "science", labelKey: "sources.science", color: "#eab308" },
];

const timeRanges = [
  { id: "today", labelKey: "filter.timeRange.today" },
  { id: "week", labelKey: "filter.timeRange.week" },
];

interface FilterBarProps {
  selectedCategory?: string;
  selectedSource?: string;
  selectedTimeRange?: string;
  onCategoryChange?: (category: string) => void;
  onSourceChange?: (source: string) => void;
  onTimeRangeChange?: (timeRange: string) => void;
}

export function FilterBar({
  selectedCategory: externalCategory,
  selectedSource: externalSource,
  selectedTimeRange: externalTimeRange,
  onCategoryChange,
  onSourceChange,
  onTimeRangeChange,
}: FilterBarProps = {}) {
  const { t } = useLanguage();
  const categories = getCategories(t);
  const [selectedCategory, setSelectedCategory] = useState(externalCategory || "all");
  const [selectedSource, setSelectedSource] = useState(externalSource || "all");
  const [selectedTimeRange, setSelectedTimeRange] = useState(externalTimeRange || "week");

  // 同步外部状态
  useEffect(() => {
    if (externalCategory !== undefined) setSelectedCategory(externalCategory);
  }, [externalCategory]);

  useEffect(() => {
    if (externalSource !== undefined) setSelectedSource(externalSource);
  }, [externalSource]);

  useEffect(() => {
    if (externalTimeRange !== undefined) setSelectedTimeRange(externalTimeRange);
  }, [externalTimeRange]);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedSource !== "all" ||
    selectedTimeRange !== "week";

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange?.(category);
  };

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    onSourceChange?.(source);
  };

  const handleTimeRangeChange = (timeRange: string) => {
    setSelectedTimeRange(timeRange);
    onTimeRangeChange?.(timeRange);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedSource("all");
    setSelectedTimeRange("week");
    onCategoryChange?.("all");
    onSourceChange?.("all");
    onTimeRangeChange?.("week");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-16 z-40 py-4 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-[var(--border-secondary)]"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] mr-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">{t("filter.title") as string}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={`inline-flex items-center justify-center h-9 gap-2 px-3 text-sm font-medium rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-secondary)] ${
                selectedCategory !== "all"
                  ? "text-[var(--accent-orange)] border-[var(--accent-orange)]/50"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>
                {categories.find((c) => c.id === selectedCategory)?.label}
              </span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="bg-[var(--bg-secondary)] border-[var(--border-secondary)]"
            >
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`cursor-pointer ${
                    selectedCategory === category.id
                      ? "text-[var(--accent-orange)]"
                      : "text-[var(--text-secondary)]"
                  } hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]`}
                >
                  {category.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={`inline-flex items-center justify-center h-9 gap-2 px-3 text-sm font-medium rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-secondary)] ${
                selectedSource !== "all"
                  ? "text-[var(--accent-orange)] border-[var(--accent-orange)]/50"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <Database className="h-4 w-4" />
              <span>
                {t(sources.find((s) => s.id === selectedSource)?.labelKey || "") as string}
              </span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="bg-[var(--bg-secondary)] border-[var(--border-secondary)]"
            >
              {sources.map((source) => (
                <DropdownMenuItem
                  key={source.id}
                  onClick={() => handleSourceChange(source.id)}
                  className={`cursor-pointer flex items-center gap-2 ${
                    selectedSource === source.id
                      ? "text-[var(--accent-orange)]"
                      : "text-[var(--text-secondary)]"
                  } hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]`}
                >
                  {source.id !== "all" && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                  )}
                  {t(source.labelKey) as string}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
            <Clock className="h-4 w-4 text-[var(--text-tertiary)] ml-2" />
            {timeRanges.map((range) => (
              <Button
                key={range.id}
                variant="ghost"
                size="sm"
                onClick={() => handleTimeRangeChange(range.id)}
                className={`h-7 px-3 text-xs ${
                  selectedTimeRange === range.id
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t(range.labelKey) as string}
              </Button>
            ))}
          </div>

          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 gap-1 text-[var(--text-tertiary)] hover:text-[var(--accent-red)]"
              >
                <X className="h-4 w-4" />
                {t("filter.clear") as string}
              </Button>
            </motion.div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {selectedCategory !== "all" && (
              <Badge
                variant="secondary"
                className="bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] border-0"
              >
                {categories.find((c) => c.id === selectedCategory)?.label}
              </Badge>
            )}
            {selectedSource !== "all" && (
              <Badge
                variant="secondary"
                className="bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-0"
              >
                {t(sources.find((s) => s.id === selectedSource)?.labelKey || "") as string}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
