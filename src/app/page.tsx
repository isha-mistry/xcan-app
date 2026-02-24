"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Calendar, Clock, Users, Video, Star, User, Sparkles, Zap, Globe, MousePointer2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useRef, useState, useEffect } from "react";
import StatisticsSection from "@/components/HomePage/StatisticsSection";
import PlatformCapabilities from "@/components/HomePage/PlatformCapabilities";
import HowItWorks from "@/components/HomePage/HowItWorks";
import LearningModules from "@/components/HomePage/LearningModules";
import OnChainCredentials from "@/components/HomePage/OnChainCredentials";
import Community from "@/components/HomePage/Community";
import FinalCTA from "@/components/HomePage/FinalCTA";
import HeroBackground from "@/components/HomePage/HeroBackground";

// Magnetic Button Component
const MagneticButton = ({ children, className, onClick, href, target }: any) => {
  const ref = useRef<any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: any) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target={target} className="block">
        {content}
      </a>
    );
  }

  return content;
};

export default function Home() {
  const router = useRouter();
  const { address } = useAccount();
  const { authenticated } = usePrivy();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  // Mouse parallax effect for floating elements
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const handleProfileClick = () => {
    if (!authenticated || !address) {
      router.push('/dashboard');
    } else {
      router.push(`/profile/${address}?active=info`);
    }
  };

  return (
    <main ref={containerRef} className="min-h-screen font-robotoMono relative overflow-hidden">

      {/* Interactive Background */}
      <HeroBackground />

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity, scale, y }}
          className="container mx-auto px-4"
        >
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-10">

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-5xl lg:text-8xl font-unbounded font-black mb-6 leading-[1.05] text-white tracking-[-0.04em]"
              >
                Learn. <br/> Connect.<br className="hidden md:block" />
                <span className="relative inline-block px-2">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400">
                    Earn On-Chain.
                  </span>
                  <div className="absolute -inset-x-4 -inset-y-2 bg-blue-500/5 blur-[40px] -z-10 rounded-full opacity-50" />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="text-sm md:text-base text-white/30 mb-10 max-w-xl mx-auto leading-relaxed font-medium"
              >
                Your hub for meaningful expert sessions and lectures. <br className="hidden sm:block" />
                Connect, learn, and grow with our community of experts and learners.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <MagneticButton
                href="https://modules.xcan.dev/"
                target="_blank"
                className="relative bg-white text-[#07090D] px-8 py-4 rounded-full font-black flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 text-sm tracking-widest group overflow-hidden"
              >
                <Zap className="w-5 h-5 fill-blue-600 text-blue-600 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">GET STARTED</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <div className="relative z-10">
        <StatisticsSection />
      </div>

      {/* Platform Capabilities Section */}
      <div className="relative z-10">
        <PlatformCapabilities />
      </div>

      {/* How It Works Section */}
      <div className="relative z-10">
        <HowItWorks />
      </div>

      {/* Learning Modules Section */}
      <div className="relative z-10">
        <LearningModules />
      </div>

      {/* On-Chain Credentials Section */}
      <div className="relative z-10">
        <OnChainCredentials />
      </div>

      {/* Community Section */}
      <div className="relative z-10">
        <Community />
      </div>

      {/* Final CTA Section */}
      <div className="relative z-10">
        <FinalCTA />
      </div>

      {/* Bottom Glow */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none z-0" />
    </main>
  );
}

