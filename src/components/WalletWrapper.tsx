"use client";
import { useAccount } from "wagmi";
import ConnectYourWallet from "./ComponentUtils/ConnectYourWallet";

export default function WalletWrapper({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <ConnectYourWallet />;
  }

  return <>{children}</>;
}