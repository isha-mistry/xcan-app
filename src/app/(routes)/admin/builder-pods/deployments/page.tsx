"use client";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    Code2,
    Check,
    X,
    Loader2,
    ExternalLink,
} from "lucide-react";

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());

export default function AdminDeploymentsPage() {
    const { data, isLoading } = useSWR(
        "/api/admin/builder-pods/deployments",
        fetcher
    );
    const [processing, setProcessing] = useState<string | null>(null);

    const handleAction = async (deploymentId: string, action: "verify" | "reject") => {
        setProcessing(deploymentId);
        try {
            await fetch("/api/admin/builder-pods/deployments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    deploymentId,
                    action,
                }),
            });
            mutate("/api/admin/builder-pods/deployments");
            mutate("/api/admin/builder-pods/dashboard");
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(null);
        }
    };

    const deployments = data?.deployments ?? [];

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <Code2 className="w-5 h-5 text-blue-400/70" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Deployment Verification
                </h1>
                {deployments.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400 font-robotoMono">
                        {deployments.length} pending
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-xl p-5 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-white/5 rounded-lg" />
                                <div className="h-4 w-48 bg-white/5 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : deployments.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <Check className="w-8 h-8 text-green-400/60 mx-auto mb-3" />
                    <p className="text-sm text-white/60 font-robotoMono">All deployments verified!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {deployments.map((dep: any, index: number) => (
                        <motion.div
                            key={dep._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.03 }}
                            className="glass-container rounded-xl p-5 hover:border-white/15 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-white font-robotoMono truncate">
                                            {dep.txHash.slice(0, 14)}...{dep.txHash.slice(-6)}
                                        </span>
                                        <a
                                            href={`https://sepolia.arbiscan.io/tx/${dep.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400/70 hover:text-blue-400 transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <p className="text-[10px] text-white/45 font-robotoMono">
                                        {dep.collegeId?.name || "Unknown"} · {dep.walletAddress.slice(0, 8)}...{dep.walletAddress.slice(-4)}
                                        {dep.description && ` · ${dep.description}`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAction(dep._id, "verify")}
                                        disabled={processing === dep._id}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                    >
                                        {processing === dep._id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Check className="w-3 h-3" />
                                        )}
                                        Verify
                                    </button>
                                    <button
                                        onClick={() => handleAction(dep._id, "reject")}
                                        disabled={processing === dep._id}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                    >
                                        <X className="w-3 h-3" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
