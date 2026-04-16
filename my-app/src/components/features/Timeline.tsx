"use client";

import { motion } from "framer-motion";
import { Rocket, Brain, Cpu, Globe, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface TimelineEvent {
  id: string;
  date: string;
  dateEn: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: React.ElementType;
  color: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    id: "1",
    date: "2026年1月",
    dateEn: "Jan 2026",
    title: "GPT-5 发布",
    titleEn: "GPT-5 Released",
    description: "OpenAI 发布 GPT-5，在推理能力和多模态理解上实现重大突破",
    descriptionEn: "OpenAI releases GPT-5 with breakthrough improvements in reasoning and multimodal understanding",
    icon: Brain,
    color: "#22c55e",
  },
  {
    id: "2",
    date: "2026年2月",
    dateEn: "Feb 2026",
    title: "Claude 4 系列亮相",
    titleEn: "Claude 4 Series Debut",
    description: "Anthropic 推出 Claude 4，在代码生成和数学推理方面达到新高度",
    descriptionEn: "Anthropic launches Claude 4, reaching new heights in code generation and mathematical reasoning",
    icon: Sparkles,
    color: "#a855f7",
  },
  {
    id: "3",
    date: "2026年3月",
    dateEn: "Mar 2026",
    title: "Sora 2.0 视频生成",
    titleEn: "Sora 2.0 Video Generation",
    description: "OpenAI 发布 Sora 2.0，支持 4K 长视频生成和实时编辑",
    descriptionEn: "OpenAI releases Sora 2.0 supporting 4K long-form video generation and real-time editing",
    icon: Rocket,
    color: "#3b82f6",
  },
  {
    id: "4",
    date: "2026年4月",
    dateEn: "Apr 2026",
    title: "Tesla Optimus Gen 3",
    titleEn: "Tesla Optimus Gen 3",
    description: "特斯拉发布 Optimus Gen 3，人形机器人实现工厂量产",
    descriptionEn: "Tesla releases Optimus Gen 3 humanoid robot with factory-scale production",
    icon: Cpu,
    color: "#eab308",
  },
  {
    id: "5",
    date: "2026年4月",
    dateEn: "Apr 2026",
    title: "Gemini 3.0 发布",
    titleEn: "Gemini 3.0 Released",
    description: "Google 发布 Gemini 3.0，原生多模态和工具使用能力大幅提升",
    descriptionEn: "Google releases Gemini 3.0 with significantly enhanced native multimodal and tool-use capabilities",
    icon: Globe,
    color: "#f97316",
  },
];

export function Timeline() {
  const { t, language } = useLanguage();
  const isEn = language === "en";

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3">
            {t("timeline.title") as string}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {t("timeline.subtitle") as string}
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-[var(--border-secondary)] sm:-translate-x-1/2" />

          {/* Timeline Events */}
          <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-start gap-4 sm:gap-8 ${
                  index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: event.color,
                  }}
                >
                  <event.icon className="h-5 w-5" style={{ color: event.color }} />
                </motion.div>

                {/* Content */}
                <div
                  className={`flex-1 pt-1 ${
                    index % 2 === 0 ? "sm:text-right sm:pr-8" : "sm:text-left sm:pl-8"
                  }`}
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="inline-block"
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: event.color }}
                    >
                      {isEn ? event.dateEn : event.date}
                    </span>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-1">
                      {isEn ? event.titleEn : event.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-sm">
                      {isEn ? event.descriptionEn : event.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
