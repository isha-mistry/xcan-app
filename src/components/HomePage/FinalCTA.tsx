"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

const FinalCTA = () => {
  return (
    <section className="relative py-24 bg-[#07090D] overflow-hidden">

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative group overflow-hidden rounded-[48px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-12 md:p-24 text-center shadow-2xl"
        >
          {/* Card Inner Shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-blue-500/[0.03] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/80 animate-pulse" />
              <p className="text-blue-400 font-black text-[9px] uppercase tracking-[0.4em]">
                Join the Revolution
              </p>
            </motion.div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-unbounded font-black text-white mb-10 tracking-[-0.04em] leading-[1.1]">
              Ready to build <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-500/40">on Arbitrum?</span>
            </h2>

            <p className="text-base md:text-lg text-white/20 mb-12 leading-relaxed font-medium max-w-2xl mx-auto">
              Sign up with just your email — no wallet or crypto logic needed to start.
              <span className="text-white/40 block mt-4 font-black uppercase text-[10px] tracking-[0.2em]">Credentials live permanently on-chain.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.a
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-[#07090D] px-10 py-4 rounded-full font-black text-base hover:shadow-xl transition-all duration-500 shadow-lg group relative overflow-hidden"
                href="https://modules.xcan.dev/"
                target="_blank"
              >
                <Zap className="w-5 h-5 fill-blue-600 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="tracking-widest">START FREE</span>
              </motion.a>

              <Link href="/doc" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-10 py-4 rounded-full font-black text-base hover:bg-white/10 hover:border-blue-400/20 transition-all duration-500 shadow-lg backdrop-blur-xl group"
                >
                  <FileText className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                  <span className="tracking-widest">DOCS</span>
                  <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
