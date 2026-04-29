"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Rocket, Eye } from "lucide-react";
import builderPodsBg from "@/assets/images/builder-pods-bg.jpg";

function HeroSection() {
    return (
        <section className="relative overflow-hidden rounded-3xl mb-10">
            <Image
                src={builderPodsBg}
                alt="Builder Pods hero background"
                fill
                priority
                sizes="(min-width: 1280px) 1200px, (min-width: 768px) 100vw, 100vw"
                quality={75}
                className="absolute inset-0 rounded-3xl object-cover"
            />
            <div className="absolute inset-0 rounded-3xl backdrop-blur-lg bg-gradient-to-r from-black/60 via-black/45 to-black/40" />

            <div className="relative z-10 px-8 py-16 md:px-16 md:py-24">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 font-robotoMono">
                            Arbitrum Ecosystem
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-unbounded tracking-tighter leading-[1.1] mb-5">
                        <span className="bg-gradient-to-r from-[#E9D5FF] via-[#A5B4FC] to-[#7DD3FC] bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(125,211,252,0.14)]">
                            Arbitrum{" "}
                            <span className="bg-gradient-to-r from-[#C4B5FD] via-[#93C5FD] to-[#E9D5FF] bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(233,213,255,0.12)]">
                                Builder Pods
                            </span>
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-white/75 text-sm md:text-base font-robotoMono leading-relaxed max-w-xl mb-8">
                        A structured university network building on Arbitrum across India.
                        Join Builder Labs, form Pods, deploy contracts, and compete in
                        regional showcases.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link href="/builder-pods/register">
                            <span className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:shadow-lg hover:shadow-white/10">
                                <Rocket className="w-4 h-4" />
                                Join via Builder Lab
                            </span>
                        </Link>
                        <a href="#colleges">
                            <span className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white border border-white/10 rounded-full text-[11px] font-bold uppercase tracking-widest font-robotoMono transition-all hover:bg-white/10">
                                <Eye className="w-4 h-4" />
                                View Pods
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default React.memo(HeroSection);
