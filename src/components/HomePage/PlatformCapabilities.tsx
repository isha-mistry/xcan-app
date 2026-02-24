"use client";

import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Video, Clock, BookOpen, Award, ArrowUpRight } from "lucide-react";

const capabilities = [
  {
    title: "Live Lectures",
    description: "Join interactive sessions with experts in real-time. Attendance auto-recorded as on-chain attestation via EAS on Arbitrum Sepolia.",
    tag: "Attendance NFT",
    icon: <Video className="w-6 h-6 text-blue-400" />,
    color: "blue",
  },
  {
    title: "Expert Sessions",
    description: "Schedule one-on-one time with Arbitrum mentors for personalized guidance. Code review, project advice, or career planning.",
    tag: "1:1 Mentorship",
    icon: <Clock className="w-6 h-6 text-orange-400" />,
    color: "orange",
  },
  {
    title: "Learning Modules",
    description: "8 structured paths from Web3 Basics to advanced Stylus. Story-driven chapters with quizzes and coding challenges in-browser.",
    tag: "8 Learning Paths",
    icon: <BookOpen className="w-6 h-6 text-green-400" />,
    color: "green",
  },
  {
    title: "NFT Certifications",
    description: "Complete a module, earn a permanent on-chain certificate. Download PDF for LinkedIn — shareable, verifiable, permanent proof.",
    tag: "Arbitrum Sepolia",
    icon: <Award className="w-6 h-6 text-cyan-400" />,
    color: "cyan",
  },
];

const PlatformCapabilities = () => {
  return (
    <section className="relative py-12 bg-[#07090D] overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Compact Header */}
        <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center lg:justify-start gap-3 mb-4"
            >
              <div className="h-[1px] w-8 bg-blue-500" />
              <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">
                Ecosystem
              </p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl md:text-5xl lg:text-6xl font-unbounded font-black text-white mb-4 tracking-[-0.04em] leading-[1.1]"
            >
              Everything in <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400/50">one ecosystem</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/30 text-sm md:text-base font-medium max-w-sm lg:text-right"
          >
            A comprehensive suite of tools built specifically for the next generation of Arbitrum developers.
          </motion.p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-12 gap-4">
          {capabilities.map((item, index) => {
            const mouseX = useMotionValue(0);
            const mouseY = useMotionValue(0);

            function handleMouseMove({ currentTarget, clientX, clientY }: any) {
              const { left, top } = currentTarget.getBoundingClientRect();
              mouseX.set(clientX - left);
              mouseY.set(clientY - top);
            }

            // Bento Logic: 1st & 4th are larger
            const isWide = index === 0 || index === 3;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                onMouseMove={handleMouseMove}
                className={`group relative overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 md:p-10 transition-all duration-700
                  col-span-12 ${isWide ? 'lg:col-span-7' : 'lg:col-span-5'}`}
              >
                {/* Spotlight */}
                <motion.div
                  className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: useMotionTemplate`
                      radial-gradient(
                        400px circle at ${mouseX}px ${mouseY}px,
                        ${item.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' :
                        item.color === 'orange' ? 'rgba(249, 115, 22, 0.1)' :
                          item.color === 'green' ? 'rgba(34, 197, 94, 0.1)' :
                            'rgba(34, 211, 238, 0.1)'},
                        transparent 80%
                      )
                    `,
                  }}
                />

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500`}>
                        {item.icon}
                      </div>
                    </div>

                    <h3 className="text-2xl font-unbounded font-black text-white mb-3 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-white/30 text-sm leading-relaxed font-medium max-w-sm group-hover:text-white/50 transition-colors duration-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-10 flex items-center gap-4">
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent" />
                    <div className="px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                      {item.tag}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
//   );
// };

export default PlatformCapabilities;
