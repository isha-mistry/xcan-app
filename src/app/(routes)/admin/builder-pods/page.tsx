"use client";
import React from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  FolderKanban,
  Trophy,
  Building2,
  AlertTriangle,
  Clock,
  Activity,
  Shield,
} from "lucide-react";
import {
  PageShell,
  PageHero,
  StatPill,
  SectionHeader,
  GlassCard,
} from "@/components/BuilderPods/ui";

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: "include" });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.success || !payload?.dashboard) {
    throw new Error(payload?.error || "Failed to load Builder Pods dashboard");
  }

  return payload;
};

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useSWR(
    "/api/admin/builder-pods/dashboard",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      errorRetryCount: 0,
    }
  );

  const dashboard = data?.dashboard;
  const isDashboardReady = Boolean(dashboard);
  const showDashboardLoader = isLoading || (!error && !isDashboardReady);

  const pendingCards = isDashboardReady
    ? [
        {
          label: "Pending Members",
          value: dashboard.pendingMembers,
          icon: Users,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          href: "/admin/builder-pods/members",
        },
        {
          label: "Pending Projects",
          value: dashboard.pendingProjects,
          icon: FolderKanban,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          href: "/admin/builder-pods/projects",
        },
        {
          label: "Pending Submissions",
          value: dashboard.pendingSubmissions,
          icon: Trophy,
          color: "text-purple-400",
          bg: "bg-purple-500/10",
          href: "/admin/builder-pods/showcases",
        },
        {
          label: "Total Colleges",
          value: dashboard.totalColleges,
          icon: Building2,
          color: "text-green-400",
          bg: "bg-green-500/10",
          href: "/admin/builder-pods/colleges",
        },
      ]
    : [];

  return (
    <PageShell>
      <PageHero
        accent="amber"
        badge="Admin control center"
        BadgeIcon={Shield}
        title="Admin Dashboard"
        description="Operate Builder Pods — approvals, showcases, colleges, and program health in one place."
        stats={
          isDashboardReady ? (
            <>
              <StatPill
                icon={<Users className="h-3.5 w-3.5 text-amber-400" />}
                label="Pending members"
                value={dashboard.pendingMembers}
              />
              <StatPill
                icon={<Trophy className="h-3.5 w-3.5 text-purple-400" />}
                label="Pending showcases"
                value={dashboard.pendingSubmissions}
              />
              <StatPill
                icon={<Building2 className="h-3.5 w-3.5 text-green-400" />}
                label="Colleges"
                value={dashboard.totalColleges}
              />
            </>
          ) : undefined
        }
      />

      <SectionHeader
        icon={Activity}
        title="Action Queue"
        subtitle="Jump into items that need attention"
        iconClassName="text-amber-400/80"
      />

      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {showDashboardLoader
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="glass-container h-32 animate-pulse rounded-2xl"
              />
            ))
          : error
            ? (
                <div className="glass-container col-span-2 rounded-2xl p-5 lg:col-span-4">
                  <p className="text-sm text-amber-300 font-robotoMono">
                    Unable to load Builder Pods dashboard right now.
                  </p>
                </div>
              )
            : pendingCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <GlassCard key={card.label} index={i} padding="none">
                    <Link
                      href={card.href}
                      className="block p-5 transition-all hover:bg-white/[0.02]"
                    >
                      <div className={`${card.bg} mb-3 w-fit rounded-lg p-2`}>
                        <Icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                      <span className="block text-3xl font-black text-white font-unbounded">
                        {card.value}
                      </span>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/60 font-robotoMono">
                        {card.label}
                      </p>
                    </Link>
                  </GlassCard>
                );
              })}
      </div>

      {dashboard?.weeklyUpdatesMissing?.count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-container mb-8 rounded-2xl border border-amber-500/15 p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/80 font-robotoMono">
              Pods Missing Weekly Update ({dashboard.weeklyUpdatesMissing.count})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {dashboard.weeklyUpdatesMissing.pods.map((pod: any) => (
              <Link
                key={pod._id}
                href={`/builder-pods/${pod.slug}`}
                className="rounded-lg border border-amber-500/10 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-400 transition-all hover:bg-amber-500/10 font-robotoMono"
              >
                {pod.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      <SectionHeader
        icon={Activity}
        title="Recent Activity"
        iconClassName="text-white/50"
      />
      <GlassCard padding="md" animate={false}>
        {showDashboardLoader ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-white/[0.02]"
              />
            ))}
          </div>
        ) : error ? (
          <p className="py-6 text-center text-sm text-amber-300 font-robotoMono">
            Unable to load recent activity right now.
          </p>
        ) : !dashboard?.recentAudit?.length ? (
          <p className="py-6 text-center text-sm text-white/50 font-robotoMono">
            No activity yet.
          </p>
        ) : (
          <div className="space-y-1">
            {dashboard.recentAudit.map((log: any) => (
              <div
                key={log._id}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white/[0.02]"
              >
                <Clock className="h-3 w-3 shrink-0 text-white/40" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-white/70 font-robotoMono">
                    <span className="font-bold text-white/90">{log.action}</span>{" "}
                    by {log.actorWallet?.slice(0, 8)}...
                  </span>
                </div>
                <span className="shrink-0 text-[10px] text-white/40 font-robotoMono">
                  {new Date(log.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </PageShell>
  );
}
