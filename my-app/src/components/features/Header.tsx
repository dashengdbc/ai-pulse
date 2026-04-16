"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cpu, Globe, Moon, Sun, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

const languages = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
];

export function Header() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const isDark = theme === "dark";
  const currentLang = language;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[var(--border-secondary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-red)]">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {t("header.title") as string}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              {t("header.subtitle") as string}
            </span>
          </div>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center h-8 gap-2 px-3 text-sm font-medium rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {languages.find((l) => l.code === currentLang)?.label}
              </span>
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[120px] bg-[var(--bg-secondary)] border-[var(--border-secondary)]"
            >
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as "zh" | "en")}
                  className={`cursor-pointer ${
                    currentLang === lang.code
                      ? "text-[var(--accent-orange)]"
                      : "text-[var(--text-secondary)]"
                  } hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]`}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Real-time Clock */}
          <motion.div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-secondary)]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="h-2 w-2 rounded-full bg-[var(--accent-red)] animate-pulse" />
            <span className="text-sm font-mono text-[var(--text-secondary)]">
              {currentTime}
            </span>
          </motion.div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <Sun className={`h-4 w-4 ${isDark ? 'text-[var(--text-tertiary)]' : 'text-[var(--accent-orange)]'}`} />
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
              size="sm"
            />
            <Moon className={`h-4 w-4 ${isDark ? 'text-[var(--accent-orange)]' : 'text-[var(--text-tertiary)]'}`} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
