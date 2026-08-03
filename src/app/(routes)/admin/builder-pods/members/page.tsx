"use client";

import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import useSWR, { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    Users,
    Check,
    X,
    Loader2,
    Search,
    Shield,
    Github,
    Copy,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Award,
    Clock,
    QrCode,
    Building2,
    ArrowUpCircle,
} from "lucide-react";
import { adminFetcher, ADMIN_SWR_OPTIONS } from "@/lib/fetchers";

const VIEW_TABS = [
    { key: "members", label: "Members" },
    { key: "role_requests", label: "Role Requests" },
] as const;
type ViewTab = (typeof VIEW_TABS)[number]["key"];

const ASSIGNABLE_ROLES = [
    { value: "pod_lead", label: "Pod Lead" },
    { value: "pod_member", label: "Pod Member" },
    { value: "lab_participant", label: "Lab Participant" },
    { value: "faculty_coordinator", label: "Faculty Coordinator" },
    { value: "mentor", label: "Mentor" },
] as const;

const statusStyles: Record<string, { bg: string; text: string }> = {
    active: { bg: "bg-green-500/10", text: "text-green-400" },
    pending: { bg: "bg-amber-500/10", text: "text-amber-400" },
    inactive: { bg: "bg-white/5", text: "text-white/80" },
    removed: { bg: "bg-red-500/10", text: "text-red-400" },
};

const roleStyles: Record<string, { bg: string; text: string }> = {
    pod_lead: { bg: "bg-amber-500/10", text: "text-amber-400" },
    pod_member: { bg: "bg-blue-500/10", text: "text-blue-400" },
    lab_participant: { bg: "bg-teal-500/10", text: "text-teal-400" },
    faculty_coordinator: { bg: "bg-purple-500/10", text: "text-purple-400" },
    mentor: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
};

const levelStyles: Record<string, { bg: string; text: string }> = {
    beginner: { bg: "bg-green-500/10", text: "text-green-400" },
    intermediate: { bg: "bg-blue-500/10", text: "text-blue-400" },
    advanced: { bg: "bg-purple-500/10", text: "text-purple-400" },
};

function WalletCell({ address }: { address: string }) {
    const [copied, setCopied] = useState(false);
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

    const copy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/80 font-robotoMono">
                {truncated}
            </span>
            <button
                onClick={copy}
                className="p-0.5 rounded hover:bg-white/5 transition-colors"
                title="Copy full address"
            >
                {copied ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                ) : (
                    <Copy className="w-3 h-3 text-white/75 hover:text-white/80" />
                )}
            </button>
        </div>
    );
}

