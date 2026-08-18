"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FolderGit2,
    ExternalLink,
    Github,
    CheckCircle,
    Users,
    Crown,
    Copy,
    Loader2,
    UserPlus,
    X,
    FileText,
    KeyRound,
    LogOut,
    Trash2,
    Presentation,
    Edit3,
} from "lucide-react";
import ProjectSubmitForm from "./ProjectSubmitForm";
import { TeamMember, ProjectData, ConfirmActionModalProps } from "@/types/builder-pods";

interface ProjectsGridProps {
    projects: ProjectData[];
    isLoading?: boolean;
    walletAddress?: string | null;
    isMember?: boolean;
    memberStatus?: string | null;
    memberRole?: string | null;
    memberRequestedRole?: string | null;
    collegeSlug?: string;
    onRefresh?: () => void;
    isPodLead?: boolean;
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
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch("/api/builder-pods/projects/join-team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    teamCode: code.trim(),
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
            role="dialog"
            aria-modal="true"
            aria-label="Join a Team"
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
                        <KeyRound className="w-4 h-4 text-cyan-400/70" />
                        <h3 className="text-base font-black text-white font-unbounded tracking-tight">
                            Join a Team
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X className="w-4 h-4 text-white/60" />
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
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 font-robotoMono mb-2">
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
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-black text-white font-robotoMono tracking-[0.3em] placeholder:text-white/45 placeholder:text-sm placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all uppercase"
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

function ConfirmActionModal({
    title,
    message,
    actionLabel,
    actionColor,
    icon: Icon,
    submitting,
    onConfirm,
    onClose,
}: ConfirmActionModalProps) {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !submitting) onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose, submitting]);

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
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
                        <Icon className={`w-4 h-4 ${actionColor}`} />
                        <h3 className="text-base font-black text-white font-unbounded tracking-tight">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        disabled={submitting}
                    >
                        <X className="w-4 h-4 text-white/60" />
                    </button>
                </div>

                <p className="text-sm text-white/70 font-robotoMono leading-relaxed mb-6">
                    {message}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white text-xs font-bold uppercase tracking-wider font-robotoMono hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={submitting}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-robotoMono transition-colors ${actionLabel === 'Delete'
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                            }`}
                    >
                        {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            actionLabel
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function ProjectEditModal({
    project,
    onClose,
    onSuccess,
}: {
    project: ProjectData;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [techInput, setTechInput] = useState("");

    const [form, setForm] = useState({
        name: project.name || "",
        problemStatement: project.problemStatement || "",
        githubRepo: project.githubRepo || "",
        demoLink: project.demoLink || "",
        techStack: project.techStack || ([] as string[]),
    });

    const addTech = () => {
        const trimmed = techInput.trim();
        if (!trimmed) return;
        setForm((prev) => {
            if (prev.techStack.includes(trimmed)) return prev;
            return { ...prev, techStack: [...prev.techStack, trimmed] };
        });
        setTechInput("");
    };

    const removeTech = (tech: string) => {
        setForm((prev) => ({
            ...prev,
            techStack: prev.techStack.filter((t) => t !== tech),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const payload = {
                name: form.name.trim(),
                problemStatement: form.problemStatement.trim(),
                githubRepo: form.githubRepo.trim() ? form.githubRepo.trim() : null,
                demoLink: form.demoLink.trim() ? form.demoLink.trim() : null,
                techStack: form.techStack || [],
            };

            const res = await fetch(`/api/builder-pods/projects/${project._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to update project");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Edit Project"
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
                className="w-full max-w-2xl glass-container rounded-3xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] max-h-[83vh] flex flex-col overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/70 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <FolderGit2 className="w-5 h-5 text-cyan-400/80" />
                        <div>
                            <h2 className="text-lg font-black text-white font-unbounded tracking-tight">
                                Edit Project
                            </h2>
                            <p className="mt-0.5 text-[11px] text-white/70 font-robotoMono">
                                Update project details for your team.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        disabled={submitting}
                    >
                        <X className="w-4 h-4 text-white/70" />
                    </button>
                </div>

                <div className="px-6 py-5 overflow-y-auto technical-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 font-robotoMono mb-2">
                                <FileText className="w-3.5 h-3.5" />
                                Project Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/50 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 font-robotoMono mb-2">
                                <FileText className="w-3.5 h-3.5" />
                                Problem Statement
                            </label>
                            <textarea
                                value={form.problemStatement}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, problemStatement: e.target.value }))
                                }
                                rows={4}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/50 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all resize-none technical-scrollbar"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 font-robotoMono mb-2">
                                <ExternalLink className="w-3.5 h-3.5" />
                                Demo Link
                            </label>
                            <input
                                type="url"
                                value={form.demoLink}
                                onChange={(e) => setForm((prev) => ({ ...prev, demoLink: e.target.value }))}
                                placeholder="https://..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/50 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 font-robotoMono mb-2">
                                <Github className="w-3.5 h-3.5" />
                                GitHub Repo
                            </label>
                            <input
                                type="url"
                                value={form.githubRepo}
                                onChange={(e) =>
                                    setForm((prev) => ({ ...prev, githubRepo: e.target.value }))
                                }
                                placeholder="https://github.com/..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/50 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 font-robotoMono mb-2">
                                <FolderGit2 className="w-3.5 h-3.5" />
                                Tech Stack
                            </label>
                            <div className="flex flex-col gap-2 mb-2 sm:flex-row">
                                <input
                                    type="text"
                                    value={techInput}
                                    onChange={(e) => setTechInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addTech();
                                        }
                                    }}
                                    placeholder="e.g. Stylus, Rust, React"
                                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-robotoMono placeholder:text-white/50 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={addTech}
                                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/80 font-robotoMono hover:bg-white/10 transition-all"
                                >
                                    Add
                                </button>
                            </div>

                            {form.techStack.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {form.techStack.map((tech) => (
                                        <span
                                            key={tech}
                                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-[9px] font-bold text-blue-400/80 font-robotoMono uppercase tracking-wider"
                                        >
                                            {tech}
                                            <button
                                                type="button"
                                                onClick={() => removeTech(tech)}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                                <p className="text-[11px] text-red-400 font-robotoMono">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function ProjectsGrid({
    projects,
    isLoading,
    walletAddress,
    isMember,
    memberStatus,
    memberRole,
    memberRequestedRole,
    collegeSlug,
    onRefresh,
    isPodLead,
}: ProjectsGridProps) {
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [actionModal, setActionModal] = useState<{ type: 'leave' | 'delete', projectId: string } | null>(null);
    const [editModalProject, setEditModalProject] = useState<ProjectData | null>(null);
    const [submittingAction, setSubmittingAction] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const wallet = walletAddress?.toLowerCase() ?? null;
    const canSubmitOrJoin = memberRole === "pod_member" || memberRole === "pod_lead";
    const showActions = wallet && isMember && canSubmitOrJoin;
    const isActive = memberStatus === "active";
    const isAlreadyInATeam = projects.some(p =>
        p.teamLeader?.toLowerCase() === wallet ||
        p.teamMembers?.some(m => m.walletAddress?.toLowerCase() === wallet)
    );

    const copyCode = (code: string, projectId: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(projectId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleAction = async () => {
        if (!actionModal || !wallet) return;
        setSubmittingAction(true);
        setActionError(null);
        try {
            const url = actionModal.type === 'leave'
                ? `/api/builder-pods/projects/${actionModal.projectId}/leave`
                : `/api/builder-pods/projects/${actionModal.projectId}`;

            const options: RequestInit = actionModal.type === 'leave'
                ? {
                    method: "POST",
                    credentials: "include",
                }
                : { method: "DELETE", credentials: "include" };

            const res = await fetch(url, options);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Action failed");

            setActionModal(null);
            onRefresh?.();
        } catch (error) {
            setActionError((error as Error).message);
        } finally {
            setSubmittingAction(false);
        }
    };

    if (isLoading) {
        return (
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <FolderGit2 className="w-4 h-4 text-white/60" />
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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10">
                        <FolderGit2 className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-tight text-white font-unbounded">
                            Projects
                        </h2>
                        <p className="text-[10px] text-white/40 font-robotoMono">
                            {projects.length} project{projects.length === 1 ? "" : "s"} in this pod
                        </p>
                    </div>
                </div>
                {showActions && (
                    <div className="flex items-center gap-3">
                        {!isActive && (
                            <span className="text-[9px] text-amber-400 font-robotoMono mr-1">
                                Pending approval
                            </span>
                        )}
                        {isAlreadyInATeam && (
                            <span className="text-[9px] text-blue-400 font-robotoMono">
                                Already in a team
                            </span>
                        )}
                        {collegeSlug && (
                            <ProjectSubmitForm
                                collegeSlug={collegeSlug}
                                walletAddress={walletAddress!}
                                isMember={true}
                                memberStatus={memberStatus}
                                memberRole={memberRole}
                                memberRequestedRole={memberRequestedRole}
                                isDisabled={isAlreadyInATeam}
                                onRefresh={onRefresh}
                            />
                        )}
                        <button
                            onClick={() => setJoinModalOpen(true)}
                            disabled={!isActive || isAlreadyInATeam}
                            title={
                                !isActive
                                    ? "Your membership must be approved before you can join a team"
                                    : isAlreadyInATeam
                                        ? "You are already part of a team"
                                        : undefined
                            }
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold font-robotoMono uppercase tracking-wider transition-all ${isActive && !isAlreadyInATeam
                                    ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/15"
                                    : "bg-white/5 border border-white/10 text-white/50 cursor-not-allowed"
                                }`}
                        >
                            <KeyRound className="w-3 h-3" />
                            Join Team
                        </button>
                    </div>
                )}
            </div>

            {projects.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <p className="text-white/50 text-sm font-robotoMono">
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
                            wallet && project.teamLeader?.toLowerCase() === wallet;
                        const isInTeam =
                            wallet &&
                            project.teamMembers?.some(
                                (m) => m.walletAddress?.toLowerCase() === wallet
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

                                {/* Progress Pipeline */}
                                <div className="flex items-center gap-1 mb-3">
                                    {["ideation", "architecture_finalized", "prototype", "deployed", "demo_ready"].map((step, stepIdx) => {
                                        const statusOrder = ["ideation", "architecture_finalized", "prototype", "deployed", "demo_ready"];
                                        const currentIdx = statusOrder.indexOf(project.status);
                                        const isCompleted = stepIdx <= currentIdx;
                                        const isCurrent = stepIdx === currentIdx;
                                        return (
                                            <React.Fragment key={step}>
                                                <div
                                                    className={`h-1.5 flex-1 rounded-full transition-all ${isCompleted
                                                            ? isCurrent
                                                                ? "bg-gradient-to-r from-cyan-500/80 to-cyan-400/60"
                                                                : "bg-cyan-500/40"
                                                            : "bg-white/[0.06]"
                                                        }`}
                                                    title={statusConfig[step]?.label || step}
                                                />
                                            </React.Fragment>
                                        );
                                    })}
                                </div>

                                {/* Problem Statement */}
                                <p className="text-xs text-white/60 font-robotoMono leading-relaxed mb-4 line-clamp-2">
                                    {project.problemStatement}
                                </p>

                                {/* Tech Stack */}
                                {project.techStack.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {project.techStack.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold text-white/55 font-robotoMono uppercase tracking-wider"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Showcase Badge */}
                                {project.submittedToShowcase && (
                                    <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg bg-purple-500/5 border border-purple-500/15 w-fit">
                                        <Presentation className="w-3 h-3 text-purple-400" />
                                        <span className="text-[9px] font-bold text-purple-400 font-robotoMono uppercase tracking-wider">
                                            Submitted to Showcase
                                        </span>
                                    </div>
                                )}

                                {/* Team Info */}
                                {teamSize > 0 && (
                                    <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-3 h-3 text-white/50" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono">
                                                Team ({teamSize})
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.teamMembers!.map((m) => (
                                                <span
                                                    key={m.walletAddress}
                                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold font-robotoMono ${m.role ===
                                                            "team_leader"
                                                            ? "bg-cyan-500/10 text-cyan-400"
                                                            : "bg-white/5 text-white/60"
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
                                                <KeyRound className="w-3 h-3 text-blue-400/70" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400/70 font-robotoMono">
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
                                                        <Copy className="w-3 h-3 text-blue-400/60" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Your role badge & actions */}
                                {(isInTeam || isPodLead) && (
                                    <div className="mb-3 flex items-start justify-between">
                                        {isInTeam && (
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-robotoMono ${isTeamLeader
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
                                        )}
                                        <div className="flex items-center gap-2 ml-auto">
                                            {!isTeamLeader && isInTeam && (
                                                <button
                                                    onClick={() => setActionModal({ type: 'leave', projectId: project._id })}
                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase tracking-wider font-robotoMono hover:bg-amber-500/20 transition-colors"
                                                >
                                                    <LogOut className="w-3 h-3" />
                                                    Leave
                                                </button>
                                            )}
                                            {(isTeamLeader) && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setEditModalProject(project)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-bold uppercase tracking-wider font-robotoMono hover:bg-cyan-500/20 transition-colors"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setActionModal({ type: 'delete', projectId: project._id })
                                                        }
                                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider font-robotoMono hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Links */}
                                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                                    {project.githubRepo && (
                                        <a
                                            href={project.githubRepo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-bold text-white/55 hover:text-white/75 font-robotoMono uppercase tracking-wider transition-colors"
                                        >
                                            <Github className="w-3.5 h-3.5" />
                                            Repo
                                        </a>
                                    )}
                                    {project.demoLink && (
                                        <a
                                            href={project.demoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-400 font-robotoMono uppercase tracking-wider transition-colors"
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

            {/* Join Team and Action Modals */}
            <AnimatePresence>
                {joinModalOpen && wallet && (
                    <JoinTeamModal
                        onClose={() => setJoinModalOpen(false)}
                        onSuccess={() => onRefresh?.()}
                    />
                )}
                {actionModal && (
                    <ConfirmActionModal
                        title={actionModal.type === 'leave' ? 'Leave Team' : 'Delete Project'}
                        message={actionModal.type === 'leave'
                            ? 'Are you sure you want to leave this project team? You will need the team code to rejoin.'
                            : 'Are you sure you want to delete this project? This action cannot be undone and will free all team members.'}
                        actionLabel={actionModal.type === 'leave' ? 'Leave' : 'Delete'}
                        actionColor={actionModal.type === 'leave' ? 'text-amber-400' : 'text-red-400'}
                        icon={actionModal.type === 'leave' ? LogOut : Trash2}
                        submitting={submittingAction}
                        onConfirm={handleAction}
                        onClose={() => setActionModal(null)}
                    />
                )}
                {editModalProject && (
                    <ProjectEditModal
                        project={editModalProject}
                        onClose={() => setEditModalProject(null)}
                        onSuccess={() => onRefresh?.()}
                    />
                )}
            </AnimatePresence>

            {actionError && (
                <div className="fixed bottom-4 right-4 z-50 p-3 rounded-xl bg-red-500/10 border border-red-500/20 max-w-sm animate-in fade-in">
                    <p className="text-[11px] text-red-400 font-robotoMono">{actionError}</p>
                    <button
                        onClick={() => setActionError(null)}
                        className="mt-1 text-[9px] text-red-400/60 font-robotoMono underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}
        </div>
    );
}
