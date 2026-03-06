"use client";
import React from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Trophy,
    MapPin,
    Calendar,
    ExternalLink,
    Github,
    Award,
    Medal,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function RegionalShowcasePage() {
    const params = useParams();
    const regionSlug = params["region-slug"] as string;

    const { data: showcaseData, isLoading: showcaseLoading } = useSWR(
        "/api/builder-pods/showcases",
        fetcher
    );

    // Find the showcase matching this region slug
    const showcase = showcaseData?.showcases?.find(
        (s: any) =>
            s.slug === regionSlug ||
            s.regionSnapshot?.slug === regionSlug ||
            s._id === regionSlug
    );

    // Fetch submissions for this showcase
    const { data: submissionsData, isLoading: subsLoading } = useSWR(
        showcase?._id
            ? `/api/builder-pods/showcases?showcaseId=${showcase._id}`
            : null,
        fetcher
    );

    const isLoading = showcaseLoading || subsLoading;

    const statusColors: Record<string, string> = {
        winner: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        finalist: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        approved: "bg-green-500/10 text-green-400 border-green-500/20",
        pending: "bg-white/5 text-white/30 border-white/10",
        rejected: "bg-red-500/10 text-red-400/40 border-red-500/10",
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/builder-pods/showcase" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                All Showcases
            </Link>

            {isLoading ? (
                <div className="space-y-4">
                    <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
                    <div className="h-4 w-48 bg-white/5 rounded-lg animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="glass-container rounded-2xl p-6 animate-pulse">
                                <div className="h-5 w-48 bg-white/5 rounded-lg mb-3" />
                                <div className="h-4 w-32 bg-white/5 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : !showcase ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <Trophy className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30 font-robotoMono">Showcase not found</p>
                </div>
            ) : (
                <>
                    {/* Showcase Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-5 h-5 text-yellow-400/40" />
                            <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                                {showcase.name}
                            </h1>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-robotoMono ${statusColors[showcase.status] || 'bg-white/5 text-white/20'}`}>
                                {showcase.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-white/25 font-robotoMono">
                            {showcase.city && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {showcase.city}
                                </div>
                            )}
                            {showcase.eventDate && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(showcase.eventDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </div>
                            )}
                            {showcase.prizePoolUsd > 0 && (
                                <div className="flex items-center gap-1">
                                    <Award className="w-3 h-3 text-yellow-400/30" />
                                    ${showcase.prizePoolUsd.toLocaleString()} Prize Pool
                                </div>
                            )}
                        </div>

                        {showcase.description && (
                            <p className="text-xs text-white/20 font-robotoMono mt-3 max-w-2xl leading-relaxed">
                                {showcase.description}
                            </p>
                        )}
                    </motion.div>

                    {/* Winners Section */}
                    {submissionsData?.submissions?.filter((s: any) => s.status === "winner").length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Medal className="w-4 h-4 text-yellow-400/40" />
                                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-400/40 font-robotoMono">
                                    Winners
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {submissionsData.submissions
                                    .filter((s: any) => s.status === "winner")
                                    .map((sub: any, i: number) => (
                                        <SubmissionCard key={sub._id} sub={sub} index={i} statusColors={statusColors} />
                                    ))}
                            </div>
                        </motion.div>
                    )}

                    {/* All Submissions */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/20 font-robotoMono mb-4">
                            All Submissions ({submissionsData?.submissions?.length || 0})
                        </h2>
                        {!submissionsData?.submissions?.length ? (
                            <div className="glass-container rounded-2xl p-10 text-center">
                                <p className="text-xs text-white/20 font-robotoMono">No submissions yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {submissionsData.submissions.map((sub: any, i: number) => (
                                    <SubmissionCard key={sub._id} sub={sub} index={i} statusColors={statusColors} />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Submit Entry CTA */}
                    {showcase.status === "open" && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="mt-8 text-center"
                        >
                            <Link
                                href="/builder-pods/showcase-submit"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold font-robotoMono transition-all border border-blue-500/10"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Submit Your Project
                            </Link>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
}

function SubmissionCard({ sub, index, statusColors }: { sub: any; index: number; statusColors: Record<string, string> }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className="glass-container rounded-2xl p-5 hover:border-white/15 transition-all"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white font-robotoMono mb-1">
                        {sub.projectSnapshot?.name || "Untitled Project"}
                    </h3>
                    <p className="text-[10px] text-white/20 font-robotoMono">
                        {sub.collegeSnapshot?.name || "Unknown College"}
                    </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-robotoMono shrink-0 ${statusColors[sub.status] || "bg-white/5 text-white/20"}`}>
                    {sub.placement ? `#${sub.placement}` : sub.status}
                </span>
            </div>

            {sub.projectSnapshot?.problemStatement && (
                <p className="text-[10px] text-white/15 font-robotoMono mb-3 line-clamp-2 leading-relaxed">
                    {sub.projectSnapshot.problemStatement}
                </p>
            )}

            <div className="flex items-center gap-2">
                {sub.githubRepo && (
                    <a
                        href={sub.githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] text-white/30 font-robotoMono transition-all"
                    >
                        <Github className="w-3 h-3" />
                        GitHub
                    </a>
                )}
                {sub.demoLink && (
                    <a
                        href={sub.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] text-white/30 font-robotoMono transition-all"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Demo
                    </a>
                )}
            </div>
        </motion.div>
    );
}