function RoleDropdown({
    currentRole,
    memberId,
    onAssign,
    disabled,
}: {
    currentRole: string;
    memberId: string;
    onAssign: (memberId: string, role: string) => void;
    disabled: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({
        visibility: 'hidden',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const dropdownWidth = 200;

            let left = rect.left;
            // Prevent dropdown from going off-screen
            if (left + dropdownWidth > viewportWidth - 20) {
                left = viewportWidth - dropdownWidth - 20;
            }

            setMenuStyles({
                position: 'fixed',
                top: `${rect.bottom + 8}px`,
                left: `${Math.max(20, left)}px`,
                minWidth: `${dropdownWidth}px`,
                visibility: 'visible',
            });
        }
    };

    // calculate position before paint to avoid flicker
    useLayoutEffect(() => {
        if (open) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            // using capture to detect scroll in any container
            window.addEventListener('scroll', updatePosition, true);
        }
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [open]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        if (open) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open]);

    const currentRoleData = ASSIGNABLE_ROLES.find(r => r.value === currentRole) || {
        value: currentRole,
        label: currentRole.replace(/_/g, " ")
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                type="button"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-robotoMono transition-all border ${roleStyles[currentRole]
                    ? `${roleStyles[currentRole].bg} ${roleStyles[currentRole].text} border-current/20`
                    : "bg-white/5 text-white/80 border-white/10"
                    } hover:ring-2 hover:ring-current/10 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
                <Shield className="w-3 h-3 opacity-60" />
                {currentRoleData.label}
                <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {open && (
                        <div className="fixed inset-0 z-[10000] pointer-events-none">
                            {/* Backdrop to close the dropdown */}
                            <div
                                className="absolute inset-0 bg-black/5 pointer-events-auto"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                }}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                transition={{ duration: 0.1, ease: "easeOut" }}
                                style={menuStyles}
                                className="rounded-xl border border-white/10 bg-[#0a0f17]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto"
                            >
                                <div className="p-1.5 flex flex-col gap-1">
                                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                                        <p className="text-[8px] font-bold text-white/80 uppercase tracking-widest">Assign Role</p>
                                    </div>
                                    {ASSIGNABLE_ROLES.map((r) => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (r.value !== currentRole) {
                                                    onAssign(memberId, r.value);
                                                }
                                                setOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[10px] font-bold font-robotoMono uppercase tracking-wider transition-all ${r.value === currentRole
                                                ? "bg-white/10 text-white"
                                                : "text-white/80 hover:bg-white/5 hover:text-white/70"
                                                }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${r.value === 'pod_lead' ? 'bg-amber-500' :
                                                r.value === 'pod_member' ? 'bg-blue-500' :
                                                    r.value === 'faculty_coordinator' ? 'bg-purple-500' :
                                                        r.value === 'mentor' ? 'bg-cyan-500' : "bg-white/20"
                                                }`} />
                                            {r.label}
                                            {r.value === currentRole && (
                                                <Check className="w-3.5 h-3.5 ml-auto text-green-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

const PAGE_SIZE = 20;

export default function AdminMembersPage() {
    const [activeTab, setActiveTab] = useState<ViewTab>("members");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [processing, setProcessing] = useState<string | null>(null);
    const [sortField, setSortField] = useState<string>("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCollege, setSelectedCollege] = useState<string>("all");

    const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 300);
    };

    const apiUrl = `/api/admin/builder-pods/members?status=pending,active,inactive,removed`;

    const { data, isLoading, error } = useSWR(apiUrl, adminFetcher, ADMIN_SWR_OPTIONS);

    const allMembers: any[] = data?.members ?? [];

    const colleges = useMemo(() => {
        const map = new Map<string, string>();
        for (const m of allMembers) {
            if (m.collegeId?._id && m.collegeId?.name) {
                map.set(m.collegeId._id, m.collegeId.name);
            }
        }
        return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [allMembers]);

    const roleRequestCount = useMemo(() => {
        return allMembers.filter((m: any) => m.requestedRole).length;
    }, [allMembers]);

    const filtered = useMemo(() => {
        let list = allMembers;
        if (activeTab === "role_requests") {
            list = list.filter((m: any) => m.requestedRole);
        }
        if (selectedCollege !== "all") {
            list = list.filter((m: any) => m.collegeId?._id === selectedCollege);
        }
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            list = list.filter(
                (m: any) =>
                    m.name?.toLowerCase().includes(q) ||
                    m.walletAddress?.toLowerCase().includes(q) ||
                    m.githubUsername?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [allMembers, activeTab, selectedCollege, debouncedSearch]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a: any, b: any) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            if (sortField === "college") {
                aVal = a.collegeId?.name ?? "";
                bVal = b.collegeId?.name ?? "";
            }
            if (typeof aVal === "string") aVal = aVal.toLowerCase();
            if (typeof bVal === "string") bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [filtered, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const paginated = sorted.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, debouncedSearch, selectedCollege]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("desc");
        }
    };

    const handleApproveReject = async (
        memberId: string,
        action: "approve" | "reject" | "activate" | "deactivate"
    ) => {
        setProcessing(memberId);
        try {
            await fetch("/api/admin/builder-pods/members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ memberId, action }),
            });
            mutate(apiUrl);
            mutate("/api/admin/builder-pods/dashboard");
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(null);
        }
    };

    const handleRoleRequest = async (memberId: string, action: "approve_role" | "reject_role") => {
        setProcessing(memberId);
        try {
            await fetch("/api/admin/builder-pods/members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ memberId, action }),
            });
            mutate(apiUrl);
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(null);
        }
    };

    const handleRoleAssign = async (memberId: string, role: string) => {
        setProcessing(memberId);
        try {
            await fetch("/api/admin/builder-pods/members/roles", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ memberId, role }),
            });
            mutate(apiUrl);
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(null);
        }
    };

    const columns = [
        { key: "name", label: "Name", sortable: true },
        { key: "walletAddress", label: "Wallet", sortable: false },
        { key: "college", label: "College", sortable: true },
        { key: "role", label: "Role", sortable: true },
        { key: "requestedRole", label: "Request", sortable: false },
        { key: "status", label: "Status", sortable: true },
        { key: "programmingLevel", label: "Level", sortable: true },
        { key: "githubUsername", label: "GitHub", sortable: false },
        { key: "stylusModulesCompleted", label: "Modules", sortable: true },
        { key: "activeProjects", label: "Active Projects", sortable: true },
        { key: "totalScore", label: "Score", sortable: true },
        { key: "createdAt", label: "Joined", sortable: true },
        { key: "actions", label: "Actions", sortable: false },
    ];

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link
                href="/admin/builder-pods"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white/80 font-robotoMono mb-6 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-amber-400/70" />
                    <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                        Members
                    </h1>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 text-[10px] font-bold text-white/80 font-robotoMono">
                        {allMembers.length} total
                    </span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* College Filter */}
                    <div className="relative w-full sm:w-52">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/75 pointer-events-none" />
                        <select
                            value={selectedCollege}
                            onChange={(e) => setSelectedCollege(e.target.value)}
                            className="w-full appearance-none bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white font-robotoMono focus:outline-none focus:border-white/20 transition-all cursor-pointer"
                        >
                            <option value="all" className="bg-[#0a0f17] text-white">All Colleges</option>
                            {colleges.map((c) => (
                                <option key={c.id} value={c.id} className="bg-[#0a0f17] text-white">
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/75 pointer-events-none" />
                    </div>
                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/75" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search name, wallet, or GitHub..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-robotoMono placeholder:text-white/75 focus:outline-none focus:border-white/20 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
                {VIEW_TABS.map((tab) => {
                    const count = tab.key === "role_requests" ? roleRequestCount : allMembers.length;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest font-robotoMono transition-all whitespace-nowrap ${activeTab === tab.key
                                ? "bg-white/10 text-white"
                                : "text-white/75 hover:text-white/80 hover:bg-white/[0.03]"
                                }`}
                        >
                            {tab.key === "role_requests" && (
                                <ArrowUpCircle className={`w-3 h-3 ${activeTab === tab.key ? "text-cyan-400" : "text-white/50"}`} />
                            )}
                            {tab.label}
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${tab.key === "role_requests" && roleRequestCount > 0
                                    ? activeTab === tab.key
                                        ? "bg-cyan-500/20 text-cyan-300"
                                        : "bg-cyan-500/10 text-cyan-400"
                                    : activeTab === tab.key
                                        ? "bg-white/10 text-white/70"
                                        : "bg-white/5 text-white/75"
                                    }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            {error ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <Users className="w-8 h-8 text-amber-400/50 mx-auto mb-3" />
                    <p className="text-sm text-amber-300 font-robotoMono">
                        {(error as any)?.status === 401
                            ? "Session expired. Please refresh or re-authenticate."
                            : "Unable to load members right now."}
                    </p>
                    <button
                        onClick={() => mutate(apiUrl)}
                        className="mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-white/60 font-robotoMono transition-all"
                    >
                        Retry
                    </button>
                </div>
            ) : isLoading ? (
                <div className="glass-container rounded-2xl p-6 animate-pulse">
                    <div className="space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex gap-4">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <div
                                        key={j}
                                        className="h-4 bg-white/5 rounded-lg flex-1"
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ) : sorted.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <Users className="w-8 h-8 text-white/70 mx-auto mb-3" />
                    <p className="text-sm text-white/80 font-robotoMono">
                        {debouncedSearch
                            ? "No members match your search."
                            : activeTab === "role_requests"
                                ? "No pending role requests."
                                : "No members found."}
                    </p>
                </div>
            ) : (
                <div className="glass-container rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            onClick={() =>
                                                col.sortable &&
                                                handleSort(col.key)
                                            }
                                            className={`text-left text-[9px] font-bold uppercase tracking-widest text-white/75 font-robotoMono px-4 py-3 whitespace-nowrap ${col.sortable
                                                ? "cursor-pointer hover:text-white/80 select-none"
                                                : ""
                                                } ${sortField === col.key
                                                    ? "text-white/80"
                                                    : ""
                                                }`}
                                        >
                                            <div className="flex items-center gap-1">
                                                {col.label}
                                                {sortField === col.key && (
                                                    <span className="text-[8px]">
                                                        {sortDir === "asc"
                                                            ? "▲"
                                                            : "▼"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((member: any, index: number) => {
                                    const st =
                                        statusStyles[member.status] ??
                                        statusStyles.inactive;
                                    const lvl = member.programmingLevel
                                        ? levelStyles[
                                        member.programmingLevel
                                        ] ?? { bg: "bg-white/5", text: "text-white/80" }
                                        : null;
                                    const isProcessing =
                                        processing === member._id;

                                    return (
                                        <motion.tr
                                            key={member._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{
                                                duration: 0.15,
                                                delay: Math.min(
                                                    index * 0.01,
                                                    0.3
                                                ),
                                            }}
                                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* Name */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white font-robotoMono whitespace-nowrap">
                                                        {member.name}
                                                    </span>
                                                    {member.joinedViaQr && (
                                                        <span title="Joined via QR">
                                                            <QrCode className="w-3 h-3 text-white/75" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Wallet */}
                                            <td className="px-4 py-3">
                                                <WalletCell
                                                    address={
                                                        member.walletAddress
                                                    }
                                                />
                                            </td>

                                            {/* College */}
                                            <td className="px-4 py-3">
                                                <span className="text-[11px] text-white/80 font-robotoMono whitespace-nowrap">
                                                    {member.collegeId?.name ??
                                                        "—"}
                                                </span>
                                            </td>

                                            {/* Role */}
                                            <td className="px-4 py-3">
                                                {member.podMemberInviteStatus === "pending" ? (
                                                    <span
                                                        className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[9px] font-bold text-amber-400 uppercase tracking-wider font-robotoMono whitespace-nowrap"
                                                        title="Waiting for Yes/No from invite email"
                                                    >
                                                        Awaiting RSVP
                                                    </span>
                                                ) : (
                                                    <RoleDropdown
                                                        currentRole={member.role}
                                                        memberId={member._id}
                                                        onAssign={handleRoleAssign}
                                                        disabled={isProcessing || member.status !== "active"}
                                                    />
                                                )}
                                            </td>

                                            {/* Requested Role */}
                                            <td className="px-4 py-3">
                                                {member.requestedRole ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-[9px] font-bold text-cyan-400 uppercase tracking-wider font-robotoMono whitespace-nowrap">
                                                            → {member.requestedRole === "pod_member" ? "Pod Member" : member.requestedRole === "pod_lead" ? "Pod Lead" : member.requestedRole.replace(/_/g, " ")}
                                                        </span>
                                                        <button
                                                            onClick={() => handleRoleRequest(member._id, "approve_role")}
                                                            disabled={isProcessing}
                                                            title="Approve role request"
                                                            className="p-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-all disabled:opacity-30"
                                                        >
                                                            {isProcessing ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Check className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRoleRequest(member._id, "reject_role")}
                                                            disabled={isProcessing}
                                                            title="Reject role request"
                                                            className="p-1 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all disabled:opacity-30"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-white/75 font-robotoMono">—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-robotoMono ${st.bg} ${st.text}`}
                                                >
                                                    {member.status}
                                                </span>
                                            </td>

                                            {/* Level */}
                                            <td className="px-4 py-3">
                                                {lvl ? (
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-robotoMono ${lvl.bg} ${lvl.text}`}
                                                    >
                                                        {member.programmingLevel}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-white/75 font-robotoMono">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            {/* GitHub */}
                                            <td className="px-4 py-3">
                                                {member.githubUsername ? (
                                                    <a
                                                        href={`https://github.com/${member.githubUsername}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-[10px] text-white/80 hover:text-white/75 font-robotoMono transition-colors"
                                                    >
                                                        <Github className="w-3 h-3" />
                                                        {member.githubUsername}
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-white/75 font-robotoMono">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            {/* Modules */}
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-sm text-white/75 font-robotoMono font-bold">
                                                    {member.stylusModulesCompleted}
                                                </span>
                                            </td>

                                            {/* Active Projects */}
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-sm text-white/75 font-robotoMono font-bold">
                                                    {member.activeProjects}
                                                </span>
                                            </td>

                                            {/* Score */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-center">
                                                    <Award className="w-3 h-3 text-amber-400/70" />
                                                    <span className="text-sm text-white font-bold font-robotoMono">
                                                        {member.totalScore}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Joined */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-[10px] text-white/75 font-robotoMono whitespace-nowrap">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {new Date(
                                                        member.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    {member.status === "pending" ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveReject(member._id, "approve")}
                                                                disabled={isProcessing}
                                                                title="Approve member"
                                                                className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-all disabled:opacity-30"
                                                            >
                                                                {isProcessing ? (
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                ) : (
                                                                    <Check className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleApproveReject(member._id, "reject")}
                                                                disabled={isProcessing}
                                                                title="Reject member"
                                                                className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all disabled:opacity-30"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    ) : member.status === "active" ? (
                                                        <button
                                                            onClick={() => handleApproveReject(member._id, "deactivate")}
                                                            disabled={isProcessing}
                                                            title="Deactivate member"
                                                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[9px] font-bold font-robotoMono uppercase tracking-wider transition-all disabled:opacity-30"
                                                        >
                                                            {isProcessing ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                "Deactivate"
                                                            )}
                                                        </button>
                                                    ) : member.status === "inactive" ? (
                                                        <button
                                                            onClick={() => handleApproveReject(member._id, "activate")}
                                                            disabled={isProcessing}
                                                            title="Activate member"
                                                            className="px-2.5 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[9px] font-bold font-robotoMono uppercase tracking-wider transition-all disabled:opacity-30"
                                                        >
                                                            {isProcessing ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                "Activate"
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="text-[9px] text-white/70 font-robotoMono">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-white/75 font-robotoMono">
                            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length} member{sorted.length !== 1 ? "s" : ""}
                        </span>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/80 hover:text-white/80 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === "..." ? (
                                            <span key={`e${i}`} className="px-1 text-[10px] text-white/75 font-robotoMono">...</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p)}
                                                className={`min-w-[28px] h-7 rounded-lg text-[10px] font-bold font-robotoMono transition-all ${currentPage === p
                                                    ? "bg-white/10 text-white"
                                                    : "text-white/75 hover:text-white/75 hover:bg-white/5"
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/80 hover:text-white/80 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
