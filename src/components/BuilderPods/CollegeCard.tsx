"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Users, ArrowRight } from "lucide-react";

interface CollegeData {
    _id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    podName: string;
    memberCount: number;
    activeMemberCount: number;
    status: "active" | "inactive" | "alumni";
}

interface CollegeCardProps {
    college: CollegeData;
    index: number;
}

export default function CollegeCard({ college, index }: CollegeCardProps) {
    const isActive = college.status === "active";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
        >
            <Link href={`/builder-pods/${college.slug}`}>
                <div className="glass-container rounded-2xl p-6 group hover:border-white/20 transition-all duration-300 cursor-pointer h-full flex flex-col">
                    {/* Status Badge + Pod Name */}
                    <div className="flex items-center justify-between mb-4">
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] font-robotoMono ${isActive
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : "bg-white/5 text-white/30 border border-white/10"
                                }`}
                        >
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-white/20"
                                    }`}
                            />
                            {college.status}
                        </span>
                    </div>

                    {/* College Name */}
                    <h3 className="text-lg font-bold text-white font-unbounded tracking-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {college.name}
                    </h3>

                    {/* Pod Name */}
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-wider font-robotoMono mb-4">
                        {college.podName}
                    </p>

                    {/* City */}
                    <div className="flex items-center gap-1.5 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-white/20" />
                        <span className="text-xs text-white/40 font-robotoMono">
                            {college.city}, {college.state}
                        </span>
                    </div>

                    {/* Spacer to push bottom content down */}
                    <div className="flex-1" />

                    {/* Members + CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-white/20" />
                            <span className="text-xs text-white/40 font-robotoMono">
                                <span className="text-white/60 font-bold">
                                    {college.memberCount}
                                </span>{" "}
                                members
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400 text-[10px] font-bold uppercase tracking-wider font-robotoMono opacity-0 group-hover:opacity-100 transition-opacity">
                            View
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
