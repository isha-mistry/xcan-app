"use client";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Award,
    ExternalLink,
    Loader2,
    Search,
    Shield,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

import { adminFetcher, ADMIN_SWR_STATIC_OPTIONS } from "@/lib/fetchers";

const BADGE_SLUGS = [
    { slug: "builder_lab_participant", label: "Lab Participant", color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { slug: "builder_pod_member", label: "Pod Member", color: "text-green-400", bg: "bg-green-500/10" },
    { slug: "builder_pod_lead", label: "Pod Lead", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { slug: "regional_showcase_finalist", label: "Showcase Finalist", color: "text-purple-400", bg: "bg-purple-500/10" },
    { slug: "regional_showcase_winner", label: "Showcase Winner", color: "text-amber-400", bg: "bg-amber-500/10" },
];

export default function AdminBadgesPage() {
    const { data: badgeTypesData } = useSWR("/api/builder-pods/badges", adminFetcher, ADMIN_SWR_STATIC_OPTIONS);
    const [walletSearch, setWalletSearch] = useState("");
    const { data: userBadgesData, isLoading: userLoading } = useSWR(
        walletSearch.length >= 6 ? `/api/builder-pods/badges/user/${walletSearch}` : null,
        adminFetcher,
        ADMIN_SWR_STATIC_OPTIONS
    );

    const [assigning, setAssigning] = useState(false);
    const [attesting, setAttesting] = useState<string | null>(null);
    const [assignResult, setAssignResult] = useState<{ success: boolean; message: string } | null>(null);
    const [form, setForm] = useState({
        walletAddress: "",
        badgeSlug: "",
        collegeId: "",
    });

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setAssigning(true);
        setAssignResult(null);
        try {
            const res = await fetch("/api/builder-pods/badges/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setAssignResult({ success: true, message: `Badge "${form.badgeSlug}" assigned successfully.` });
                setForm({ walletAddress: "", badgeSlug: "", collegeId: "" });
                if (walletSearch) mutate(`/api/builder-pods/badges/user/${walletSearch}`);
            } else {
                setAssignResult({ success: false, message: data.error || "Failed to assign badge." });
            }
        } catch {
            setAssignResult({ success: false, message: "Network error. Please try again." });
        } finally {
            setAssigning(false);
        }
    };

    const handleAttest = async (badgeId: string) => {
        setAttesting(badgeId);
        try {
            const res = await fetch(`/api/builder-pods/badges/attest/${badgeId}`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (data.success || data.easUid) {
                if (walletSearch) mutate(`/api/builder-pods/badges/user/${walletSearch}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAttesting(null);
        }
    };

    const badgeTypes = badgeTypesData?.badges ?? [];
    const userBadges = userBadgesData?.badges ?? [];

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <Award className="w-5 h-5 text-yellow-400/70" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Badge Management
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assign Badge */}
                <motion.form
                    onSubmit={handleAssign}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="glass-container rounded-2xl p-6"
                >
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 font-robotoMono mb-4">
                        Assign Badge
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1.5">
                                Wallet Address *
                            </label>
                            <input
                                type="text"
                                value={form.walletAddress}
                                onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                                placeholder="0x..."
                                required
                                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono placeholder:text-white/40 focus:outline-none focus:border-white/15 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1.5">
                                Badge Type *
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {BADGE_SLUGS.map((b) => (
                                    <button
                                        key={b.slug}
                                        type="button"
                                        onClick={() => setForm({ ...form, badgeSlug: b.slug })}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-robotoMono transition-all border ${form.badgeSlug === b.slug
                                                ? `${b.bg} ${b.color} border-current`
                                                : "bg-white/[0.02] border-white/[0.05] text-white/50"
                                            }`}
                                    >
                                        {b.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1.5">
                                College ID (optional)
                            </label>
                            <input
                                type="text"
                                value={form.collegeId}
                                onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
                                placeholder="MongoDB ObjectId"
                                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono placeholder:text-white/40 focus:outline-none focus:border-white/15 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={assigning || !form.walletAddress || !form.badgeSlug}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-[10px] font-bold font-robotoMono transition-all border border-yellow-500/10 disabled:opacity-30"
                        >
                            {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                            Assign Badge
                        </button>
                        {assignResult && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg text-[10px] font-robotoMono ${assignResult.success ? "bg-green-500/5 text-green-400" : "bg-red-500/5 text-red-400"}`}>
                                {assignResult.success ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                                {assignResult.message}
                            </div>
                        )}
                    </div>
                </motion.form>

                {/* Search User Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="glass-container rounded-2xl p-6"
                >
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 font-robotoMono mb-4">
                        Look Up User Badges
                    </h2>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/45" />
                        <input
                            type="text"
                            value={walletSearch}
                            onChange={(e) => setWalletSearch(e.target.value.toLowerCase())}
                            placeholder="Enter wallet address..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono placeholder:text-white/40 focus:outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    {userLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-10 bg-white/[0.02] rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : userBadges.length > 0 ? (
                        <div className="space-y-2">
                            {userBadges.map((badge: any) => {
                                const meta = BADGE_SLUGS.find((b) => b.slug === badge.badgeSnapshot?.slug);
                                return (
                                    <div key={badge._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.01]">
                                        <Award className={`w-4 h-4 ${meta?.color || "text-white/50"}`} />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs text-white/75 font-robotoMono font-bold">
                                                {badge.badgeSnapshot?.label || badge.badgeSnapshot?.slug}
                                            </span>
                                            <p className="text-[9px] text-white/45 font-robotoMono">
                                                {new Date(badge.assignedAt).toLocaleDateString("en-IN")}
                                                {badge.easUid && (
                                                    <>
                                                        {" · "}
                                                        <a
                                                            href={`https://sepolia.easscan.org/attestation/view/${badge.easUid}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-cyan-400 hover:text-cyan-400 inline-flex items-center gap-0.5"
                                                        >
                                                            Attested <ExternalLink className="w-2.5 h-2.5 inline" />
                                                        </a>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        {!badge.easUid && (
                                            <button
                                                onClick={() => handleAttest(badge._id)}
                                                disabled={attesting === badge._id}
                                                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[9px] font-bold font-robotoMono transition-all border border-cyan-500/10 disabled:opacity-30"
                                            >
                                                {attesting === badge._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                                                Attest
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : walletSearch.length >= 6 ? (
                        <p className="text-[10px] text-white/45 font-robotoMono text-center py-4">
                            No badges found for this wallet
                        </p>
                    ) : null}
                </motion.div>
            </div>

            {/* Badge Types Reference */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-container rounded-2xl p-6 mt-6"
            >
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 font-robotoMono mb-4">
                    Badge Types ({badgeTypes.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {badgeTypes.map((bt: any) => {
                        const meta = BADGE_SLUGS.find((b) => b.slug === bt.slug);
                        return (
                            <div key={bt._id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                                <Award className={`w-5 h-5 mx-auto mb-2 ${meta?.color || "text-white/50"}`} />
                                <p className="text-[10px] font-bold text-white/70 font-robotoMono">{bt.label}</p>
                                <p className="text-[8px] text-white/40 font-robotoMono mt-1">{bt.slug}</p>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
