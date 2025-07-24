"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import ConnectYourWallet from "./ComponentUtils/ConnectYourWallet";
import { Bars } from "react-loader-spinner";

export default function WalletWrapper({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (ready) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  if (!ready || isInitializing) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Bars height="150" width="150" color="#0500FF" ariaLabel="bars-loading" visible={true} />
      </div>
    );
  }

  if (!authenticated) {
    return <ConnectYourWallet />;
  }

  return <>{children}</>;
}