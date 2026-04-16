"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileText, GitBranch, Trophy, TrendingUp } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay: number;
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color, delay }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-secondary)] p-6 transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]"
      >
        {/* Glow Effect */}
        <div
          className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
          style={{ background: `radial-gradient(circle at center, ${color}20, transparent 70%)` }}
        />
        
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm text-[var(--text-tertiary)] mb-1">{label}</p>
            <p className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              <AnimatedCounter value={value} suffix={suffix} />
            </p>
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
        
        {/* Trend Indicator */}
        <div className="relative mt-4 flex items-center gap-1 text-sm">
          <TrendingUp className="h-4 w-4 text-[var(--source-arxiv)]" />
          <span className="text-[var(--source-arxiv)]">+12.5%</span>
          <span className="text-[var(--text-tertiary)]">较上周</span>
        </div>
      </div>
    </motion.div>
  );
}

export function StatsDashboard() {
  const stats = [
    {
      icon: FileText,
      label: "本周新论文",
      value: 2847,
      color: "#22c55e",
    },
    {
      icon: GitBranch,
      label: "开源项目更新",
      value: 156,
      color: "#a855f7",
    },
    {
      icon: Trophy,
      label: "突破性成果",
      value: 23,
      color: "#eab308",
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            数据概览
          </h2>
          <p className="text-[var(--text-secondary)]">
            实时追踪全球 AI 与机器人领域最新动态
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              {...stat}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
