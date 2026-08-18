import React from "react";

export function StatPill({
  icon,
  label,
  value,
  className = "",
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-[100px] items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm ${className}`}
    >
      {icon != null && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-lg font-bold leading-none text-white font-unbounded">
          {value}
        </p>
        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40 font-robotoMono">
          {label}
        </p>
      </div>
    </div>
  );
}
