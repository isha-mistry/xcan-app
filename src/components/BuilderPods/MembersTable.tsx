"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Github, Award, Copy, CheckCircle2 } from "lucide-react";

interface MemberData {
    _id: string;
    walletAddress: string;
    name: string;
    role: string;
    programmingLevel: string | null;
    githubUsername: string | null;
    status: string;
    stylusModulesCompleted: number;
    contractsDeployed: number;
    totalScore: number;
}

interface MembersTableProps {
    members: MemberData[];
    isLoading?: boolean;
}

const roleStyles: Record<string, { bg: string; text: string }> = {
    tech_lead: { bg: "bg-amber-500/10", text: "text-amber-400" },
    member: { bg: "bg-blue-500/10", text: "text-blue-400" },
    faculty: { bg: "bg-purple-500/10", text: "text-purple-400" },
    mentor: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
};

const statusStyles: Record<string, { bg: string; text: string }> = {
    active: { bg: "bg-green-500/10", text: "text-green-400" },
    pending: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
    inactive: { bg: "bg-white/5", text: "text-white/30" },
    removed: { bg: "bg-red-500/10", text: "text-red-400" },
};

export default function MembersTable({
    members,
    isLoading,
}: MembersTableProps) {
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
            <div className="flex items-center gap-3 mb-6">
                <Users className="w-4 h-4 text-white/30" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 font-robotoMono">
                    Pod Members
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/30 font-robotoMono">
                    {members.length}
                </span>
            </div>

            {members.length === 0 ? (
                <p className="text-white/20 text-sm font-robotoMono text-center py-8">
                    No members yet.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                {["Name", "Wallet", "Role", "Status", "Level", "Modules", "Deploys", "Score"].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="text-left text-[9px] font-bold uppercase tracking-widest text-white/20 font-robotoMono pb-3 pr-4"
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((m) => {
                                const role = roleStyles[m.role] || roleStyles.member;
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
                                                        className="text-white/20 hover:text-white/40 transition-colors"
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
                                        <td className="py-3 pr-4 text-xs text-white/30 font-robotoMono capitalize">
                                            {m.programmingLevel || "—"}
                                        </td>
                                        <td className="py-3 pr-4 text-sm text-white/50 font-robotoMono font-bold">
                                            {m.stylusModulesCompleted}
                                        </td>
                                        <td className="py-3 pr-4 text-sm text-white/50 font-robotoMono font-bold">
                                            {m.contractsDeployed}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-1">
                                                <Award className="w-3 h-3 text-amber-400/50" />
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
                <span className="text-[11px] text-white/40 font-robotoMono">
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
                        <Copy className="w-3 h-3 text-white/15 hover:text-white/30" />
                    )}
                </button>
            </div>
        </td>
    );
}
