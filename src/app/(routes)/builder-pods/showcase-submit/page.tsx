"use client";
import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    Trophy,
    Github,
    ExternalLink,
    Code2,
    FileText,
    Loader2,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

interface ShowcaseEvent {
    _id: string;
    name: string;
    regionSnapshot: { name: string; showcaseCity: string };
    status: string;
}

export default function ShowcaseSubmitPage() {
    const { user } = usePrivy();
    const walletAddress = user?.wallet?.address ?? null;

    const [showcases, setShowcases] = useState<ShowcaseEvent[]>([]);
    const [colleges, setColleges] = useState<{ slug: string; name: string }[]>([]);
    const [projects, setProjects] = useState<{ _id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const [form, setForm] = useState({
        showcaseEventId: "",
        collegeSlug: "",
        projectId: "",
        demoLink: "",
        githubRepo: "",
        contractAddress: "",
        pitchDeckUrl: "",
    });

    useEffect(() => {
        Promise.all([
            fetch("/api/builder-pods/showcases").then((r) => r.json()),
            fetch("/api/builder-pods/register").then((r) => r.json()),
        ])
            .then(([showcaseData, collegeData]) => {
                if (showcaseData.success) {
                    setShowcases(showcaseData.showcases.filter((s: ShowcaseEvent) => s.status !== "completed"));
                }
                if (collegeData.success) setColleges(collegeData.colleges);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Load projects when college selected
    useEffect(() => {
        if (!form.collegeSlug) {
            setProjects([]);
            return;
        }
        fetch(`/api/builder-pods/colleges/${form.collegeSlug}/projects`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success) setProjects(data.projects);
            })
            .catch(console.error);
    }, [form.collegeSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) return;
        setSubmitting(true);
        setResult(null);

        try {
            const res = await fetch("/api/builder-pods/showcases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, walletAddress }),
            });
            const data = await res.json();
            if (data.success) {
                setResult({ success: true, message: "🎉 Showcase submission received! Status: Pending Review" });
                setForm({ showcaseEventId: "", collegeSlug: "", projectId: "", demoLink: "", githubRepo: "", contractAddress: "", pitchDeckUrl: "" });
            } else {
                setResult({ success: false, message: data.error || "Submission failed" });
            }
        } catch {
            setResult({ success: false, message: "Network error. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/15 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all";
    const labelClass =
        "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 font-robotoMono mb-2";

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Builder Pods
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-container rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-1">
                    <Trophy className="w-5 h-5 text-amber-400/50" />
                    <h2 className="text-xl font-black text-white font-unbounded tracking-tight">
                        Showcase Submission
                    </h2>
                </div>
                <p className="text-xs text-white/30 font-robotoMono mb-8">
                    Submit your project for a Regional Showcase event.
                </p>

                {!walletAddress ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-white/30 font-robotoMono">
                            Please connect your wallet to submit.
                        </p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-white/20" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Showcase Event */}
                        <div>
                            <label className={labelClass}><Trophy className="w-3 h-3" />Showcase Event *</label>
                            <select required value={form.showcaseEventId} onChange={(e) => setForm((f) => ({ ...f, showcaseEventId: e.target.value }))} className={inputClass}>
                                <option value="" className="bg-[#0a0d12]">Select showcase</option>
                                {showcases.map((s) => (
                                    <option key={s._id} value={s._id} className="bg-[#0a0d12]">
                                        {s.name} — {s.regionSnapshot.showcaseCity}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* College */}
                        <div>
                            <label className={labelClass}>College *</label>
                            <select required value={form.collegeSlug} onChange={(e) => setForm((f) => ({ ...f, collegeSlug: e.target.value, projectId: "" }))} className={inputClass}>
                                <option value="" className="bg-[#0a0d12]">Select college</option>
                                {colleges.map((c) => (
                                    <option key={c.slug} value={c.slug} className="bg-[#0a0d12]">{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Project */}
                        <div>
                            <label className={labelClass}><FileText className="w-3 h-3" />Project *</label>
                            <select required value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))} className={inputClass}>
                                <option value="" className="bg-[#0a0d12]">{form.collegeSlug ? "Select project" : "Select college first"}</option>
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id} className="bg-[#0a0d12]">{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* GitHub */}
                        <div>
                            <label className={labelClass}><Github className="w-3 h-3" />GitHub Repo *</label>
                            <input type="url" required value={form.githubRepo} onChange={(e) => setForm((f) => ({ ...f, githubRepo: e.target.value }))} placeholder="https://github.com/..." className={inputClass} />
                        </div>

                        {/* Demo Link */}
                        <div>
                            <label className={labelClass}><ExternalLink className="w-3 h-3" />Demo Link</label>
                            <input type="url" value={form.demoLink} onChange={(e) => setForm((f) => ({ ...f, demoLink: e.target.value }))} placeholder="https://..." className={inputClass} />
                        </div>

                        {/* Contract */}
                        <div>
                            <label className={labelClass}><Code2 className="w-3 h-3" />Contract Address</label>
                            <input type="text" value={form.contractAddress} onChange={(e) => setForm((f) => ({ ...f, contractAddress: e.target.value }))} placeholder="0x..." className={inputClass} />
                        </div>

                        {/* Pitch Deck */}
                        <div>
                            <label className={labelClass}><FileText className="w-3 h-3" />Pitch Deck URL</label>
                            <input type="url" value={form.pitchDeckUrl} onChange={(e) => setForm((f) => ({ ...f, pitchDeckUrl: e.target.value }))} placeholder="Cloudinary or Google Slides link" className={inputClass} />
                        </div>

                        {result && (
                            <div className={`flex items-start gap-2 p-4 rounded-xl border text-sm font-robotoMono ${result.success ? "bg-green-500/5 border-green-500/20 text-green-400" : "bg-red-500/5 border-red-500/20 text-red-400"}`}>
                                {result.success ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                                {result.message}
                            </div>
                        )}

                        <button type="submit" disabled={submitting || !form.showcaseEventId || !form.projectId || !form.githubRepo} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed">
                            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Submit to Showcase"}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
