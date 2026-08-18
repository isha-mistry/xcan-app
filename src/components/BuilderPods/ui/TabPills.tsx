"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export type TabPillItem<T extends string = string> = {
  key: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
};

export function TabPills<T extends string>({
  tabs,
  active,
  onChange,
  variant = "solid",
}: {
  tabs: TabPillItem<T>[];
  active: T;
  onChange: (key: T) => void;
  /** solid = white active (leaderboard); soft = blue active (filters) */
  variant?: "solid" | "soft";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        const solidActive = "bg-white text-black border-transparent";
        const solidIdle =
          "bg-white/[0.03] text-white/70 border-white/5 hover:text-white/90 hover:bg-white/[0.06]";
        const softActive =
          "border-blue-500/30 bg-blue-500/15 text-blue-300";
        const softIdle =
          "border-white/5 bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/70";

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all font-robotoMono ${
              variant === "solid"
                ? isActive
                  ? solidActive
                  : solidIdle
                : isActive
                  ? softActive
                  : softIdle
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {tab.label}
            {tab.count != null && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[8px] ${
                  isActive && variant === "solid"
                    ? "bg-black/10"
                    : "bg-white/10"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
