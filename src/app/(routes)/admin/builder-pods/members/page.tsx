"use client";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    Users,
    Check,
    X,
    Loader2,
    Clock,
    Shield,
    Save,
} from "lucide-react";

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());
const pendingMembersKey = "/api/admin/builder-pods/members?status=pending";
const managedMembersKey = "/api/admin/builder-pods/members?status=active,inactive,removed";
const roleOptions = [
    { value: "tech_lead", label: "Tech Lead" },
    { value: "member", label: "Member" },
    { value: "mentor", label: "Mentor" },
    { value: "faculty", label: "Faculty" },
];
const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "removed", label: "Removed" },
];

export default function AdminMembersPage() {
    const { data: pendingData, isLoading: pendingLoading } = useSWR(
        pendingMembersKey,
        fetcher
    );
    const { data: managedData, isLoading: managedLoading } = useSWR(
        managedMembersKey,
        fetcher
    );

    const [processing, setProcessing] = useState<string | null>(null);
    const [saving, setSaving] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, { role: string; status: string }>>({});

    const handleAction = async (memberId: string, action: "approve" | "reject") => {
        setProcessing(memberId);
        try {
            await fetch("/api/admin/builder-pods/members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    memberId,
                    action,
                }),
            });
            mutate(pendingMembersKey);
            mutate(managedMembersKey);
            mutate("/api/admin/builder-pods/dashboard");
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(null);
        }
    };

    const handleDraftChange = (member: any, field: "role" | "status", value: string) => {
        setDrafts((current) => ({
            ...current,
            [member._id]: {
                role: current[member._id]?.role ?? member.role,
                status: current[member._id]?.status ?? member.status,
                [field]: value,
            },
        }));
    };

    const handleMemberSave = async (member: any) => {
        const draft = drafts[member._id] ?? { role: member.role, status: member.status };
        const payload: Record<string, string> = { memberId: member._id };

        if (draft.role !== member.role) payload.role = draft.role;
        if (draft.status !== member.status) payload.status = draft.status;
        if (Object.keys(payload).length === 1) return;

        setSaving(member._id);
        try {
            await fetch("/api/admin/builder-pods/members/roles", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            setDrafts((current) => {
                const next = { ...current };
                delete next[member._id];
                return next;
            });
            mutate(managedMembersKey);
            mutate("/api/admin/builder-pods/dashboard");
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(null);
        }
    };

    const pendingMembers = pendingData?.members ?? [];
    const managedMembers = managedData?.members ?? [];

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <Users className="w-5 h-5 text-amber-400/40" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Member Management
                </h1>
                {pendingMembers.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400/60 font-robotoMono">
                        {pendingMembers.length} pending
                    </span>
                )}
            </div>

            <div className="glass-container rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-amber-400/40" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 font-robotoMono">
                        Approval Queue
                    </h2>
                </div>

                {pendingLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="rounded-xl p-5 bg-white/[0.02] animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg" />
                                    <div className="h-4 w-36 bg-white/5 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : pendingMembers.length === 0 ? (
                    <div className="rounded-2xl p-10 text-center bg-white/[0.02] border border-white/5">
                        <Check className="w-8 h-8 text-green-400/30 mx-auto mb-3" />
                        <p className="text-sm text-white/30 font-robotoMono">All clear. No pending members.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {pendingMembers.map((member: any, index: number) => (
                            <motion.div
                                key={member._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: index * 0.03 }}
                                className="rounded-xl p-5 bg-white/[0.02] hover:border-white/15 transition-all border border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-white font-robotoMono">
                                                {member.name}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[8px] font-bold text-white/20 font-robotoMono uppercase">
                                                {member.role.replace("_", " ")}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-white/15 font-robotoMono">
                                            {member.collegeId?.name} · {member.walletAddress.slice(0, 8)}...{member.walletAddress.slice(-4)}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-white/10 font-robotoMono">
                                            <Clock className="w-2.5 h-2.5" />
                                            {new Date(member.createdAt).toLocaleDateString("en-IN")}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAction(member._id, "approve")}
                                            disabled={processing === member._id}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                        >
                                            {processing === member._id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Check className="w-3 h-3" />
                                            )}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(member._id, "reject")}
                                            disabled={processing === member._id}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400/60 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                        >
                                            <X className="w-3 h-3" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="glass-container rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-blue-400/40" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 font-robotoMono">
                        Member Controls
                    </h2>
                </div>

                {managedLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-xl p-5 bg-white/[0.02] animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-white/5 rounded-lg" />
                                <div className="h-4 w-36 bg-white/5 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
                ) : managedMembers.length === 0 ? (
                <div className="rounded-2xl p-10 text-center bg-white/[0.02] border border-white/5">
                    <Users className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-white/30 font-robotoMono">No approved or archived members to manage yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {managedMembers.map((member: any, index: number) => {
                        const draft = drafts[member._id] ?? { role: member.role, status: member.status };
                        const hasChanges = draft.role !== member.role || draft.status !== member.status;

                        return (
                        <motion.div
                            key={member._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.03 }}
                            className="rounded-xl p-5 bg-white/[0.02] hover:border-white/15 transition-all border border-white/5"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-white font-robotoMono">
                                            {member.name}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[8px] font-bold text-white/20 font-robotoMono uppercase">
                                            {member.role.replace("_", " ")}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/15 font-robotoMono">
                                        {member.collegeId?.name} · {member.walletAddress.slice(0, 8)}...{member.walletAddress.slice(-4)}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-white/10 font-robotoMono">
                                        <Clock className="w-2.5 h-2.5" />
                                        {new Date(member.createdAt).toLocaleDateString("en-IN")}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:min-w-[420px]">
                                    <select
                                        value={draft.role}
                                        onChange={(e) => handleDraftChange(member, "role", e.target.value)}
                                        className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[10px] text-white/60 font-bold font-robotoMono focus:outline-none"
                                    >
                                        {roleOptions.map((option) => (
                                            <option key={option.value} value={option.value} className="bg-[#0a0d12]">
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={draft.status}
                                        onChange={(e) => handleDraftChange(member, "status", e.target.value)}
                                        className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[10px] text-white/60 font-bold font-robotoMono focus:outline-none"
                                    >
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value} className="bg-[#0a0d12]">
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleMemberSave(member)}
                                        disabled={!hasChanges || saving === member._id}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30"
                                    >
                                        {saving === member._id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Save className="w-3 h-3" />
                                        )}
                                        Save
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )})}
                </div>
            )}
            </div>
        </div>
    );
}
