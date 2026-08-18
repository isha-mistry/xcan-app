import React from "react";
import { LucideIcon } from "lucide-react";

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  count,
  action,
  className = "",
  iconClassName = "text-yellow-400/70",
  size = "lg",
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  count?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "lg";
}) {
  return (
    <div
      className={`mb-6 flex flex-wrap items-end justify-between gap-3 ${className}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {Icon && <Icon className={`h-5 w-5 shrink-0 ${iconClassName}`} />}
          <h2
            className={`font-black tracking-tight text-white font-unbounded ${
              size === "lg"
                ? "text-xl sm:text-2xl"
                : "text-lg sm:text-xl"
            }`}
          >
            {title}
            {count != null && (
              <span className="ml-2 text-base font-bold text-white/40 sm:text-lg">
                {count}
              </span>
            )}
          </h2>
        </div>
        {subtitle && (
          <p className="mt-1 text-[11px] text-white/40 font-robotoMono">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
