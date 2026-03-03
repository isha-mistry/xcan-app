"use client";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    Users,
    Check,
    X,
    Loader2,
    Clock,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminMembersPage() {
    const { data, isLoading } = useSWR(
        "/api/admin/builder-pods/members",
        fetcher
    );

    const [processing, setProcessing] = useState<string | null>(null);

    const handleAction = async (memberId: string, action: "approve" | "reject") => {
        setProcessing(memberId);
        try {
            await fetch("/api/admin/builder-pods/members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    memberId,
                    action,
                    adminWallet: "admin", // In production, get from auth context
                }),
            });
            mutate("/api/admin/builder-pods/members");
            mutate("/api/admin/builder-pods/dashboard");
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(null);
        }
    };

    const members = data?.members ?? [];

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <Users className="w-5 h-5 text-amber-400/40" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Member Approval Queue
                </h1>
                {members.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400/60 font-robotoMono">
                        {members.length} pending
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-xl p-5 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-white/5 rounded-lg" />
                                <div className="h-4 w-36 bg-white/5 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : members.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <Check className="w-8 h-8 text-green-400/30 mx-auto mb-3" />
                    <p className="text-sm text-white/30 font-robotoMono">All clear! No pending members.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {members.map((member: any, index: number) => (
                        <motion.div
                            key={member._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.03 }}
                            className="glass-container rounded-xl p-5 hover:border-white/15 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-white font-robotoMono">
                                            {member.name}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[8px] font-bold text-white/20 font-robotoMono uppercase">
                                            {member.role.replace("_", " ")}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/15 font-robotoMono">
                                        {member.collegeId?.name} · {member.walletAddress.slice(0, 8)}...{member.walletAddress.slice(-4)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-white/10 font-robotoMono">
                                        <Clock className="w-2.5 h-2.5" />
                                        {new Date(member.createdAt).toLocaleDateString("en-IN")}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAction(member._id, "approve")}
                                        disabled={processing === member._id}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                    >
                                        {processing === member._id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Check className="w-3 h-3" />
                                        )}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(member._id, "reject")}
                                        disabled={processing === member._id}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400/60 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
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
