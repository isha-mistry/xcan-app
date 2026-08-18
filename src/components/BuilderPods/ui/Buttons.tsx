import React from "react";
import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-xl text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30 disabled:cursor-not-allowed";

export function PrimaryButton({
  children,
  className = "",
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: React.ReactNode;
}) {
  const cls = `${base} bg-white px-4 py-2.5 text-black uppercase tracking-widest hover:shadow-lg hover:shadow-white/10 ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: React.ReactNode;
}) {
  const cls = `${base} border border-white/10 bg-white/[0.04] px-3 py-2 text-white/80 hover:border-white/20 hover:bg-white/[0.08] hover:text-white ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

export function SoftButton({
  children,
  className = "",
  href,
  color = "blue",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: React.ReactNode;
  color?: "blue" | "amber" | "purple" | "green";
}) {
  const colors = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20",
    amber:
      "border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
    purple:
      "border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20",
    green:
      "border-green-500/20 bg-green-500/10 text-green-300 hover:bg-green-500/20",
  };
  const cls = `${base} border px-3 py-2 ${colors[color]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
