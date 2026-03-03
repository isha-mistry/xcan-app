"use client";
import React from "react";
import { motion } from "framer-motion";
import {
    FolderGit2,
    Github,
    ExternalLink,
    Code2,
    CheckCircle,
} from "lucide-react";

interface ProjectData {
    _id: string;
    name: string;
    problemStatement: string;
    githubRepo: string | null;
    contractAddress: string | null;
    demoLink: string | null;
    techStack: string[];
    status: string;
    isApproved: boolean;
    createdAt: string;
}

interface ProjectsGridProps {
    projects: ProjectData[];
    isLoading?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    ideation: { label: "Ideation", color: "text-gray-400", bg: "bg-gray-500/10" },
    architecture_finalized: { label: "Architecture", color: "text-blue-400", bg: "bg-blue-500/10" },
    prototype: { label: "Prototype", color: "text-purple-400", bg: "bg-purple-500/10" },
    deployed: { label: "Deployed", color: "text-green-400", bg: "bg-green-500/10" },
    demo_ready: { label: "Demo Ready", color: "text-amber-400", bg: "bg-amber-500/10" },
};

export default function ProjectsGrid({
    projects,
    isLoading,
}: ProjectsGridProps) {
    if (isLoading) {
        return (
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <FolderGit2 className="w-4 h-4 text-white/30" />
                    <div className="h-4 w-24 bg-white/5 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="glass-container rounded-2xl p-6 animate-pulse">
                            <div className="h-5 w-3/4 bg-white/5 rounded-lg mb-3" />
                            <div className="h-3 w-full bg-white/5 rounded-lg mb-2" />
                            <div className="h-3 w-2/3 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
                <FolderGit2 className="w-4 h-4 text-white/30" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 font-robotoMono">
                    Projects
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/30 font-robotoMono">
                    {projects.length}
                </span>
            </div>

            {projects.length === 0 ? (
                <div className="glass-container rounded-2xl p-12 text-center">
                    <p className="text-white/20 text-sm font-robotoMono">
                        No projects submitted yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project, index) => {
                        const sc = statusConfig[project.status] || statusConfig.ideation;
                        return (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="glass-container rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h3 className="text-base font-bold text-white font-unbounded tracking-tight">
                                        {project.name}
                                    </h3>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {project.isApproved && (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        )}
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-robotoMono ${sc.bg} ${sc.color}`}
                                        >
                                            {sc.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Problem Statement */}
                                <p className="text-xs text-white/30 font-robotoMono leading-relaxed mb-4 line-clamp-2">
                                    {project.problemStatement}
                                </p>

                                {/* Tech Stack */}
                                {project.techStack.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {project.techStack.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold text-white/25 font-robotoMono uppercase tracking-wider"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Links */}
                                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                                    {project.githubRepo && (
                                        <a
                                            href={project.githubRepo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-bold text-white/25 hover:text-white/50 font-robotoMono uppercase tracking-wider transition-colors"
                                        >
                                            <Github className="w-3.5 h-3.5" />
                                            Repo
                                        </a>
                                    )}
                                    {project.contractAddress && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-white/25 font-robotoMono">
                                            <Code2 className="w-3.5 h-3.5" />
                                            {project.contractAddress.slice(0, 6)}...
                                            {project.contractAddress.slice(-4)}
                                        </span>
                                    )}
                                    {project.demoLink && (
                                        <a
                                            href={project.demoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-bold text-blue-400/60 hover:text-blue-400 font-robotoMono uppercase tracking-wider transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Demo
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
