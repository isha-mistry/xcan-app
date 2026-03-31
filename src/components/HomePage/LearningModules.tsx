"use client";

import { motion } from "framer-motion";
import { Globe, Zap, Layers, Rocket, Code, Share2, ArrowRight, Layout, Database } from "lucide-react";

const modules = [
  {
    title: "Web3 Basics",
    level: "Absolute Beginner",
    price: "$50",
    description: "Learn Web3 fundamentals through engaging stories and interactive lessons. No prior experience needed!",
    stats: ["5 challenges", "12 sections"],
    icon: <Globe className="w-5 h-5 text-blue-400" />,
  },
  {
    title: "Stylus Core Concepts",
    level: "Beginner — Intermediate",
    price: "$50",
    description: "Master Arbitrum Stylus and build high-performance smart contracts with Rust. Learn WASM, constructors, storage.",
    stats: ["9 challenges", "12 sections"],
    icon: <Zap className="w-5 h-5 text-orange-400" />,
  },
  {
    title: "Stylus Foundation",
    level: "Beginner",
    price: "$50",
    description: "Build a complete ERC20 token system and mint your achievement certificate! Learn ERC20 and ERC721 standards with Rust contract development.",
    stats: ["1 challenges"],
    icon: <Layout className="w-5 h-5 text-green-400" />,
  },
  {
    title: "Master Arbitrum Orbit",
    level: "Intermediate — Advanced",
    price: "$50",
    description: "Configure, deploy, test, and operate your own Orbit L3 chain. Structured theory and quizzes — no coding required.",
    stats: ["6 challenges", "60 sections"],
    icon: <Share2 className="w-5 h-5 text-purple-400" />,
  },
  {
    title: "Arbitrum Stylus",
    level: "Intermediate — Advanced",
    price: "$50",
    description: "Build high-performance smart contracts with Rust, C, and C++ on Arbitrum",
    stats: ["11 challenges"],
    icon: <Database className="w-5 h-5 text-pink-400" />,
  },
  {
    title: "Master DeFi on Arbitrum",
    level: "Beginner — Intermediate",
    price: "$50",
    description: "DeFi fundamentals: DEXs, vaults, and security on Arbitrum through structured theory with practical concepts.",
    stats: ["8 challenges", "Story-based"],
    icon: <Layers className="w-5 h-5 text-green-400" />,
  },
  {
    title: "Cross-Chain Development",
    level: "Intermediate — Advanced",
    price: "$50",
    description: "Foundations — token bridging — advanced protocols — Arbitrum bridge and troubleshooting via stories and quizzes.",
    stats: ["6 challenges", "30 sections"],
    icon: <Code className="w-5 h-5 text-cyan-400" />,
  },
  {
    title: "Precompile Playground",
    level: "Beginner — Advanced",
    price: "$50",
    description: "Master Arbitrum's powerful precompiles through interactive coding challenges",
    stats: ["6 challenges"],
    icon: <Zap className="w-5 h-5 text-blue-400" />,
  },
  {
    title: "Project Submission",
    level: "All Levels",
    price: "FREE",
    description: "Built something with Stylus? Submit to get featured, gain visibility, and inspire others in the ecosystem.",
    stats: ["Community reviewed", "Portfolio building"],
    icon: <Rocket className="w-5 h-5 text-pink-400" />,
    isFree: true,
  },
];

const ModuleCard = ({ module, index, isDuplicate }: { module: any, index: number, isDuplicate?: boolean }) => (
  <motion.div
    key={isDuplicate ? `second-${index}` : `first-${index}`}
    whileHover={{
      y: -5,
      transition: { duration: 0.4, ease: "easeOut" }
    }}
    className={`flex flex-col group relative w-[320px] md:w-[400px] shrink-0 bg-white/[0.01] backdrop-blur-3xl border ${module.isFree ? "border-dashed border-white/10" : "border-white/5"} rounded-[32px] p-8 hover:bg-white/[0.03] hover:border-blue-500/10 transition-all duration-500 overflow-hidden shadow-xl`}
  >
    {/* Card Inner Glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    {/* Price Badge */}
    <div className="absolute top-6 right-6 px-3 py-1 rounded-lg bg-[#07090F] border border-white/5 group-hover:border-blue-500/10 transition-colors">
      <span className={`text-[8px] font-black tracking-[0.1em] ${module.isFree ? "text-green-400/80" : "text-white/40"}`}>
        {module.price}
      </span>
    </div>

    <div className="flex items-center gap-3 mb-6 relative z-10">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-105 group-hover:bg-blue-500/5 transition-all duration-500">
        {module.icon}
      </div>
      <div className="text-[8px] font-black uppercase tracking-[0.1em] text-white/10 group-hover:text-blue-400/60 transition-colors">
        {module.level}
      </div>
    </div>

    <h3 className="text-xl font-unbounded font-black text-white/90 mb-3 tracking-tight group-hover:text-white transition-colors relative z-10">
      {module.title}
    </h3>
    <p className="text-white/20 leading-relaxed font-medium mb-8 min-h-[70px] text-xs group-hover:text-white/40 transition-colors relative z-10">
      {module.description}
    </p>

    <div className="flex flex-wrap gap-2 relative z-10 mt-auto pt-8">
      {module.stats.map((stat: string, i: number) => (
        <div key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black tracking-wider text-white/10 group-hover:border-white/10 group-hover:text-white/30 transition-all">
          {stat.toUpperCase()}
        </div>
      ))}
    </div>

    {/* Decorative background circle */}
    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/5 blur-[50px] rounded-full group-hover:bg-blue-500/10 transition-all duration-700" />
  </motion.div>
);

const LearningModules = () => {
  return (
    <section className="relative py-16 bg-[#07090D] overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.01),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center md:justify-start gap-3 mb-4"
            >
              <div className="h-[1px] w-6 bg-blue-500/30" />
              <p className="text-blue-400 font-black text-[9px] uppercase tracking-[0.2em]">
                Learning Paths
              </p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-5xl font-unbounded font-black text-white tracking-[-0.04em] leading-[1.1]"
            >
              Start anywhere. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-blue-400/50">Go everywhere.</span>
            </motion.h2>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open("https://modules.xcan.dev", "_blank")}
              className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl border border-white/10 px-6 py-2.5 lg:py-3.5 rounded-full text-white font-black hover:bg-white/10 hover:border-blue-400/20 transition-all duration-300 group shadow-lg"
            >
              <span className="text-[9px] tracking-[0.2em]">EXPLORE ALL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Modules Auto Carousel */}
      <div className="relative w-full pb-12 pt-4 overflow-hidden mt-8">
        <style dangerouslySetInnerHTML={{__html: `
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 50s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}} />
        
        {/* Edge gradients to blend the marquee fading out */}
        <div className="absolute top-0 bottom-0 left-0 w-8 md:w-32 bg-gradient-to-r from-[#07090D] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-8 md:w-32 bg-gradient-to-l from-[#07090D] to-transparent z-20 pointer-events-none" />

        <div className="marquee-track items-stretch">
          {/* First Set of Modules */}
          <div className="flex space-x-6 shrink-0 items-stretch pr-6 px-4 md:px-0">
            {modules.map((module, index) => (
              <ModuleCard key={`first-${index}`} module={module} index={index} />
            ))}
          </div>

          {/* Duplicated Set of Modules for Seamless Looping */}
          {/* <div className="flex gap-6 shrink-0 items-stretch pr-6">
            {modules.map((module, index) => (
              <ModuleCard key={`second-${index}`} module={module} index={index} isDuplicate />
            ))}
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default LearningModules;
