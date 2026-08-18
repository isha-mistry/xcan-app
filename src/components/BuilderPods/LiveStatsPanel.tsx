"use client";
import React from "react";
import {
    GraduationCap,
    Users,
    UserCheck,
    Code2,
    FolderGit2,
} from "lucide-react";
import { StatsData } from "@/types/builder-pods";

interface LiveStatsPanelProps {
    stats: StatsData;
    isLoading?: boolean;
}

const statItems = [
    {
        key: "totalColleges",
        label: "Colleges Activated",
        icon: GraduationCap,
        gradient: "from-blue-500 to-blue-600",
        bg: "bg-blue-500/10",
        text: "text-blue-400",
    },
    {
        key: "totalMembers",
        label: "Students Registered",
        icon: Users,
        gradient: "from-purple-500 to-purple-600",
        bg: "bg-purple-500/10",
        text: "text-purple-400",
    },
    {
        key: "totalActiveMembers",
        label: "Active lab participants",
        icon: UserCheck,
        gradient: "from-cyan-500 to-cyan-600",
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
    },
    {
        key: "totalDeployments",
        label: "Contracts Deployed",
        icon: Code2,
        gradient: "from-green-500 to-emerald-600",
        bg: "bg-green-500/10",
        text: "text-green-400",
    },
    {
        key: "totalProjects",
        label: "Projects in Progress",
        icon: FolderGit2,
        gradient: "from-amber-500 to-orange-600",
        bg: "bg-amber-500/10",
        text: "text-amber-400",
    },
];

function LiveStatsPanel({
    stats,
    isLoading,
}: LiveStatsPanelProps) {
    return (
        <section className="mb-10">
            <div className="mb-6 flex items-center gap-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 font-robotoMono">
                    Live Stats
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                {statItems.map((item) => {
                    const Icon = item.icon;
                    const value = stats[item.key as keyof StatsData] ?? 0;

                    return (
                        <div
                            key={item.key}
                            className="glass-container group rounded-2xl border border-white/[0.06] p-5 transition-all duration-300 hover:border-white/20"
                        >
                            <div className={`${item.bg} mb-3 w-fit rounded-xl p-2.5`}>
                                <Icon className={`h-4 w-4 ${item.text}`} />
                            </div>
                            <div className="space-y-1">
                                {isLoading ? (
                                    <div className="h-8 w-16 animate-pulse rounded-lg bg-white/5" />
                                ) : (
                                    <span className="text-2xl font-black tracking-tight text-white font-unbounded md:text-3xl">
                                        {value.toLocaleString()}
                                    </span>
                                )}
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 font-robotoMono">
                                    {item.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default React.memo(LiveStatsPanel);
