"use client";
import React from "react";
import {
    MapPin,
    Users,
    UserCheck,
    FolderGit2,
    Calendar,
    Building2,
    Trophy,
    Sparkles,
} from "lucide-react";
import { CollegeData } from "@/types/builder-pods";
import { PageHero, StatPill, StatusChip } from "@/components/BuilderPods/ui";

interface PodOverviewCardProps {
    college: CollegeData;
    isLoading?: boolean;
}

export default function PodOverviewCard({ college, isLoading }: PodOverviewCardProps) {
    if (isLoading) {
        return (
            <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-blue-500/[0.08] via-transparent to-purple-500/[0.06] p-6 sm:p-8 animate-pulse">
                <div className="mb-3 h-5 w-20 rounded-full bg-white/5" />
                <div className="mb-2 h-9 w-64 rounded-lg bg-white/5" />
                <div className="mb-6 h-4 w-44 rounded-lg bg-white/5" />
                <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-14 w-28 rounded-2xl border border-white/10 bg-black/20"
                        />
                    ))}
                </div>
            </div>
        );
    }

    const isActive = college.status === "active";
    const activePct =
        college.memberCount > 0
            ? Math.round((college.activeMemberCount / college.memberCount) * 100)
            : 0;

    return (
        <PageHero
            accent={isActive ? "green" : "blue"}
            badge={`${college.status} pod`}
            BadgeIcon={Sparkles}
            title={college.name}
            description={
                <span className="text-white/70">{college.podName}</span>
            }
            meta={
                <>
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {college.city}, {college.state}
                    </span>
                    {college.regionSnapshot && (
                        <span className="inline-flex items-center gap-1.5">
                            <Building2 className="h-3 w-3" />
                            {college.regionSnapshot.name}
                        </span>
                    )}
                    {college.activatedAt && (
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            Activated{" "}
                            {new Date(college.activatedAt).toLocaleDateString("en-IN", {
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                    )}
                    {college.facultyCoordinator && (
                        <span className="inline-flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            Faculty: {college.facultyCoordinator}
                        </span>
                    )}
                    <StatusChip
                        label={college.status}
                        tone={college.status}
                        icon={
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                    isActive ? "bg-green-400 animate-pulse" : "bg-white/30"
                                }`}
                            />
                        }
                    />
                </>
            }
            stats={
                <>
                    <StatPill
                        icon={<Users className="h-3.5 w-3.5 text-blue-400" />}
                        label="Participants"
                        value={college.memberCount}
                    />
                    <StatPill
                        icon={<UserCheck className="h-3.5 w-3.5 text-green-400" />}
                        label="Active"
                        value={`${activePct}%`}
                    />
                    <StatPill
                        icon={<FolderGit2 className="h-3.5 w-3.5 text-purple-400" />}
                        label="Projects"
                        value={college.projectCount}
                    />
                    <StatPill
                        icon={<Trophy className="h-3.5 w-3.5 text-amber-400" />}
                        label="Showcase ready"
                        value={college.showcaseReadyProjectCount ?? 0}
                    />
                </>
            }
        >
            {college.memberCount > 0 && (
                <div className="max-w-md">
                    <div className="mb-1.5 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-white/40 font-robotoMono">
                        <span>Active participants</span>
                        <span>
                            {college.activeMemberCount}/{college.memberCount}
                        </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500/70 to-emerald-400/50 transition-all"
                            style={{ width: `${activePct}%` }}
                        />
                    </div>
                </div>
            )}
        </PageHero>
    );
}
