"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import ConnectYourWallet from "./ComponentUtils/ConnectYourWallet";
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

  useEffect(() => {
    // Give some time for authentication to settle
    if (ready) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  // Show loading while initializing
  if (!ready || isInitializing) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Bars
          height="150"
          width="150"
          color="#0500FF"
          ariaLabel="bars-loading"
          visible={true}
        />
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
    // Check if user has verified wallets
    const verifiedWallets = user?.linkedAccounts
      ?.filter((account) => account.type === "wallet")
      ?.map((account) => account.address) || [];

    // Check if there's an active wallet that's verified
    const activeWallet = wallets.find(
      (wallet) => wallet.address && verifiedWallets.includes(wallet.address)
    );

    return Boolean(activeWallet && isConnected && address);
  };

  // Check for GitHub authentication
  const hasGitHubAuth = () => {
    return Boolean(user?.linkedAccounts?.find((account) => account.type === "github_oauth"));
  };

  // Handle different authentication requirements
  if (requireWallet === 'wallet-and-github') {
    // Require both wallet and GitHub
    if (!hasValidWallet() || !hasGitHubAuth()) {
      return <ConnectYourWallet requireGitHub={true} />;
    }
  } else if (requireWallet && !hasValidWallet()) {
    // If wallet is required and not properly connected, show connect screen
    return <ConnectYourWallet />;
  }

  // All checks passed, render children
  return <>{children}</>;
}