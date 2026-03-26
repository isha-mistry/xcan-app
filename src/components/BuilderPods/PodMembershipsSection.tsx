"use client";

import React from "react";
import Link from "next/link";
import {
    Award,
    Code2,
    ExternalLink,
    GraduationCap,
    Layers,
    Rocket,
    Trophy,
} from "lucide-react";
import { MembershipEntry, BadgeEntry } from "@/types/builder-pods";

const BADGE_COLORS: Record<string, { color: string; bg: string }> = {
    builder_lab_participant: { color: "text-cyan-400", bg: "bg-cyan-500/10" },
    builder_pod_member: { color: "text-green-400", bg: "bg-green-500/10" },
    builder_pod_lead: { color: "text-yellow-400", bg: "bg-yellow-500/10" },
    regional_showcase_finalist: { color: "text-purple-400", bg: "bg-purple-500/10" },
    regional_showcase_winner: { color: "text-amber-400", bg: "bg-amber-500/10" },
};

interface PodMembershipsSectionProps {
    memberships: MembershipEntry[];
    badges?: BadgeEntry[];
}

export default function PodMembershipsSection({
    memberships,
    badges = [],
}: PodMembershipsSectionProps) {
    if (!Array.isArray(memberships) || memberships.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 font-robotoMono">
                    Builder Pod Memberships
                </h3>
            </div>

            <div className="space-y-4">
                {memberships.map((entry) => {
                    const { member, college, projectCount } = entry;
                    const stats = [
                        { label: "Modules", value: member.stylusModulesCompleted ?? 0, icon: Layers },
                        { label: "Deployments", value: member.contractsDeployed ?? 0, icon: Rocket },
                        { label: "Projects", value: projectCount ?? 0, icon: Code2 },
                        { label: "Score", value: member.totalScore ?? 0, icon: Trophy },
                    ];

                    return (
                        <div
                            key={`${college?._id ?? college?.slug ?? member.joinedAt ?? member.name ?? "membership"}`}
                            className="glass-container rounded-2xl p-5"
                        >
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
                                <span
                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest font-robotoMono ${
                                        member.status === "active"
                                            ? "bg-green-500/10 text-green-400 border border-green-500/15"
                                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/15"
                                    }`}
                                >
                                    {member.status}
                                </span>
                                {member.individualRank && (
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/15 text-[9px] font-bold text-amber-400 font-robotoMono">
                                        Rank #{member.individualRank}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-4 gap-3 mb-4">
                                {stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="text-center p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                                    >
                                        <stat.icon className="w-3.5 h-3.5 mx-auto mb-1.5 text-white/45" />
                                        <p className="text-sm font-black text-white/80 font-robotoMono">{stat.value}</p>
                                        <p className="text-[8px] text-white/45 font-robotoMono uppercase tracking-widest">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {badges.length > 0 && (
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-2">
                            Badges ({badges.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {badges.map((badge) => {
                                const badgeColors = badge.slug
                                    ? BADGE_COLORS[badge.slug] || { color: "text-white/70", bg: "bg-white/[0.03]" }
                                    : { color: "text-white/70", bg: "bg-white/[0.03]" };

                                return (
                                    <div
                                        key={badge._id}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${badgeColors.bg} border border-white/[0.05]`}
                                    >
                                        <Award className={`w-3 h-3 ${badgeColors.color}`} />
                                        <span className={`text-[10px] font-bold font-robotoMono ${badgeColors.color}`}>
                                            {badge.label}
                                        </span>
                                        {badge.easUid && (
                                            <a
                                                href={`https://sepolia.easscan.org/attestation/view/${badge.easUid}`}
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
