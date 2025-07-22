"use client";

import React, { useState, useEffect } from "react";
import { usePrivy, useWallets, getAccessToken } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { Bars } from "react-loader-spinner";
import { FaGithub, FaWallet } from "react-icons/fa";
import { BASE_URL } from "@/config/constants";

interface ConnectYourWalletProps {
  requireGitHub?: boolean;
  showBg?: boolean;
  closeModal?: () => void;
}

export default function ConnectYourWallet({ requireGitHub = true, showBg = true, closeModal }: ConnectYourWalletProps) {
  const { login, authenticated, user, linkGithub, connectWallet } = usePrivy();
  const { wallets } = useWallets();
  const { address, isConnected } = useAccount();
  const [isLinkingGitHub, setIsLinkingGitHub] = useState(false);
  const [authStep, setAuthStep] = useState<'wallet' | 'github' | 'complete'>('wallet');

  // Check authentication status
  const hasValidWallet = () => {
    const verifiedWallets = user?.linkedAccounts
      ?.filter((account) => account.type === "wallet")
      ?.map((account) => account.address) || [];

    const activeWallet = wallets.find(
      (wallet) => wallet.address && verifiedWallets.includes(wallet.address)
    );

    return Boolean(activeWallet && isConnected && address);
  };

  const hasGitHubAuth = () => {
    return Boolean(user?.linkedAccounts?.find((account) => account.type === "github_oauth"));
  };

  // Update auth step based on current status
  useEffect(() => {
    if (!authenticated) {
      setAuthStep('wallet');
    } else if (!hasValidWallet()) {
      setAuthStep('wallet');
    } else if (requireGitHub && !hasGitHubAuth()) {
      setAuthStep('github');
    } else {
      setAuthStep('complete');
    }
  }, [authenticated, user, wallets, address, isConnected, requireGitHub]);

  const handleWalletConnect = async () => {
    if (!authenticated) {
      await login();
    } else {
      await connectWallet();
    }
  };

  const handleGitHubLink = async () => {
    setIsLinkingGitHub(true);
    try {
      linkGithub();

      // After successful GitHub linking, save to database
      if (address && user) {
        const githubAccount = user.linkedAccounts.find(account => account.type === "github_oauth");
        if (githubAccount) {
          const token = await getAccessToken();

          await fetch(`${BASE_URL}/api/auth/link-github`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-wallet-address": address,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              githubId: githubAccount.subject,
              githubUsername: githubAccount.username || githubAccount.name,
            }),
          });
        }
      }
    } catch (error) {
      console.error("Error linking GitHub:", error);
    } finally {
      setIsLinkingGitHub(false);
    }
  };

  if (authStep === 'complete') {
    return (
      <div className="flex h-screen justify-center items-center bg-gradient-to-br from-[#0a0a23] to-[#1a1a40]">
        <Bars height="150" width="150" color="#6366f1" ariaLabel="bars-loading" visible={true} />
      </div>
    );
  }

  return (
    <div className={` min-h-screen flex items-center justify-center p-4 ${showBg ? 'bg-gradient-to-br from-[#0a0a23] to-[#1a1a40]' : ''}`}>
      <div className="relative bg-[#181826] rounded-2xl shadow-2xl p-8 max-w-md w-full border border-[#23234a]">
        {!showBg && <button onClick={closeModal} className="absolute top-2 right-2 text-white bg-dark-tertiary rounded-full p-2 hover:bg-dark-accent focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <span className="sr-only">Close</span>
          ×
        </button>}
        <div className="text-center mb-8 ">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to InOrbit</h1>
          <p className="text-[#b3b3cc]">
            {requireGitHub
              ? "Connect your wallet and link your GitHub account to continue"
              : "Connect your wallet to get started"
            }
          </p>
        </div>

        {/* Wallet Connection Step */}
        <div className={`mb-6 p-4 rounded-lg border-2 transition-colors duration-200 ${authStep === 'wallet' ? 'border-indigo-500 bg-[#23234a]' :
          hasValidWallet() ? 'border-green-500 bg-[#1e2d24]' : 'border-[#23234a] bg-[#181826]'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaWallet className={`mr-3 text-2xl ${hasValidWallet() ? 'text-green-400' : 'text-indigo-400'}`} />
              <div>
                <h3 className="font-semibold text-white">Wallet Connection</h3>
                <p className="text-sm text-[#b3b3cc]">
                  {hasValidWallet() ? 'Connected successfully' : 'Connect your crypto wallet'}
                </p>
              </div>
            </div>
            {!hasValidWallet() ? (
              <button
                onClick={handleWalletConnect}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-colors"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="text-green-400 text-2xl font-bold">✓</div>
            )}
          </div>
        </div>

        {/* GitHub Connection Step */}
        {requireGitHub && (
          <div className={`mb-6 p-4 rounded-lg border-2 transition-colors duration-200 ${authStep === 'github' ? 'border-indigo-500 bg-[#23234a]' :
            hasGitHubAuth() ? 'border-green-500 bg-[#1e2d24]' : 'border-[#23234a] bg-[#181826]'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaGithub className={`mr-3 text-2xl ${hasGitHubAuth() ? 'text-green-400' : 'text-indigo-400'}`} />
                <div>
                  <h3 className="font-semibold text-white">GitHub Account</h3>
                  <p className="text-sm text-[#b3b3cc]">
                    {hasGitHubAuth() ? 'Linked successfully' : 'Link your GitHub account'}
                  </p>
                </div>
              </div>
              {!hasGitHubAuth() && hasValidWallet() ? (
                <button
                  onClick={handleGitHubLink}
                  disabled={isLinkingGitHub}
                  className="bg-[#23234a] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-colors disabled:opacity-50 border border-indigo-500"
                >
                  {isLinkingGitHub ? 'Linking...' : 'Link GitHub'}
                </button>
              ) : hasGitHubAuth() ? (
                <div className="text-green-400 text-2xl font-bold">✓</div>
              ) : (
                <div className="text-[#666688] text-sm">Complete wallet first</div>
              )}
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-8">
          <div className="flex justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${hasValidWallet() ? 'bg-green-400' : 'bg-[#39396a]'}`} />
            {requireGitHub && (
              <div className={`w-3 h-3 rounded-full ${hasGitHubAuth() ? 'bg-green-400' : 'bg-[#39396a]'}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
