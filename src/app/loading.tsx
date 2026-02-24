"use client";
import React from "react";
import { Bars } from "react-loader-spinner";
import { motion } from "framer-motion";

function loading() {
  return (
    <div className="flex flex-col h-screen justify-center items-center bg-[#07090D] relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Loading Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <div className="relative">
          <Bars
            height="120"
            width="120"
            color="#3b82f6"
            ariaLabel="bars-loading"
            visible={true}
          />
          {/* Subtle outer ring */}
          <div className="absolute inset-0 border-2 border-white/5 rounded-full scale-150 animate-pulse" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <motion.h2
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-white font-bold text-xl tracking-[0.2em] uppercase font-unbounded"
          >
            Xcan
          </motion.h2>
          <p className="text-white/40 text-xs font-medium tracking-widest uppercase font-robotoMono">
            Synchronizing data modules...
          </p>
        </div>
      </motion.div>

      {/* Technical Details (Subtle) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] text-white/10 uppercase tracking-[0.3em] font-robotoMono">
        <span>V4.2.0-ALPH</span>
        <div className="w-1 h-1 bg-white/20 rounded-full" />
        <span>NODE-LAT: 24MS</span>
      </div>
    </div>
  );
}

export default loading;

