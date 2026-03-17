"use client";
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    X,
    CalendarDays,
    Github,
    AlertTriangle,
    Target,
    FileText,
    Loader2,
    CheckCircle,
    Wallet,
    RotateCw,
    ShieldAlert,
} from "lucide-react";
import { useAccount } from "wagmi";
import { isActiveWeeklyUpdateLead } from "@/lib/builder-pods/membership";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface WeeklyUpdateFormProps {
    collegeSlug: string;
    onSuccess?: () => void;
    editData?: {
        id: string;
        completedThisWeek: string;
        blockers: string | null;
        nextMilestone: string;
        githubLink: string | null;
    };
    trigger?: React.ReactNode;
}

export default function WeeklyUpdateForm({
    collegeSlug,
    onSuccess,
    editData,
    trigger,
}: WeeklyUpdateFormProps) {
    const { address } = useAccount();
    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const isEdit = !!editData;

    const [form, setForm] = useState({
        completedThisWeek: editData?.completedThisWeek || "",
        blockers: editData?.blockers || "",
        nextMilestone: editData?.nextMilestone || "",
        githubLink: editData?.githubLink || "",
    });

    // Fetch college data to get member role and status
    const { data: collegeData, isLoading: loadingRole } = useSWR(
        collegeSlug && isOpen ? `/api/builder-pods/colleges/${collegeSlug}` : null,
        fetcher
    );

    const currentUser = useMemo(() => {
        if (!collegeData?.members || !address) return null;
        return collegeData.members.find(
            (m: any) => m.walletAddress.toLowerCase() === address.toLowerCase()
        );
    }, [collegeData, address]);

    const userRole = currentUser?.role || "pod_member";
    const userStatus = currentUser?.status || "pending";
    
    const isAuthorized = useMemo(() => {
        return isActiveWeeklyUpdateLead(currentUser);
    }, [currentUser]);

    // Role display label
    const roleLabel = useMemo(() => {
        if (!currentUser) return "Scanning...";
        return userRole.replace(/_/g, " ");
    }, [userRole, currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const url = isEdit
                ? `/api/builder-pods/colleges/${collegeSlug}/updates/${editData.id}`
                : `/api/builder-pods/colleges/${collegeSlug}/updates/submit`;
            
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    blockers: form.blockers || null,
                    githubLink: form.githubLink || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'submit'} update`);
            }

            setSuccess(true);
            if (!isEdit) {
                setForm({
                    completedThisWeek: "",
                    blockers: "",
                    nextMilestone: "",
                    githubLink: "",
                });
            }

            setTimeout(() => {
                setSuccess(false);
                setIsOpen(false);
                onSuccess?.();
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)}>{trigger}</div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 font-robotoMono uppercase tracking-wider hover:bg-purple-500/15 transition-all"
                >
                    <Plus className="w-3 h-3" />
                    Submit Update
                </button>
            )}

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center px-4 pb-4 pt-24 md:px-6 md:pb-6 md:pt-28 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setIsOpen(false);
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
                                    <CalendarDays className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <h2 className="text-lg font-black text-white font-unbounded tracking-tight">
                                            {isEdit ? "Edit Weekly Update" : "Weekly Update"}
                                        </h2>
                                        <p className="mt-0.5 text-[11px] text-white/70 font-robotoMono">
                                            {isEdit ? "Update your progress, blockers, and next steps." : "Capture progress, blockers, and next steps."}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/70" />
                                </button>
                            </div>

                            <div className="px-6 py-5 md:px-8 md:py-6 overflow-y-auto technical-scrollbar">
                                {success ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center gap-3 py-4"
                                    >
                                        <CheckCircle className="w-10 h-10 text-green-400" />
                                        <p className="text-sm font-bold text-green-400 font-robotoMono text-center">
                                            Weekly update {isEdit ? 'updated' : 'submitted'}!
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Submitter Info */}
                                        {address && (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <Wallet className="w-3.5 h-3.5 text-white/55" />
                                                    <span className="text-[10px] text-white/75 font-robotoMono">
                                                        Updating as:{" "}
                                                        {address.slice(0, 8)}...
                                                        {address.slice(-4)}
                                                    </span>
                                                    {loadingRole ? (
                                                        <RotateCw className="w-3 h-3 ml-auto text-white/50 animate-spin" />
                                                    ) : (
                                                        <span className={`ml-auto px-2 py-0.5 rounded-full text-[8px] font-bold font-robotoMono uppercase tracking-wider ${
                                                            isAuthorized ? "bg-purple-500/10 text-purple-300" : "bg-white/5 text-white/50"
                                                        }`}>
                                                            {roleLabel}
                                                        </span>
                                                    )}
                                                </div>

                                                {!loadingRole && !isAuthorized && (
                                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                                        <p className="text-[10px] text-amber-400 font-robotoMono">
                                                            Only active Pod Leads or Tech Leads can submit weekly updates.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* Completed This Week */}
                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 font-robotoMono mb-2">
                                                <FileText className="w-3.5 h-3.5" />
                                                What was completed this week? *
                                            </label>
                                            <textarea
                                                required
                                                value={form.completedThisWeek}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        completedThisWeek:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="Describe what was accomplished this week..."
                                                rows={4}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/50 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all resize-none technical-scrollbar"
                                            />
                                        </div>

                                        {/* Blockers */}
                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400/80 font-robotoMono mb-2">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Blockers
                                            </label>
                                            <textarea
                                                value={form.blockers}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        blockers: e.target.value,
                                                    }))
                                                }
                                                placeholder="Any blockers or challenges faced..."
                                                rows={3}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/50 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.05] transition-all resize-none technical-scrollbar"
                                            />
                                        </div>

                                        {/* Next Milestone */}
                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 font-robotoMono mb-2">
                                                <Target className="w-3.5 h-3.5" />
                                                Next Milestone *
                                            </label>
                                            <textarea
                                                required
                                                value={form.nextMilestone}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        nextMilestone:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="What's the next milestone or goal?"
                                                rows={2}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/50 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all resize-none technical-scrollbar"
                                            />
                                        </div>

                                        {/* GitHub Link */}
                                        <div>
                                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 font-robotoMono mb-2">
                                                <Github className="w-3.5 h-3.5" />
                                                GitHub Link
                                            </label>
                                            <input
                                                type="url"
                                                value={form.githubLink}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        githubLink: e.target.value,
                                                    }))
                                                }
                                                placeholder="https://github.com/..."
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/50 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all"
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
                                            disabled={submitting || !isAuthorized || loadingRole}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    {isEdit ? 'Updating...' : 'Submitting...'}
                                                </>
                                            ) : (
                                                <>
                                                    {isEdit ? <FileText className="w-3.5 h-3.5" /> : <CalendarDays className="w-3.5 h-3.5" />}
                                                    {isEdit ? 'Update Weekly Update' : 'Submit Weekly Update'}
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
        )}
        </>
    );
}
