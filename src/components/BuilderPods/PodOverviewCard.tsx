"use client";
import React from "react";
import { motion } from "framer-motion";
import {
    MapPin,
    Users,
    UserCheck,
    Code2,
    FolderGit2,
    Calendar,
    Building2,
} from "lucide-react";

interface CollegeData {
    name: string;
    podName: string;
    city: string;
    state: string;
    regionSnapshot?: { name: string; showcaseCity: string };
    status: string;
    tier: string;
    memberCount: number;
    activeMemberCount: number;
    projectCount: number;
    deploymentCount: number;
    activatedAt: string | null;
    facultyCoordinator: string | null;
}

interface PodOverviewCardProps {
    college: CollegeData;
    isLoading?: boolean;
}

export default function PodOverviewCard({ college, isLoading }: PodOverviewCardProps) {
    if (isLoading) {
        return (
            <div className="glass-container rounded-2xl p-6 md:p-8 mb-8 animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div className="space-y-3">
                        <div className="h-6 w-24 bg-white/5 rounded-full" />
                        <div className="h-8 w-64 bg-white/5 rounded-lg" />
                        <div className="h-4 w-44 bg-white/5 rounded-lg" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-4 w-32 bg-white/5 rounded-lg" />
                    ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="bg-white/[0.02] rounded-xl p-4 border border-white/5"
                        >
                            <div className="w-8 h-8 bg-white/5 rounded-lg mb-2" />
                            <div className="h-6 w-16 bg-white/5 rounded-lg mb-2" />
                            <div className="h-3 w-20 bg-white/5 rounded-lg" />
                        </div>
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

    const stats = [
        {
            label: "Members",
            value: college.memberCount,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            label: "Active Members",
            value: `${activePct}%`,
            subtitle: `${college.activeMemberCount}/${college.memberCount}`,
            icon: UserCheck,
            color: "text-green-400",
            bg: "bg-green-500/10",
            pct: activePct,
        },
        {
            label: "Projects",
            value: college.projectCount,
            icon: FolderGit2,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
        },
        {
            label: "Deployments",
            value: college.deploymentCount,
            icon: Code2,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-container rounded-2xl p-6 md:p-8 mb-8"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] font-robotoMono ${isActive
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : "bg-white/5 text-white/60 border border-white/10"
                                }`}
                        >
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-white/20"
                                    }`}
                            />
                            {college.status}
                        </span>
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider font-robotoMono">
                            {college.tier}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white font-unbounded tracking-tight">
                        {college.name}
                    </h1>
                    <p className="text-sm text-white/60 font-robotoMono mt-1">
                        {college.podName}
                    </p>
                </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1.5 text-xs text-white/70 font-robotoMono">
                    <MapPin className="w-3.5 h-3.5" />
                    {college.city}, {college.state}
                </div>
                {college.regionSnapshot && (
                    <div className="flex items-center gap-1.5 text-xs text-white/70 font-robotoMono">
                        <Building2 className="w-3.5 h-3.5" />
                        {college.regionSnapshot.name}
                    </div>
                )}
                {college.activatedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-white/70 font-robotoMono">
                        <Calendar className="w-3.5 h-3.5" />
                        Activated{" "}
                        {new Date(college.activatedAt).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                        })}
                    </div>
                )}
                {college.facultyCoordinator && (
                    <div className="flex items-center gap-1.5 text-xs text-white/70 font-robotoMono">
                        <Users className="w-3.5 h-3.5" />
                        Faculty: {college.facultyCoordinator}
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="bg-white/[0.02] rounded-xl p-4 border border-white/5"
                        >
                            <div className={`${stat.bg} p-2 rounded-lg w-fit mb-2`}>
                                <Icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <span className="text-xl font-black text-white font-unbounded">
                                {stat.value}
                            </span>
                            {(stat as any).subtitle && (
                                <span className="text-[9px] text-white/45 font-robotoMono ml-1">
                                    ({(stat as any).subtitle})
                                </span>
                            )}
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/55 font-robotoMono mt-0.5">
                                {stat.label}
                            </p>
                            {(stat as any).pct !== undefined && (
                                <div className="w-full h-1 rounded-full bg-white/5 mt-2">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-green-500/60 to-green-400/40 transition-all"
                                        style={{ width: `${(stat as any).pct}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
