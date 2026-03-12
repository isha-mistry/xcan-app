"use client";

import React from "react";
import ConnectWalletWithENS from "@/components/ConnectWallet/ConnectWalletWithENS";
import { ShieldCheckIcon } from "lucide-react";

interface ConnectYourWalletProps {
  showBg?: boolean;
  closeModal?: () => void;
}

export default function ConnectYourWallet({
  showBg = true,
  closeModal
}: ConnectYourWalletProps) {
  const outerClasses = showBg
    ? "min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617]"
    : "w-full flex justify-center";

  return (
    <div className={outerClasses}>
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-white/5/5 bg-gradient-to-br from-white/5 via-white/2 to-white/5 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.9)] px-6 py-7 sm:px-8 sm:py-8">
        {!showBg && closeModal && (
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all duration-200"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-500 via-cyan-400 to-sky-500 shadow-[0_0_40px_rgba(56,189,248,0.45)] mb-4 sm:mb-5">
            <ShieldCheckIcon className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-unbounded tracking-tight text-white mb-2">
            Connect your wallet
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-robotoMono uppercase tracking-[0.2em]">
            Unlock Builder Pods profile & rewards
          </p>
        </div>

        <div className="space-y-5">
          {/* Wallet Connection */}
          <div className="flex justify-center">
            <ConnectWalletWithENS />
          </div>

          {/* Security Info */}
          <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-emerald-300/5 px-4 py-3">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 mt-0.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <div>
                <h4 className="font-semibold text-sm text-white">
                  Non‑custodial & secure
                </h4>
                <p className="text-xs text-white/60">
                  You stay in control of your keys. We only use your address to personalize your Builder Pods experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-center text-[10px] sm:text-xs text-white/40 font-robotoMono">
            By connecting, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}