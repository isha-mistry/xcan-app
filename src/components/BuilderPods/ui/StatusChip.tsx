import React from "react";

const PRESETS: Record<string, string> = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  inactive: "bg-white/5 text-white/50 border-white/10",
  removed: "bg-red-500/10 text-red-400 border-red-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  judging: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  upcoming: "bg-white/5 text-white/50 border-white/10",
  winner: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  finalist: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  pod_lead: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  pod_member: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  lab_participant: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  faculty_coordinator: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  mentor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  admin: "bg-purple-500/10 text-purple-300 border-purple-500/20",
};

export function StatusChip({
  label,
  tone,
  className = "",
  icon,
}: {
  label: React.ReactNode;
  /** preset key (status/role) or raw tailwind classes if starting with bg- */
  tone?: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  const key = (tone || String(label)).toLowerCase().replace(/\s+/g, "_");
  const styles =
    tone?.startsWith("bg-") || tone?.startsWith("text-")
      ? tone
      : PRESETS[key] || "bg-white/5 text-white/60 border-white/10";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-robotoMono ${styles} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
