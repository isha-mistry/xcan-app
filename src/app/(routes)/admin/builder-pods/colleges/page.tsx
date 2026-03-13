"use client";
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    Plus,
    Edit,
    Power,
    Loader2,
    MapPin,
    Users,
    Code2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());

export default function AdminCollegesPage() {
    const { data, isLoading } = useSWR(
        "/api/admin/builder-pods/colleges",
        fetcher
    );
    const [toggling, setToggling] = useState<string | null>(null);

    const handleToggleStatus = async (collegeId: string, currentStatus: string) => {
        setToggling(collegeId);
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        try {
            await fetch("/api/admin/builder-pods/colleges", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    collegeId,
                    status: newStatus,
                }),
            });
            mutate("/api/admin/builder-pods/colleges");
        } catch (e) {
            console.error(e);
        } finally {
            setToggling(null);
        }
    };

    const colleges = data?.colleges ?? [];

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-green-400/70" />
                    <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                        College Management
                    </h1>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-2xl p-6 animate-pulse">
                            <div className="h-5 w-48 bg-white/5 rounded-lg mb-2" />
                            <div className="h-3 w-32 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : colleges.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <p className="text-sm text-white/80 font-robotoMono">No colleges yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {colleges.map((college: any, index: number) => (
                        <motion.div
                            key={college._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.04 }}
                            className="glass-container rounded-2xl p-5 hover:border-white/15 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-white font-unbounded truncate">
                                            {college.name}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider font-robotoMono ${college.status === "active"
                                                ? "bg-green-500/10 text-green-400"
                                                : "bg-white/5 text-white/75"
                                            }`}>
                                            {college.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/75 font-robotoMono">
                                        {college.podName}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleToggleStatus(college._id, college.status)}
                                    disabled={toggling === college._id}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold font-robotoMono transition-all disabled:opacity-30 ${college.status === "active"
                                            ? "bg-red-500/5 hover:bg-red-500/10 text-red-400"
                                            : "bg-green-500/5 hover:bg-green-500/10 text-green-400"
                                        }`}
                                >
                                    {toggling === college._id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Power className="w-3 h-3" />
                                    )}
                                    {college.status === "active" ? "Deactivate" : "Activate"}
                                </button>
                            </div>

                            <div className="flex items-center gap-4 text-[10px] text-white/75 font-robotoMono">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {college.city}, {college.state}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {college.memberCount ?? 0} members
                                </div>
                                <div className="flex items-center gap-1">
                                    <Code2 className="w-3 h-3" />
                                    {college.deploymentCount ?? 0} deploys
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
