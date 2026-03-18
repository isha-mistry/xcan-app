"use client";
import React from "react";
import CollegeCard from "./CollegeCard";

interface CollegeData {
    _id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    podName: string;
    memberCount: number;
    activeMemberCount: number;
    projectCount: number;
    status: "active" | "inactive" | "alumni";
}

interface CollegeGridProps {
    colleges: CollegeData[];
    isLoading?: boolean;
}

export default function CollegeGrid({ colleges, isLoading }: CollegeGridProps) {
    if (isLoading) {
        return (
            <section id="colleges" className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 font-robotoMono">
                        College Pods
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="glass-container rounded-2xl p-6 animate-pulse"
                        >
                            <div className="h-4 w-16 bg-white/5 rounded-full mb-4" />
                            <div className="h-6 w-3/4 bg-white/5 rounded-lg mb-2" />
                            <div className="h-3 w-1/2 bg-white/5 rounded-lg mb-4" />
                            <div className="h-3 w-2/3 bg-white/5 rounded-lg mb-6" />
                            <div className="h-px w-full bg-white/5 mb-4" />
                            <div className="h-4 w-1/3 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!colleges || colleges.length === 0) {
        return (
            <section id="colleges" className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 font-robotoMono">
                        College Pods
                    </h2>
                </div>
                <div className="glass-container rounded-2xl p-12 text-center">
                    <p className="text-white/60 text-sm font-robotoMono">
                        No college pods have been activated yet. Check back soon!
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section id="colleges" className="mb-10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 font-robotoMono">
                        College Pods
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/60 font-robotoMono">
                        {colleges.length}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {colleges.map((college, index) => (
                    <CollegeCard key={college._id} college={college} index={index} />
                ))}
            </div>
        </section>
    );
}
