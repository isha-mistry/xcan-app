"use client";
import React from "react";
import useSWR from "swr";
import {
  Building2,
  Users,
  UserCheck,
  FolderGit2,
  Code2,
  Award,
  Activity,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  PageShell,
  BackLink,
  PageHero,
  StatPill,
  SectionHeader,
  GlassCard,
  EmptyState,
} from "@/components/BuilderPods/ui";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AnalyticsPage() {
  const { data: summaryData, isLoading: summaryLoading } = useSWR(
    "/api/builder-pods/analytics/summary",
    fetcher,
    { refreshInterval: 120_000 }
  );

  const { data: weeklyData, isLoading: weeklyLoading } = useSWR(
    "/api/builder-pods/analytics/weekly-activity",
    fetcher
  );

  const { data: regionData, isLoading: regionLoading } = useSWR(
    "/api/builder-pods/analytics/regions",
    fetcher
  );

  const summary = summaryData?.summary;
  const weeklyActivity = weeklyData?.data ?? [];
  const regions = regionData?.data ?? [];

  const statCards = summary
    ? [
        {
          label: "Colleges",
          value: summary.collegesActivated,
          icon: Building2,
          color: "text-blue-400",
        },
        {
          label: "Students",
          value: summary.studentsRegistered,
          icon: Users,
          color: "text-purple-400",
        },
        {
          label: "Active %",
          value: `${summary.activePodMembersPercent}%`,
          icon: UserCheck,
          color: "text-green-400",
        },
        {
          label: "Projects",
          value: summary.totalProjects,
          icon: FolderGit2,
          color: "text-amber-400",
        },
        {
          label: "Contracts",
          value: summary.contractsDeployed,
          icon: Code2,
          color: "text-cyan-400",
        },
        {
          label: "Badges",
          value: summary.badgesIssued,
          icon: Award,
          color: "text-pink-400",
        },
      ]
    : [];

  const maxWeekly = Math.max(
    ...weeklyActivity.map((w: any) => w.updatesSubmitted),
    1
  );

  return (
    <PageShell>
      <BackLink href="/builder-pods">Builder Pods</BackLink>

      <PageHero
        accent="purple"
        badge="Public analytics"
        BadgeIcon={Sparkles}
        title="Analytics"
        description="Live overview of the Arbitrum Builder Pods program — colleges, participation, activity, and regional growth."
        stats={
          summaryLoading
            ? undefined
            : (
                <>
                  <StatPill
                    icon={<Building2 className="h-3.5 w-3.5 text-blue-400" />}
                    label="Colleges"
                    value={summary?.collegesActivated ?? 0}
                  />
                  <StatPill
                    icon={<Users className="h-3.5 w-3.5 text-purple-400" />}
                    label="Students"
                    value={summary?.studentsRegistered ?? 0}
                  />
                  <StatPill
                    icon={<Code2 className="h-3.5 w-3.5 text-cyan-400" />}
                    label="Contracts"
                    value={summary?.contractsDeployed ?? 0}
                  />
                </>
              )
        }
      />

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {summaryLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass-container h-28 animate-pulse rounded-2xl"
              />
            ))
          : statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <GlassCard key={stat.label} index={i} padding="md">
                  <Icon className={`mb-3 h-4 w-4 ${stat.color}`} />
                  <span className="block text-2xl font-black text-white font-unbounded">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </span>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50 font-robotoMono">
                    {stat.label}
                  </p>
                </GlassCard>
              );
            })}
      </div>

      <SectionHeader
        icon={Activity}
        title="Weekly Activity"
        subtitle="Updates submitted across the network"
        iconClassName="text-cyan-400/80"
      />
      <GlassCard className="mb-10" padding="lg" animate={false}>
        {weeklyLoading ? (
          <div className="h-40 animate-pulse rounded-xl bg-white/5" />
        ) : weeklyActivity.length === 0 ? (
          <p className="py-8 text-center text-xs text-white/40 font-robotoMono">
            No weekly activity data yet
          </p>
        ) : (
          <div className="flex h-48 items-end gap-2 sm:gap-3">
            {weeklyActivity.map((w: any, i: number) => {
              const height = Math.max(
                8,
                (w.updatesSubmitted / maxWeekly) * 100
              );
              return (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-[9px] font-bold text-white/50 font-robotoMono">
                    {w.updatesSubmitted}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-500/40 to-purple-400/50 transition-all"
                    style={{ height: `${height}%` }}
                    title={`${w.updatesSubmitted} updates`}
                  />
                  <span className="text-[8px] font-bold uppercase text-white/35 font-robotoMono">
                    {w.label || w.week || `W${i + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <SectionHeader
        icon={MapPin}
        title="Regional Breakdown"
        subtitle="Colleges, members, and deployments by zone"
        iconClassName="text-purple-400/80"
      />
      {regionLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="glass-container h-36 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : regions.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No regional data yet"
          description="Regions appear as colleges activate across India."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {regions.map((r: any, i: number) => (
            <GlassCard key={r.name || i} index={i}>
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-400/70" />
                <h3 className="text-sm font-bold text-white font-unbounded">
                  {r.name}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Colleges" value={r.colleges} />
                <MiniStat label="Members" value={r.members} />
                <MiniStat label="Deploys" value={r.deployments} />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-2 py-2.5 text-center">
      <span className="block text-lg font-black text-white font-unbounded">
        {value ?? 0}
      </span>
      <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 font-robotoMono">
        {label}
      </span>
    </div>
  );
}
