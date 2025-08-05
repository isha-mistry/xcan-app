"use client";

import { useEffect, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSearchParams } from "next/navigation";
import { createOrVerifyAccount } from "@/utils/api";

export function PrivyAuthHandler() {
  const { user, ready, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const searchParams = useSearchParams();
  const processedWalletRef = useRef<string | null>(null);

  useEffect(() => {
    const handleUserLogin = async () => {
      if (!ready || !user) return;

      try {
        const token = await getAccessToken();
        const referrer = searchParams.get("referrer");

        // Wait for wallets to be properly initialized
        if (!wallets || wallets.length === 0) {
          // console.log("Waiting for wallets to initialize...");
          return;
        }

        // Get verified wallets from user object
        const verifiedWallets = user.linkedAccounts
          .filter((account) => account.type === "wallet")
          .map((account) => account.address);

        // Find a wallet that is both connected and verified
        const selectedWallet = wallets.find(
          (wallet) => wallet.address && verifiedWallets.includes(wallet.address)
        );

        if (!selectedWallet) {
          console.log(
            "No verified wallet found. Available wallets:",
            wallets.map((w) => w.address)
          );
          return;
        }

        // Ensure we have a valid address
        if (!selectedWallet.address) {
          console.error("Selected wallet has no address");
          return;
        }

        // Check if we've already processed this wallet
        if (processedWalletRef.current === selectedWallet.address) {
          return;
        }

        // Store the processed wallet address
        processedWalletRef.current = selectedWallet.address;

        // Small delay to ensure everything is synchronized
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Create or verify account
        await createOrVerifyAccount(selectedWallet.address, token, referrer);
      } catch (error) {
        console.error("Error in PrivyAuthHandler:", error);
      }
    };

    handleUserLogin();
  }, [user, ready, wallets, getAccessToken, searchParams]);

  // Return null since this component only handles side effects
  return null;
}
