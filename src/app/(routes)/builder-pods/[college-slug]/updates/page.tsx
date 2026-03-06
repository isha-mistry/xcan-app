"use client";
import React from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    FileText,
    Calendar,
    User,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CollegeUpdatesPage() {
    const params = useParams();
    const slug = params["college-slug"] as string;

    const { data, isLoading } = useSWR(
        slug ? `/api/builder-pods/colleges/${slug}/updates` : null,
        fetcher
    );

    const updates = data?.updates ?? [];

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
                {updates.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400/60 font-robotoMono">
                        {updates.length} updates
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
                <div className="space-y-3">
                    {updates.map((update: any, index: number) => (
                        <motion.div
                            key={update._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.03 }}
                            className="glass-container rounded-2xl p-6 hover:border-white/15 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-[10px] font-bold text-blue-400/60 font-robotoMono">
                                        Week {update.weekNumber}
                                    </span>
                                    <span className="text-[10px] text-white/15 font-robotoMono">
                                        {update.year}
                                    </span>
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

                            {/* Summary */}
                            {update.summary && (
                                <p className="text-xs text-white/40 font-robotoMono mb-4 leading-relaxed">
                                    {update.summary}
                                </p>
                            )}

                            {/* Highlights */}
                            {update.highlights?.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-white/15 font-robotoMono mb-2">
                                        Highlights
                                    </h4>
                                    <div className="space-y-1.5">
                                        {update.highlights.map((h: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-green-400/30 mt-0.5 shrink-0" />
                                                <span className="text-[10px] text-white/25 font-robotoMono leading-relaxed">{h}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Blockers */}
                            {update.blockers?.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-red-400/30 font-robotoMono mb-2">
                                        Blockers
                                    </h4>
                                    <div className="space-y-1.5">
                                        {update.blockers.map((b: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <AlertCircle className="w-3 h-3 text-red-400/30 mt-0.5 shrink-0" />
                                                <span className="text-[10px] text-white/25 font-robotoMono leading-relaxed">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center gap-3 pt-3 border-t border-white/[0.03]">
                                {update.submittedBy && (
                                    <div className="flex items-center gap-1 text-[9px] text-white/10 font-robotoMono">
                                        <User className="w-2.5 h-2.5" />
                                        {update.submittedBy.slice(0, 8)}...
                                    </div>
                                )}
                                {update.activeMembersThisWeek != null && (
                                    <span className="text-[9px] text-white/10 font-robotoMono">
                                        {update.activeMembersThisWeek} active members
                                    </span>
                                )}
                                {update.deploymentsThisWeek != null && (
                                    <span className="text-[9px] text-white/10 font-robotoMono">
                                        {update.deploymentsThisWeek} deployments
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
