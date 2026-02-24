"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description: "Use your email or connect an existing wallet. Email users get a free embedded wallet — no crypto experience required.",
  },
  {
    number: "02",
    title: "Choose a Module",
    description: "Pick from 8 learning paths. Story + quiz chapters with 80% pass threshold. Code directly in your browser.",
  },
  {
    number: "03",
    title: "Complete & Certify",
    description: "Finish all chapters, pass the challenges. Unlock your certification and mint your unique NFT badge on Arbitrum.",
  },
  {
    number: "04",
    title: "Book Expert Sessions",
    description: "Scheduled 1:1 meetings with Arbitrum experts for personalized guidance on your build.",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-16 bg-[#07090D] overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{
        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="h-[1px] w-6 bg-blue-500/30" />
            <p className="text-blue-400 font-black text-[9px] uppercase tracking-[0.2em]">
              Roadmap to Success
            </p>
            <div className="h-[1px] w-6 bg-blue-500/30" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl font-unbounded font-black text-white mb-4 tracking-[-0.04em]"
          >
            Four steps to <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400"> on-chain fame</span>
          </motion.h2>
        </div>

        {/* Steps Timeline Area */}
        <div className="relative mt-12 max-w-6xl mx-auto">
          {/* Connecting Line - Desktop Only */}
          <div className="absolute top-10 left-[10%] right-[10%] h-[1px] bg-white/5 hidden lg:block overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              whileInView={{ x: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent w-1/2 opacity-30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Number Circle */}
                <div className="relative z-10 w-20 h-20 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border border-white/5 group-hover:border-blue-500/30 transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute inset-1.5 rounded-full border border-white/5 bg-[#07090F] shadow-xl" />

                  {/* Glowing core */}
                  <div className="absolute inset-4 rounded-full bg-blue-500/5 blur-md group-hover:bg-blue-500/10 transition-all duration-700" />

                  <span className="relative z-10 text-xl font-black text-white/30 group-hover:text-blue-400/80 transition-colors duration-500">
                    {step.number}
                  </span>

                  {/* Orbiting element */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>

                <div className="max-w-xs relative px-4">
                  <h3 className="text-lg font-unbounded font-black text-white/90 mb-3 tracking-tight group-hover:text-blue-50 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-white/20 leading-relaxed font-medium text-xs group-hover:text-white/40 transition-colors">
                    {step.description}
                  </p>
                </div>

                {/* Vertical Line for Mobile/Tablet */}
                {index !== steps.length - 1 && (
                  <div className="absolute top-[80px] left-1/2 w-[1px] h-[30px] bg-gradient-to-b from-blue-500/20 to-transparent md:hidden lg:hidden" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
