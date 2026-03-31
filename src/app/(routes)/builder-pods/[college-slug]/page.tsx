"use client";
import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, UserPlus, Loader2, CheckCircle } from "lucide-react";
import PodOverviewCard from "@/components/BuilderPods/PodOverviewCard";
import MembersTable from "@/components/BuilderPods/MembersTable";
import ProjectsGrid from "@/components/BuilderPods/ProjectsGrid";
import WeeklyUpdatesFeed from "@/components/BuilderPods/WeeklyUpdatesFeed";
import { isActiveWeeklyUpdateLead } from "@/lib/builder-pods/membership";

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

    const loadingCollegeData = {
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
        pendingProjectCount: 0,
        activatedAt: null,
        facultyCoordinator: null,
    };
    const collegeData = data?.college;
    const showPodLoaders = isLoading || (!error && !data);

    const members = data?.members ?? [];
    const projects = data?.projects ?? [];
    const recentUpdates = data?.recentUpdates ?? [];

    const membersForTable = useMemo(() => {
        const countByWallet = new Map<string, number>();

        for (const p of projects as any[]) {
            const leader = p.teamLeader?.toLowerCase?.();
            if (leader) countByWallet.set(leader, (countByWallet.get(leader) ?? 0) + 1);

            const membersArr = Array.isArray(p.teamMembers) ? p.teamMembers : [];
            for (const tm of membersArr) {
                const w = tm?.walletAddress?.toLowerCase?.();
                if (w) countByWallet.set(w, (countByWallet.get(w) ?? 0) + 1);
            }
        }

        return members.map((m: any) => ({
            ...m,
            activeProjectCount: countByWallet.get((m.walletAddress ?? "").toLowerCase()) ?? 0,
        }));
    }, [members, projects]);

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
    const memberRole: string | null = currentMember?.role ?? null;
    const memberRequestedRole: string | null = currentMember?.requestedRole ?? null;

    const isPodLead =
        wallet != null &&
        members.some((m: any) => m.walletAddress.toLowerCase() === wallet && isActiveWeeklyUpdateLead(m));

    const canRequestPodMember =
        isMember &&
        memberStatus === "active" &&
        memberRole === "lab_participant" &&
        !memberRequestedRole;

    const [requestingRole, setRequestingRole] = useState(false);
    const [roleRequestResult, setRoleRequestResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleRequestPodMember = async () => {
        setRequestingRole(true);
        setRoleRequestResult(null);
        try {
            const res = await fetch("/api/builder-pods/request-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ collegeSlug: slug, requestedRole: "pod_member" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send request");
            setRoleRequestResult({ success: true, message: data.message });
            mutate();
        } catch (err: any) {
            setRoleRequestResult({ success: false, message: err.message });
        } finally {
            setRequestingRole(false);
        }
    };

    const handleDataRefresh = () => {
        mutate();
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            {/* Back button */}
            <Link
                href="/builder-pods"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white/80 font-robotoMono mb-6 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Pods
            </Link>

            {error ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <p className="text-red-400 text-sm font-robotoMono">
                        Failed to load pod data. Please try again.
                    </p>
                </div>
            ) : !showPodLoaders && !collegeData ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <p className="text-white/80 text-sm font-robotoMono">
                        College pod not found.
                    </p>
                </div>
            ) : (
                <>
                    <PodOverviewCard
                        college={collegeData ?? loadingCollegeData}
                        isLoading={showPodLoaders}
                    />

                    {/* Request to join as Pod Member */}
                    {!showPodLoaders && (canRequestPodMember || memberRequestedRole === "pod_member") && (
                        <div className="my-6 glass-container rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-white font-unbounded tracking-tight mb-1">
                                    Become a Pod Member
                                </h3>
                                <p className="text-[11px] text-white/60 font-robotoMono leading-relaxed">
                                    Pod members can join teams and contribute to projects. Request Pod Lead when you need to create a project or submit weekly updates.
                                </p>
                            </div>
                            {memberRequestedRole === "pod_member" ? (
                                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 font-robotoMono uppercase tracking-wider whitespace-nowrap">
                                    <Loader2 className="w-3.5 h-3.5" />
                                    Request Pending
                                </span>
                            ) : roleRequestResult?.success ? (
                                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 font-robotoMono uppercase tracking-wider whitespace-nowrap">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Request Sent
                                </span>
                            ) : (
                                <div className="flex flex-col items-end gap-1.5">
                                    <button
                                        onClick={handleRequestPodMember}
                                        disabled={requestingRole}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {requestingRole ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Requesting...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-3.5 h-3.5" />
                                                Request to Join as Pod Member
                                            </>
                                        )}
                                    </button>
                                    {roleRequestResult && !roleRequestResult.success && (
                                        <p className="text-[9px] text-red-400 font-robotoMono">
                                            {roleRequestResult.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {showPodLoaders ? (
                        <>
                            <MembersTable members={[]} isLoading />

                            <ProjectsGrid
                                projects={[]}
                                isLoading
                                walletAddress={walletAddress}
                                isMember={isMember}
                                memberStatus={memberStatus}
                                memberRole={memberRole}
                                memberRequestedRole={memberRequestedRole}
                                collegeSlug={slug}
                                onRefresh={handleDataRefresh}
                            />

                            <WeeklyUpdatesFeed
                                updates={[]}
                                isLoading
                                slug={slug}
                                isTeamLead={false}
                                onRefresh={handleDataRefresh}
                            />
                        </>
                    ) : collegeData?.status === 'active' ? (
                        <>
                            <MembersTable members={membersForTable} isLoading={isLoading} />

                            <ProjectsGrid
                                projects={projects}
                                isLoading={isLoading}
                                walletAddress={walletAddress}
                                isMember={isMember}
                                memberStatus={memberStatus}
                                memberRole={memberRole}
                                memberRequestedRole={memberRequestedRole}
                                collegeSlug={slug}
                                onRefresh={handleDataRefresh}
                                isPodLead={isPodLead}
                            />

                            <WeeklyUpdatesFeed
                                updates={recentUpdates}
                                projects={projects}
                                isLoading={isLoading}
                                slug={slug}
                                isTeamLead={isPodLead}
                                onRefresh={handleDataRefresh}
                            />
                        </>
                    ) : (
                        <div className="glass-container rounded-2xl p-12 text-center mt-8">
                            <p className="text-white/80 text-sm font-robotoMono">
                                Detailed insights are not available. This college pod is currently {collegeData?.status}.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
