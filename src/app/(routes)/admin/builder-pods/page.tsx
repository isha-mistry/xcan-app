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
} from "lucide-react";

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
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight mb-1">
                    Admin Dashboard
                </h1>
                <p className="text-xs text-white/80 font-robotoMono">
                    Builder Pods administration panel.
                </p>
            </div>

            {/* Pending Action Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
                {showDashboardLoader
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-2xl p-5 animate-pulse">
                            <div className="w-8 h-8 bg-white/5 rounded-lg mb-3" />
                            <div className="h-6 w-10 bg-white/5 rounded-lg mb-1" />
                            <div className="h-3 w-24 bg-white/5 rounded-lg" />
                        </div>
                    ))
                    : error ? (
                        <div className="glass-container rounded-2xl p-5 col-span-2 lg:col-span-4">
                            <p className="text-sm text-amber-300 font-robotoMono">
                                Unable to load Builder Pods dashboard right now.
                            </p>
                        </div>
                    )
                        : pendingCards.map((card, i) => {
                            const Icon = card.icon;
                            return (
                                <motion.div
                                    key={card.label}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                >
                                    <Link href={card.href} className="glass-container rounded-2xl p-5 block hover:border-white/20 transition-all">
                                        <div className={`${card.bg} p-2 rounded-lg w-fit mb-3`}>
                                            <Icon className={`w-4 h-4 ${card.color}`} />
                                        </div>
                                        <span className="text-3xl font-black text-white font-unbounded block">
                                            {card.value}
                                        </span>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/75 font-robotoMono mt-1">
                                            {card.label}
                                        </p>
                                    </Link>
                                </motion.div>
                            );
                        })}
            </div>

            {/* Missing Weekly Updates */}
            {dashboard?.weeklyUpdatesMissing?.count > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="glass-container rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/70 font-robotoMono">
                            Pods Missing Weekly Update ({dashboard.weeklyUpdatesMissing.count})
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {dashboard.weeklyUpdatesMissing.pods.map((pod: any) => (
                            <Link
                                key={pod._id}
                                href={`/builder-pods/${pod.slug}`}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-400 font-robotoMono hover:bg-amber-500/10 transition-all"
                            >
                                {pod.name}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recent Audit Log */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glass-container rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-4 h-4 text-white/75" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 font-robotoMono">
                        Recent Activity
                    </h2>
                </div>

                {showDashboardLoader ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-10 bg-white/[0.02] rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-amber-300 text-sm font-robotoMono text-center py-6">
                        Unable to load recent activity right now.
                    </p>
                ) : !dashboard?.recentAudit?.length ? (
                    <p className="text-white/75 text-sm font-robotoMono text-center py-6">
                        No activity yet.
                    </p>
                ) : (
                    <div className="space-y-1">
                        {dashboard.recentAudit.map((log: any) => (
                            <div
                                key={log._id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.01] hover:bg-white/[0.02] transition-colors"
                            >
                                <Clock className="w-3 h-3 text-white/70 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs text-white/80 font-robotoMono">
                                        <span className="text-white/80 font-bold">{log.action}</span>{" "}
                                        by {log.actorWallet.slice(0, 8)}...
                                    </span>
                                </div>
                                <span className="text-[10px] text-white/70 font-robotoMono shrink-0">
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
            </motion.div>
        </div>
    );
}
