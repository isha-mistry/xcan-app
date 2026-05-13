import React from "react";

const CollegeGridSkeleton = () => {
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
};

export default CollegeGridSkeleton;
