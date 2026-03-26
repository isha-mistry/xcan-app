"use client";
import React from "react";
import ConnectYourWallet from "../ComponentUtils/ConnectYourWallet";
import { useAccount } from "wagmi";
import PodMembershipsSection from "./PodMembershipsSection";
import { useMyMembership } from "@/hooks/useBuilderPods";

export default function ProfilePodSection() {
    const { address: walletAddress } = useAccount();
    const { data, isLoading } = useMyMembership(walletAddress ?? undefined);

    if (!walletAddress) {
        return (
            <div className="py-8">
                <ConnectYourWallet showBg={false} />
            </div>
        );
    }
    if (isLoading) {
        return (
            <div className="glass-container rounded-2xl p-6 animate-pulse">
                <div className="h-5 w-40 bg-white/5 rounded-lg mb-4" />
                <div className="h-20 bg-white/[0.02] rounded-xl" />
            </div>
        );
    }

    if (!Array.isArray(data?.memberships) || data.memberships.length === 0) return null;

    return <PodMembershipsSection memberships={data.memberships} badges={data.badges ?? []} />;
}
