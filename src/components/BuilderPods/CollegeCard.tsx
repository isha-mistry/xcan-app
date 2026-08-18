"use client";
import React from "react";
import Link from "next/link";
import { MapPin, Users, UserCheck, FolderGit2, Eye } from "lucide-react";
import { CollegeData } from "@/types/builder-pods";

interface CollegeCardProps {
    college: CollegeData;
}

function CollegeCard({ college }: CollegeCardProps) {
    const isActive = college.status === "active";
    const activePct =
        college.memberCount > 0
            ? Math.round((college.activeMemberCount / college.memberCount) * 100)
            : 0;

    return (
        <article className=" [contain-intrinsic-size:1px_340px]">
            <Link href={`/builder-pods/${college.slug}`} prefetch={false}>
                <div className="glass-container group flex h-full cursor-pointer flex-col rounded-2xl border border-white/[0.06] p-6 transition-all duration-300 hover:border-white/20">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
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
                    </div>

                    {/* College Name */}
                    <h3 className="text-lg font-bold text-white font-unbounded tracking-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {college.name}
                    </h3>

                    {/* Pod Name */}
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-robotoMono mb-4">
                        {college.podName}
                    </p>

                    {/* City */}
                    <div className="flex items-center gap-1.5 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-white/50" />
                        <span className="text-xs text-white/70 font-robotoMono">
                            {college.city}, {college.state}
                        </span>
                    </div>

                    {/* Active Members % + Project Progress */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                            <div className="flex items-center gap-1 mb-1.5">
                                <UserCheck className="w-3 h-3 text-green-400/80" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono">
                                    Active
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-black text-white font-unbounded">
                                    {activePct}%
                                </span>
                                <span className="text-[9px] text-white/45 font-robotoMono">
                                    ({college.activeMemberCount}/{college.memberCount})
                                </span>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-1 rounded-full bg-white/5 mt-1.5">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-green-500/60 to-green-400/40 transition-all"
                                    style={{ width: `${activePct}%` }}
                                />
                            </div>
                        </div>
                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                            <div className="flex items-center gap-1 mb-1.5">
                                <FolderGit2 className="w-3 h-3 text-purple-400/80" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono">
                                    Projects
                                </span>
                            </div>
                            <span className="text-sm font-black text-white font-unbounded">
                                {college.projectCount ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Members Count + View Pod Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-white/50" />
                            <span className="text-xs text-white/70 font-robotoMono">
                                <span className="text-white/80 font-bold">
                                    {college.memberCount}
                                </span>{" "}
                                participants
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider font-robotoMono border border-blue-500/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/20 transition-all">
                            <Eye className="w-3 h-3" />
                            View Pod
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
}

export default React.memo(CollegeCard);
