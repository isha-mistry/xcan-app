"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FolderGit2,
    Github,
    ExternalLink,
    Code2,
    CheckCircle,
    Users,
    Crown,
    Copy,
    Loader2,
    UserPlus,
    X,
    KeyRound,
} from "lucide-react";
import ProjectSubmitForm from "./ProjectSubmitForm";

interface TeamMember {
    walletAddress: string;
    name: string;
    role: "team_leader" | "team_member";
    joinedAt: string;
}

interface ProjectData {
    _id: string;
    name: string;
    problemStatement: string;
    githubRepo: string | null;
    contractAddress: string | null;
    demoLink: string | null;
    techStack: string[];
    status: string;
    isApproved: boolean;
    teamCode?: string;
    teamLeader?: string;
    teamMembers?: TeamMember[];
    createdBy?: string;
    createdAt: string;
}

interface ProjectsGridProps {
    projects: ProjectData[];
    isLoading?: boolean;
    walletAddress?: string | null;
    isMember?: boolean;
    collegeSlug?: string;
    onRefresh?: () => void;
}

const statusConfig: Record<
    string,
    { label: string; color: string; bg: string }
> = {
    ideation: {
        label: "Ideation",
        color: "text-gray-400",
        bg: "bg-gray-500/10",
    },
    architecture_finalized: {
        label: "Architecture",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
    },
    prototype: {
        label: "Prototype",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
    deployed: {
        label: "Deployed",
        color: "text-green-400",
        bg: "bg-green-500/10",
    },
    demo_ready: {
        label: "Demo Ready",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
    },
};

function JoinTeamModal({
    walletAddress,
    onClose,
    onSuccess,
}: {
    walletAddress: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch("/api/builder-pods/projects/join-team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamCode: code.trim(),
                    walletAddress,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to join team");
            }

            setSuccess(data.message);
            setTimeout(() => {
                onClose();
                onSuccess();
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-sm glass-container rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-cyan-400/40" />
                        <h3 className="text-base font-black text-white font-unbounded tracking-tight">
                            Join a Team
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X className="w-4 h-4 text-white/30" />
                    </button>
                </div>

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-3 py-4"
                    >
                        <CheckCircle className="w-8 h-8 text-green-400" />
                        <p className="text-xs font-bold text-green-400 font-robotoMono text-center">
                            {success}
                        </p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 font-robotoMono mb-2">
                                <KeyRound className="w-3.5 h-3.5" />
                                Team Code
                            </label>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) =>
                                    setCode(e.target.value.toUpperCase())
                                }
                                placeholder="e.g. A1B2C3D4"
                                maxLength={8}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-black text-white font-robotoMono tracking-[0.3em] placeholder:text-white/15 placeholder:text-sm placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all uppercase"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                                <p className="text-[11px] text-red-400 font-robotoMono">
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || code.length < 4}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-3.5 h-3.5" />
                                    Join Team
                                </>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
}

export default function ProjectsGrid({
    projects,
    isLoading,
    walletAddress,
    isMember,
    collegeSlug,
    onRefresh,
}: ProjectsGridProps) {
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const wallet = walletAddress?.toLowerCase() ?? null;
    const showActions = wallet && isMember;

    const copyCode = (code: string, projectId: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(projectId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <FolderGit2 className="w-4 h-4 text-white/30" />
                    <div className="h-4 w-24 bg-white/5 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="glass-container rounded-2xl p-6 animate-pulse"
                        >
                            <div className="h-5 w-3/4 bg-white/5 rounded-lg mb-3" />
                            <div className="h-3 w-full bg-white/5 rounded-lg mb-2" />
                            <div className="h-3 w-2/3 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <FolderGit2 className="w-4 h-4 text-white/30" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 font-robotoMono">
                        Projects
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/30 font-robotoMono">
                        {projects.length}
                    </span>
                </div>
                {showActions && (
                    <div className="flex items-center gap-2">
                        {collegeSlug && (
                            <ProjectSubmitForm
                                collegeSlug={collegeSlug}
                                walletAddress={walletAddress!}
                                isMember={true}
                                onSuccess={() => onRefresh?.()}
                            />
                        )}
                        <button
                            onClick={() => setJoinModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 font-robotoMono uppercase tracking-wider hover:bg-cyan-500/15 transition-all"
                        >
                            <KeyRound className="w-3 h-3" />
                            Join Team
                        </button>
                    </div>
                )}
            </div>

            {projects.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <p className="text-white/20 text-sm font-robotoMono">
                        No projects submitted yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project, index) => {
                        const sc =
                            statusConfig[project.status] ||
                            statusConfig.ideation;
                        const isTeamLeader =
                            wallet && project.teamLeader === wallet;
                        const isInTeam =
                            wallet &&
                            project.teamMembers?.some(
                                (m) => m.walletAddress === wallet
                            );
                        const teamSize = project.teamMembers?.length ?? 0;

                        return (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.05,
                                }}
                                className="glass-container rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h3 className="text-base font-bold text-white font-unbounded tracking-tight">
                                        {project.name}
                                    </h3>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {project.isApproved && (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        )}
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-robotoMono ${sc.bg} ${sc.color}`}
                                        >
                                            {sc.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Problem Statement */}
                                <p className="text-xs text-white/30 font-robotoMono leading-relaxed mb-4 line-clamp-2">
                                    {project.problemStatement}
                                </p>

                                {/* Tech Stack */}
                                {project.techStack.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {project.techStack.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold text-white/25 font-robotoMono uppercase tracking-wider"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Team Info */}
                                {teamSize > 0 && (
                                    <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-3 h-3 text-white/20" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 font-robotoMono">
                                                Team ({teamSize})
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.teamMembers!.map((m) => (
                                                <span
                                                    key={m.walletAddress}
                                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold font-robotoMono ${
                                                        m.role ===
                                                        "team_leader"
                                                            ? "bg-cyan-500/10 text-cyan-400"
                                                            : "bg-white/5 text-white/30"
                                                    }`}
                                                >
                                                    {m.role ===
                                                        "team_leader" && (
                                                        <Crown className="w-2.5 h-2.5" />
                                                    )}
                                                    {m.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Team Code (visible to team leader and team members) */}
                                {isTeamLeader && project.teamCode && (
                                    <div className="mb-4 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/15">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <KeyRound className="w-3 h-3 text-blue-400/40" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400/40 font-robotoMono">
                                                    Team Code
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-blue-400 font-robotoMono tracking-[0.15em]">
                                                    {project.teamCode}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        copyCode(
                                                            project.teamCode!,
                                                            project._id
                                                        )
                                                    }
                                                    className="p-1 rounded hover:bg-white/5 transition-colors"
                                                    title="Copy team code"
                                                >
                                                    {copiedId ===
                                                    project._id ? (
                                                        <CheckCircle className="w-3 h-3 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-3 h-3 text-blue-400/30" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Your role badge */}
                                {isInTeam && (
                                    <div className="mb-3">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-robotoMono ${
                                                isTeamLeader
                                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                                    : "bg-green-500/10 text-green-400 border border-green-500/20"
                                            }`}
                                        >
                                            {isTeamLeader ? (
                                                <>
                                                    <Crown className="w-2.5 h-2.5" />
                                                    Team Leader
                                                </>
                                            ) : (
                                                <>
                                                    <Users className="w-2.5 h-2.5" />
                                                    Team Member
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {/* Links */}
                                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                                    {project.githubRepo && (
                                        <a
                                            href={project.githubRepo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-bold text-white/25 hover:text-white/50 font-robotoMono uppercase tracking-wider transition-colors"
                                        >
                                            <Github className="w-3.5 h-3.5" />
                                            Repo
                                        </a>
                                    )}
                                    {project.contractAddress && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-white/25 font-robotoMono">
                                            <Code2 className="w-3.5 h-3.5" />
                                            {project.contractAddress.slice(
                                                0,
                                                6
                                            )}
                                            ...
                                            {project.contractAddress.slice(-4)}
                                        </span>
                                    )}
                                    {project.demoLink && (
                                        <a
                                            href={project.demoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-bold text-blue-400/60 hover:text-blue-400 font-robotoMono uppercase tracking-wider transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Demo
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Join Team Modal */}
            <AnimatePresence>
                {joinModalOpen && wallet && (
                    <JoinTeamModal
                        walletAddress={wallet}
                        onClose={() => setJoinModalOpen(false)}
                        onSuccess={() => onRefresh?.()}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
