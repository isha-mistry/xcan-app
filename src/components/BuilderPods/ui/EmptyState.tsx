import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`glass-container rounded-2xl border border-white/[0.06] p-12 text-center ${className}`}
    >
      <Icon className="mx-auto mb-3 h-8 w-8 text-white/30" />
      <p className="mb-1 text-sm text-white/70 font-robotoMono">{title}</p>
      {description && (
        <p className="mx-auto max-w-md text-[11px] text-white/40 font-robotoMono">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
