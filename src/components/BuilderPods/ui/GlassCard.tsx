"use client";

import React from "react";
import { motion } from "framer-motion";

export function GlassCard({
  children,
  className = "",
  hover = true,
  padding = "md",
  animate = true,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  animate?: boolean;
  index?: number;
}) {
  const pad =
    padding === "none"
      ? ""
      : padding === "sm"
        ? "p-4"
        : padding === "lg"
          ? "p-6 md:p-8"
          : "p-5 sm:p-6";

  const classes = `glass-container rounded-2xl border border-white/[0.06] ${pad} ${
    hover ? "transition-all hover:border-white/15" : ""
  } ${className}`;

  if (!animate) {
    return <div className={classes}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.35) }}
      className={classes}
    >
      {children}
    </motion.div>
  );
}
