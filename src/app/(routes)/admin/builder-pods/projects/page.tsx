"use client";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    FolderKanban,
    ChevronRight,
    Loader2,
    CheckCircle2,
} from "lucide-react";

import { adminFetcher, ADMIN_SWR_OPTIONS } from "@/lib/fetchers";

const STATUS_COLUMNS = [
    { key: "ideation", label: "Ideation", color: "text-gray-400", bg: "bg-gray-500/10" },
    { key: "architecture_finalized", label: "Architecture", color: "text-blue-400", bg: "bg-blue-500/10" },
    { key: "prototype", label: "Prototype", color: "text-purple-400", bg: "bg-purple-500/10" },
    { key: "deployed", label: "Deployed", color: "text-green-400", bg: "bg-green-500/10" },
    { key: "demo_ready", label: "Demo Ready", color: "text-amber-400", bg: "bg-amber-500/10" },
];

export default function AdminProjectsPage() {
    const { data, isLoading } = useSWR(
        "/api/admin/builder-pods/colleges",
        adminFetcher,
        ADMIN_SWR_OPTIONS
    );

    const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
    const { data: projectsData, isLoading: projectsLoading } = useSWR(
        selectedCollege ? `/api/builder-pods/colleges/${selectedCollege}/projects` : null,
        adminFetcher,
        ADMIN_SWR_OPTIONS
    );
    const [updating, setUpdating] = useState<string | null>(null);

    const projects = projectsData?.projects ?? [];
    const colleges = data?.colleges ?? [];

    const updateStatus = async (projectId: string, newStatus: string) => {
        setUpdating(projectId);
        try {
            await fetch("/api/builder-pods/projects/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    projectId,
                    status: newStatus,
                }),
            });
            if (selectedCollege) {
                mutate(`/api/builder-pods/colleges/${selectedCollege}/projects`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(null);
        }
    };

    const updateApproval = async (projectId: string, isApproved: boolean) => {
        setUpdating(projectId);
        try {
            await fetch("/api/builder-pods/projects/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    projectId,
                    isApproved,
                }),
            });
            if (selectedCollege) {
                mutate(`/api/builder-pods/colleges/${selectedCollege}/projects`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <FolderKanban className="w-5 h-5 text-blue-400/70" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Project Board
                </h1>
            </div>

            {/* College Selector */}
            <div className="mb-6 flex flex-wrap gap-2">
                {isLoading ? (
                    <div className="flex items-center gap-2 text-xs text-white/70 font-robotoMono">
                        <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                        Loading colleges...
                    </div>
                ) : (
                    colleges.map((c: any) => (
                        <button
                            key={c.slug}
                            onClick={() => setSelectedCollege(c.slug)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-robotoMono transition-all border ${
                                selectedCollege === c.slug
                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                    : "bg-white/[0.02] border-white/[0.05] text-white/75 hover:bg-white/[0.04]"
                            }`}
                        >
                            {c.name}
                        </button>
                    ))
                )}
            </div>

            {isLoading ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white/60 mx-auto mb-3" />
                    <p className="text-sm text-white/80 font-robotoMono">
                        Loading project data...
                    </p>
                </div>
            ) : !selectedCollege ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <FolderKanban className="w-8 h-8 text-white/70 mx-auto mb-3" />
                    <p className="text-sm text-white/80 font-robotoMono">
                        Select a college to view projects
                    </p>
                </div>
            ) : projectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {STATUS_COLUMNS.map((col) => (
                        <div key={col.key} className="glass-container rounded-2xl p-4 animate-pulse">
                            <div className="h-4 w-24 bg-white/5 rounded-lg mb-4" />
                            <div className="space-y-2">
                                <div className="h-16 bg-white/[0.02] rounded-lg" />
                                <div className="h-16 bg-white/[0.02] rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {STATUS_COLUMNS.map((col) => {
                        const colProjects = projects.filter((p: any) => p.status === col.key);
                        return (
                            <motion.div
                                key={col.key}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="glass-container rounded-2xl p-4"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={`px-2 py-0.5 rounded-full ${col.bg} ${col.color} text-[9px] font-bold font-robotoMono`}>
                                        {col.label}
                                    </span>
                                    <span className="text-[9px] text-white/70 font-robotoMono">
                                        {colProjects.length}
                                    </span>
                                </div>

                                <div className="space-y-2 min-h-[100px]">
                                    {colProjects.map((project: any) => (
                                        <div
                                            key={project._id}
                                            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all"
                                        >
                                            <h4 className="text-[11px] font-bold text-white/80 font-robotoMono mb-1">
                                                {project.name}
                                            </h4>
                                            {project.problemStatement && (
                                                <p className="text-[9px] text-white/75 font-robotoMono line-clamp-2 mb-2">
                                                    {project.problemStatement}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className={`text-[8px] font-bold uppercase tracking-widest font-robotoMono ${project.isApproved ? "text-green-400/70" : "text-amber-400/70"}`}>
                                                    {project.isApproved ? "Approved" : "Pending Approval"}
                                                </span>
                                                {!project.isApproved && (
                                                    <button
                                                        onClick={() => updateApproval(project._id, true)}
                                                        disabled={updating === project._id}
                                                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[8px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                                    >
                                                        {updating === project._id ? (
                                                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                                        )}
                                                        Approve
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {STATUS_COLUMNS.filter((s) => s.key !== col.key).map((target) => (
                                                    <button
                                                        key={target.key}
                                                        onClick={() => updateStatus(project._id, target.key)}
                                                        disabled={updating === project._id}
                                                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold font-robotoMono transition-all ${target.bg} ${target.color} opacity-40 hover:opacity-100 disabled:opacity-10`}
                                                        title={`Move to ${target.label}`}
                                                    >
                                                        {updating === project._id ? (
                                                            <Loader2 className="w-2 h-2 animate-spin" />
                                                        ) : (
                                                            <ChevronRight className="w-2 h-2" />
                                                        )}
                                                        {target.label.split(" ")[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {colProjects.length === 0 && (
                                        <p className="text-[9px] text-white/70 font-robotoMono text-center py-4">
                                            No projects
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
