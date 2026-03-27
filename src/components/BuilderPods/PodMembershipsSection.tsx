"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Code2,
    ExternalLink,
    GraduationCap,
    Layers,
    Rocket,
    Trophy,
} from "lucide-react";
import { MembershipEntry, BadgeEntry } from "@/types/builder-pods";
import { getBuilderPodBadgeMeta } from "@/lib/builder-pods/badge-ui";

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
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                            {badges.map((badge) => {
                                const badgeMeta = getBuilderPodBadgeMeta(badge);

                                return (
                                    <div
                                        key={badge._id}
                                        className={`group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border p-3 sm:p-4 ${badgeMeta.surfaceClass}`}
                                    >
                                        <div className="relative">
                                            <div
                                                className={`relative overflow-hidden rounded-[1.25rem] border border-white/10 ${badgeMeta.imagePanelClass}`}
                                            >
                                                <div className={`pointer-events-none absolute inset-x-10 top-6 h-24 rounded-full blur-3xl opacity-90 ${badgeMeta.auraClass}`} />
                                                <div
                                                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${badgeMeta.glowGradientClass} opacity-60`}
                                                />
                                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)]" />
                                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                                    <Image
                                                        src={badgeMeta.imageSrc}
                                                        alt={badgeMeta.label}
                                                        fill
                                                        sizes="(min-width: 1536px) 18vw, (min-width: 1280px) 22vw, (min-width: 640px) 40vw, 100vw"
                                                        className="object-contain p-5 sm:p-6 drop-shadow-[0_18px_36px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-[1.04]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-1 flex-col">
                                                <p className="text-[9px] uppercase tracking-[0.22em] text-white/40 font-robotoMono">
                                                    Earned Badge
                                                </p>
                                                <p className={`mt-2 text-sm font-bold font-robotoMono ${badgeMeta.titleClass}`}>
                                                    {badgeMeta.label}
                                                </p>
                                                <p className="mt-2 text-xs leading-relaxed text-white/60 font-robotoMono">
                                                    {badgeMeta.description}
                                                </p>
                                                {badge.easUid && (
                                                    <a
                                                        href={`https://sepolia.easscan.org/attestation/view/${badge.easUid}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] font-robotoMono transition-all ${badgeMeta.buttonClass}`}
                                                    >
                                                        View EAS
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
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
