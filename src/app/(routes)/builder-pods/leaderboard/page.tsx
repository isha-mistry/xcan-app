"use client";
import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, Trophy, Users } from "lucide-react";
import PodLeaderboardTable from "@/components/BuilderPods/PodLeaderboardTable";
import IndividualLeaderboardTable from "@/components/BuilderPods/IndividualLeaderboardTable";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<"pods" | "individuals">("pods");

    const { data: podData, isLoading: podLoading } = useSWR(
        "/api/builder-pods/leaderboard/pods",
        fetcher,
        { revalidateOnFocus: true }
    );

    const { data: indData, isLoading: indLoading } = useSWR(
        "/api/builder-pods/leaderboard/individuals",
        fetcher,
        { revalidateOnFocus: true }
    );

    const tabs = [
        { key: "pods" as const, label: "Pod Rankings", icon: Trophy },
        { key: "individuals" as const, label: "Individual Rankings", icon: Users },
    ];

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link
                href="/builder-pods"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 font-robotoMono mb-6 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Builder Pods
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight mb-1">
                    Leaderboard
                </h1>
                <p className="text-xs text-white/30 font-robotoMono">
                    Rankings updated hourly based on deployments, modules, projects, and weekly activity.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest font-robotoMono transition-all ${isActive
                                    ? "bg-white text-black"
                                    : "bg-white/[0.03] text-white/30 hover:text-white/50 border border-white/5"
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {activeTab === "pods" ? (
                <PodLeaderboardTable pods={podData?.pods ?? []} isLoading={podLoading} />
            ) : (
                <IndividualLeaderboardTable
                    individuals={indData?.individuals ?? []}
                    isLoading={indLoading}
                />
            )}
        </div>
    );
}
