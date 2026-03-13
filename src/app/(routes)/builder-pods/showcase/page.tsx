"use client";
import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Trophy,
    MapPin,
    Calendar,
    ExternalLink,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ShowcasePage() {
    const { data, isLoading } = useSWR(
        "/api/builder-pods/showcases",
        fetcher
    );

    const showcases = data?.showcases ?? [];

    return (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <Link href="/builder-pods" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white/80 font-robotoMono mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Builder Pods
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <Trophy className="w-5 h-5 text-yellow-400/70" />
                <h1 className="text-2xl font-black text-white font-unbounded tracking-tight">
                    Regional Showcases
                </h1>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-2xl p-6 animate-pulse">
                            <div className="h-5 w-40 bg-white/5 rounded-lg mb-3" />
                            <div className="h-4 w-24 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : showcases.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <Trophy className="w-8 h-8 text-white/40 mx-auto mb-3" />
                    <p className="text-sm text-white/80 font-robotoMono">No showcases yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {showcases.map((showcase: any, index: number) => (
                        <motion.div
                            key={showcase._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="glass-container rounded-2xl p-6 hover:border-white/15 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-white font-robotoMono mb-1.5">
                                        {showcase.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-robotoMono">
                                        <MapPin className="w-3 h-3" />
                                        {showcase.city || showcase.regionSnapshot?.showcaseCity || "TBD"}
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-robotoMono ${showcase.status === 'completed'
                                        ? 'bg-green-500/10 text-green-400'
                                        : showcase.status === 'open'
                                            ? 'bg-blue-500/10 text-blue-400'
                                            : showcase.status === 'judging'
                                                ? 'bg-yellow-500/10 text-yellow-400'
                                                : 'bg-white/5 text-white/50'
                                    }`}>
                                    {showcase.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-[10px] text-white/45 font-robotoMono mb-4">
                                {showcase.eventDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(showcase.eventDate).toLocaleDateString('en-IN', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </div>
                                )}
                                {showcase.prizePoolUsd > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Trophy className="w-3 h-3 text-yellow-400/60" />
                                        ${showcase.prizePoolUsd.toLocaleString()} prize
                                    </div>
                                )}
                            </div>

                            {(showcase.status === 'open') && (
                                <Link
                                    href="/builder-pods/showcase-submit"
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold font-robotoMono transition-all"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Submit Entry
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
