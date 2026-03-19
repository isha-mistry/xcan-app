"use client";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    QrCode,
    Plus,
    Loader2,
    Calendar,
    Users,
    Copy,
    CheckCircle2,
    Image as ImageIcon,
} from "lucide-react";

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());

interface AdminCollegeOption {
    _id: string;
    slug: string;
    name: string;
    city: string;
    state: string;
    status: string;
}

export default function AdminLabEventsPage() {
    const { data, isLoading } = useSWR(
        "/api/admin/builder-pods/lab-events",
        fetcher
    );
    const { data: collegesData, isLoading: loadingColleges } = useSWR(
        "/api/admin/builder-pods/colleges",
        fetcher
    );

    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [qrModal, setQrModal] = useState<{ eventId: string; dataUrl: string | null; registrationUrl: string | null; loading: boolean } | null>(null);
    const [form, setForm] = useState({
        eventName: "",
        collegeSlug: "",
        eventDate: "",
        expectedAttendees: 30,
    });

    const events = data?.events ?? [];
    const colleges: AdminCollegeOption[] = collegesData?.colleges ?? [];

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setFormError(null);
        try {
            const payload = {
                eventName: form.eventName.trim(),
                collegeSlug: form.collegeSlug,
                eventDate: form.eventDate || undefined,
                expectedAttendees: form.expectedAttendees || undefined,
            };

            const response = await fetch("/api/admin/builder-pods/lab-events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const payloadData = await response.json().catch(() => null);

            if (!response.ok || !payloadData?.success) {
                throw new Error(payloadData?.error || "Failed to create event");
            }

            mutate("/api/admin/builder-pods/lab-events");
            setShowForm(false);
            setForm({ eventName: "", collegeSlug: "", eventDate: "", expectedAttendees: 30 });
        } catch (e) {
            console.error(e);
            setFormError((e as Error).message || "Failed to create event");
        } finally {
            setCreating(false);
        }
    };

    const copyToken = (token: string) => {
        navigator.clipboard.writeText(token);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const viewQR = async (eventId: string) => {
        setQrModal({ eventId, dataUrl: null, registrationUrl: null, loading: true });
        try {
            const res = await fetch(`/api/admin/builder-pods/lab-events/${eventId}/qr`, { credentials: "include" });
            const data = await res.json();
            setQrModal({ eventId, dataUrl: data.qr?.dataUrl || null, registrationUrl: data.qr?.registrationUrl || null, loading: false });
        } catch {
            setQrModal({ eventId, dataUrl: null, registrationUrl: null, loading: false });
        }
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-cyan-400/70" />
                    <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                        Lab Events
                    </h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold font-robotoMono transition-all border border-cyan-500/10"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Event
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <motion.form
                    onSubmit={handleCreate}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="glass-container rounded-2xl p-6 mb-6 max-w-2xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1.5">Event Name *</label>
                            <input
                                type="text"
                                value={form.eventName}
                                onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                                placeholder="e.g. Builder Lab #3 - IIT Bombay"
                                required
                                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono placeholder:text-white/40 focus:outline-none focus:border-white/15 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1.5">College *</label>
                            <select
                                value={form.collegeSlug}
                                onChange={(e) => setForm({ ...form, collegeSlug: e.target.value })}
                                required
                                disabled={loadingColleges || colleges.length === 0}
                                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0f17] border border-white/[0.06] text-xs text-white/80 font-robotoMono focus:outline-none focus:border-white/15 transition-colors disabled:opacity-50"
                            >
                                <option value="">
                                    {loadingColleges ? "Loading colleges..." : "Select a college pod"}
                                </option>
                                {colleges.map((college) => (
                                    <option key={college._id} value={college.slug}>
                                        {college.name} — {college.city}, {college.state} ({college.status})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1.5">Event Date</label>
                            <input
                                type="datetime-local"
                                value={form.eventDate}
                                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono focus:outline-none focus:border-white/15 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1.5">Expected Attendees</label>
                            <input
                                type="number"
                                value={form.expectedAttendees}
                                onChange={(e) => setForm({ ...form, expectedAttendees: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 font-robotoMono focus:outline-none focus:border-white/15 transition-colors"
                            />
                        </div>
                    </div>
                    {formError && (
                        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-300 font-robotoMono">
                            {formError}
                        </div>
                    )}
                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={creating || loadingColleges || colleges.length === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                        >
                            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                            Create Event
                        </button>
                    </div>
                </motion.form>
            )}

            {/* QR Modal */}
            {qrModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setQrModal(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-container rounded-2xl p-8 max-w-sm w-full text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {qrModal.loading ? (
                            <Loader2 className="w-8 h-8 text-white/50 animate-spin mx-auto" />
                        ) : qrModal.dataUrl ? (
                            <>
                                <Image
                                    src={qrModal.dataUrl}
                                    alt="QR Code"
                                    width={256}
                                    height={256}
                                    unoptimized
                                    className="mx-auto rounded-xl"
                                />
                                <a
                                    href={qrModal.dataUrl}
                                    download={`qr-${qrModal.eventId}.png`}
                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-[10px] text-cyan-400 font-robotoMono hover:bg-cyan-500/20 transition-all"
                                >
                                    <ImageIcon className="w-3 h-3" />
                                    Download QR Image
                                </a>
                            </>
                        ) : (
                            <p className="text-xs text-white/60 font-robotoMono">QR generation not available. Install: yarn add qrcode</p>
                        )}
                        {qrModal.registrationUrl && (
                            <div className="mt-4 text-left">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono mb-1">Registration URL</p>
                                <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.06]">
                                    <span className="text-[10px] text-white/70 font-robotoMono truncate flex-1">
                                        {qrModal.registrationUrl}
                                    </span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(qrModal.registrationUrl!);
                                        }}
                                        className="p-1 rounded hover:bg-white/5 transition-colors"
                                    >
                                        <Copy className="w-3 h-3 text-white/50" />
                                    </button>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setQrModal(null)}
                            className="mt-4 px-4 py-2 rounded-lg bg-white/5 text-[10px] text-white/60 font-robotoMono hover:bg-white/10 transition-all"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Events List */}
            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-xl p-5 animate-pulse">
                            <div className="h-4 w-48 bg-white/5 rounded-lg mb-2" />
                            <div className="h-3 w-32 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <QrCode className="w-8 h-8 text-white/40 mx-auto mb-3" />
                    <p className="text-sm text-white/60 font-robotoMono">No lab events yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {events.map((event: any, index: number) => (
                        <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.03 }}
                            className="glass-container rounded-xl p-5 hover:border-white/15 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-white font-robotoMono">
                                            {event.eventName}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold font-robotoMono ${event.qrIsActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400/70"}`}>
                                            {event.qrIsActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-white/45 font-robotoMono">
                                        {event.collegeId?.name && (
                                            <div className="truncate">
                                                {event.collegeId.name}
                                            </div>
                                        )}
                                        {event.eventDate && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(event.eventDate).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {event.actualAttendees || 0}/{event.expectedAttendees || "?"} attendees
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => copyToken(event.qrToken)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] text-white/60 font-robotoMono transition-all"
                                    >
                                        {copiedToken === event.qrToken ? (
                                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                        Token
                                    </button>
                                    <button
                                        onClick={() => viewQR(event._id)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-[9px] text-cyan-400 font-robotoMono transition-all"
                                    >
                                        <ImageIcon className="w-3 h-3" />
                                        QR
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
