import React from "react";
import { IoClose } from "react-icons/io5";
import Image from "next/image";
import logo from "@/assets/images/daos/CCLogo2.png";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { Wallet } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";

interface ConnectWalletHomePageProps {
  onClose: () => void;
}

function ConnectWalletHomePage({ onClose }: ConnectWalletHomePageProps) {
  const { authenticated, login, user, connectWallet } = usePrivy();
  const handleLogin = async () => {
    if (!authenticated) {
      try {
        await login();
      } catch (error) { }
    } else {
      if (!user?.google && !user?.farcaster) {
        try {
          await connectWallet();
        } catch (error) { }
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
      {/* Animated Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#07090D]/80 border border-white/10 rounded-[48px] p-12 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden backdrop-blur-3xl"
      >
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group z-20"
        >
          <IoClose className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-10 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl"
          >
            <Image src={logo} alt="Chora Club Logo" width={120} height={120} className="filter brightness-110" />
          </motion.div>

          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-white mb-6 tracking-tighter"
          >
            Welcome to the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">On-Chain Hub</span>
          </motion.h2>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/40 mb-12 text-lg font-medium leading-relaxed"
          >
            Connect your wallet to earn verifiable credentials, join live sessions, and track your growth on Arbitrum.
          </motion.p>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full"
          >
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-4 bg-white text-[#07090D] px-10 py-6 rounded-3xl font-black text-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              <Wallet className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="tracking-widest">CONNECT WALLET</span>
            </button>

            <p className="mt-8 text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">
              Safe & Secure • Web3 Ready
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default ConnectWalletHomePage;
