"use client";
import React from "react";
import CollegeCard from "./CollegeCard";
import { CollegeData } from "@/types/builder-pods";

interface CollegeGridProps {
    colleges: CollegeData[];
    isLoading?: boolean;
}

function CollegeGrid({ colleges, isLoading }: CollegeGridProps) {
    const PAGE_SIZE = 12;
    const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

    React.useEffect(() => {
        if (isLoading || colleges.length <= PAGE_SIZE) {
            setVisibleCount(PAGE_SIZE);
            return;
        }

        setVisibleCount(PAGE_SIZE);

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const scheduleNextBatch = () => {
            timeoutId = setTimeout(() => {
                if (cancelled) return;
                setVisibleCount((current) => {
                    const next = Math.min(current + PAGE_SIZE, colleges.length);
                    if (next < colleges.length) {
                        scheduleNextBatch();
                    }
                    return next;
                });
            }, 80);
        };

        scheduleNextBatch();

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [colleges.length, isLoading]);

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
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-pulse"
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
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
                    <p className="text-white/60 text-sm font-robotoMono">
                        No college pods have been activated yet. Check back soon!
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section id="colleges" className="mb-10 [content-visibility:auto] [contain-intrinsic-size:1px_1600px]">
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
                {colleges.slice(0, visibleCount).map((college) => (
                    <CollegeCard key={college._id} college={college} />
                ))}
            </div>
        </section>
    );
}

export default React.memo(CollegeGrid);
