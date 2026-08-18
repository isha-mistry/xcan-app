"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

const ACCENTS = {
  blue: {
    panel:
      "from-blue-500/[0.08] via-transparent to-purple-500/[0.06]",
    orbA: "bg-blue-500/10",
    orbB: "bg-purple-500/10",
  },
  purple: {
    panel:
      "from-purple-500/[0.08] via-transparent to-blue-500/[0.06]",
    orbA: "bg-purple-500/10",
    orbB: "bg-cyan-500/10",
  },
  amber: {
    panel:
      "from-amber-500/[0.07] via-transparent to-orange-500/[0.05]",
    orbA: "bg-amber-400/10",
    orbB: "bg-yellow-500/10",
  },
  green: {
    panel:
      "from-emerald-500/[0.08] via-transparent to-cyan-500/[0.05]",
    orbA: "bg-emerald-500/10",
    orbB: "bg-teal-500/10",
  },
  yellow: {
    panel:
      "from-yellow-500/[0.06] via-transparent to-blue-500/[0.07]",
    orbA: "bg-yellow-400/10",
    orbB: "bg-blue-500/10",
  },
} as const;

export type PageHeroAccent = keyof typeof ACCENTS;

export function PageHero({
  badge,
  BadgeIcon,
  title,
  description,
  meta,
  stats,
  actions,
  accent = "blue",
  children,
  className = "",
}: {
  badge?: string;
  BadgeIcon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  stats?: React.ReactNode;
  actions?: React.ReactNode;
  accent?: PageHeroAccent;
  children?: React.ReactNode;
  className?: string;
}) {
  const theme = ACCENTS[accent] ?? ACCENTS.blue;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative mb-10 overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br ${theme.panel} p-6 sm:p-8 ${className}`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full ${theme.orbA} blur-3xl`}
      />
      <div
        className={`pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full ${theme.orbB} blur-3xl`}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl min-w-0">
          {badge && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 font-robotoMono">
              {BadgeIcon && <BadgeIcon className="h-3 w-3 text-yellow-400/80" />}
              {badge}
            </div>
          )}
          <h1 className="mb-2 text-2xl font-black tracking-tight text-white font-unbounded sm:text-3xl">
            {title}
          </h1>
          {description && (
            <div className="text-xs leading-relaxed text-white/55 font-robotoMono sm:text-sm">
              {description}
            </div>
          )}
          {meta && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-white/50 font-robotoMono">
              {meta}
            </div>
          )}
          {actions && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>

        {stats && (
          <div className="flex flex-wrap gap-3 lg:justify-end">{stats}</div>
        )}
      </div>

      {children && <div className="relative mt-6">{children}</div>}
    </motion.section>
  );
}
