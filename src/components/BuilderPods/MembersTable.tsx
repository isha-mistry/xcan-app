"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Shield,
    Github,
    Award,
    Copy,
    CheckCircle2,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { MemberData } from "@/types/builder-pods";

interface MembersTableProps {
    members: MemberData[];
    isLoading?: boolean;
}

const roleStyles: Record<string, { bg: string; text: string }> = {
    pod_lead: { bg: "bg-amber-500/10", text: "text-amber-400" },
    pod_member: { bg: "bg-blue-500/10", text: "text-blue-400" },
    faculty_coordinator: { bg: "bg-purple-500/10", text: "text-purple-400" },
    mentor: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
};

const statusStyles: Record<string, { bg: string; text: string }> = {
    active: { bg: "bg-green-500/10", text: "text-green-400" },
    pending: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
    inactive: { bg: "bg-white/5", text: "text-white/60" },
    removed: { bg: "bg-red-500/10", text: "text-red-400" },
};

const rolePriority: Record<string, number> = {
    pod_lead: 0,
    pod_member: 1,
    lab_participant: 2,
};

export default function MembersTable({
    members,
    isLoading,
}: MembersTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    const filteredMembers = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        const matchedMembers = !q
            ? members
            : members.filter((m) => {
            const searchable = [
                m.name,
                m.walletAddress,
                m.role,
                m.status,
                m.programmingLevel ?? "",
                m.githubUsername ?? "",
            ]
                .join(" ")
                .toLowerCase();
            return searchable.includes(q);
        });

        return [...matchedMembers].sort((a, b) => {
            const roleDiff = (rolePriority[a.role] ?? 99) - (rolePriority[b.role] ?? 99);
            if (roleDiff !== 0) return roleDiff;
            return a.name.localeCompare(b.name);
        });
    }, [members, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, members.length]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedMembers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredMembers.slice(start, start + pageSize);
    }, [filteredMembers, currentPage]);

    if (isLoading) {
        return (
            <div className="glass-container rounded-2xl p-6 mb-8 animate-pulse">
                <div className="h-5 w-32 bg-white/5 rounded-lg mb-6" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 mb-4">
                        <div className="h-4 w-1/4 bg-white/5 rounded-lg" />
                        <div className="h-4 w-1/6 bg-white/5 rounded-lg" />
                        <div className="h-4 w-1/6 bg-white/5 rounded-lg" />
                        <div className="h-4 w-1/6 bg-white/5 rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-container rounded-2xl p-6 mb-8"
        >
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-white/60" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 font-robotoMono">
                        Lab Members
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/60 font-robotoMono">
                        {filteredMembers.length}
                    </span>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search members"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-xs text-white font-robotoMono placeholder:text-white/45 focus:outline-none focus:border-blue-500/40"
                    />
                </div>
            </div>

            {filteredMembers.length === 0 ? (
                <p className="text-white/50 text-sm font-robotoMono text-center py-8">
                    {members.length === 0 ? "No members yet." : "No matching members found."}
                </p>
            ) : (
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-white/5">
                                    {["Name", "Wallet", "Role", "Status", "Level", "Modules", "Active Projects", "Score"].map(
                                        (h) => (
                                            <th
                                                key={h}
                                                className="text-left text-[9px] font-bold uppercase tracking-widest text-white/50 font-robotoMono pb-3 pr-4"
                                            >
                                                {h}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedMembers.map((m) => {
                                    const role = roleStyles[m.role] || roleStyles.pod_member;
                                    const status = statusStyles[m.status] || statusStyles.inactive;
                                    return (
                                        <tr
                                            key={m._id}
                                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-white font-medium font-robotoMono">
                                                        {m.name}
                                                    </span>
                                                    {m.githubUsername && (
                                                        <a
                                                            href={`https://github.com/${m.githubUsername}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-white/50 hover:text-white/70 transition-colors"
                                                        >
                                                            <Github className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <WalletCell address={m.walletAddress} />
                                            <td className="py-3 pr-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-robotoMono ${role.bg} ${role.text}`}
                                                >
                                                    <Shield className="w-2.5 h-2.5" />
                                                    {m.role.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-robotoMono ${status.bg} ${status.text}`}
                                                >
                                                    {m.status}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-xs text-white/60 font-robotoMono capitalize">
                                                {m.programmingLevel || "—"}
                                            </td>
                                            <td className="py-3 pr-4 text-sm text-white/75 font-robotoMono font-bold">
                                                {m.stylusModulesCompleted}
                                            </td>
                                            <td className="py-3 pr-4 text-sm text-white/75 font-robotoMono font-bold">
                                                {m.activeProjectCount ?? 0}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-1">
                                                    <Award className="w-3 h-3 text-amber-400/80" />
                                                    <span className="text-sm text-white font-bold font-robotoMono">
                                                        {m.totalScore}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[10px] text-white/55 font-robotoMono">
                                Showing {(currentPage - 1) * pageSize + 1}-
                                {Math.min(currentPage * pageSize, filteredMembers.length)} of{" "}
                                {filteredMembers.length}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 font-robotoMono disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    Prev
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => {
                                    const page = i + 1;
                                    const isActive = page === currentPage;
                                    return (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-robotoMono ${
                                                isActive
                                                    ? "bg-white/10 border-white/30 text-white"
                                                    : "border-white/10 text-white/70 hover:bg-white/[0.03]"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 font-robotoMono disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}

/** Inline wallet cell with copy button */
function WalletCell({ address }: { address: string }) {
    const [copied, setCopied] = useState(false);
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

    const copy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <td className="py-3 pr-4">
            <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/70 font-robotoMono">
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
                        <Copy className="w-3 h-3 text-white/45 hover:text-white/60" />
                    )}
                </button>
            </div>
        </td>
    );
}
