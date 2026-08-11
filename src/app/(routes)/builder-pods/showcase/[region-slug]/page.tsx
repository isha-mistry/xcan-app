"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Calendar,
  Clock,
  MonitorPlay,
  Users,
  ExternalLink,
  CheckCircle2,
  Target,
} from "lucide-react";
import {
  formatShowcaseDate,
  getShowcaseDetailsBySlug,
} from "@/lib/builder-pods/showcase-details";

const statusStyles: Record<string, string> = {
  upcoming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  open: "bg-green-500/10 text-green-400 border-green-500/20",
  live: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completed: "bg-white/5 text-white/60 border-white/10",
};

export default function ShowcaseDetailPage() {
  const params = useParams();
  const regionSlug = params["region-slug"] as string;
  const showcase = getShowcaseDetailsBySlug(regionSlug);

  if (!showcase) {
    return (
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <Link
          href="/builder-pods/showcase"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white font-robotoMono mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Showcases
        </Link>
        <div className="glass-container rounded-2xl p-12 text-center">
          <Trophy className="w-8 h-8 text-white/40 mx-auto mb-3" />
          <p className="text-sm text-white/80 font-robotoMono mb-2">
            Showcase not found
          </p>
          <p className="text-[11px] text-white/45 font-robotoMono">
            No event details are configured for “{regionSlug}”.
          </p>
        </div>
      </div>
    );
  }

  const hasJoinLink = Boolean(showcase.joinLink?.trim());

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <Link
        href="/builder-pods/showcase"
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white font-robotoMono mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Showcases
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider font-robotoMono bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            {showcase.subtitle}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider font-robotoMono border ${statusStyles[showcase.status] || statusStyles.upcoming}`}
          >
            {showcase.status}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white font-unbounded tracking-tight mb-2">
          {showcase.name}
        </h1>
        <p className="text-xs md:text-sm text-white/55 font-robotoMono max-w-3xl leading-relaxed mb-4">
          {showcase.tagline}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-white/60 font-robotoMono">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400/70" />
            {showcase.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400/70" />
            {formatShowcaseDate(showcase.date)} · {showcase.day}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400/70" />
            {showcase.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MonitorPlay className="w-3.5 h-3.5 text-blue-400/70" />
            {showcase.format}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400/70" />
            {showcase.podsPresenting} pods presenting
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 mb-8 items-start">
        {/* Poster only — sized to image, no extra letterboxing */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-2xl overflow-hidden border border-white/10 leading-none"
        >
          <Image
            src={showcase.poster}
            alt={`${showcase.name} poster`}
            width={1200}
            height={1500}
            className="w-full h-auto block"
            priority
            sizes="(max-width: 1280px) 100vw, 55vw"
          />
        </motion.div>

        {/* Sidebar: join + key facts + prizes */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="glass-container rounded-2xl p-5 md:p-6 border border-blue-500/15">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 font-robotoMono mb-4">
              Date & Time
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <FactCard
                icon={Calendar}
                label="Date"
                value={formatShowcaseDate(showcase.date)}
              />
              <FactCard icon={Clock} label="Day" value={showcase.day} />
              <FactCard icon={Clock} label="Time" value={showcase.time} />
              <FactCard
                icon={MonitorPlay}
                label="Format"
                value={showcase.format}
              />
            </div>

            {hasJoinLink ? (
              <a
                href={showcase.joinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-100 text-md font-bold font-robotoMono transition-all border border-blue-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {showcase.joinLinkLabel || "Join Showcase"}
              </a>
            ) : (
              <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-white/45 text-xs font-bold font-robotoMono border border-white/10">
                Join link will be shared soon
              </div>
            )}
          </div>

          <div className="glass-container rounded-2xl p-5 md:p-6 border border-yellow-500/15">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-yellow-400/80" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-400/80 font-robotoMono">
                Prize Pool · ${showcase.prizePool.totalUsd.toLocaleString()}
              </h2>
            </div>
            <div className="space-y-2">
              {showcase.prizePool.breakdown.map((prize) => (
                <div
                  key={prize.place}
                  className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5"
                >
                  <span className="text-[11px] text-white/70 font-robotoMono">
                    {prize.place}
                  </span>
                  <span className="text-sm font-black text-yellow-400/90 font-unbounded">
                    ${prize.amountUsd}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-container rounded-2xl p-5 md:p-6">
            <p className="text-[10px] text-white/45 font-robotoMono uppercase tracking-wider mb-2">
              Presented by
            </p>
            <p className="text-sm font-bold text-white font-robotoMono mb-3">
              {showcase.presentedBy}
            </p>
            <p className="text-[10px] text-white/45 font-robotoMono uppercase tracking-wider mb-2">
              In partnership with
            </p>
            <p className="text-xs text-white/75 font-robotoMono">
              {showcase.partners.join(" · ")}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Colleges */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-blue-400/70" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 font-robotoMono">
            Colleges Joining ({showcase.colleges.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {showcase.colleges.map((college, index) => {
            const card = (
              <div className="glass-container rounded-2xl p-4 h-full hover:border-blue-500/25 transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-black text-white font-unbounded tracking-tight">
                    {college.shortName}
                  </h3>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold font-robotoMono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/15">
                    Pod {index + 1}
                  </span>
                </div>
                <p className="text-[11px] text-white/55 font-robotoMono mb-2 line-clamp-2">
                  {college.name}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-white/45 font-robotoMono">
                  <MapPin className="w-3 h-3" />
                  {college.city}
                </div>
              </div>
            );

            if (college.collegeSlug) {
              return (
                <Link
                  key={college.shortName}
                  href={`/builder-pods/${college.collegeSlug}`}
                  className="block"
                >
                  {card}
                </Link>
              );
            }

            return <div key={college.shortName}>{card}</div>;
          })}
        </div>
      </motion.section>

      {/* Outcomes */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-green-400/70" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 font-robotoMono">
            Outcomes
          </h2>
        </div>
        <div className="glass-container rounded-2xl p-5 md:p-6 space-y-3 max-w-3xl">
          {showcase.outcomes.map((outcome) => (
            <div key={outcome} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400/70 shrink-0 mt-0.5" />
              <p className="text-[12px] text-white/70 font-robotoMono leading-relaxed">
                {outcome}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {showcase.description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="text-[11px] text-white/40 font-robotoMono leading-relaxed max-w-3xl"
        >
          {showcase.description}
        </motion.p>
      )}
    </div>
  );
}

function FactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3 text-blue-400/70" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400/70 font-robotoMono">
          {label}
        </span>
      </div>
      <p className="text-[11px] font-bold text-white font-robotoMono leading-snug">
        {value}
      </p>
    </div>
  );
}
