"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Calendar,
  ExternalLink,
  Medal,
  Search,
  Award,
  Building2,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  ShowcaseSubmissionCard,
  type PublicShowcaseSubmission,
} from "@/components/BuilderPods/ShowcaseSubmissionCard";
import { matchesShowcaseSlug } from "@/lib/builder-pods/showcase";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type FilterKey =
  | "all"
  | "pending"
  | "approved"
  | "finalist"
  | "winner"
  | "special_mention";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "finalist", label: "Finalists" },
  { key: "winner", label: "Winners" },
];

export default function RegionalShowcasePage() {
  const params = useParams();
  const regionSlug = params["region-slug"] as string;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const { data: listData, isLoading: listLoading } = useSWR(
    "/api/builder-pods/showcases",
    fetcher
  );

  const showcase = useMemo(() => {
    const list = listData?.showcases ?? [];
    return (
      list.find(
        (s: any) =>
          s.slug === regionSlug ||
          matchesShowcaseSlug(s, regionSlug) ||
          String(s._id) === regionSlug
      ) ?? null
    );
  }, [listData, regionSlug]);

  const { data: detailData, isLoading: detailLoading } = useSWR(
    showcase?._id
      ? `/api/builder-pods/showcases?showcaseId=${showcase._id}`
      : null,
    fetcher
  );

  const isLoading = listLoading || (!!showcase && detailLoading);
  const event = detailData?.showcase ?? showcase;
  const submissions: PublicShowcaseSubmission[] =
    detailData?.submissions ?? [];

  const filtered = useMemo(() => {
    let list = [...submissions];
    if (filter !== "all") {
      list = list.filter((s) => s.status === filter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.projectSnapshot?.name?.toLowerCase().includes(q) ||
          s.collegeSnapshot?.name?.toLowerCase().includes(q) ||
          s.collegeSnapshot?.podName?.toLowerCase().includes(q) ||
          s.projectSnapshot?.problemStatement?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [submissions, filter, query]);

  const winners = useMemo(
    () => submissions.filter((s) => s.status === "winner"),
    [submissions]
  );

  const stats = useMemo(() => {
    const colleges = new Set(
      submissions
        .map((s) => s.collegeSnapshot?.slug || s.collegeSnapshot?.name)
        .filter(Boolean)
    );
    return {
      total: submissions.length,
      colleges: colleges.size,
      winners: winners.length,
      finalists: submissions.filter((s) => s.status === "finalist").length,
    };
  }, [submissions, winners]);

  const statusColors: Record<string, string> = {
    winner: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    finalist: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    approved: "bg-green-500/10 text-green-400 border-green-500/20",
    open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    judging: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    upcoming: "bg-white/5 text-white/50 border-white/10",
    pending: "bg-white/5 text-white/70 border-white/10",
  };

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <Link
        href="/builder-pods/showcase"
        className="mb-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 transition-colors hover:text-white font-robotoMono"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Showcases
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-10 w-72 animate-pulse rounded-lg bg-white/5" />
          <div className="h-4 w-48 animate-pulse rounded-lg bg-white/5" />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="glass-container h-40 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        </div>
      ) : !event ? (
        <div className="glass-container rounded-2xl p-12 text-center">
          <Trophy className="mx-auto mb-3 h-8 w-8 text-white/40" />
          <p className="mb-1 text-sm text-white/80 font-robotoMono">
            Showcase not found
          </p>
          <p className="text-[11px] text-white/40 font-robotoMono">
            Check the link or return to the public showcase gallery.
          </p>
        </div>
      ) : (
        <>
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-yellow-500/[0.06] via-transparent to-blue-500/[0.07] p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />

            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/55 font-robotoMono">
                <Sparkles className="h-3 w-3 text-yellow-400/80" />
                Public · no wallet needed
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-400/80" />
                <h1 className="text-2xl font-black tracking-tight text-white font-unbounded sm:text-3xl">
                  {event.name}
                </h1>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] font-bold font-robotoMono ${
                    statusColors[event.status] || statusColors.upcoming
                  }`}
                >
                  {event.status}
                </span>
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-4 text-[10px] text-white/60 font-robotoMono">
                {(event.city || event.regionSnapshot?.showcaseCity) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.city || event.regionSnapshot?.showcaseCity}
                  </div>
                )}
                {event.eventDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.eventDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
                {event.prizePoolUsd > 0 && (
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-yellow-400/60" />$
                    {event.prizePoolUsd.toLocaleString()} Prize Pool
                  </div>
                )}
                {event.venue && (
                  <div className="text-white/40">Venue: {event.venue}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat
                  icon={<Layers className="h-3.5 w-3.5 text-blue-400" />}
                  label="Projects"
                  value={stats.total}
                />
                <MiniStat
                  icon={<Building2 className="h-3.5 w-3.5 text-purple-400" />}
                  label="Colleges"
                  value={stats.colleges}
                />
                <MiniStat
                  icon={<Medal className="h-3.5 w-3.5 text-yellow-400" />}
                  label="Winners"
                  value={stats.winners}
                />
                <MiniStat
                  icon={<Sparkles className="h-3.5 w-3.5 text-cyan-400" />}
                  label="Finalists"
                  value={stats.finalists}
                />
              </div>
            </div>
          </motion.section>

          {/* Winners */}
          {winners.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="mb-10"
            >
              <div className="mb-4 flex items-center gap-2">
                <Medal className="h-4 w-4 text-yellow-400/80" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-400/80 font-robotoMono">
                  Winners
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {winners.map((sub, i) => (
                  <ShowcaseSubmissionCard
                    key={sub._id}
                    sub={sub}
                    index={i}
                    featured
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Toolbar */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 font-robotoMono">
              All Projects ({filtered.length}
              {filter !== "all" || query ? ` / ${submissions.length}` : ""})
            </h2>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search projects or colleges…"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-[11px] text-white placeholder:text-white/30 focus:border-blue-500/40 focus:outline-none font-robotoMono sm:w-56"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={`rounded-lg border px-2.5 py-1.5 text-[9px] font-bold transition-all font-robotoMono ${
                      filter === f.key
                        ? "border-blue-500/30 bg-blue-500/15 text-blue-300"
                        : "border-white/5 bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/70"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gallery */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            {filtered.length === 0 ? (
              <div className="glass-container rounded-2xl p-10 text-center">
                <p className="text-xs text-white/50 font-robotoMono">
                  {submissions.length === 0
                    ? "No submissions yet for this showcase"
                    : "No projects match your filters"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((sub, i) => (
                  <ShowcaseSubmissionCard key={sub._id} sub={sub} index={i} />
                ))}
              </div>
            )}
          </motion.section>

          {event.status === "open" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-10 text-center"
            >
              <Link
                href="/builder-pods/showcase-submit"
                className="inline-flex items-center gap-2 rounded-xl border border-blue-500/15 bg-blue-500/10 px-6 py-3 text-xs font-bold text-blue-400 transition-all hover:bg-blue-500/20 font-robotoMono"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Submit Your Project
              </Link>
              <p className="mt-2 text-[10px] text-white/35 font-robotoMono">
                Only active pod leads who lead the project can submit
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-1.5 text-white/40">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider font-robotoMono">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold text-white font-unbounded">{value}</p>
    </div>
  );
}
