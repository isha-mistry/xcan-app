"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    FileText,
    Calendar,
    User,
    CheckCircle,
    AlertTriangle,
    Target,
    Code2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    FolderGit2,
    Edit3,
    RotateCw,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import WeeklyUpdateForm from "@/components/BuilderPods/WeeklyUpdateForm";
import MarkdownContent from "@/components/BuilderPods/MarkdownContent";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CollegeUpdatesPage() {
    const params = useParams();
    const slug = params["college-slug"] as string;
    const { user } = usePrivy();
    const walletAddress = user?.wallet?.address?.toLowerCase() ?? null;
    const [page, setPage] = useState(1);
    const [openSections, setOpenSections] = useState<string[]>([]);

    const { data, isLoading, mutate } = useSWR(
        slug ? `/api/builder-pods/colleges/${slug}/updates?page=${page}&limit=10` : null,
        fetcher
    );

    // Also fetch college pod data to check team lead status
    const { data: podData } = useSWR(
        slug ? `/api/builder-pods/colleges/${slug}` : null,
        fetcher
    );

    const updates = useMemo(() => data?.updates ?? [], [data?.updates]);
    const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };
    const projects = useMemo(() => podData?.projects ?? [], [podData?.projects]);
    const isCollegeAdmin = data?.isCollegeAdmin === true;

    const projectMap = useMemo(() => {
        const map = new Map<string, any>();
        for (const project of projects) {
            map.set(project._id, project);
        }
        return map;
    }, [projects]);

    const groupedUpdates = useMemo(() => {
        const grouped = new Map<string, {
            key: string;
            title: string;
            project: any | null;
            updates: any[];
            latestUpdate: any | null;
            isUsersProject: boolean;
        }>();
        for (const update of updates) {
            const key = update.targetProjectId || "general-updates";
            const project = update.targetProjectId ? projectMap.get(update.targetProjectId) : null;
            if (!grouped.has(key)) {
                const isUsersProject = Boolean(
                    walletAddress &&
                    project &&
                    (
                        project.teamLeader?.toLowerCase() === walletAddress ||
                        project.teamMembers?.some((member: any) => member.walletAddress?.toLowerCase() === walletAddress)
                    )
                );
                grouped.set(key, {
                    key,
                    title: project?.name || "General Updates",
                    project: project ?? null,
                    updates: [],
                    latestUpdate: null,
                    isUsersProject,
                });
            }
            const group = grouped.get(key);
            if (!group) continue;
            group.updates.push(update);
            if (
                !group.latestUpdate ||
                new Date(update.createdAt).getTime() > new Date(group.latestUpdate.createdAt).getTime()
            ) {
                group.latestUpdate = update;
            }
        }
        return Array.from(grouped.values()).sort((a, b) => {
            if (a.isUsersProject !== b.isUsersProject) return a.isUsersProject ? -1 : 1;
            if (a.key === "general-updates" && b.key !== "general-updates") return 1;
            if (b.key === "general-updates" && a.key !== "general-updates") return -1;
            const aTime = a.latestUpdate ? new Date(a.latestUpdate.createdAt).getTime() : 0;
            const bTime = b.latestUpdate ? new Date(b.latestUpdate.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [projectMap, updates, walletAddress]);

    useEffect(() => {
        if (groupedUpdates.length === 0) {
            setOpenSections([]);
            return;
        }

        setOpenSections((current) => {
            const availableKeys = new Set(groupedUpdates.map((group) => group.key));
            const preserved = current.filter((key) => availableKeys.has(key));
            if (preserved.length > 0) return preserved;

            const defaultKeys = groupedUpdates
                .filter((group) => group.isUsersProject)
                .map((group) => group.key);

            if (defaultKeys.length > 0) return defaultKeys;
            return [groupedUpdates[0].key];
        });
    }, [groupedUpdates]);

    const canEditUpdate = (update: any) => {
        if (isCollegeAdmin) return true;
        if (!walletAddress || !update.targetProjectId) return false;
        const project = projectMap.get(update.targetProjectId);
        return project?.teamLeader?.toLowerCase() === walletAddress;
    };

    const toggleSection = (key: string) => {
        setOpenSections((current) =>
            current.includes(key)
                ? current.filter((sectionKey) => sectionKey !== key)
                : [...current, key]
        );
    };

    const handleRefresh = () => {
        mutate();
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href={`/builder-pods/${slug}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Pod
            </Link>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400/70" />
                    <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                        Weekly Updates
                    </h1>
                    {pagination.total > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400 font-robotoMono">
                            {pagination.total} updates
                        </span>
                    )}
                </div>
                <button 
                    onClick={handleRefresh}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white/80"
                    title="Refresh updates"
                >
                    <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-2xl p-6 animate-pulse">
                            <div className="h-5 w-32 bg-white/5 rounded-lg mb-3" />
                            <div className="h-4 w-full bg-white/5 rounded-lg mb-2" />
                            <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : updates.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <FileText className="w-8 h-8 text-white/40 mx-auto mb-3" />
                    <p className="text-sm text-white/80 font-robotoMono">No weekly updates yet</p>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {groupedUpdates.map((group, groupIndex) => (
                            <section key={group.key}>
                                <div className="glass-container rounded-3xl border border-white/10 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleSection(group.key)}
                                        className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 hover:bg-white/[0.03] transition-colors"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FolderGit2 className="w-4 h-4 text-white/45" />
                                                        <span className="text-sm font-bold text-white font-unbounded truncate">
                                                            {group.title}
                                                        </span>
                                                    </div>
                                                    {group.isUsersProject && (
                                                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-[9px] font-bold text-purple-300 font-robotoMono uppercase tracking-wider">
                                                            Your Project
                                                        </span>
                                                    )}
                                                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold text-white/55 font-robotoMono uppercase tracking-wider">
                                                        {group.updates.length} updates
                                                    </span>
                                                    {group.latestUpdate && (
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[9px] font-bold text-blue-300 font-robotoMono uppercase tracking-wider">
                                                            Latest W{group.latestUpdate.weekNumber}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-white/50 font-robotoMono">
                                                    {group.project?.teamLeader && (
                                                        <span>
                                                            Leader: {group.project.teamLeader.slice(0, 8)}...
                                                        </span>
                                                    )}
                                                    {group.latestUpdate && (
                                                        <span>
                                                            Updated {new Date(group.latestUpdate.createdAt).toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                                {group.latestUpdate?.completedThisWeek && (
                                                    <div className="mt-3 line-clamp-2 max-w-3xl">
                                                        <MarkdownContent
                                                            markdown={group.latestUpdate.completedThisWeek}
                                                            className="text-xs text-white/60"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-3">
                                                <span className="text-[10px] text-white/45 font-robotoMono uppercase tracking-[0.2em]">
                                                    {openSections.includes(group.key) ? "Hide Updates" : "Show Updates"}
                                                </span>
                                                <ChevronDown
                                                    className={`w-4 h-4 text-white/60 transition-transform ${
                                                        openSections.includes(group.key) ? "rotate-180" : ""
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    </button>

                                    {openSections.includes(group.key) && (
                                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 border-t border-white/5 space-y-3">
                                            <div className="pt-4 text-[10px] text-white/45 font-robotoMono uppercase tracking-[0.2em]">
                                                All weekly updates for this project
                                            </div>
                                            {group.updates.map((update: any, index: number) => (
                                                <motion.div
                                                    key={update._id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.25, delay: (groupIndex * 0.04) + (index * 0.02) }}
                                                    className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 hover:border-white/15 transition-all"
                                                >
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-[10px] font-bold text-blue-400 font-robotoMono">
                                                                W{update.weekNumber} · {update.year}
                                                            </span>
                                                            {update.reviewedBy && (
                                                                <span className="flex items-center gap-1 text-[9px] font-bold text-green-400 font-robotoMono uppercase tracking-wider">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Reviewed
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2 text-[10px] text-white/45 font-robotoMono">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(update.createdAt).toLocaleDateString("en-IN", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })}
                                                            </div>
                                                            {canEditUpdate(update) && (
                                                                <WeeklyUpdateForm
                                                                    collegeSlug={slug}
                                                                    onSuccess={handleRefresh}
                                                                    canSubmitOverride
                                                                    editData={{
                                                                        id: update._id,
                                                                        targetProjectId: update.targetProjectId,
                                                                        completedThisWeek: update.completedThisWeek,
                                                                        blockers: update.blockers,
                                                                        nextMilestone: update.nextMilestone,
                                                                        contractAddresses: update.contractAddresses || [],
                                                                    }}
                                                                    trigger={
                                                                        <button className="p-1 rounded-md hover:bg-white/5 text-white/50 hover:text-white/80 transition-all cursor-pointer">
                                                                            <Edit3 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="space-y-3">
                                                        {/* Completed */}
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1">
                                                                Completed
                                                            </p>
                                                            <MarkdownContent
                                                                markdown={update.completedThisWeek}
                                                                className="text-xs text-white/75"
                                                            />
                                                        </div>

                                                        {/* Blockers */}
                                                        {update.blockers && (
                                                            <div>
                                                                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-400/60 font-robotoMono mb-1">
                                                                    <AlertTriangle className="w-3 h-3" />
                                                                    Blockers
                                                                </p>
                                                                <p className="text-xs text-white/80 font-robotoMono leading-relaxed">
                                                                    {update.blockers}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Next Milestone */}
                                                        <div>
                                                            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1">
                                                                <Target className="w-3 h-3" />
                                                                Next Milestone
                                                            </p>
                                                            <p className="text-xs text-white/75 font-robotoMono leading-relaxed">
                                                                {update.nextMilestone}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.03]">
                                                        {update.submittedBy && (
                                                            <div className="flex items-center gap-1 text-[9px] text-white/40 font-robotoMono">
                                                                <User className="w-2.5 h-2.5" />
                                                                {update.submittedBy.slice(0, 8)}...
                                                            </div>
                                                        )}
                                                        {update.contractAddresses &&
                                                            update.contractAddresses.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {update.contractAddresses.map((addr: string) => (
                                                                        <span
                                                                            key={addr}
                                                                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold text-white/60 font-robotoMono uppercase tracking-wider"
                                                                        >
                                                                            <Code2 className="w-2.5 h-2.5 text-white/40" />
                                                                            {addr.slice(0, 6)}...{addr.slice(-4)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-8">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/80 font-robotoMono disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                            >
                                <ChevronLeft className="w-3 h-3" />
                                Prev
                            </button>
                            <span className="text-[10px] text-white/50 font-robotoMono">
                                {page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                disabled={page >= pagination.totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/80 font-robotoMono disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                            >
                                Next
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
