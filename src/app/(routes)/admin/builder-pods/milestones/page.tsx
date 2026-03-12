"use client";
import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Target,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());

export default function AdminMilestonesPage() {
    const { data, isLoading } = useSWR(
        "/api/builder-pods/analytics/milestones",
        fetcher
    );

    const milestones = data?.milestones ?? [];

    const getProgress = (current: number, target: number) => {
        if (target <= 0) return 0;
        return Math.min(Math.round((current / target) * 100), 100);
    };

    const getColor = (progress: number) => {
        if (progress >= 100) return { bar: "bg-green-400", text: "text-green-400", bg: "bg-green-500/10" };
        if (progress >= 70) return { bar: "bg-blue-400", text: "text-blue-400", bg: "bg-blue-500/10" };
        if (progress >= 40) return { bar: "bg-yellow-400", text: "text-yellow-400", bg: "bg-yellow-500/10" };
        return { bar: "bg-red-400", text: "text-red-400", bg: "bg-red-500/10" };
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <Target className="w-5 h-5 text-emerald-400/40" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Milestone KPI Tracker
                </h1>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-2xl p-6 animate-pulse">
                            <div className="h-4 w-32 bg-white/5 rounded-lg mb-4" />
                            <div className="h-3 w-full bg-white/5 rounded-full mb-2" />
                            <div className="h-3 w-20 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : milestones.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <Target className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30 font-robotoMono">No milestones configured</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {milestones.map((ms: any, index: number) => {
                        const progress = getProgress(ms.current, ms.target);
                        const colors = getColor(progress);
                        return (
                            <motion.div
                                key={ms._id || index}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="glass-container rounded-2xl p-6 hover:border-white/15 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-white font-robotoMono mb-1">
                                            {ms.label || ms.kpiName}
                                        </h3>
                                        {ms.description && (
                                            <p className="text-[10px] text-white/15 font-robotoMono">
                                                {ms.description}
                                            </p>
                                        )}
                                    </div>
                                    {progress >= 100 ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-400/60 shrink-0" />
                                    ) : progress < 40 ? (
                                        <AlertCircle className="w-4 h-4 text-red-400/40 shrink-0" />
                                    ) : (
                                        <TrendingUp className={`w-4 h-4 ${colors.text} opacity-40 shrink-0`} />
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden mb-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                        className={`h-full rounded-full ${colors.bar} opacity-60`}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white/20 font-robotoMono">
                                        {ms.current?.toLocaleString()} / {ms.target?.toLocaleString()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} text-[9px] font-bold font-robotoMono`}>
                                        {progress}%
                                    </span>
                                </div>

                                {ms.deadline && (
                                    <p className="text-[9px] text-white/10 font-robotoMono mt-2">
                                        Deadline: {new Date(ms.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
