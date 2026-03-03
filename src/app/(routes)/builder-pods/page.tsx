"use client";
import React from "react";
import useSWR from "swr";
import HeroSection from "@/components/BuilderPods/HeroSection";
import LiveStatsPanel from "@/components/BuilderPods/LiveStatsPanel";
import CollegeGrid from "@/components/BuilderPods/CollegeGrid";
import Heading from "@/components/ComponentUtils/Heading";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BuilderPodsPage() {
    const { data, isLoading } = useSWR("/api/builder-pods/colleges", fetcher, {
        refreshInterval: 60_000,
        revalidateOnFocus: true,
    });

    const colleges = data?.colleges ?? [];
    const stats = data?.stats ?? {
        totalColleges: 0,
        totalMembers: 0,
        totalActiveMembers: 0,
        totalDeployments: 0,
        totalProjects: 0,
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Heading />
            <HeroSection />
            <LiveStatsPanel stats={stats} isLoading={isLoading} />
            <CollegeGrid colleges={colleges} isLoading={isLoading} />
        </div>
    );
}
