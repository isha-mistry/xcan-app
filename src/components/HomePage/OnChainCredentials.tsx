"use client";

import { motion } from "framer-motion";
import { Globe, Zap, Trophy, Share2, Building2, ShieldCheck, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const badges = [
  { name: "Web3", icon: <Globe className="w-8 h-8 text-blue-400" /> },
  { name: "Stylus", icon: <Zap className="w-8 h-8 text-orange-400" /> },
  { name: "Foundation", icon: <Trophy className="w-8 h-8 text-yellow-400" /> },
  { name: "Orbit", icon: <Share2 className="w-8 h-8 text-purple-400" /> },
  { name: "DeFi", icon: <Building2 className="w-8 h-8 text-green-400" /> },
  { name: "Cross-Chain", icon: <ShieldCheck className="w-8 h-8 text-cyan-400" /> },
  { name: "Advocate", icon: <Star className="w-8 h-8 text-pink-400" /> },
];

const OnChainCredentials = () => {
  return (
    <section className="relative py-16 bg-[#07090D] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/[0.01] blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-[1px] w-6 bg-blue-500/30" />
            <p className="text-blue-400 font-black text-[9px] uppercase tracking-[0.2em]">
              On-Chain Credentials
            </p>
            <div className="h-[1px] w-6 bg-blue-500/30" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl font-unbounded font-black text-white mb-6 tracking-[-0.04em] leading-[1.1]"
          >
            Earn badges. <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-blue-400/50">Prove your skills.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm md:text-base text-white/20 leading-relaxed font-medium max-w-xl mx-auto"
          >
            Complete each module to unlock and mint a unique NFT certificate on Arbitrum Sepolia. <br className="hidden md:block" />
            <span className="text-blue-200/30 font-black uppercase text-[9px] tracking-widest mt-4 block">7 certification levels — permanent proof of your growth.</span>
          </motion.p>
        </div>

        {/* Badges Display */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12 px-4">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, rotate: index % 2 === 0 ? -5 : 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -5,
                scale: 1.05,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="flex flex-col items-center group relative"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] bg-white/[0.01] backdrop-blur-3xl border border-white/5 flex items-center justify-center mb-3 group-hover:bg-white/[0.03] group-hover:border-blue-500/10 transition-all duration-500">
                {/* Badge Glow */}
                <div className="absolute inset-0 rounded-[24px] bg-blue-500/0 group-hover:bg-blue-500/5 blur-md transition-all duration-500" />

                <div className="relative z-10 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.2)] group-hover:scale-105 transition-all duration-500 scale-75 md:scale-90">
                  {badge.icon}
                </div>
              </div>
              <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em] group-hover:text-blue-400/40 transition-colors">
                {badge.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <Link
          href={"https://modules.xcan.dev/nft"}
          target="_blank"
          className="inline-flex items-center gap-3 bg-white text-[#07090D] px-8 py-3.5 rounded-full font-black text-base hover:shadow-lg transition-all duration-500 shadow-md group overflow-hidden relative"
        >
          <span className="relative z-10 tracking-[0.1em] text-[10px]">VIEW NFT COLLECTION</span>
          <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

export default OnChainCredentials;
