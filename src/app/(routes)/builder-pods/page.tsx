"use client";
import React from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import HeroSection from "@/components/BuilderPods/HeroSection";
import type { StatsData } from "@/types/builder-pods";
import Heading from "@/components/ComponentUtils/Heading";
import CollegeGridSkeleton from "@/components/BuilderPods/CollegeGridSkeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_STATS: StatsData = {
    totalColleges: 0,
    totalMembers: 0,
    totalActiveMembers: 0,
    totalDeployments: 0,
    totalProjects: 0,
};

const LiveStatsPanel = dynamic(
    () => import("@/components/BuilderPods/LiveStatsPanel"),
    {
        ssr: true,
        loading: () => (
            <section className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 font-robotoMono">
                        Live Stats
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 animate-pulse"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 mb-3" />
                            <div className="h-8 w-16 bg-white/5 rounded-lg mb-2" />
                            <div className="h-3 w-24 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            </section>
        ),
    }
);

const CollegeGrid = dynamic(
    () => import("@/components/BuilderPods/CollegeGrid"),
    {
        ssr: true,
        loading: () => <CollegeGridSkeleton />,
    }
);

export default function BuilderPodsPage() {
    const { data, isLoading } = useSWR("/api/builder-pods/colleges", fetcher, {
        refreshInterval: 60_000,
        dedupingInterval: 60_000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
        suspense: false,
    });

    const colleges = data?.colleges ?? [];
    const stats = data?.stats ?? DEFAULT_STATS;

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Heading />
            <HeroSection />
            <LiveStatsPanel stats={stats} isLoading={isLoading} />
            <CollegeGrid colleges={colleges} isLoading={isLoading} />
        </div>
    );
}
