"use client";
import React from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import PodMembershipsSection from "./PodMembershipsSection";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ProfileSectionProps {
    walletAddress: string;
}

export default function ProfileSection({ walletAddress }: ProfileSectionProps) {
    const { data, isLoading } = useSWR(
        walletAddress ? `/api/builder-pods/profile/${walletAddress}` : null,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-white/50" />
            </div>
        );
    }

    if (!data?.success || !data.enrolled || !Array.isArray(data.memberships) || data.memberships.length === 0) {
        return null;
    }

    const { memberships, badges } = data;

    return <PodMembershipsSection memberships={memberships} badges={badges} />;
}
