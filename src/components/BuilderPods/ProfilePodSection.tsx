"use client";
import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Building2,
    Award,
    Code2,
    BookOpen,
    TrendingUp,
    ExternalLink,
    Shield,
} from "lucide-react";
import ConnectYourWallet from "../ComponentUtils/ConnectYourWallet";
import { useAccount } from "wagmi";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProfilePodSection() {
    const { address: walletAddress } = useAccount();
    const { data, isLoading } = useSWR(
        walletAddress
            ? `/api/builder-pods/members/me?wallet=${walletAddress}`
            : null,
        fetcher
    );

    if (!walletAddress) {
        return (
            <div className="py-8">
                <ConnectYourWallet showBg={false} />
            </div>
        );
    }
    if (isLoading) {
        return (
            <div className="glass-container rounded-2xl p-6 animate-pulse">
                <div className="h-5 w-40 bg-white/5 rounded-lg mb-4" />
                <div className="h-20 bg-white/[0.02] rounded-xl" />
            </div>
        );
    }

    if (!data?.membership) return null;

    const { membership, badges, stats } = data;
    const college = membership.collegeId;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-container rounded-2xl p-6"
        >
            <div className="flex items-center gap-2 mb-5">
                <Shield className="w-4 h-4 text-blue-400/50" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 font-robotoMono">
                    Builder Pod Membership
                </h3>
            </div>

            {/* College Info */}
            <Link
                href={`/builder-pods/${college?.slug}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all mb-5"
            >
                <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Building2 className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-white font-unbounded block truncate">
                        {college?.name}
                    </span>
                    <span className="text-[10px] text-white/20 font-robotoMono">
                        {college?.podName} · {college?.city}
                    </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase font-robotoMono ${membership.status === "active"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-amber-500/10 text-amber-400"
                    }`}>
                    {membership.status}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-white/15" />
            </Link>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-5">
                {[
                    { label: "Score", value: stats.score, icon: TrendingUp, color: "text-green-400" },
                    { label: "Rank", value: stats.rank ? `#${stats.rank}` : "—", icon: Award, color: "text-amber-400" },
                    { label: "Modules", value: stats.modules, icon: BookOpen, color: "text-blue-400" },
                    { label: "Deploys", value: stats.totalVerifiedDeployments, icon: Code2, color: "text-cyan-400" },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white/[0.02] rounded-xl p-3 text-center">
                            <Icon className={`w-3.5 h-3.5 ${s.color} mx-auto mb-1.5 opacity-40`} />
                            <span className="text-base font-black text-white font-unbounded block">
                                {s.value}
                            </span>
                            <p className="text-[8px] text-white/15 font-robotoMono uppercase font-bold">
                                {s.label}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Badges */}
            {badges?.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 font-robotoMono mb-2">
                        Badges ({badges.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {badges.map((badge: any) => (
                            <span
                                key={badge._id}
                                className="px-2.5 py-1 rounded-full bg-purple-500/5 border border-purple-500/10 text-[9px] font-bold text-purple-400/50 font-robotoMono"
                                title={badge.badgeSnapshot.label}
                            >
                                {badge.badgeSnapshot.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
