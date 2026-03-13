"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Download,
    FileJson,
    Loader2,
    CheckCircle2,
} from "lucide-react";

export default function AdminExportPage() {
    const [loading, setLoading] = useState(false);
    const [exported, setExported] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        setExported(false);
        try {
            const res = await fetch("/api/admin/builder-pods/export/report", { credentials: "include" });
            const data = await res.json();

            // Download as JSON file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `builder-pods-report-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setExported(true);
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/admin/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Admin Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <Download className="w-5 h-5 text-indigo-400/70" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    DAO Report Export
                </h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-container rounded-2xl p-8 max-w-xl"
            >
                <div className="flex items-center gap-3 mb-6">
                    <FileJson className="w-8 h-8 text-indigo-400/50" />
                    <div>
                        <h2 className="text-sm font-bold text-white font-robotoMono">
                            Full Program Export
                        </h2>
                        <p className="text-[10px] text-white/70 font-robotoMono mt-0.5">
                            Download a complete JSON export of all Builder Pods data.
                        </p>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    {[
                        "All colleges with stats",
                        "Member data and roles",
                        "Projects and deployment records",
                        "Badge and attestation data",
                        "Leaderboard standings",
                        "Showcase results",
                        "Lab event attendance",
                    ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-indigo-400/60 shrink-0" />
                            <span className="text-[11px] text-white/60 font-robotoMono">{item}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleExport}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold font-robotoMono transition-all border border-indigo-500/10 disabled:opacity-30 w-full justify-center"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating Export...
                        </>
                    ) : exported ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            Exported Successfully
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            Export DAO Report
                        </>
                    )}
                </button>

                {exported && (
                    <p className="text-[9px] text-green-400/60 font-robotoMono text-center mt-3">
                        Report downloaded as JSON. Check your downloads folder.
                    </p>
                )}
            </motion.div>
        </div>
    );
}
