"use client";
import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ScrollText,
    Clock,
    Filter,
    Search,
    User,
} from "lucide-react";

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());

export default function AdminAuditLogsPage() {
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState("");
    const [walletFilter, setWalletFilter] = useState("");

    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (actionFilter) params.set("action", actionFilter);
    if (walletFilter) params.set("wallet", walletFilter);

    const { data, isLoading } = useSWR(
        `/api/admin/builder-pods/audit-logs?${params.toString()}`,
        fetcher
    );

    const logs = data?.logs ?? [];
    const totalPages = data?.totalPages ?? 1;

    const actionColors: Record<string, string> = {
        "member.register": "text-cyan-400",
        "member.approve": "text-green-400",
        "member.reject": "text-red-400/70",
        "deployment.verify": "text-blue-400",
        "deployment.reject": "text-red-400/70",
        "badge.auto_award": "text-yellow-400",
        "badge.manual_assign": "text-amber-400",
        "badge.attest": "text-purple-400",
        "showcase.approved": "text-green-400",
        "showcase.finalist": "text-purple-400",
        "showcase.winner": "text-yellow-400",
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <ScrollText className="w-5 h-5 text-white/55" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Audit Trail
                </h1>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/45" />
                    <input
                        type="text"
                        value={walletFilter}
                        onChange={(e) => { setWalletFilter(e.target.value); setPage(1); }}
                        placeholder="Filter by wallet..."
                        className="pl-8 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[10px] text-white/80 font-robotoMono placeholder:text-white/40 focus:outline-none focus:border-white/15 transition-colors w-56"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/45" />
                    <input
                        type="text"
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        placeholder="Filter by action..."
                        className="pl-8 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[10px] text-white/80 font-robotoMono placeholder:text-white/40 focus:outline-none focus:border-white/15 transition-colors w-56"
                    />
                </div>
            </div>

            {/* Logs */}
            {isLoading ? (
                <div className="space-y-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-12 bg-white/[0.02] rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : logs.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <ScrollText className="w-8 h-8 text-white/40 mx-auto mb-3" />
                    <p className="text-sm text-white/60 font-robotoMono">No audit logs found</p>
                </div>
            ) : (
                <>
                    <div className="glass-container rounded-2xl overflow-hidden">
                        <div className="space-y-0">
                            {logs.map((log: any, index: number) => (
                                <motion.div
                                    key={log._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                    className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors"
                                >
                                    <Clock className="w-3 h-3 text-white/40 shrink-0" />
                                    <div className="flex-1 min-w-0 flex items-center gap-3">
                                        <span className={`text-[10px] font-bold font-robotoMono whitespace-nowrap ${actionColors[log.action] || "text-white/70"}`}>
                                            {log.action}
                                        </span>
                                        <div className="flex items-center gap-1 text-[9px] text-white/45 font-robotoMono">
                                            <User className="w-2.5 h-2.5" />
                                            {log.actorWallet === "system"
                                                ? "system"
                                                : `${log.actorWallet.slice(0, 8)}...${log.actorWallet.slice(-4)}`}
                                        </div>
                                        {log.entityType && (
                                            <span className="text-[8px] text-white/30 font-robotoMono">
                                                {log.entityType}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[9px] text-white/40 font-robotoMono shrink-0">
                                        {new Date(log.createdAt).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] text-white/60 font-robotoMono hover:bg-white/10 transition-all disabled:opacity-20"
                            >
                                Previous
                            </button>
                            <span className="text-[10px] text-white/50 font-robotoMono">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] text-white/60 font-robotoMono hover:bg-white/10 transition-all disabled:opacity-20"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
