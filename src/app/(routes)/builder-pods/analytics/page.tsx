"use client";
import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    BarChart3,
    Building2,
    Users,
    UserCheck,
    FolderGit2,
    Code2,
    Award,
    Activity,
    MapPin,
} from "lucide-react";

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
            { label: "Colleges Activated", value: summary.collegesActivated, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Students Registered", value: summary.studentsRegistered, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "Active Members %", value: `${summary.activePodMembersPercent}%`, icon: UserCheck, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Total Projects", value: summary.totalProjects, icon: FolderGit2, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Contracts Deployed", value: summary.contractsDeployed, icon: Code2, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { label: "Badges Issued", value: summary.badgesIssued, icon: Award, color: "text-pink-400", bg: "bg-pink-500/10" },
        ]
        : [];

    // Find max value for bar chart scaling
    const maxWeekly = Math.max(...weeklyActivity.map((w: any) => w.updatesSubmitted), 1);

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Builder Pods
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight mb-1">
                    Analytics
                </h1>
                <p className="text-xs text-white/80 font-robotoMono">
                    Public overview of the Arbitrum Builder Pods program.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
                {summaryLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-2xl p-5 animate-pulse">
                            <div className="w-8 h-8 bg-white/5 rounded-lg mb-3" />
                            <div className="h-6 w-12 bg-white/5 rounded-lg mb-1" />
                            <div className="h-3 w-20 bg-white/5 rounded-lg" />
                        </div>
                    ))
                    : statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="glass-container rounded-2xl p-5"
                            >
                                <div className={`${stat.bg} p-2 rounded-lg w-fit mb-3`}>
                                    <Icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                                <span className="text-2xl font-black text-white font-unbounded block">
                                    {stat.value}
                                </span>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mt-0.5">
                                    {stat.label}
                                </p>
                            </motion.div>
                        );
                    })}
            </div>

            {/* Weekly Activity Chart */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glass-container rounded-2xl p-6 mb-8"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-4 h-4 text-white/80" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 font-robotoMono">
                        Weekly Activity (Last 8 Weeks)
                    </h2>
                </div>

                {weeklyLoading ? (
                    <div className="h-40 flex items-end gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex-1 bg-white/5 rounded-t-lg animate-pulse" style={{ height: `${30 + Math.random() * 70}%` }} />
                        ))}
                    </div>
                ) : weeklyActivity.length === 0 ? (
                    <p className="text-white/50 text-sm font-robotoMono text-center py-8">
                        No activity data yet.
                    </p>
                ) : (
                    <div className="h-48 flex items-end gap-2">
                        {weeklyActivity.map((w: any, i: number) => {
                            const height = (w.updatesSubmitted / maxWeekly) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-white/80 font-robotoMono font-bold">
                                        {w.updatesSubmitted}
                                    </span>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(height, 5)}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.05 }}
                                        className="w-full bg-gradient-to-t from-blue-500/20 to-blue-400/40 rounded-t-lg min-h-[4px]"
                                    />
                                    <span className="text-[8px] text-white/45 font-robotoMono">
                                        {w.weekLabel}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Region Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-container rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-4 h-4 text-white/80" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 font-robotoMono">
                        Region Breakdown
                    </h2>
                </div>

                {regionLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white/[0.02] rounded-xl p-4 animate-pulse">
                                <div className="h-4 w-32 bg-white/5 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : regions.length === 0 ? (
                    <p className="text-white/50 text-sm font-robotoMono text-center py-8">
                        No region data yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {regions.map((r: any) => (
                            <div key={r.regionName} className="bg-white/[0.02] rounded-xl p-5 border border-white/5">
                                <h3 className="text-sm font-bold text-white font-unbounded mb-1">
                                    {r.regionName}
                                </h3>
                                <p className="text-[10px] text-white/50 font-robotoMono mb-3">
                                    Showcase: {r.showcaseCity}
                                </p>
                                <div className="flex gap-4">
                                    <div>
                                        <span className="text-lg font-black text-white font-unbounded">{r.colleges}</span>
                                        <p className="text-[9px] text-white/45 font-robotoMono">Colleges</p>
                                    </div>
                                    <div>
                                        <span className="text-lg font-black text-white font-unbounded">{r.members}</span>
                                        <p className="text-[9px] text-white/45 font-robotoMono">Members</p>
                                    </div>
                                    <div>
                                        <span className="text-lg font-black text-white font-unbounded">{r.deployments}</span>
                                        <p className="text-[9px] text-white/45 font-robotoMono">Deploys</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
