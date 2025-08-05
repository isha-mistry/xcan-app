"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import ConnectYourWallet from "./ComponentUtils/ConnectYourWallet";
import { Bars } from "react-loader-spinner";

interface WalletWrapperProps {
  children: React.ReactNode;
  requireWallet?: boolean;
}

export default function WalletWrapper({
  children,
  requireWallet = true
}: WalletWrapperProps) {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { address, isConnected } = useAccount();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
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

  // If wallet is required but not connected, show connect wallet modal
  if (requireWallet && !hasValidWallet()) {
    return <ConnectYourWallet />;
  }

  return <>{children}</>;
}