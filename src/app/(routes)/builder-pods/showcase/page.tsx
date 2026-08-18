"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  MapPin,
  Calendar,
  ExternalLink,
  Clock,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  Layers,
  Users,
} from "lucide-react";
import {
  ShowcaseSubmissionCard,
  type PublicShowcaseSubmission,
} from "@/components/BuilderPods/ShowcaseSubmissionCard";
import {
  PageShell,
  BackLink,
  PageHero,
  StatPill,
} from "@/components/BuilderPods/ui";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_CHIP: Record<string, string> = {
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  judging: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  upcoming: "bg-white/5 text-white/50 border-white/10",
};

export default function ShowcasePage() {
  const { data, isLoading } = useSWR(
    "/api/builder-pods/showcases?includeSubmissions=all",
    fetcher,
    { revalidateOnFocus: true }
  );

  const showcases = data?.showcases ?? [];
  const submissions: PublicShowcaseSubmission[] = data?.submissions ?? [];
  const userSubmissions = data?.userSubmissions ?? [];

  const totalProjects = useMemo(
    () =>
      showcases.reduce(
        (sum: number, s: any) => sum + (s.submissionCount ?? 0),
        0
      ),
    [showcases]
  );

  const openCount = useMemo(
    () => showcases.filter((s: any) => s.status === "open").length,
    [showcases]
  );

  return (
    <PageShell>
      <BackLink href="/builder-pods">Builder Pods</BackLink>

      <PageHero
        accent="blue"
        badge="Public gallery · no wallet required"
        BadgeIcon={Sparkles}
        title="Regional Showcases"
        description="Explore every project submitted to Arbitrum Builder Pods regional showcases. Browse by region, follow finalists, and open demos — all without connecting a wallet."
        stats={
          <>
            <StatPill
              icon={<Layers className="h-3.5 w-3.5 text-blue-400" />}
              label="Events"
              value={showcases.length}
            />
            <StatPill
              icon={<FileText className="h-3.5 w-3.5 text-purple-400" />}
              label="Projects"
              value={totalProjects}
            />
            <StatPill
              icon={<Trophy className="h-3.5 w-3.5 text-yellow-400" />}
              label="Open now"
              value={openCount}
            />
          </>
        }
      />

      {/* Your submissions (only when authed + has any) */}
      {!isLoading && userSubmissions.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-4 w-4 text-blue-400/70" />
            <h2 className="text-lg font-bold tracking-tight text-white font-unbounded">
              Your Submissions
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {userSubmissions.map((sub: any) => {
              const showcase = showcases.find(
                (s: any) => String(s._id) === String(sub.showcaseEventId)
              );
              return (
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-container flex flex-col gap-3 rounded-2xl border-blue-500/10 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-robotoMono">
                        {showcase?.name || "Showcase"}
                      </span>
                      <h3 className="max-w-[220px] truncate text-sm font-bold text-white font-robotoMono">
                        {sub.projectSnapshot?.name}
                      </h3>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1 text-[9px] font-bold uppercase font-robotoMono ${
                        sub.status === "approved" ||
                        sub.status === "finalist" ||
                        sub.status === "winner"
                          ? "text-green-400"
                          : sub.status === "rejected"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {sub.status === "pending" && <Clock className="h-3 w-3" />}
                      {(sub.status === "approved" ||
                        sub.status === "finalist" ||
                        sub.status === "winner") && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {sub.status === "pending"
                        ? "Pending"
                        : String(sub.status).replace("_", " ")}
                    </div>
                  </div>
                  {showcase?.slug && (
                    <Link
                      href={`/builder-pods/showcase/${showcase.slug}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400/80 transition-colors hover:text-blue-300 font-robotoMono"
                    >
                      View public gallery
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Events */}
      <section className="mb-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-yellow-400/70" />
            <h2 className="text-xl font-black tracking-tight text-white font-unbounded sm:text-2xl">
              Showcase Events
            </h2>
          </div>
          <Link
            href="/builder-pods/showcase-submit"
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-[10px] font-bold text-blue-300 transition-all hover:bg-blue-500/20 font-robotoMono"
          >
            <ExternalLink className="h-3 w-3" />
            Submit a project
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="glass-container animate-pulse rounded-2xl p-6"
              >
                <div className="mb-3 h-5 w-40 rounded-lg bg-white/5" />
                <div className="h-4 w-24 rounded-lg bg-white/5" />
              </div>
            ))}
          </div>
        ) : showcases.length === 0 ? (
          <div className="glass-container rounded-2xl p-12 text-center">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-white/40" />
            <p className="text-sm text-white/80 font-robotoMono">
              No showcases yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {showcases.map((showcase: any, index: number) => {
              const slug = showcase.slug || showcase._id;
              const city =
                showcase.city ||
                showcase.regionSnapshot?.showcaseCity ||
                "TBD";
              return (
                <motion.div
                  key={showcase._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass-container group flex flex-col rounded-2xl p-6 transition-all hover:border-white/15"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="mb-1.5 truncate text-sm font-bold text-white font-robotoMono">
                        {showcase.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-robotoMono">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {city}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold font-robotoMono ${
                        STATUS_CHIP[showcase.status] || STATUS_CHIP.upcoming
                      }`}
                    >
                      {showcase.status}
                    </span>
                  </div>

                  <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] text-white/45 font-robotoMono">
                    {showcase.eventDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(showcase.eventDate).toLocaleDateString(
                          "en-IN",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                    )}
                    {showcase.prizePoolUsd > 0 && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-400/60" />$
                        {showcase.prizePoolUsd.toLocaleString()} prize
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-purple-400/70" />
                      {showcase.submissionCount ?? 0} project
                      {(showcase.submissionCount ?? 0) === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <Link
                      href={`/builder-pods/showcase/${slug}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white font-robotoMono"
                    >
                      View projects
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                    {showcase.status === "open" && (
                      <Link
                        href="/builder-pods/showcase-submit"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-2 text-[10px] font-bold text-blue-400 transition-all hover:bg-blue-500/20 font-robotoMono"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Submit entry
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Global project gallery */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400/80" />
              <h2 className="text-lg font-bold tracking-tight text-white font-unbounded sm:text-xl">
                All Submitted Projects
              </h2>
            </div>
            <p className="text-[11px] text-white/40 font-robotoMono">
              Live public feed across every regional showcase
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold text-white/50 font-robotoMono">
            {submissions.length} visible
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass-container h-44 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="glass-container rounded-2xl p-12 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-white/30" />
            <p className="mb-1 text-sm text-white/70 font-robotoMono">
              No public submissions yet
            </p>
            <p className="text-[11px] text-white/40 font-robotoMono">
              Projects appear here as soon as a pod lead submits to an open
              showcase.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {submissions.map((sub, i) => (
              <ShowcaseSubmissionCard
                key={sub._id}
                sub={sub}
                index={i}
                showShowcaseName
                featured={sub.status === "winner"}
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
