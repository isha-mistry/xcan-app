"use client";
/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Gamepad2,
  BookOpen,
  Trophy,
  Users,
  CalendarDays,
  Video,
  Shield,
  Sparkles,
  Award,
  HelpCircle,
  Link2,
  Lightbulb,
  ShieldCheck,
  FileText,
  ExternalLink,
} from "lucide-react";

function FAQRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Hide answer" : "Show answer"}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-3 text-left group"
      >
        <div className="text-white/85 text-sm md:text-base">{question}</div>
        <span className="ml-3 h-6 w-6 inline-flex items-center justify-center rounded-md border border-white/10 text-sm text-blue-100 group-hover:border-white/20 group-hover:bg-white/5 transition">
          {open ? "–" : "+"}
        </span>
      </button>
      {open && (
        <div className="mt-2 text-sm text-white/70">{answer}</div>
      )}
    </div>
  );
}

export default function DocPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const item = {
    hidden: { y: 16, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <div className="relative w-full px-6 md:px-10 lg:px-16 xl:px-24 py-10 md:py-14 text-dark-text-primary font-robotoMono">
      {/* Cyber grid background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_20%_20%,#63A7FA_0%,transparent_35%),radial-gradient(circle_at_80%_30%,#6ff2f2_0%,transparent_30%),radial-gradient(circle_at_30%_80%,#4185F3_0%,transparent_25%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent_0,transparent_calc(100%-1px),rgba(255,255,255,0.06)_calc(100%-1px)),linear-gradient(90deg,transparent_0,transparent_calc(100%-1px),rgba(255,255,255,0.06)_calc(100%-1px))] bg-[length:24px_24px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0A13]/60 backdrop-blur-sm p-6 md:p-10 mb-10"
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[conic-gradient(from_90deg,rgba(99,167,250,0.15),rgba(111,242,242,0.15),rgba(65,133,243,0.15))] blur-3xl" />
          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-white/50 bg-white/9">
              <FileText className="text-blue-500" size={20} />
            </div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 font-robotoMono">Xcan Guide</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-unbounded tracking-tighter bg-gradient-to-r from-blue-400 via-white to-blue-600 bg-clip-text text-transparent">
            Welcome to Xcan - Learn, Play, Earn
          </h1>
          <p className="mt-4 text-dark-text-secondary max-w-3xl font-medium leading-relaxed">
            Your hub for Arbitrum learning, expert sessions, and on-chain credentials. Explore our
            gamified tracks, unlock certifications, and level up your Web3 career.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="#get-started"
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-black bg-white hover:bg-white/90 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Sparkles size={14} /> Get Started
            </Link>
            <Link
              href="https://modules.xcan.dev/leaderboard"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest bg-white/5 text-white/60 border border-white/10 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
            >
              <Trophy size={14} /> Leaderboard
            </Link>
          </div>
        </motion.div>

        {/* Sticky in-page navigation */}
        <div className="sticky top-4 z-20 mb-4">
          <div className="overflow-x-auto no-scrollbar">
            <div className="inline-flex gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-3 backdrop-blur-3xl">
              {[
                { id: "get-started", label: "Start" },
                { id: "learn", label: "Learn" },
                { id: "sessions", label: "Sessions" },
                { id: "meetings", label: "Meetings" },
                { id: "certs", label: "Certificates" },
                { id: "attestations", label: "Attestations" },
                { id: "faq", label: "FAQ" },
                { id: "links", label: "Links" },
              ].map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:border-blue-500/50 hover:text-white transition-all duration-300 group/nav"
                >
                  <span className="h-1 w-1 rounded-full bg-blue-500 group-hover/nav:scale-150 transition-transform duration-300" />
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Triad */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12"
        >
          {[
            {
              icon: <BookOpen size={20} className="text-blue-200" />,
              title: "Learning Platform",
              desc:
                "Interactive paths, quizzes, and coding challenges with certification NFTs.",
            },
            {
              icon: <Users size={20} className="text-green-shade-100" />,
              title: "Expert Sessions & Lectures",
              desc: "1:1 mentorship and open Q&A to accelerate your growth.",
            },
            {
              icon: <Video size={20} className="text-blue-200" />,
              title: "Video Meetings",
              desc: "Polished meeting UX with on-chain attendance attestations.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={item}
              className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 overflow-hidden group hover:border-blue-500/30 transition-all duration-500 backdrop-blur-3xl"
            >
              <div className="absolute -inset-0.5 opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl bg-[radial-gradient(40%_40%_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />
              <div className="relative flex items-center gap-4">
                <div className="h-12 w-12 inline-flex items-center justify-center rounded-xl border border-white/5 bg-white/5 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:text-blue-300 transition-all duration-500">
                  {f.icon}
                </div>
                <h3 className="text-lg font-black font-unbounded tracking-tight">{f.title}</h3>
              </div>
              <p className="relative mt-4 text-white/40 text-sm font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Getting Started */}
        <motion.section
          id="get-started"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 scroll-mt-24"
        >
          <motion.h2 variants={item} className="text-2xl font-black font-unbounded tracking-tighter mb-6 flex items-center gap-3">
            <span className="h-8 w-1 bg-blue-500 rounded-full" />
            Getting Started
          </motion.h2>
          <motion.div
            variants={item}
            className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 overflow-hidden backdrop-blur-3xl"
          >
            <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(30,64,175,0.18)_0%,transparent_60%)]" />
            <div className="relative grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-black font-unbounded uppercase tracking-wider text-white/90 flex items-center gap-2">
                  <Shield size={16} className="text-blue-400" /> Connect Your Wallet
                </h3>
                <ol className="mt-4 list-decimal pl-6 text-white/40 space-y-2 text-[13px] font-medium leading-relaxed">
                  <li>Click <b className="text-white">Connect Wallet</b> in the top right.</li>
                  <li>Pick MetaMask / Coinbase / WalletConnect</li>
                  <li>Sign a message (no gas).</li>
                  <li>Your Web3 account is created automatically.</li>
                </ol>
                <div className="mt-3 text-white/70 italic">
                  💡 <b>Your wallet</b> is your identity on Xcan.
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black font-unbounded uppercase tracking-wider text-white/90 flex items-center gap-2">
                  <Users size={16} className="text-blue-400" /> Complete Your Profile
                </h3>
                <p className="mt-4 text-white/40 text-[13px] font-medium leading-relaxed">
                  Add a display name, image, and socials so others can connect with you.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Learning Platform */}
        <motion.section
          id="learn"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 scroll-mt-24"
        >
          <motion.h2 variants={item} className="text-2xl font-black font-unbounded tracking-tighter mb-6 flex items-center gap-3">
            <span className="h-8 w-1 bg-blue-500 rounded-full" />
            Learning Platform
          </motion.h2>
          <motion.p variants={item} className="text-white/40 font-medium leading-relaxed max-w-4xl">
            Choose from <b>9 learning paths</b> - from Web3 Basics to Advanced Arbitrum and
            Cross-Chain. Features: interactive stories, quizzes, hands-on coding challenges,
            certification NFTs.
          </motion.p>
          <motion.div
            variants={item}
            className="my-6 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 text-dark-text-secondary border-l-4 border-l-blue-500"
          >
            <b className="font-unbounded text-[10px] uppercase tracking-wider">Pricing:</b> All modules are <span className="text-blue-400 font-bold">$50</span> each
            except <b>Project Submission</b> (free).
          </motion.div>

          <motion.div variants={item} className="mt-8 mb-4 text-xs font-black font-unbounded uppercase tracking-[0.2em] text-white/30">
            Learning Paths & Modules
          </motion.div>
          <motion.div
            variants={item}
            className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {[
              { title: "Web3 Basics", reward: "Web3 Basics NFT", href: "https://modules.xcan.dev/learn-web3-basics", color: "text-blue-300" },
              { title: "Stylus Core Concepts", reward: "Stylus Core NFT", href: "https://modules.xcan.dev/learn-stylus", color: "text-pink-300" },
              { title: "Stylus Foundation", reward: "Stylus Foundation NFT", href: "https://www.speedrunstylus.com/foundation", color: "text-emerald-300" },
              { title: "Arbitrum Stylus (Advanced)", reward: "Advanced Stylus NFT", href: "https://www.speedrunstylus.com/", color: "text-cyan-300" },
              { title: "DeFi on Arbitrum", reward: "DeFi Master NFT", href: "https://modules.xcan.dev/learn-defi", color: "text-indigo-300" },
              { title: "Cross-Chain Development", reward: "Cross-Chain Expert NFT", href: "https://modules.xcan.dev/learn-cross-chain", color: "text-amber-300" },
              { title: "Arbitrum Orbit", reward: "Orbit Builder NFT", href: "https://modules.xcan.dev/learn-orbit", color: "text-violet-300" },
              { title: "Precompile Playground", reward: "Precompile Playground NFT", href: "https://modules.xcan.dev/challenges", color: "text-teal-300" },
              { title: "Project Submission (Free)", reward: "Showcase & Feedback", href: "https://modules.xcan.dev/project-submission", color: "text-orange-300" },
            ].map((mod, i) => (
              mod.href ? (
                <a
                  key={i}
                  href={mod.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-blue-500/30 transition-all duration-300 block backdrop-blur-3xl group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black font-unbounded text-sm tracking-tight text-white/90 group-hover:text-blue-400 transition-colors uppercase">{mod.title}</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 text-white/20">Earn: {mod.reward}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink size={16} className={`${mod.color} group-hover:text-white`} />
                      <Award size={18} className="text-blue-200" />
                    </div>
                  </div>
                </a>
              ) : (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-3xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black font-unbounded text-sm tracking-tight text-white/90 group-hover:text-blue-400 transition-colors uppercase">{mod.title}</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 text-white/20">Earn: {mod.reward}</div>
                    </div>
                    <Award size={18} className="text-blue-200" />
                  </div>
                </div>
              )
            ))}
          </motion.div>

          <motion.div variants={item} className="mt-6">
            <h4 className="text-xs font-black font-unbounded uppercase tracking-wider text-white/80">How Modules Work</h4>
            <ul className="list-disc pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
              <li>Story + Quiz: Pass with 80% to proceed.</li>
              <li>Coding Challenges: Code in browser, test, auto-save.</li>
              <li>Certification unlocks when all chapters complete.</li>
            </ul>
          </motion.div>

          <motion.div variants={item} className="mt-6">
            <h4 className="text-xs font-black font-unbounded uppercase tracking-wider text-white/80">Leaderboard</h4>
            <p className="text-white/40 text-[13px] font-medium leading-relaxed mt-2">Rank up by completing challenges, modules, and NFTs.</p>
          </motion.div>
        </motion.section>

        {/* Expert Sessions & Lectures */}
        <motion.section
          id="sessions"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 scroll-mt-24"
        >
          <motion.h2 variants={item} className="text-2xl font-black font-unbounded tracking-tighter mb-6 flex items-center gap-3 text-white">
            <span className="h-8 w-1 bg-blue-500 rounded-full" />
            Expert Sessions & Lectures
          </motion.h2>
          <motion.p variants={item} className="text-white/40 font-medium leading-relaxed max-w-4xl">
            Connect with blockchain experts for guidance via bookable sessions or drop-in lectures.
          </motion.p>

          <motion.div variants={item} className="mt-4 grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Expert Sessions",
                desc: "One-time, scheduled meetings: project advice, code review, more.",
              },
              {
                title: "Lectures",
                desc: "Recurring, open-door Q&A - mentorship with the community.",
              },
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-3xl group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-black font-unbounded text-sm uppercase tracking-tight text-white/90 mb-1 group-hover:text-blue-400 transition-colors uppercase">{c.title}</div>
                    <p className="text-white/40 text-[13px] font-medium leading-relaxed">{c.desc}</p>
                  </div>
                  <div className="h-10 w-10 flex-shrink-0 inline-flex items-center justify-center rounded-lg border border-white/5 bg-white/5 text-blue-400">
                    <Video size={18} />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={item} className="mt-4">
            <h4 className="text-xs font-black font-unbounded uppercase tracking-wider text-white/80">How to book</h4>
            <ul className="list-disc pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
              <li>Browse sessions, choose an expert, book, get reminders.</li>
              <li>Cancel early if needed to free the slot for others.</li>
            </ul>
          </motion.div>
        </motion.section>

        {/* Meetings */}
        <motion.section
          id="meetings"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 scroll-mt-24"
        >
          <motion.h2 variants={item} className="text-2xl font-black font-unbounded tracking-tighter mb-6 flex items-center gap-3 text-white">
            <span className="h-8 w-1 bg-blue-500 rounded-full" />
            Video Meetings
          </motion.h2>
          <motion.p variants={item} className="text-white/40 font-medium leading-relaxed max-w-4xl">
            Meetings have unique links, a lobby device check, grid view, screen sharing, chat, and
            blockchain-based attendance attestations.
          </motion.p>

          <motion.div variants={item} className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl">
              <div className="text-xs font-black font-unbounded uppercase tracking-wider text-white/90 mb-4 flex items-center gap-2">
                <span className="h-4 w-1 bg-blue-500/50 rounded-full" />
                Joining
              </div>
              <ol className="mt-4 list-decimal pl-6 text-white/40 space-y-2 text-[13px] font-medium leading-relaxed">
                <li>Click meeting link</li>
                <li>Lobby to test camera / mic</li>
                <li>Set display name</li>
                <li>Join when ready</li>
              </ol>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl">
              <div className="text-xs font-black font-unbounded uppercase tracking-wider text-white/90 mb-4 flex items-center gap-2">
                <span className="h-4 w-1 bg-blue-500/50 rounded-full" />
                Features
              </div>
              <ul className="mt-4 list-disc pl-6 text-white/40 space-y-2 text-[13px] font-medium leading-relaxed">
                <li>Grid/carousel video, control bar, chat & participants sidebar.</li>
                <li>
                  <b className="text-blue-400">Attendance attestations auto-issued if you attend ≥50%.</b>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div variants={item} className="mt-4">
            <div className="font-semibold text-white/90">Etiquette</div>
            <ul className="mt-2 list-disc pl-6 text-white/75 space-y-1">
              <li>Join on time and lobby-check devices.</li>
              <li>Mute when not speaking; raise hand to interrupt.</li>
              <li>Keep video on, use headphones, no disruptive behavior.</li>
            </ul>
          </motion.div>
        </motion.section>

        {/* NFT Certifications */}
        <motion.section
          id="certs"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 scroll-mt-24"
        >
          <motion.h2 variants={item} className="text-2xl font-black font-unbounded tracking-tighter mb-6 flex items-center gap-3 text-white">
            <span className="h-8 w-1 bg-blue-500 rounded-full" />
            NFT Certifications
          </motion.h2>
          <motion.div variants={item} className="text-white/40 font-medium leading-relaxed max-w-4xl mb-6">
            Complete a module, earn a unique NFT certificate on Arbitrum Sepolia.
          </motion.div>

          <motion.div variants={item} className="mt-4 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl group hover:border-blue-500/30 transition-all duration-300">
              <div className="text-xs font-black font-unbounded uppercase tracking-wider text-white group-hover:text-blue-400 transition-colors flex items-center gap-2 mb-4">
                <Award size={14} /> What are they?
              </div>
              <ul className="list-disc pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
                <li>Permanent on-chain proof - verifiable and collectible</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl group hover:border-blue-500/30 transition-all duration-300">
              <div className="text-xs font-black font-unbounded uppercase tracking-wider text-white group-hover:text-blue-400 transition-colors flex items-center gap-2 mb-4">
                <Trophy size={14} /> Available Certifications
              </div>
              <ol className="list-decimal pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
                <li>First Blood - SpeedrunStylus</li>
                <li>Web3 Basics</li>
                <li>Stylus Foundation</li>
                <li>Stylus Core</li>
                <li>DeFi Master</li>
                <li>Cross-Chain Expert</li>
                <li>Orbit Builder</li>
                <li>Xcan Advocate</li>
              </ol>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl group hover:border-blue-500/30 transition-all duration-300">
              <div className="text-xs font-black font-unbounded uppercase tracking-wider text-white group-hover:text-blue-400 transition-colors flex items-center gap-2 mb-4">
                <Link2 size={14} /> How to Earn & Mint
              </div>
              <ul className="list-disc pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
                <li>Complete chapters, pass quizzes, mint from dashboard.</li>
                <li>Download a printable certificate for LinkedIn.</li>
              </ul>
              <div className="mt-4 text-[12px] text-white/30 italic">
                Session Reward NFTs: watch recorded expert sessions and mint free collectibles.
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Attestations */}
        <motion.section
          id="attestations"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 scroll-mt-24"
        >
          <motion.h2 variants={item} className="text-2xl font-black font-unbounded tracking-tighter mb-6 flex items-center gap-3 text-white">
            <span className="h-8 w-1 bg-blue-500 rounded-full" />
            Attestations
          </motion.h2>
          <motion.p variants={item} className="text-white/40 font-medium leading-relaxed max-w-4xl">
            Cryptographic proof of attendance via EAS on Arbitrum Sepolia.
          </motion.p>
          <motion.ul variants={item} className="list-disc pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
            <li>Permanent, verifiable, privacy-respecting</li>
            <li>Issued automatically for meetings (≥50% attendance)</li>
            <li>Public on-chain and shareable anywhere</li>
          </motion.ul>
        </motion.section>

        {/* Profile & Leaderboard */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12"
        >
          <motion.h2 variants={item} className="text-2xl font-black font-unbounded tracking-tighter mb-6 flex items-center gap-3 text-white">
            <span className="h-8 w-1 bg-blue-500 rounded-full" />
            Your Profile & Leaderboard
          </motion.h2>
          <motion.ul variants={item} className="list-disc pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
            <li>Overview: Personal info, stats, rank</li>
            <li>Challenges: Completed, difficulty, points, dates</li>
            <li>Modules: Progress, completion %</li>
            <li>NFTs: Certification gallery with links</li>
          </motion.ul>
        </motion.section>

        {/* Best Practices */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12"
        >
          <motion.h2 variants={item} className="text-2xl font-black font-unbounded tracking-tighter mb-6 flex items-center gap-3 text-white">
            <span className="h-8 w-1 bg-blue-500 rounded-full" />
            Best Practices
          </motion.h2>
          <motion.div variants={item} className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl group hover:border-blue-500/30 transition-all duration-300">
              <div className="text-xs font-black font-unbounded uppercase tracking-wider text-white group-hover:text-blue-400 transition-colors flex items-center gap-2 mb-4">
                <Lightbulb size={14} /> Learning Tips
              </div>
              <ul className="list-disc pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
                <li>Start with Web3 Basics; chapters build on each other.</li>
                <li>Use Precompile Playground to reinforce learning.</li>
                <li>Set a cadence - one chapter per session.</li>
                <li>Ask in lectures or expert sessions when stuck.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl group hover:border-blue-500/30 transition-all duration-300">
              <div className="text-xs font-black font-unbounded uppercase tracking-wider text-white group-hover:text-blue-400 transition-colors flex items-center gap-2 mb-4">
                <ShieldCheck size={14} /> Security & Privacy
              </div>
              <ul className="list-disc pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
                <li>Never share private keys/seed phrases.</li>
                <li>Only connect on official Xcan domains.</li>
                <li>Use separate wallets for funds and learning.</li>
              </ul>
            </div>
          </motion.div>
        </motion.section>

        {/* FAQ - collapsible items */}
        <motion.section
          id="faq"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 scroll-mt-24"
        >
          <motion.h2 variants={item} className="text-2xl font-black font-unbounded tracking-tighter mb-6 flex items-center gap-3 text-white">
            <span className="h-8 w-1 bg-blue-500 rounded-full" />
            FAQs
          </motion.h2>
          <motion.div variants={item} className="grid md:grid-cols-2 gap-4">
            {[{
              title: "Getting Started",
              icon: <Users size={18} className="text-blue-200" />,
              qa: [
                { q: "Do I need ETH to begin?", a: "Only for minting and advanced challenges; normal use is free." },
                { q: "Which network is used?", a: "Arbitrum Sepolia (testnet) for credentials and attestations." },
              ],
            }, {
              title: "Learning Platform",
              icon: <BookOpen size={18} className="text-blue-200" />,
              qa: [
                { q: "Is coding required?", a: "Not for basics. Quizzes are retakeable with 80% to pass." },
                { q: "How much do modules cost?", a: "Modules are $50 each. Project Submission is free." },
                { q: "What if I am stuck?", a: "Use hints, revisit theory, join lectures, or ask in expert sessions." },
              ],
            }, {
              title: "Sessions & Meetings",
              icon: <CalendarDays size={18} className="text-green-shade-100" />,
              qa: [
                { q: "What’s the difference?", a: "Sessions are scheduled 1:1; lectures are recurring open Q&A." },
                { q: "Can I host?", a: "Yes. Complete your profile and publish your slot." },
                { q: "Cancellation policy?", a: "Cancel early so others can take the slot." },
              ],
            }, {
              title: "NFTs & Certificates",
              icon: <Award size={18} className="text-blue-200" />,
              qa: [
                { q: "Cost to earn?", a: "Earning is free; minting costs testnet gas." },
                { q: "Are they recognized?", a: "Yes, many Web3 employers value on-chain credentials." },
                { q: "Where can I verify?", a: "All NFTs and attestations are public and verifiable (EAS UID)." },
              ],
            }].map((block, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl group hover:border-blue-500/30 transition-all duration-300">
                <div className="text-xs font-black font-unbounded uppercase tracking-wider text-white group-hover:text-blue-400 transition-colors flex items-center gap-2 mb-4">
                  {block.icon} {block.title}
                </div>
                <div className="mt-3 space-y-2">
                  {block.qa.map((pair, idx) => (
                    <FAQRow key={idx} question={pair.q} answer={pair.a} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Quick Links & Support */}
        <motion.section
          id="links"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-2 scroll-mt-24"
        >
          <motion.h2 variants={item} className="text-2xl font-black font-unbounded tracking-tighter mb-6 flex items-center gap-3 text-white">
            <span className="h-8 w-1 bg-blue-500 rounded-full" />
            Quick Links & Support
          </motion.h2>
          <motion.div variants={item} className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-black font-unbounded uppercase tracking-wider text-white/90 mb-4 flex items-center gap-2">
                  <span className="h-4 w-1 bg-blue-500/50 rounded-full" />
                  Platforms
                </div>
                <ul className="list-disc pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
                  <li>
                    Learning Platform: <Link href="https://modules.xcan.dev/" className="underline decoration-blue-500/40 underline-offset-4" target="_blank">modules.xcan.dev</Link>
                  </li>
                  <li>
                    Expert Sessions: <Link href="https://www.xcan.dev/sessions?active=availableExperts/" className="underline decoration-blue-500/40 underline-offset-4" target="_blank">www.xcan.dev/sessions</Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-black font-unbounded uppercase tracking-wider text-white/90 mb-4 flex items-center gap-2">
                  <span className="h-4 w-1 bg-blue-500/50 rounded-full" />
                  Other Links
                </div>
                <ul className="list-disc pl-6 text-white/40 mt-3 space-y-2 text-[13px] font-medium leading-relaxed">
                  <li>
                    Your Profile: <Link href="https://modules.xcan.dev/profile" className="underline decoration-blue-500/40 underline-offset-4" target="_blank">modules.xcan.dev/profile</Link>
                  </li>
                  <li>
                    Leaderboard: <Link href="https://modules.xcan.dev/leaderboard" className="underline decoration-blue-500/40 underline-offset-4" target="_blank">modules.xcan.dev/leaderboard</Link>
                  </li>
                  <li>
                    NFT Certifications: <Link href="https://modules.xcan.dev/nft" className="underline decoration-blue-500/40 underline-offset-4" target="_blank">modules.xcan.dev/nft</Link>
                  </li>
                  <li>
                    Twitter/X: <Link href="https://x.com/xcan_arbitrum" className="underline decoration-blue-500/40 underline-offset-4" target="_blank">x.com/xcan_arbitrum</Link>
                  </li>
                  <li>
                    Youtube: <Link href="https://youtube.com/@xcan_arbitrum" className="underline decoration-blue-500/40 underline-offset-4" target="_blank">youtube.com/@xcan_arbitrum</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 text-white/75 italic text-center">
              Happy learning and collaborating with Xcan!
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
