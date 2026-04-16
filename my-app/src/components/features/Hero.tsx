"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, TrendingUp } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function Hero() {
  const { t, language } = useLanguage();
  const isEn = language === "en";

  const stats = [
    { icon: Zap, labelKey: "hero.stats.papers", value: "127" },
    { icon: TrendingUp, labelKey: "hero.stats.repos", value: "48" },
    { icon: Sparkles, labelKey: "hero.stats.breakthroughs", value: "12" },
  ];

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-1/4 w-96 h-96 bg-[var(--accent-orange)]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-1/4 w-72 h-72 bg-[var(--accent-red)]/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-secondary)] mb-8"
        >
          <Sparkles className="h-4 w-4 text-[var(--accent-orange)]" />
          <span className="text-sm text-[var(--text-secondary)]">
            {isEn
              ? "Real-time tracking of global AI & Robotics frontier"
              : "实时追踪全球 AI 与机器人前沿动态"}
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
        >
          {isEn ? (
            <>
              <span className="text-[var(--text-primary)]">{t("hero.title") as string}</span>
              <span className="text-gradient"> {t("hero.titleHighlight") as string}</span>
              <br className="hidden sm:block" />
              <span className="text-[var(--text-primary)]"> {t("hero.titleEnd") as string}</span>
            </>
          ) : (
            <>
              <span className="text-[var(--text-primary)]">探索</span>
              <span className="text-gradient"> AI </span>
              <span className="text-[var(--text-primary)]">与</span>
              <span className="text-gradient"> 机器人</span>
              <br className="hidden sm:block" />
              <span className="text-[var(--text-primary)]">的无限可能</span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {isEn
            ? "Aggregating top sources like arXiv, GitHub, IEEE, and Science to bring you the latest breakthroughs and open-source projects"
            : "聚合 arXiv、GitHub、IEEE、Science 等顶级来源，为您提供最新科研突破与开源项目动态"}
        </motion.p>

        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-orange)]/10">
                <stat.icon className="h-5 w-5 text-[var(--accent-orange)]" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">
                  {t(stat.labelKey) as string}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
