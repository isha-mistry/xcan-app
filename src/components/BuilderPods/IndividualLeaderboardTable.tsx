"use client";
import React from "react";
import { motion } from "framer-motion";
import { Trophy, Code2, BookOpen, Award } from "lucide-react";
import { IndividualScore } from "@/types/builder-pods";

interface IndividualLeaderboardTableProps {
    individuals: IndividualScore[];
    isLoading?: boolean;
}

const medalColors = ["text-amber-400", "text-gray-300", "text-amber-600"];

export default function IndividualLeaderboardTable({
    individuals,
    isLoading,
}: IndividualLeaderboardTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="glass-container rounded-xl p-4 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-white/5 rounded-lg" />
                            <div className="h-4 w-32 bg-white/5 rounded-lg" />
                            <div className="ml-auto h-5 w-12 bg-white/5 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!individuals.length) {
        return (
            <div className="glass-container rounded-2xl p-12 text-center">
                <p className="text-white/50 text-sm font-robotoMono">No individual rankings yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {individuals.map((person, index) => {
                const rank = person.individualRank ?? index + 1;
                const isTopThree = rank <= 3;

                return (
                    <motion.div
                        key={person._id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        className="glass-container rounded-xl p-4 hover:border-white/15 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            {/* Rank */}
                            <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-unbounded font-black text-xs ${isTopThree
                                    ? `bg-white/5 ${medalColors[rank - 1]}`
                                    : "bg-white/[0.02] text-white/45"
                                }`}>
                                {isTopThree ? <Trophy className="w-4 h-4" /> : rank}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white font-robotoMono truncate">
                                        {person.name}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[8px] font-bold text-white/50 font-robotoMono uppercase tracking-wider">
                                        {person.role.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="text-[10px] text-white/45 font-robotoMono truncate">
                                    {person.collegeId?.name || "Unknown"} · {person.walletAddress.slice(0, 6)}...{person.walletAddress.slice(-4)}
                                </p>
                            </div>

                            {/* Metrics */}
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] text-white/50 font-robotoMono" title="Modules">
                                    <BookOpen className="w-3 h-3" />
                                    {person.stylusModulesCompleted}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-white/50 font-robotoMono" title="Deploys">
                                    <Code2 className="w-3 h-3" />
                                    {person.contractsDeployed}
                                </div>
                            </div>

                            {/* Score */}
                            <div className="flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-amber-400/70" />
                                <span className="text-base font-black text-white font-unbounded">
                                    {person.totalScore}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
