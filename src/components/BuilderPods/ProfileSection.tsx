"use client";
import React from "react";
import useSWR from "swr";
import Link from "next/link";
import {
    Award,
    ExternalLink,
    GraduationCap,
    Code2,
    Rocket,
    Layers,
    Trophy,
    Loader2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const BADGE_COLORS: Record<string, { color: string; bg: string }> = {
    builder_lab_participant: { color: "text-cyan-400", bg: "bg-cyan-500/10" },
    builder_pod_member: { color: "text-green-400", bg: "bg-green-500/10" },
    builder_pod_lead: { color: "text-yellow-400", bg: "bg-yellow-500/10" },
    regional_showcase_finalist: { color: "text-purple-400", bg: "bg-purple-500/10" },
    regional_showcase_winner: { color: "text-amber-400", bg: "bg-amber-500/10" },
};

interface ProfileSectionProps {
    walletAddress: string;
}

export default function ProfileSection({ walletAddress }: ProfileSectionProps) {
    const { data, isLoading } = useSWR(
        walletAddress ? `/api/builder-pods/profile/${walletAddress}` : null,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-white/50" />
            </div>
        );
    }

    if (!data?.success || !data.enrolled) {
        return null;
    }

    const { member, college, badges, projectCount } = data;

    const stats = [
        { label: "Modules", value: member.stylusModulesCompleted, icon: Layers },
        { label: "Deployments", value: member.contractsDeployed, icon: Rocket },
        { label: "Projects", value: projectCount, icon: Code2 },
        { label: "Score", value: member.totalScore, icon: Trophy },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 font-robotoMono">
                    Builder Pod
                </h3>
            </div>

            <div className="glass-container rounded-2xl p-5">
                {college && (
                    <div className="mb-4">
                        <Link
                            href={`/builder-pods/${college.slug}`}
                            className="text-sm font-bold text-white/70 hover:text-white transition-colors font-robotoMono"
                        >
                            {college.podName || college.name}
                        </Link>
                        <p className="text-[10px] text-white/50 font-robotoMono">
                            {college.city}, {college.state}
                        </p>
                    </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[9px] font-bold uppercase tracking-widest text-white/60 font-robotoMono">
                        {member.role}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest font-robotoMono ${
                        member.status === "active"
                            ? "bg-green-500/10 text-green-400 border border-green-500/15"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/15"
                    }`}>
                        {member.status}
                    </span>
                    {member.individualRank && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/15 text-[9px] font-bold text-amber-400 font-robotoMono">
                            Rank #{member.individualRank}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <s.icon className="w-3.5 h-3.5 mx-auto mb-1.5 text-white/45" />
                            <p className="text-sm font-black text-white/80 font-robotoMono">{s.value}</p>
                            <p className="text-[8px] text-white/45 font-robotoMono uppercase tracking-widest">{s.label}</p>
                        </div>
                    ))}
                </div>

                {badges.length > 0 && (
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-2">
                            Badges ({badges.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {badges.map((b: any) => {
                                const bc = BADGE_COLORS[b.slug] || { color: "text-white/70", bg: "bg-white/[0.03]" };
                                return (
                                    <div key={b._id} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${bc.bg} border border-white/[0.05]`}>
                                        <Award className={`w-3 h-3 ${bc.color}`} />
                                        <span className={`text-[10px] font-bold font-robotoMono ${bc.color}`}>
                                            {b.label}
                                        </span>
                                        {b.easUid && (
                                            <a
                                                href={`https://sepolia.easscan.org/attestation/view/${b.easUid}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white/50 hover:text-white/75 transition-colors"
                                            >
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
