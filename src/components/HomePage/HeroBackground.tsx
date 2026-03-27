"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Threads from "./Threads";

// ─── Mouse Glow ──────────────────────────────────────────────────────────────

const MouseGlow = () => {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed pointer-events-none z-[2]"
      style={{
        left: springX,
        top: springY,
        x: "-50%",
        y: "-50%",
        width: 600,
        height: 600,
        background:
          "radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0.02) 40%, transparent 70%)",
        borderRadius: "50%",
      }}
    />
  );
};

// ─── Main HeroBackground Component ──────────────────────────────────────────

const HeroBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#07090D]">

      {/* Interactive Threads background */}
      <div className="absolute inset-0 z-[1]" style={{ pointerEvents: "auto" }}>
        <Threads
          color={[0.231, 0.510, 0.965]}
          amplitude={2.5}
          distance={0.15}
          enableMouseInteraction
        />
      </div>

      {/* Subtle grid underlay */}
      <div
        className="absolute inset-0 z-[0] opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)",
        }}
      />

      {/* Mouse-following glow */}
      <MouseGlow />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 z-[5] opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top / Bottom edge vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07090D] via-transparent to-[#07090D] z-[6] opacity-80" />

      {/* Top center radial glow accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,rgba(59,130,246,0.08)_0%,transparent_60%)] z-[7]" />

      {/* Inner shadow vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.7)] z-[8]" />
    </div>
  );
};

export default HeroBackground;
