import React from "react";

export function GlassPanel({
  children,
  className = "",
  toolbar,
}: {
  children: React.ReactNode;
  className?: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <div
      className={`glass-container overflow-hidden rounded-2xl border border-white/[0.06] ${className}`}
    >
      {toolbar && (
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          {toolbar}
        </div>
      )}
      {children}
    </div>
  );
}
