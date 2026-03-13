"use client";
import React from "react";
import { useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PodOverviewCard from "@/components/BuilderPods/PodOverviewCard";
import MembersTable from "@/components/BuilderPods/MembersTable";
import ProjectsGrid from "@/components/BuilderPods/ProjectsGrid";
import WeeklyUpdatesFeed from "@/components/BuilderPods/WeeklyUpdatesFeed";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CollegePodPage() {
    const params = useParams();
    const slug = params?.["college-slug"] as string;
    const { user } = usePrivy();
    const walletAddress = user?.wallet?.address ?? null;

    const { data, isLoading, error, mutate } = useSWR(
        slug ? `/api/builder-pods/colleges/${slug}` : null,
        fetcher,
        { revalidateOnFocus: true }
    );

    const collegeData = data?.college || {
        name: "Loading...",
        podName: "",
        city: "",
        state: "",
        status: "inactive",
        tier: "tier2",
        memberCount: 0,
        activeMemberCount: 0,
        projectCount: 0,
        deploymentCount: 0,
        activatedAt: null,
        facultyCoordinator: null,
    };

    const members = data?.members ?? [];
    const projects = data?.projects ?? [];
    const recentUpdates = data?.recentUpdates ?? [];

    const wallet = walletAddress?.toLowerCase() ?? null;
    const currentMember = wallet
        ? members.find(
              (m: any) =>
                  m.walletAddress === wallet &&
                  (m.status === "active" || m.status === "pending")
          )
        : null;
    const isMember = currentMember != null;
    const memberStatus: string | null = currentMember?.status ?? null;

    const isTeamLead =
        wallet != null &&
        members.some((m: any) => m.walletAddress.toLowerCase() === wallet && m.role === 'pod_lead' && m.status === 'active');

    const handleDataRefresh = () => {
        mutate();
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            {/* Back button */}
            <Link
                href="/builder-pods"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 font-robotoMono mb-6 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Pods
            </Link>

            {error ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <p className="text-red-400/60 text-sm font-robotoMono">
                        Failed to load pod data. Please try again.
                    </p>
                </div>
            ) : !isLoading && !data?.college ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <p className="text-white/30 text-sm font-robotoMono">
                        College pod not found.
                    </p>
                </div>
            ) : (
                <>
                    <PodOverviewCard college={collegeData} />
                    
                    {collegeData.status === 'active' ? (
                        <>
                            <MembersTable members={members} isLoading={isLoading} />

                    <ProjectsGrid
                        projects={projects}
                        isLoading={isLoading}
                        walletAddress={walletAddress}
                        isMember={isMember}
                        memberStatus={memberStatus}
                        collegeSlug={slug}
                        onRefresh={handleDataRefresh}
                    />

                            <WeeklyUpdatesFeed
                                updates={recentUpdates}
                                isLoading={isLoading}
                                slug={slug}
                                isTeamLead={isTeamLead}
                                onRefresh={handleDataRefresh}
                            />
                        </>
                    ) : (
                        <div className="glass-container rounded-2xl p-12 text-center mt-8">
                            <p className="text-white/40 text-sm font-robotoMono">
                                Detailed insights are not available. This college pod is currently {collegeData.status}.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
