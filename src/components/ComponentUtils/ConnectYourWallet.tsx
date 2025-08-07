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
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${showBg ? 'bg-gradient-to-br from-[#0a0a23] to-[#1a1a40]' : ''
      }`}>
      <div className="relative bg-gradient-to-br from-[#181826] to-[#19192a] rounded-3xl shadow-2xl p-8 max-w-md w-full border border-[#23234a] backdrop-blur-sm">
        {!showBg && closeModal && (
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white bg-dark-tertiary rounded-full p-2 hover:bg-dark-accent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mb-6">
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Welcome to Xcan
          </h1>
          <p className="text-[#b3b3cc] text-lg leading-relaxed">
            Connect your wallet to access exclusive expert sessions and lectures
          </p>
        </div>

        <div className="space-y-6">
          {/* Wallet Connection */}
          <div className="flex justify-center">
            <ConnectWalletWithENS />
          </div>

          {/* Security Info */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 rounded-xl border border-green-500/30">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <div>
                <h4 className="font-semibold text-white text-sm">Secure Connection</h4>
                <p className="text-xs text-[#b3b3cc]">Your wallet connection is encrypted and secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#23234a]">
          <p className="text-center text-xs text-[#666688]">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}