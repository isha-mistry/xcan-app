"use client";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Trophy,
    Loader2,
    Check,
    Star,
    Medal,
    X,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminShowcasesPage() {
    const { data, isLoading } = useSWR(
        "/api/admin/builder-pods/showcases",
        fetcher
    );

    const [processing, setProcessing] = useState<string | null>(null);

    const handleAction = async (submissionId: string, status: string, placement?: number) => {
        setProcessing(submissionId);
        try {
            await fetch("/api/admin/builder-pods/showcases", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submissionId,
                    status,
                    placement,
                    adminWallet: "admin",
                }),
            });
            mutate("/api/admin/builder-pods/showcases");
            mutate("/api/admin/builder-pods/dashboard");
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(null);
        }
    };

    const submissions = data?.submissions ?? [];

    const statusIcon = (status: string) => {
        switch (status) {
            case "winner": return <Medal className="w-3.5 h-3.5 text-yellow-400" />;
            case "finalist": return <Star className="w-3.5 h-3.5 text-purple-400" />;
            case "approved": return <Check className="w-3.5 h-3.5 text-green-400" />;
            default: return <Trophy className="w-3.5 h-3.5 text-white/20" />;
        }
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <Trophy className="w-5 h-5 text-purple-400/40" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Showcase Management
                </h1>
                {submissions.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-[10px] font-bold text-purple-400/60 font-robotoMono">
                        {submissions.length} submissions
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-xl p-5 animate-pulse">
                            <div className="h-4 w-48 bg-white/5 rounded-lg mb-2" />
                            <div className="h-3 w-32 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : submissions.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <Check className="w-8 h-8 text-green-400/30 mx-auto mb-3" />
                    <p className="text-sm text-white/30 font-robotoMono">No pending submissions</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {submissions.map((sub: any, index: number) => (
                        <motion.div
                            key={sub._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.03 }}
                            className="glass-container rounded-xl p-5 hover:border-white/15 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {statusIcon(sub.status)}
                                        <span className="text-sm font-bold text-white font-robotoMono">
                                            {sub.projectSnapshot?.name || sub.projectId?.name || "Unknown Project"}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold font-robotoMono ${sub.status === "finalist" ? "bg-purple-500/10 text-purple-400/60" :
                                                sub.status === "pending" ? "bg-white/5 text-white/20" :
                                                    "bg-green-500/10 text-green-400/60"
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/15 font-robotoMono">
                                        {sub.collegeSnapshot?.name || sub.collegeId?.name} · {sub.showcaseEventId?.name || "Showcase"}
                                    </p>
                                    {sub.githubRepo && (
                                        <a href={sub.githubRepo} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-400/40 font-robotoMono hover:text-blue-400/60 transition-colors">
                                            {sub.githubRepo}
                                        </a>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {sub.status === "pending" && (
                                        <>
                                            <button
                                                onClick={() => handleAction(sub._id, "approved")}
                                                disabled={processing === sub._id}
                                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                            >
                                                {processing === sub._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(sub._id, "rejected")}
                                                disabled={processing === sub._id}
                                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400/60 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                            >
                                                <X className="w-3 h-3" />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {(sub.status === "approved" || sub.status === "pending") && (
                                        <button
                                            onClick={() => handleAction(sub._id, "finalist")}
                                            disabled={processing === sub._id}
                                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                        >
                                            <Star className="w-3 h-3" />
                                            Finalist
                                        </button>
                                    )}
                                    {(sub.status === "finalist" || sub.status === "approved") && (
                                        <button
                                            onClick={() => handleAction(sub._id, "winner", 1)}
                                            disabled={processing === sub._id}
                                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                        >
                                            <Medal className="w-3 h-3" />
                                            Winner
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
