"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FolderGit2, CalendarDays, Github, AlertTriangle, Target, CheckCircle, FileText, Edit3 } from "lucide-react";
import WeeklyUpdateForm from "./WeeklyUpdateForm";
import { useAccount } from "wagmi";
import { UpdateData, ProjectData } from "@/types/builder-pods";

interface WeeklyUpdatesFeedProps {
    updates: UpdateData[];
    projects?: ProjectData[];
    isLoading?: boolean;
    slug?: string;
    isTeamLead?: boolean;
    onRefresh?: () => void;
}

export default function WeeklyUpdatesFeed({
    updates,
    projects = [],
    isLoading,
    slug,
    isTeamLead,
    onRefresh,
}: WeeklyUpdatesFeedProps) {
    const { address } = useAccount();

    if (isLoading) {
        return (
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <CalendarDays className="w-4 h-4 text-white/60" />
                    <div className="h-4 w-32 bg-white/5 rounded-lg animate-pulse" />
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="glass-container rounded-2xl p-6 mb-3 animate-pulse">
                        <div className="h-4 w-24 bg-white/5 rounded-lg mb-3" />
                        <div className="h-3 w-full bg-white/5 rounded-lg mb-2" />
                        <div className="h-3 w-2/3 bg-white/5 rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-white/60" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 font-robotoMono">
                        Weekly Updates
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/60 font-robotoMono">
                        {updates.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {isTeamLead && slug && (
                        <WeeklyUpdateForm
                            collegeSlug={slug}
                            projects={projects}
                            onSuccess={() => onRefresh?.()}
                        />
                    )}
                    {slug && updates.length > 0 && (
                        <Link
                            href={`/builder-pods/${slug}/updates`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 font-robotoMono uppercase tracking-wider hover:bg-white/10 hover:text-white/80 transition-all"
                        >
                            <FileText className="w-3 h-3" />
                            View All
                        </Link>
                    )}
                </div>
            </div>

            {updates.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <p className="text-white/50 text-sm font-robotoMono">
                        No weekly updates submitted yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {updates.map((update, index) => (
                        <motion.div
                            key={update._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="glass-container rounded-2xl p-5 hover:border-white/15 transition-all"
                        >
                            {/* Header */}
                            <div className="flex flex-col gap-2 mb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-[10px] font-bold text-blue-400 font-robotoMono">
                                            W{update.weekNumber} · {update.year}
                                        </span>
                                        {update.targetProjectId && projects && projects.find((p: any) => p._id === update.targetProjectId) && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-white/70 font-robotoMono">
                                                <FolderGit2 className="w-3 h-3 text-white/40" />
                                                {projects.find((p: any) => p._id === update.targetProjectId)?.name}
                                            </span>
                                        )}
                                        {update.reviewedBy && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-green-400 font-robotoMono uppercase tracking-wider">
                                                <CheckCircle className="w-3 h-3" />
                                                Reviewed
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {slug && (
                                            (update.targetProjectId && projects && projects.find((p) => p._id === update.targetProjectId)?.teamLeader?.toLowerCase() === address?.toLowerCase()) ||
                                            (update.submittedBy.toLowerCase() === address?.toLowerCase()) ||
                                            // Fallback for older updates with no target project where the user is just a team lead
                                            (isTeamLead && !update.targetProjectId && update.submittedBy.toLowerCase() === address?.toLowerCase())
                                        ) && (
                                            <WeeklyUpdateForm
                                                collegeSlug={slug}
                                                projects={projects}
                                                onSuccess={() => onRefresh?.()}
                                                editData={{
                                                    id: update._id,
                                                    targetProjectId: update.targetProjectId,
                                                    completedThisWeek: update.completedThisWeek,
                                                    blockers: update.blockers,
                                                    nextMilestone: update.nextMilestone,
                                                    githubLink: update.githubLink,
                                                }}
                                                trigger={
                                                    <button className="p-1 rounded-md hover:bg-white/5 text-white/50 hover:text-white/70 transition-all cursor-pointer">
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                }
                                            />
                                        )}
                                        <span className="text-[10px] text-white/45 font-robotoMono">
                                            {new Date(update.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                {/* Completed */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1">
                                        Completed
                                    </p>
                                    <p className="text-xs text-white/75 font-robotoMono leading-relaxed">
                                        {update.completedThisWeek}
                                    </p>
                                </div>

                                {/* Blockers */}
                                {update.blockers && (
                                    <div>
                                        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-400/60 font-robotoMono mb-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            Blockers
                                        </p>
                                        <p className="text-xs text-white/60 font-robotoMono leading-relaxed">
                                            {update.blockers}
                                        </p>
                                    </div>
                                )}

                                {/* Next Milestone */}
                                <div>
                                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1">
                                        <Target className="w-3 h-3" />
                                        Next Milestone
                                    </p>
                                    <p className="text-xs text-white/75 font-robotoMono leading-relaxed">
                                        {update.nextMilestone}
                                    </p>
                                </div>
                            </div>

                            {/* GitHub Link */}
                            {update.githubLink && (
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    <a
                                        href={update.githubLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[10px] font-bold text-white/55 hover:text-white/75 font-robotoMono uppercase tracking-wider transition-colors"
                                    >
                                        <Github className="w-3.5 h-3.5" />
                                        View commits
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
