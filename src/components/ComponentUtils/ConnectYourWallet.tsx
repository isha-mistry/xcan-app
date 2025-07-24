"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

export default function ConnectYourWallet({ showBg = true, closeModal }: { showBg?: boolean; closeModal?: () => void }) {
  const { login, authenticated } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubConnect = async () => {
    setIsLoading(true);
    try {
      await login();
    } finally {
      setIsLoading(false);
    }
  };

  if (authenticated) {
    if (closeModal) closeModal();
    return null;
  }

  return (
    <div className={`flex flex-col items-center justify-center ${showBg ? "bg-white/80 p-8 rounded-xl shadow-lg" : ""}`}>
      <button
        onClick={handleGitHubConnect}
        className="px-6 py-3 bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-900 transition"
        disabled={isLoading}
      >
        {isLoading ? "Connecting..." : "Connect via GitHub"}
      </button>
    </div>
  );
}
