"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User,
    Wallet,
    GraduationCap,
    Github,
    QrCode,
    Loader2,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

interface CollegeOption {
    _id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
}

interface RegistrationFormProps {
    walletAddress: string | null;
}

export default function RegistrationForm({
    walletAddress,
}: RegistrationFormProps) {
    const [colleges, setColleges] = useState<CollegeOption[]>([]);
    const [loadingColleges, setLoadingColleges] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const [form, setForm] = useState({
        name: "",
        collegeSlug: "",
        programmingLevel: "",
        githubUsername: "",
        semester: "",
        qrToken: "",
    });

    useEffect(() => {
        fetch("/api/builder-pods/register")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setColleges(data.colleges);
            })
            .catch(console.error)
            .finally(() => setLoadingColleges(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) return;
        setSubmitting(true);
        setResult(null);

        try {
            const res = await fetch("/api/builder-pods/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    walletAddress,
                    ...form,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setResult({
                    success: true,
                    message: data.member.joinedViaQr
                        ? "🎉 Registered successfully via Builder Lab! You've earned the Builder Lab Participant badge."
                        : "Registration submitted! Your application is pending approval.",
                });
                setForm({
                    name: "",
                    collegeSlug: "",
                    programmingLevel: "",
                    githubUsername: "",
                    semester: "",
                    qrToken: "",
                });
            } else {
                setResult({ success: false, message: data.error || "Registration failed" });
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-container rounded-2xl p-6 md:p-8 max-w-2xl mx-auto"
        >
            <h2 className="text-xl font-black text-white font-unbounded tracking-tight mb-1">
                Join a Builder Pod
            </h2>
            <p className="text-xs text-white/30 font-robotoMono mb-8">
                Connect your wallet and register to join your college&apos;s Arbitrum
                Builder Pod.
            </p>

            {!walletAddress ? (
                <div className="text-center py-8">
                    <Wallet className="w-8 h-8 text-white/15 mx-auto mb-3" />
                    <p className="text-sm text-white/30 font-robotoMono">
                        Please connect your wallet to register.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Wallet */}
                    <div>
                        <label className={labelClass}>
                            <Wallet className="w-3 h-3" />
                            Wallet Address
                        </label>
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/30 font-robotoMono">
                            {walletAddress}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className={labelClass}>
                            <User className="w-3 h-3" />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            placeholder="Enter your full name"
                            className={inputClass}
                        />
                    </div>

                    {/* College */}
                    <div>
                        <label className={labelClass}>
                            <GraduationCap className="w-3 h-3" />
                            College *
                        </label>
                        {loadingColleges ? (
                            <div className="flex items-center gap-2 text-xs text-white/20 font-robotoMono py-3">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading colleges...
                            </div>
                        ) : (
                            <select
                                required
                                value={form.collegeSlug}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, collegeSlug: e.target.value }))
                                }
                                className={inputClass}
                            >
                                <option value="" className="bg-[#0a0d12]">
                                    Select your college
                                </option>
                                {colleges.map((c) => (
                                    <option key={c.slug} value={c.slug} className="bg-[#0a0d12]">
                                        {c.name} — {c.city}, {c.state}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Programming Level */}
                    <div>
                        <label className={labelClass}>Programming Level</label>
                        <select
                            value={form.programmingLevel}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, programmingLevel: e.target.value }))
                            }
                            className={inputClass}
                        >
                            <option value="" className="bg-[#0a0d12]">
                                Select level (optional)
                            </option>
                            <option value="beginner" className="bg-[#0a0d12]">
                                Beginner
                            </option>
                            <option value="intermediate" className="bg-[#0a0d12]">
                                Intermediate
                            </option>
                            <option value="advanced" className="bg-[#0a0d12]">
                                Advanced
                            </option>
                        </select>
                    </div>

                    {/* GitHub */}
                    <div>
                        <label className={labelClass}>
                            <Github className="w-3 h-3" />
                            GitHub Username
                        </label>
                        <input
                            type="text"
                            value={form.githubUsername}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, githubUsername: e.target.value }))
                            }
                            placeholder="e.g. octocat"
                            className={inputClass}
                        />
                    </div>

                    {/* Semester */}
                    <div>
                        <label className={labelClass}>Current Semester</label>
                        <input
                            type="text"
                            value={form.semester}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, semester: e.target.value }))
                            }
                            placeholder="e.g. 6th Semester"
                            className={inputClass}
                        />
                    </div>

                    {/* QR Token */}
                    <div>
                        <label className={labelClass}>
                            <QrCode className="w-3 h-3" />
                            Builder Lab QR Code
                        </label>
                        <input
                            type="text"
                            value={form.qrToken}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, qrToken: e.target.value }))
                            }
                            placeholder="Paste QR token (if attending a lab)"
                            className={inputClass}
                        />
                        <p className="text-[10px] text-white/15 font-robotoMono mt-1">
                            Optional. Scan the QR code at your Builder Lab event.
                        </p>
                    </div>

                    {/* Result Message */}
                    {result && (
                        <div
                            className={`flex items-start gap-2 p-4 rounded-xl border text-sm font-robotoMono ${result.success
                                    ? "bg-green-500/5 border-green-500/20 text-green-400"
                                    : "bg-red-500/5 border-red-500/20 text-red-400"
                                }`}
                        >
                            {result.success ? (
                                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            )}
                            {result.message}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || !form.name || !form.collegeSlug}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Registering...
                            </>
                        ) : (
                            "Register for Builder Pod"
                        )}
                    </button>
                </form>
            )}
        </motion.div>
    );
}
