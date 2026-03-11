"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    FileText,
    Calendar,
    User,
    CheckCircle,
    AlertTriangle,
    Target,
    Github,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CollegeUpdatesPage() {
    const params = useParams();
    const slug = params["college-slug"] as string;
    const [page, setPage] = useState(1);

    const { data, isLoading } = useSWR(
        slug ? `/api/builder-pods/colleges/${slug}/updates?page=${page}&limit=10` : null,
        fetcher
    );

    const updates = data?.updates ?? [];
    const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href={`/builder-pods/${slug}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Pod
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <FileText className="w-5 h-5 text-blue-400/40" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Weekly Updates
                </h1>
                {pagination.total > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400/60 font-robotoMono">
                        {pagination.total} updates
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-2xl p-6 animate-pulse">
                            <div className="h-5 w-32 bg-white/5 rounded-lg mb-3" />
                            <div className="h-4 w-full bg-white/5 rounded-lg mb-2" />
                            <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : updates.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <FileText className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30 font-robotoMono">No weekly updates yet</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {updates.map((update: any, index: number) => (
                            <motion.div
                                key={update._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: index * 0.03 }}
                                className="glass-container rounded-2xl p-6 hover:border-white/15 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-[10px] font-bold text-blue-400/60 font-robotoMono">
                                            W{update.weekNumber} · {update.year}
                                        </span>
                                        {update.reviewedBy && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-green-400/60 font-robotoMono uppercase tracking-wider">
                                                <CheckCircle className="w-3 h-3" />
                                                Reviewed
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-white/15 font-robotoMono">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(update.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    {/* Completed */}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 font-robotoMono mb-1">
                                            Completed
                                        </p>
                                        <p className="text-xs text-white/50 font-robotoMono leading-relaxed">
                                            {update.completedThisWeek}
                                        </p>
                                    </div>

                                    {/* Blockers */}
                                    {update.blockers && (
                                        <div>
                                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-400/30 font-robotoMono mb-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Blockers
                                            </p>
                                            <p className="text-xs text-white/35 font-robotoMono leading-relaxed">
                                                {update.blockers}
                                            </p>
                                        </div>
                                    )}

                                    {/* Next Milestone */}
                                    <div>
                                        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/20 font-robotoMono mb-1">
                                            <Target className="w-3 h-3" />
                                            Next Milestone
                                        </p>
                                        <p className="text-xs text-white/50 font-robotoMono leading-relaxed">
                                            {update.nextMilestone}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.03]">
                                    {update.submittedBy && (
                                        <div className="flex items-center gap-1 text-[9px] text-white/10 font-robotoMono">
                                            <User className="w-2.5 h-2.5" />
                                            {update.submittedBy.slice(0, 8)}...
                                        </div>
                                    )}
                                    {update.githubLink && (
                                        <a
                                            href={update.githubLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[9px] font-bold text-white/15 hover:text-white/40 font-robotoMono uppercase tracking-wider transition-colors"
                                        >
                                            <Github className="w-3 h-3" />
                                            View commits
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-8">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/30 font-robotoMono disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                            >
                                <ChevronLeft className="w-3 h-3" />
                                Prev
                            </button>
                            <span className="text-[10px] text-white/20 font-robotoMono">
                                {page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                disabled={page >= pagination.totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/30 font-robotoMono disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                            >
                                Next
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
