"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    X,
    FolderGit2,
    Github,
    ExternalLink,
    Code2,
    Layers,
    FileText,
    Loader2,
    CheckCircle,
    Wallet,
    Copy,
} from "lucide-react";

interface ProjectSubmitFormProps {
    collegeSlug: string;
    walletAddress: string | null;
    isMember: boolean;
    memberStatus?: string | null;
    isDisabled?: boolean;
    onRefresh?: () => void;
}

export default function ProjectSubmitForm({
    collegeSlug,
    walletAddress,
    isMember,
    memberStatus,
    isDisabled,
    onRefresh,
}: ProjectSubmitFormProps) {
    const isActive = memberStatus === "active";
    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        teamCode?: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [techInput, setTechInput] = useState("");
    const [copied, setCopied] = useState(false);

    const [form, setForm] = useState({
        name: "",
        problemStatement: "",
        githubRepo: "",
        contractAddress: "",
        demoLink: "",
        techStack: [] as string[],
    });

    const addTech = () => {
        const trimmed = techInput.trim();
        if (trimmed && !form.techStack.includes(trimmed)) {
            setForm((prev) => ({
                ...prev,
                techStack: [...prev.techStack, trimmed],
            }));
            setTechInput("");
        }
    };

    const removeTech = (tech: string) => {
        setForm((prev) => ({
            ...prev,
            techStack: prev.techStack.filter((t) => t !== tech),
        }));
    };

    const copyTeamCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) return;
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch(
                `/api/builder-pods/colleges/${collegeSlug}/projects/submit`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...form,
                        walletAddress,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit project");
            }

            setResult({ success: true, teamCode: data.project.teamCode });
            setForm({
                name: "",
                problemStatement: "",
                githubRepo: "",
                contractAddress: "",
                demoLink: "",
                techStack: [],
            });
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        if (result?.success) {
            setResult(null);
            onRefresh?.();
        }
    };

    if (!walletAddress || !isMember) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => isActive && !isDisabled && setIsOpen(true)}
                disabled={!isActive || isDisabled}
                title={
                    !isActive 
                        ? "Your membership must be approved before you can submit a project" 
                        : isDisabled 
                            ? "You are already part of a team" 
                            : undefined
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold font-robotoMono uppercase tracking-wider transition-all ${
                    isActive && !isDisabled
                        ? "bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15"
                        : "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
                }`}
            >
                <Plus className="w-3 h-3" />
                Submit Project
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center px-4 pb-4 pt-24 md:px-6 md:pb-6 md:pt-28 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) handleClose();
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            transition={{ duration: 0.25 }}
                            className="w-full max-w-2xl glass-container rounded-3xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] max-h-[83vh] flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 border-b border-white/10 bg-black/70 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <FolderGit2 className="w-5 h-5 text-blue-400/50" />
                                    <div>
                                        <h2 className="text-lg font-black text-white font-unbounded tracking-tight">
                                            Submit Project
                                        </h2>
                                        <p className="mt-0.5 text-[11px] text-white/40 font-robotoMono">
                                            Share details about your team&apos;s build.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/40" />
                                </button>
                            </div>

                            <div className="px-6 py-5 md:px-8 md:py-6 overflow-y-auto technical-scrollbar">
                                {result?.success ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center gap-4 py-4"
                                    >
                                        <CheckCircle className="w-10 h-10 text-green-400" />
                                        <p className="text-sm font-bold text-green-400 font-robotoMono text-center">
                                            Project submitted! You are the Team Leader.
                                        </p>

                                        <div className="w-full mt-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/50 font-robotoMono mb-2 text-center">
                                                Team Code — Share with teammates
                                            </p>
                                            <div className="flex flex-wrap items-center justify-center gap-3">
                                                <span className="text-2xl font-black text-blue-400 font-robotoMono tracking-[0.3em]">
                                                    {result.teamCode}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        copyTeamCode(result.teamCode!)
                                                    }
                                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                                    title="Copy team code"
                                                >
                                                    {copied ? (
                                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-blue-400/60" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-white/30 font-robotoMono mt-2 text-center">
                                                Other pod members can use this code to join your project team.
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleClose}
                                            className="mt-3 px-6 py-2.5 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10"
                                        >
                                            Done
                                        </button>
                                    </motion.div>
                                ) : (
                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-5"
                                    >
                                        {/* Submitter info */}
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                            <Wallet className="w-3.5 h-3.5 text-white/25" />
                                            <span className="text-[10px] text-white/50 font-robotoMono">
                                                Submitting as:{" "}
                                                {walletAddress.slice(0, 8)}...
                                                {walletAddress.slice(-4)}
                                            </span>
                                            <span className="ml-auto px-2 py-0.5 rounded-full bg-cyan-500/10 text-[8px] font-bold text-cyan-400 font-robotoMono uppercase tracking-wider">
                                                Team Leader
                                            </span>
                                        </div>

                                        {/* Project Name */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="md:col-span-2">
                                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 font-robotoMono mb-2">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    Project Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={form.name}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            name: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="e.g. DeFi Lending Protocol"
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all"
                                                />
                                            </div>

                                            {/* Problem Statement */}
                                            <div className="md:col-span-2">
                                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 font-robotoMono mb-2">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    Problem Statement *
                                                </label>
                                                <textarea
                                                    required
                                                    value={form.problemStatement}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            problemStatement:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Describe the problem your project solves..."
                                                    rows={3}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all resize-none technical-scrollbar"
                                                />
                                            </div>

                                            {/* GitHub Repo */}
                                            <div>
                                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 font-robotoMono mb-2">
                                                    <Github className="w-3.5 h-3.5" />
                                                    GitHub Repo
                                                </label>
                                                <input
                                                    type="url"
                                                    value={form.githubRepo}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            githubRepo: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="https://github.com/..."
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all"
                                                />
                                            </div>

                                            {/* Contract Address */}
                                            <div>
                                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 font-robotoMono mb-2">
                                                    <Code2 className="w-3.5 h-3.5" />
                                                    Contract Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.contractAddress}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            contractAddress:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    placeholder="0x..."
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all"
                                                />
                                            </div>

                                            {/* Demo Link */}
                                            <div className="md:col-span-2">
                                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 font-robotoMono mb-2">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Demo Link
                                                </label>
                                                <input
                                                    type="url"
                                                    value={form.demoLink}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            demoLink: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="https://..."
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all"
                                                />
                                            </div>

                                            {/* Tech Stack */}
                                            <div className="md:col-span-2">
                                                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 font-robotoMono mb-2">
                                                    <Layers className="w-3.5 h-3.5" />
                                                    Tech Stack
                                                </label>
                                                <div className="flex flex-col gap-2 mb-2 sm:flex-row">
                                                    <input
                                                        type="text"
                                                        value={techInput}
                                                        onChange={(e) =>
                                                            setTechInput(e.target.value)
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                addTech();
                                                            }
                                                        }}
                                                        placeholder="e.g. Stylus, Rust, React"
                                                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-robotoMono placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={addTech}
                                                        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 font-robotoMono hover:bg-white/10 transition-all"
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
                                                                    onClick={() =>
                                                                        removeTech(tech)
                                                                    }
                                                                    className="hover:text-red-400 transition-colors"
                                                                >
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
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
                                            disabled={submitting}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <FolderGit2 className="w-3.5 h-3.5" />
                                                    Submit Project
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
