"use client";
import React from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Code2, BookOpen, Activity } from "lucide-react";

interface PodScore {
    _id: string;
    collegeId: {
        _id: string;
        name: string;
        slug: string;
        city: string;
        state: string;
        podName: string;
        status: string;
    };
    totalScore: number;
    totalDeployments: number;
    totalModuleCompletions: number;
    projectStatusScore: number;
    weeklyActivityScore: number;
    activeMembersCount: number;
    totalMembersCount: number;
    rank: number | null;
}

interface PodLeaderboardTableProps {
    pods: PodScore[];
    isLoading?: boolean;
}

const medalColors = ["text-amber-400", "text-gray-300", "text-amber-600"];

export default function PodLeaderboardTable({ pods, isLoading }: PodLeaderboardTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="glass-container rounded-2xl p-5 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl" />
                            <div className="h-4 w-40 bg-white/5 rounded-lg" />
                            <div className="ml-auto h-6 w-16 bg-white/5 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!pods.length) {
        return (
            <div className="glass-container rounded-2xl p-12 text-center">
                <p className="text-white/50 text-sm font-robotoMono py-20">No leaderboard data yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 min-h-svh">
            {pods.map((pod, index) => {
                const rank = pod.rank ?? index + 1;
                const isTopThree = rank <= 3;
                const activePercent = pod.totalMembersCount > 0
                    ? Math.round((pod.activeMembersCount / pod.totalMembersCount) * 100)
                    : 0;

                return (
                    <motion.div
                        key={pod._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        className={`glass-container rounded-2xl p-5 hover:border-white/20 transition-all ${isTopThree ? "border-white/15" : ""
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-unbounded font-black text-sm ${isTopThree
                                    ? `bg-white/5 ${medalColors[rank - 1]}`
                                    : "bg-white/[0.02] text-white/50"
                                }`}>
                                {isTopThree ? <Trophy className="w-5 h-5" /> : `#${rank}`}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white font-unbounded truncate">
                                    {pod.collegeId?.name || "Unknown"}
                                </h3>
                                <p className="text-[10px] text-white/50 font-robotoMono">
                                    {pod.collegeId?.city}, {pod.collegeId?.state} · {activePercent}% active
                                </p>
                            </div>

                            {/* Score Breakdown */}
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] text-white/55 font-robotoMono" title="Deployments">
                                    <Code2 className="w-3 h-3" />
                                    {pod.totalDeployments}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-white/55 font-robotoMono" title="Modules">
                                    <BookOpen className="w-3 h-3" />
                                    {pod.totalModuleCompletions}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-white/55 font-robotoMono" title="Weekly Activity">
                                    <Activity className="w-3 h-3" />
                                    {pod.weeklyActivityScore}
                                </div>
                            </div>

                            {/* Total Score */}
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-green-400/80" />
                                <span className="text-lg font-black text-white font-unbounded">
                                    {pod.totalScore}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
