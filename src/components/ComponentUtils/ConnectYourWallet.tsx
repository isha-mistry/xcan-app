"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Bars } from "react-loader-spinner";
import { FaGithub, FaWallet } from "react-icons/fa";
import { BASE_URL } from "@/config/constants";
import { usePrivy, useWallets } from "@privy-io/react-auth";

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
  const [githubLinked, setGithubLinked] = useState(false);

  useEffect(() => {
    const checkGithubStatus = async () => {
      if (address) {
        try {
          const response = await fetch(`${BASE_URL}/api/auth/github-status?address=${address}`);
          const data = await response.json();
          console.log("github data", data);
          setGithubLinked(data.isLinked);
        } catch (error) {
          console.error("Error checking GitHub status:", error);
        }
      }
    };

    checkGithubStatus();
  }, [address]);

  useEffect(() => {
    if (!isConnected) {
      setAuthStep('wallet');
    } else if (requireGitHub && !githubLinked) {
      setAuthStep('github');
    } else {
      setAuthStep('complete');
    }
  }, [isConnected, githubLinked, requireGitHub]);

  const handleWalletConnect = async () => {
    if (!authenticated) {
      await login();
    } else {
      await connectWallet();
    }
  };

  const handleGitHubLink = () => {
    setIsLinkingGitHub(true);
    const clientId = process.env.NEXT_PUBLIC_GITHUB_ID;
    const redirectUri = `${BASE_URL}/api/auth/github-callback`;
    const scope = 'read:user user:email';
    
    const state = address; // Using wallet address as state
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    
    window.location.href = authUrl;
  };

  if (authStep === 'complete') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${showBg ? 'bg-gradient-to-br from-[#0a0a23] to-[#1a1a40]' : ''}`}>
        <div className="relative bg-[#181826] rounded-2xl shadow-2xl p-8 max-w-md w-full border border-[#23234a]">
          {closeModal && (
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          )}
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <div className="text-white text-2xl font-bold">✓</div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">You're All Set!</h1>
            <p className="text-[#b3b3cc]">
              Your wallet and GitHub account are successfully connected
            </p>
          </div>

          {/* Wallet Status */}
          <div className="mb-4 p-4 rounded-lg border-2 border-green-500 bg-[#1e2d24]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaWallet className="mr-3 text-2xl text-green-400" />
                <div>
                  <h3 className="font-semibold text-white">Wallet Connected</h3>
                  <p className="text-sm text-green-300">Successfully linked to your account</p>
                </div>
              </div>
              <div className="text-green-400 text-2xl font-bold">✓</div>
            </div>
          </div>

          {/* GitHub Status */}
          {requireGitHub && (
            <div className="mb-6 p-4 rounded-lg border-2 border-green-500 bg-[#1e2d24]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaGithub className="mr-3 text-2xl text-green-400" />
                  <div>
                    <h3 className="font-semibold text-white">GitHub Linked</h3>
                    <p className="text-sm text-green-300">Account successfully connected</p>
                  </div>
                </div>
                <div className="text-green-400 text-2xl font-bold">✓</div>
              </div>
            </div>
          )}

          {/* Progress Indicators */}
          <div className="mt-6 mb-6">
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              {requireGitHub && (
                <div className="w-3 h-3 rounded-full bg-green-400" />
              )}
            </div>
          </div>

          {/* Close Button */}
          {closeModal && (
            <div className="text-center">
              <button
                onClick={closeModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition-colors w-full"
              >
                Continue to InOrbit
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${showBg ? 'bg-gradient-to-br from-[#0a0a23] to-[#1a1a40]' : ''}`}>
      <div className="relative bg-[#181826] rounded-2xl shadow-2xl p-8 max-w-md w-full border border-[#23234a]">
        {!showBg && closeModal && (
          <button 
            onClick={closeModal} 
            className="absolute top-2 right-2 text-white bg-dark-tertiary rounded-full p-2 hover:bg-dark-accent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        )}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to InOrbit</h1>
          <p className="text-[#b3b3cc]">
            {requireGitHub
              ? "Connect your wallet and link your GitHub account to continue"
              : "Connect your wallet to get started"
            }
          </p>
        </div>

        <div className={`mb-6 p-4 rounded-lg border-2 transition-colors duration-200 ${
          authStep === 'wallet' ? 'border-indigo-500 bg-[#23234a]' :
          isConnected ? 'border-green-500 bg-[#1e2d24]' : 'border-[#23234a] bg-[#181826]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaWallet className={`mr-3 text-2xl ${isConnected ? 'text-green-400' : 'text-indigo-400'}`} />
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

        {requireGitHub && (
          <div className={`mb-6 p-4 rounded-lg border-2 transition-colors duration-200 ${
            authStep === 'github' ? 'border-indigo-500 bg-[#23234a]' :
            githubLinked ? 'border-green-500 bg-[#1e2d24]' : 'border-[#23234a] bg-[#181826]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaGithub className={`mr-3 text-2xl ${githubLinked ? 'text-green-400' : 'text-indigo-400'}`} />
                <div>
                  <h3 className="font-semibold text-white">GitHub Account</h3>
                  <p className="text-sm text-[#b3b3cc]">
                    {githubLinked ? 'Linked successfully' : 'Link your GitHub account'}
                  </p>
                </div>
              </div>
              {!githubLinked && isConnected ? (
                <button
                  onClick={handleGitHubLink}
                  disabled={isLinkingGitHub}
                  className="bg-[#23234a] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-colors disabled:opacity-50 border border-indigo-500"
                >
                  {isLinkingGitHub ? 'Linking...' : 'Link GitHub'}
                </button>
              ) : githubLinked ? (
                <div className="text-green-400 text-2xl font-bold">✓</div>
              ) : (
                <div className="text-[#666688] text-sm">Complete wallet first</div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-[#39396a]'}`} />
            {requireGitHub && (
              <div className={`w-3 h-3 rounded-full ${githubLinked ? 'bg-green-400' : 'bg-[#39396a]'}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}