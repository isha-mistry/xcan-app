"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import ConnectYourWallet from "./ComponentUtils/ConnectYourWallet";
import { BASE_URL } from "@/config/constants";
import { Bars } from "react-loader-spinner";

interface WalletWrapperProps {
  /** 
   * If false, allows social logins (Google/Farcaster) without requiring wallet connection
   * If true (default), requires a properly connected and verified wallet
   * If 'wallet-and-github', requires both wallet and GitHub authentication
   */
  children: React.ReactNode;
  requireWallet?: boolean | 'wallet-and-github';
}

/**
 * WalletWrapper - A comprehensive authentication wrapper component
 * 
 * This component provides protection for routes by ensuring users are properly authenticated
 * through Privy and have the required wallet connection based on the route requirements.
 * 
 * Features:
 * - Checks Privy authentication status
 * - Validates wallet connection state
 * - Supports both wallet and social login authentication
 * - Can require both wallet AND GitHub authentication
 * - Provides loading states during initialization
 * - Shows appropriate connection UI when authentication is missing
 * 
 * @param children - React components to render when authentication is successful
 * @param requireWallet - Whether to require wallet connection (default: true), or 'wallet-and-github' for both
 * 
 * Authentication Flow:
 * 1. Shows loading spinner while Privy initializes
 * 2. Checks if user is authenticated with Privy
 * 3. If requireWallet=false, allows social logins to proceed
 * 4. If requireWallet=true, validates proper wallet connection
 * 5. If requireWallet='wallet-and-github', validates both wallet and GitHub
 * 6. Renders children only when all requirements are met
 * 7. Shows ConnectYourWallet component for missing authentication
 */

export default function WalletWrapper({
  children,
  requireWallet = true
}: WalletWrapperProps) {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { address, isConnected } = useAccount();
  const [isInitializing, setIsInitializing] = useState(true);

  // --- NEW: GitHub link state ---
  const [githubLinked, setGithubLinked] = useState(false);
  const [githubChecked, setGithubChecked] = useState(false);

  useEffect(() => {
    if (ready) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  // --- NEW: Check GitHub link status from backend ---
  useEffect(() => {
    const checkGithubStatus = async () => {
      if (address) {
        try {
          const response = await fetch(`/api/auth/github-status?address=${address}`);
          const data = await response.json();
          setGithubLinked(data.isLinked);
        } catch (error) {
          setGithubLinked(false);
        }
      }
      setGithubChecked(true);
    };
    if (requireWallet === 'wallet-and-github' && isConnected && address) {
      checkGithubStatus();
    } else {
      setGithubChecked(true);
    }
  }, [requireWallet, isConnected, address]);

  // Show loading while initializing
  if (!ready || isInitializing || (requireWallet === 'wallet-and-github' && !githubChecked)) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Bars height="150" width="150" color="#0500FF" ariaLabel="bars-loading" visible={true} />
      </div>
    );
  }

  // Check if user is authenticated
  if (!authenticated) {
    return <ConnectYourWallet />;
  }

  // If requireWallet is false, allow social logins without wallet
  if (!requireWallet) {
    const hasSocialLogin = user?.google || user?.farcaster;
    if (hasSocialLogin) {
      return <>{children}</>;
    }
  }

  // Check for proper wallet connection
  const hasValidWallet = () => {
    const verifiedWallets = user?.linkedAccounts
      ?.filter((account) => account.type === "wallet")
      ?.map((account) => account.address) || [];
    const activeWallet = wallets.find(
      (wallet) => wallet.address && verifiedWallets.includes(wallet.address)
    );
    return Boolean(activeWallet && isConnected && address);
  };

  // --- CHANGED: Use githubLinked state instead of Privy for GitHub auth ---
  if (requireWallet === 'wallet-and-github') {
    if (!hasValidWallet() || !githubLinked) {
      return <ConnectYourWallet requireGitHub={true} />;
    }
  } else if (requireWallet && !hasValidWallet()) {
    return <ConnectYourWallet />;
  }

  return <>{children}</>;
}