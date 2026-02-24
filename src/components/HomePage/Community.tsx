"use client";

import { motion } from "framer-motion";
import { User, Shield, Star, Globe, Award, MessageSquare } from "lucide-react";

const learners = [
  { address: "0x252d...d48d", nfts: "7 NFTs", badge: "Arbitrum Stylus", icon: <User className="w-5 h-5 text-blue-400" /> },
  { address: "0x7c30...e988", nfts: "6 NFTs", badge: "Web3 Basics", icon: <Globe className="w-5 h-5 text-green-400" /> },
  { address: "0x5bc0...b309", nfts: "5 NFTs", badge: "Master Orbit", icon: <Shield className="w-5 h-5 text-purple-400" /> },
  { address: "0x8cd...5784", nfts: "4 NFTs", badge: "Stylus Core", icon: <Star className="w-5 h-5 text-yellow-400" /> },
  { address: "0xa672...a394", nfts: "3 NFTs", badge: "Cross Chain", icon: <Award className="w-5 h-5 text-cyan-400" /> },
];

const testimonials = [
  {
    quote: "The Stylus Core Concepts module is the best resource I've found for learning Rust smart contracts. The NFT certificate is a legitimate credential I'm proud to share.",
    author: "0x252d...d48d",
    role: "Arbitrum Developer — 7 NFTs earned",
  },
  {
    quote: "Launched my own Orbit L3 chain after completing the module. The content is hands-on and actually works in production.",
    author: "0x7c30...e988",
    role: "Orbit Builder — 154 chains deployed ecosystem-wide",
  },
  {
    quote: "Expert sessions helped me get unstuck in hours. The 1:1 format is exactly what I needed to ship my DeFi project on Arbitrum.",
    author: "0x5bc0...b309",
    role: "DeFi Developer — Stylus Advocate",
  },
];

const Community = () => {
  return (
    <section className="relative py-24 bg-[#07090D] overflow-hidden">

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-[1px] w-8 bg-blue-500/50" />
            <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">
              Our Community
            </p>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-unbounded font-black text-white tracking-[-0.04em] leading-[1.1] mb-8"
          >
            Join 400+ builders <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-blue-500/50">already learning</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-white/30 max-w-2xl font-medium leading-relaxed"
          >
            Real people, real progress, verifiable on-chain. <br className="hidden md:block" />
            <span className="text-blue-200/40 font-black uppercase text-[10px] tracking-widest mt-4 block">See who's leading the ecosystem.</span>
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {/* Top Learners List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl h-fit"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="text-xl font-unbounded font-black text-white tracking-tight">Top Learners</h3>
              <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[9px] font-black text-blue-400/80 uppercase tracking-[0.1em]">LIVE DATA</span>
              </div>
            </div>

            <div className="p-4">
              {learners.map((learner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-5 hover:bg-white/[0.02] rounded-[24px] transition-all group border border-transparent hover:border-white/5 mb-1 last:mb-0 cursor-default"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-white/5 font-black text-xl w-6 group-hover:text-blue-500/30 transition-colors">0{index + 1}</span>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-500/5 group-hover:border-blue-500/20 group-hover:scale-105 transition-all duration-500 shadow-xl">
                      {learner.icon}
                    </div>
                    <div>
                      <h4 className="text-white/80 font-bold text-sm tracking-tight group-hover:text-blue-50 transition-colors">{learner.address}</h4>
                      <div className="text-[9px] text-white/20 uppercase tracking-[0.1em] font-black mt-1 flex items-center gap-2">
                        <span className="text-blue-400/60">{learner.nfts}</span>
                        <span className="opacity-30">•</span>
                        <span>{learner.badge}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-black text-white/10 uppercase tracking-[0.1em] group-hover:text-blue-400/60 transition-colors">
                    <Award className="w-3 h-3" />
                    {learner.nfts}
                  </div>
                </motion.div>
              ))}
            </div>

            <button className="w-full py-6 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white/60 transition-all border-t border-white/5 hover:bg-white/[0.01] group">
              <span className="group-hover:translate-x-1 inline-block transition-transform">VIEW FULL LEADERBOARD →</span>
            </button>
          </motion.div>

          {/* Testimonials Column */}
          <div className="space-y-6">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ x: 8 }}
                className="bg-white/[0.01] border border-white/5 p-8 rounded-[32px] hover:bg-white/[0.02] hover:border-white/10 transition-all group relative overflow-hidden backdrop-blur-sm"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.01] group-hover:opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-700">
                  <MessageSquare className="w-24 h-24 text-white" />
                </div>

                <div className="mb-6 text-blue-400/20">
                  <span className="text-4xl font-black font-serif leading-none italic">"</span>
                </div>

                <p className="text-base text-white/50 font-medium mb-8 relative z-10 leading-relaxed italic">
                  {t.quote}
                </p>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-blue-500/20 transition-colors shadow-xl">
                    <User className="w-5 h-5 text-white/30 group-hover:text-blue-400/60 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-white/70 font-black text-[10px] tracking-widest">{t.author}</h4>
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.1em] font-black mt-1">
                      {t.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
