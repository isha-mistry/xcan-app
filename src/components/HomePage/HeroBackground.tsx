"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HexNode {
  x: number;
  y: number;
  col: number;
  row: number;
  activation: number; // 0 = dormant, 1 = fully lit
  targetActivation: number;
  lastActivated: number;
  connections: number[]; // indices of connected nodes
  pulsePhase: number;
}

// ─── Knowledge Network Canvas ────────────────────────────────────────────────
// Hexagonal knowledge-node grid with cascading activations.

const KnowledgeNetworkCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<HexNode[]>([]);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  // ── Build hex grid ──
  const initNetwork = useCallback((w: number, h: number) => {
    const hexRadius = 55; // distance between centers
    const nodes: HexNode[] = [];
    const cols = Math.ceil(w / (hexRadius * 1.8)) + 2;
    const rows = Math.ceil(h / (hexRadius * 1.6)) + 2;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const offsetX = row % 2 === 0 ? 0 : hexRadius * 0.9;
        const x = col * hexRadius * 1.8 + offsetX;
        const y = row * hexRadius * 1.55;
        nodes.push({
          x, y, col, row,
          activation: 0,
          targetActivation: 0,
          lastActivated: -9999,
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Build connections (neighbours within range)
    const connDist = hexRadius * 2.1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < connDist) {
          nodes[i].connections.push(j);
          nodes[j].connections.push(i);
        }
      }
    }

    nodesRef.current = nodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      dimensionsRef.current = { w: rect.width, h: rect.height };
      initNetwork(rect.width, rect.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;
    const mouseInfluence = 180;

    // ── Draw hexagon path ──
    const hexPath = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (Math.PI / 3) * a - Math.PI / 6;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const draw = () => {
      const { w, h } = dimensionsRef.current;
      ctx.clearRect(0, 0, w, h);
      time += 1;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const nodes = nodesRef.current;

      // ── Periodic random activations (knowledge pulses) ──
      if (time % 90 === 0) {
        const idx = Math.floor(Math.random() * nodes.length);
        nodes[idx].targetActivation = 1;
        nodes[idx].lastActivated = time;
      }

      // ── Update nodes ──
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // 1. Calculate instant mouse activation (stateless)
        const dmx = n.x - mx;
        const dmy = n.y - my;
        const distMouse = Math.sqrt(dmx * dmx + dmy * dmy);
        const mouseActivation = distMouse < mouseInfluence ? (1 - distMouse / mouseInfluence) : 0;

        // 2. Cascade: if activated by a pulser, wake neighbours
        if (n.activation > 0.5 && time - n.lastActivated < 15) {
          for (const ni of n.connections) {
            const neighbour = nodes[ni];
            const cascade = n.activation * 0.5;
            if (neighbour.targetActivation < cascade) {
              neighbour.targetActivation = cascade;
              neighbour.lastActivated = time + 3;
            }
          }
        }

        // 3. Update persistent state (for ripples/pulses)
        n.activation += (n.targetActivation - n.activation) * 0.15;
        n.targetActivation *= 0.85; // Faster decay

        // 4. Combine for display
        const displayActivation = Math.max(n.activation, mouseActivation);

        if (n.activation < 0.01) n.activation = 0;

        // ── Draw connections ──
        for (const ni of n.connections) {
          if (ni <= i) continue;
          const m = nodes[ni];
          const mDmx = m.x - mx;
          const mDmy = m.y - my;
          const mDistMouse = Math.sqrt(mDmx * mDmx + mDmy * mDmy);
          const mMouseActivation = mDistMouse < mouseInfluence ? (1 - mDistMouse / mouseInfluence) : 0;

          const lineAlpha = Math.max(displayActivation, mMouseActivation);

          if (lineAlpha > 0.02) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(96, 165, 250, ${lineAlpha * 0.22})`;
            ctx.lineWidth = 0.5 + lineAlpha * 0.8;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(148, 163, 184, 0.025)`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        }

        // ── Draw hex node ──
        const restPulse = 0.3 + 0.15 * Math.sin(time * 0.012 + n.pulsePhase);
        const baseSize = 4;
        const activeSize = baseSize + displayActivation * 6;

        // Outer glow
        if (displayActivation > 0.1) {
          hexPath(n.x, n.y, activeSize * 2.2);
          ctx.fillStyle = `rgba(96, 165, 250, ${displayActivation * 0.08})`;
          ctx.fill();
        }

        // Hex shape
        hexPath(n.x, n.y, activeSize);

        if (displayActivation > 0.05) {
          ctx.fillStyle = `rgba(96, 165, 250, ${displayActivation * 0.6})`;
          ctx.strokeStyle = `rgba(96, 165, 250, ${displayActivation * 0.4})`;
          ctx.lineWidth = 0.8;
          ctx.fill();
          ctx.stroke();
        } else {
          // Dormant subtle dot
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(148, 163, 184, ${restPulse * 0.15})`;
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [initNetwork]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "auto" }}
    />
  );
};

// ─── Floating Orbs (Framer Motion) ───────────────────────────────────────────

const FloatingOrb = ({
  color,
  size,
  initialX,
  initialY,
  duration,
  delay,
}: {
  color: string;
  size: number;
  initialX: string;
  initialY: string;
  duration: number;
  delay: number;
}) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: initialX,
        top: initialY,
        background: color,
        filter: `blur(${size * 0.6}px)`,
      }}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -40, 20, -10, 0],
        scale: [1, 1.15, 0.9, 1.05, 1],
        opacity: [0.3, 0.5, 0.25, 0.45, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

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

      {/* Interactive knowledge network canvas */}
      <div className="absolute inset-0 z-[1]">
        <KnowledgeNetworkCanvas />
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
