"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Rocket, Eye } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden rounded-3xl mb-10">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-500/10 rounded-3xl" />
            <div className="absolute inset-0 backdrop-blur-3xl rounded-3xl" />

            {/* Animated glow orbs */}
            <motion.div
                className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 px-8 py-16 md:px-16 md:py-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="max-w-3xl"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
                    >
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 font-robotoMono">
                            Arbitrum Ecosystem
                        </span>
                    </motion.div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-unbounded tracking-tighter leading-[1.1] mb-5">
                        Arbitrum
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            {" "}Builder Pods
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-white/75 text-sm md:text-base font-robotoMono leading-relaxed max-w-xl mb-8">
                        A structured university network building on Arbitrum across India.
                        Join Builder Labs, form Pods, deploy contracts, and compete in
                        regional showcases.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-3">
                        <Link href="/builder-pods/register">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10"
                            >
                                <Rocket className="w-4 h-4" />
                                Join via Builder Lab
                            </motion.button>
                        </Link>
                        <a href="#colleges">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white border border-white/10 rounded-full text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:bg-white/10"
                            >
                                <Eye className="w-4 h-4" />
                                View Pods
                            </motion.button>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
