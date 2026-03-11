"use client";
import React, { useState } from "react";
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
} from "lucide-react";

interface WeeklyUpdateFormProps {
    collegeSlug: string;
    onSuccess?: () => void;
}

export default function WeeklyUpdateForm({
    collegeSlug,
    onSuccess,
}: WeeklyUpdateFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        completedThisWeek: "",
        blockers: "",
        nextMilestone: "",
        githubLink: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch(
                `/api/builder-pods/colleges/${collegeSlug}/updates/submit`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...form,
                        blockers: form.blockers || null,
                        githubLink: form.githubLink || null,
                        walletAddress: "anonymous",
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit update");
            }

            setSuccess(true);
            setForm({
                completedThisWeek: "",
                blockers: "",
                nextMilestone: "",
                githubLink: "",
            });

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
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 font-robotoMono uppercase tracking-wider hover:bg-purple-500/15 transition-all"
            >
                <Plus className="w-3 h-3" />
                Submit Update
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setIsOpen(false);
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            transition={{ duration: 0.25 }}
                            className="w-full max-w-lg glass-container rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="w-5 h-5 text-purple-400/40" />
                                    <h2 className="text-lg font-black text-white font-unbounded tracking-tight">
                                        Weekly Update
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/30" />
                                </button>
                            </div>

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-3 py-8"
                                >
                                    <CheckCircle className="w-10 h-10 text-green-400" />
                                    <p className="text-sm font-bold text-green-400 font-robotoMono">
                                        Weekly update submitted!
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Completed This Week */}
                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 font-robotoMono mb-2">
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
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/15 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all resize-none"
                                        />
                                    </div>

                                    {/* Blockers */}
                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400/30 font-robotoMono mb-2">
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
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/15 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.05] transition-all resize-none"
                                        />
                                    </div>

                                    {/* Next Milestone */}
                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 font-robotoMono mb-2">
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
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/15 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all resize-none"
                                        />
                                    </div>

                                    {/* GitHub Link */}
                                    <div>
                                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 font-robotoMono mb-2">
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
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/15 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all"
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
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                Submit Weekly Update
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
