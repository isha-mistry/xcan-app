"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
    User,
    Wallet,
    GraduationCap,
    Github,
    QrCode,
    Loader2,
    CheckCircle,
    AlertCircle,
    Award,
    X,
    ExternalLink,
    Mail,
} from "lucide-react";
import { CollegeOption } from "@/types/builder-pods";
import { getBuilderPodBadgeMeta } from "@/lib/builder-pods/badge-ui";

interface RegistrationFormProps {
    walletAddress: string | null;
    initialQrToken?: string;
}

interface CelebrationBadge {
    slug?: string | null;
    label?: string | null;
    easUid?: string | null;
}

interface ExistingMembership {
    collegeName: string | null;
    status: string | null;
}

export default function RegistrationForm({
    walletAddress,
    initialQrToken = "",
}: RegistrationFormProps) {
    const [colleges, setColleges] = useState<CollegeOption[]>([]);
    const [loadingColleges, setLoadingColleges] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [collegeLocked, setCollegeLocked] = useState(false);
    const [qrEventName, setQrEventName] = useState("");
    const [checkingExistingMembership, setCheckingExistingMembership] = useState(false);
    const [existingMembership, setExistingMembership] = useState<ExistingMembership | null>(null);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        joinedViaQr?: boolean;
    } | null>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        collegeSlug: "",
        programmingLevel: "",
        githubUsername: "",
        semester: "",
        qrToken: initialQrToken,
    });

    useEffect(() => {
        if (!initialQrToken) return;
        setForm((current) =>
            current.qrToken
                ? current
                : { ...current, qrToken: initialQrToken }
        );
    }, [initialQrToken]);

    useEffect(() => {
        fetch("/api/builder-pods/register")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setColleges(data.colleges);
            })
            .catch(console.error)
            .finally(() => setLoadingColleges(false));
    }, []);

    useEffect(() => {
        if (!initialQrToken) return;
        fetch(`/api/builder-pods/register?token=${encodeURIComponent(initialQrToken)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.collegeSlug) {
                    setForm((f) => ({ ...f, collegeSlug: data.collegeSlug }));
                    setCollegeLocked(true);
                    setQrEventName(data.eventName || "");
                }
            })
            .catch(console.error);
    }, [initialQrToken]);

    useEffect(() => {
        if (!walletAddress) {
            setExistingMembership(null);
            return;
        }

        let cancelled = false;
        setCheckingExistingMembership(true);

        fetch("/api/builder-pods/members/me", { credentials: "include" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (cancelled || !data?.success) return;
                const membership = data.membership;
                if (!membership) {
                    setExistingMembership(null);
                    return;
                }
                setExistingMembership({
                    collegeName: membership.collegeId?.name ?? null,
                    status: membership.status ?? null,
                });
                setResult({
                    success: false,
                    message: membership.collegeId?.name
                        ? `You are already registered with ${membership.collegeId.name}. This wallet cannot register for another college.`
                        : "You are already registered with another Builder Pod. This wallet cannot register again.",
                });
            })
            .catch(() => {
                if (!cancelled) {
                    setExistingMembership(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setCheckingExistingMembership(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [walletAddress]);

    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationBadges, setCelebrationBadges] = useState<CelebrationBadge[]>([]);

    const fireConfetti = useCallback(() => {
        const duration = 3000;
        const end = Date.now() + duration;
        const frame = () => {
            confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
            confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
    }, []);

    useEffect(() => {
        if (!showCelebration) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowCelebration(false);
                setCelebrationBadges([]);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [showCelebration]);

    const closeCelebration = () => {
        setShowCelebration(false);
        setCelebrationBadges([]);
    };

    const isRegistrationBlocked = Boolean(existingMembership);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) return;
        if (isRegistrationBlocked) {
            setResult({
                success: false,
                message: existingMembership?.collegeName
                    ? `You are already registered with ${existingMembership.collegeName}. This wallet cannot register for another college.`
                    : "You are already registered with another Builder Pod. This wallet cannot register again.",
            });
            return;
        }
        setSubmitting(true);
        setResult(null);

        try {
            const payload: Record<string, string> = (() => {
                const next: Record<string, string> = { ...form };
                if (!next.qrToken.trim()) {
                    // Treat empty QR token as \"no QR used\" so backend validation
                    // sees an undefined value instead of an empty string.
                    delete next.qrToken;
                }
                return next;
            })();

            const res = await fetch("/api/builder-pods/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                const viaQr = !!data.member.joinedViaQr;
                setResult({
                    success: true,
                    joinedViaQr: viaQr,
                    message: viaQr
                        ? "Registered successfully via Builder Lab! You've earned the Builder Lab Participant badge."
                        : "Registration submitted! Your application is pending approval.",
                });
                setForm({
                    name: "",
                    email: "",
                    collegeSlug: "",
                    programmingLevel: "",
                    githubUsername: "",
                    semester: "",
                    qrToken: "",
                });
                if (viaQr) {
                    setCelebrationBadges([
                        {
                            slug: "builder_lab_participant",
                            label: "Builder Lab Participant",
                        },
                    ]);
                    setShowCelebration(true);
                    fireConfetti();
                }
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
        "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-robotoMono placeholder:text-white/45 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all";
    const labelClass =
        "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 font-robotoMono mb-2";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-container rounded-2xl p-6 md:p-8 max-w-2xl mx-auto"
        >
            <h2 className=" tracking-tight mb-1 font-robotoMono">
                Join a Builder Pod
            </h2>
            <p className="text-xs text-white/60 font-robotoMono mb-8">
                Connect your wallet and register to join your college&apos;s Arbitrum
                Builder Pod.
            </p>

            {!walletAddress ? (
                <div className="text-center py-8">
                    <Wallet className="w-8 h-8 text-white/45 mx-auto mb-3" />
                    <p className="text-sm text-white/60 font-robotoMono">
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
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/60 font-robotoMono">
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
                            disabled={isRegistrationBlocked}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            placeholder="Enter your full name"
                            className={inputClass}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className={labelClass}>
                            <Mail className="w-3 h-3" />
                            Email Address *
                        </label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            disabled={isRegistrationBlocked}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, email: e.target.value }))
                            }
                            placeholder="you@example.com"
                            className={inputClass}
                        />
                        <p className="text-[10px] text-white/45 font-robotoMono mt-1">
                            Used for role change notifications. Will not be shared publicly.
                        </p>
                    </div>

                    {/* College */}
                    <div>
                        <label className={labelClass}>
                            <GraduationCap className="w-3 h-3" />
                            College *
                        </label>
                        {loadingColleges ? (
                            <div className="flex items-center gap-2 text-xs text-white/50 font-robotoMono py-3">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading colleges...
                            </div>
                        ) : (
                            <>
                                <select
                                    required
                                    value={form.collegeSlug}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, collegeSlug: e.target.value }))
                                    }
                                    disabled={collegeLocked || isRegistrationBlocked}
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
                                {collegeLocked && qrEventName && (
                                    <p className="text-[10px] text-cyan-400 font-robotoMono mt-1">
                                        Auto-selected from lab event: {qrEventName}
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Programming Level */}
                    <div>
                        <label className={labelClass}>Programming Level</label>
                        <select
                            value={form.programmingLevel}
                            disabled={isRegistrationBlocked}
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
                            GitHub Username *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.githubUsername}
                            disabled={isRegistrationBlocked}
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
                            disabled={isRegistrationBlocked}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, semester: e.target.value }))
                            }
                            placeholder="e.g. Sem 6"
                            maxLength={20}
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
                            disabled={isRegistrationBlocked}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, qrToken: e.target.value }))
                            }
                            readOnly={!!initialQrToken}
                            placeholder="Paste QR token (if attending a lab)"
                            className={inputClass}
                        />
                        <p className="text-[10px] text-white/45 font-robotoMono mt-1">
                            {initialQrToken
                                ? "Auto-filled from QR code scan."
                                : "Optional. Scan the QR code at your Builder Lab event."}
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

                    {checkingExistingMembership && (
                        <div className="flex items-center gap-2 text-xs text-white/50 font-robotoMono">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Checking your Builder Pod membership...
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            checkingExistingMembership ||
                            isRegistrationBlocked ||
                            !form.name ||
                            !form.email.trim() ||
                            !form.collegeSlug ||
                            !form.githubUsername.trim()
                        }
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

            {/* Celebration Modal */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Registration Success"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-4"
                        onClick={closeCelebration}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative glass-container rounded-3xl p-8 md:p-10 max-w-2xl w-full text-center backdrop-blur-md overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeCelebration}
                                className="absolute top-4 right-4 text-white/50 hover:text-white/75 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-400/20 via-amber-400/15 to-transparent blur-3xl animate-pulse" />

                            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border border-yellow-500/20 flex items-center justify-center mx-auto mb-5">
                                <Award className="w-8 h-8 text-yellow-400" />
                            </div>

                            <h3 className="relative text-2xl font-black text-white font-unbounded tracking-tight mb-2">
                                Congratulations!
                            </h3>
                            <p className="relative text-sm text-white/70 font-robotoMono mb-4">
                                {celebrationBadges.length > 1
                                    ? "You've unlocked new Builder Pods badges"
                                    : "You've unlocked a new Builder Pods badge"}
                            </p>

                            <div className={`relative mb-6 grid gap-4 ${celebrationBadges.length > 1 ? "sm:grid-cols-2" : ""}`}>
                                {celebrationBadges.map((badge, index) => {
                                    const badgeMeta = getBuilderPodBadgeMeta(badge);

                                    return (
                                        <div
                                            key={`${badgeMeta.slug}-${index}`}
                                            className={`relative overflow-hidden rounded-[1.75rem] border p-4 md:p-5 ${badgeMeta.surfaceClass}`}
                                        >
                                            <motion.div
                                                animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.55, 0.9, 0.55], rotate: [0, 6, -6, 0] }}
                                                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                                                className={`pointer-events-none absolute inset-x-8 top-5 h-24 rounded-full bg-gradient-to-br ${badgeMeta.glowGradientClass} blur-3xl`}
                                            />
                                            <div className="relative flex flex-col">
                                                <div
                                                    className={`relative overflow-hidden rounded-[1.35rem] border border-white/10 ${badgeMeta.imagePanelClass}`}
                                                >
                                                    <div className={`pointer-events-none absolute inset-x-10 top-8 h-20 rounded-full blur-3xl ${badgeMeta.auraClass}`} />
                                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_55%)]" />
                                                    <motion.div
                                                        animate={{ y: [0, -4, 0], scale: [1, 1.03, 1] }}
                                                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                                                        className="relative aspect-[4/3] w-full overflow-hidden"
                                                    >
                                                        <Image
                                                            src={badgeMeta.imageSrc}
                                                            alt={badgeMeta.label}
                                                            fill
                                                            sizes="(min-width: 768px) 20vw, 100vw"
                                                            className="object-contain p-6 drop-shadow-[0_18px_36px_rgba(0,0,0,0.48)]"
                                                        />
                                                    </motion.div>
                                                </div>

                                                <div className="mt-4 text-left">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1.5 border border-white/10">
                                                        <Award className="w-4 h-4 text-orange-300" />
                                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/55 font-robotoMono">
                                                            Earned Badge
                                                        </span>
                                                    </div>
                                                    <p className={`mt-3 text-sm font-bold font-robotoMono ${badgeMeta.titleClass}`}>
                                                        {badgeMeta.label}
                                                    </p>
                                                    <p className="mt-2 text-xs leading-relaxed text-white/65 font-robotoMono">
                                                        {badgeMeta.description}
                                                    </p>
                                                    {badge.easUid && (
                                                        <a
                                                            href={`https://sepolia.easscan.org/attestation/view/${badge.easUid}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] font-robotoMono transition-all ${badgeMeta.buttonClass}`}
                                                        >
                                                            View EAS
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="relative text-xs text-white/55 font-robotoMono mb-6">
                                Your badge artwork will now show up on your profile too. Keep building to unlock the rest of the collection.
                            </p>

                            <a
                                href={`/profile/${walletAddress}?active=info`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10"
                            >
                                View Profile
                            </a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
