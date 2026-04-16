"use client";
import React from "react";
import { motion } from "framer-motion";
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

export default function LiveStatsPanel({
    stats,
    isLoading,
}: LiveStatsPanelProps) {
    return (
        <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 font-robotoMono">
                    Live Stats
                </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {statItems.map((item, index) => {
                    const Icon = item.icon;
                    const value = stats[item.key as keyof StatsData] ?? 0;

                    return (
                        <motion.div
                            key={item.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            className="glass-container rounded-2xl p-5 group hover:border-white/20 transition-all duration-300"
                        >
                            <div className={`${item.bg} p-2.5 rounded-xl w-fit mb-3`}>
                                <Icon className={`w-4 h-4 ${item.text}`} />
                            </div>
                            <div className="space-y-1">
                                {isLoading ? (
                                    <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
                                ) : (
                                    <span className="text-2xl md:text-3xl font-black text-white font-unbounded tracking-tight">
                                        {value.toLocaleString()}
                                    </span>
                                )}
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 font-robotoMono">
                                    {item.label}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
