"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Github,
  FileText,
  Code2,
  Building2,
  Medal,
} from "lucide-react";

export type PublicShowcaseSubmission = {
  _id: string;
  showcaseEventId?: string;
  showcaseName?: string | null;
  collegeSnapshot?: {
    name?: string;
    slug?: string;
    podName?: string;
  } | null;
  projectSnapshot?: {
    name?: string;
    problemStatement?: string;
  } | null;
  demoLink?: string | null;
  githubRepo?: string | null;
  contractAddress?: string | null;
  pitchDeckUrl?: string | null;
  status?: string;
  placement?: string | null;
  prizeAmountUsd?: number | null;
  createdAt?: string;
  submittedBy?: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  winner: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  finalist: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  approved: "bg-green-500/15 text-green-300 border-green-500/25",
  special_mention: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  pending: "bg-blue-500/10 text-blue-300 border-blue-500/20",
};

export function ShowcaseSubmissionCard({
  sub,
  index = 0,
  showShowcaseName = false,
  featured = false,
}: {
  sub: PublicShowcaseSubmission;
  index?: number;
  showShowcaseName?: boolean;
  featured?: boolean;
}) {
  const status = sub.status || "pending";
  const statusClass =
    STATUS_STYLES[status] || "bg-white/5 text-white/60 border-white/10";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.35) }}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        featured
          ? "glass-container border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.07] via-transparent to-transparent"
          : "glass-container border-white/[0.06] hover:border-white/15"
      }`}
    >
      {featured && (
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow-400/10 blur-2xl" />
      )}

      <div className="relative p-5 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {showShowcaseName && sub.showcaseName && (
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-400/80 font-robotoMono">
                {sub.showcaseName}
              </p>
            )}
            <h3 className="truncate text-sm font-bold text-white font-robotoMono sm:text-[15px]">
              {sub.projectSnapshot?.name || "Untitled Project"}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-white/50 font-robotoMono">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3 w-3 shrink-0 opacity-70" />
                {sub.collegeSnapshot?.name || "Unknown college"}
              </span>
              {sub.collegeSnapshot?.podName && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-white/40">{sub.collegeSnapshot.podName}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-robotoMono ${statusClass}`}
            >
              {status === "winner" && <Medal className="h-3 w-3" />}
              {sub.placement ? `#${sub.placement}` : status.replace("_", " ")}
            </span>
            {typeof sub.prizeAmountUsd === "number" && sub.prizeAmountUsd > 0 && (
              <span className="text-[9px] font-bold text-yellow-400/80 font-robotoMono">
                ${sub.prizeAmountUsd.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {sub.projectSnapshot?.problemStatement && (
          <p className="mb-4 line-clamp-2 text-[11px] leading-relaxed text-white/45 font-robotoMono">
            {sub.projectSnapshot.problemStatement}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {sub.githubRepo && (
            <a
              href={sub.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[9px] font-bold text-white/70 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white font-robotoMono"
            >
              <Github className="h-3 w-3" />
              GitHub
            </a>
          )}
          {sub.demoLink && (
            <a
              href={sub.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-[9px] font-bold text-blue-300 transition-all hover:bg-blue-500/20 font-robotoMono"
            >
              <ExternalLink className="h-3 w-3" />
              Demo
            </a>
          )}
          {sub.pitchDeckUrl && (
            <a
              href={sub.pitchDeckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[9px] font-bold text-white/70 transition-all hover:bg-white/[0.08] hover:text-white font-robotoMono"
            >
              <FileText className="h-3 w-3" />
              Pitch
            </a>
          )}
          {sub.contractAddress && (
            <span
              title={sub.contractAddress}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[9px] font-bold text-white/45 font-robotoMono"
            >
              <Code2 className="h-3 w-3" />
              {`${sub.contractAddress.slice(0, 6)}…${sub.contractAddress.slice(-4)}`}
            </span>
          )}
        </div>

        {(sub.submittedBy || sub.createdAt) && (
          <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3 text-[9px] text-white/30 font-robotoMono">
            {sub.submittedBy ? <span>by {sub.submittedBy}</span> : <span />}
            {sub.createdAt && (
              <span>
                {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
