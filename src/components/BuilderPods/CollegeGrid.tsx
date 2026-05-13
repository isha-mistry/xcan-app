import React from "react";
import CollegeCard from "./CollegeCard";
import { CollegeData } from "@/types/builder-pods";
import CollegeGridSkeleton from "./CollegeGridSkeleton";

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
            // Using requestAnimationFrame or short timeout for smoother batching
            timeoutId = setTimeout(() => {
                if (cancelled) return;
                setVisibleCount((current) => {
                    const next = Math.min(current + PAGE_SIZE, colleges.length);
                    if (next < colleges.length) {
                        scheduleNextBatch();
                    }
                    return next;
                });
            }, 50); // Reduced from 80ms to 50ms for faster perceived loading
        };

        scheduleNextBatch();

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [colleges.length, isLoading]);

    if (isLoading) {
        return <CollegeGridSkeleton />;
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
