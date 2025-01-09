"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

import { useAccount, useAccountEffect } from "wagmi";

export const useConnection = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { ready, authenticated, login, logout, user } = usePrivy();  
  const { address, isConnected } = useAccount();
  const [connection, setConnection] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const checkConnection = useCallback(() => {
    const isFullyConnected = Boolean(address && authenticated && isConnected);
    setConnection(isFullyConnected);
    setIsSessionLoading(sessionStatus === "loading");
  }, [address, ready, isConnected, authenticated]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    // Check if the page has finished loading
    if (document.readyState === "complete") {
      setIsPageLoading(false);
    } else {
      const handleLoad = () => setIsPageLoading(false);
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  useAccountEffect({
    onConnect: checkConnection,
    onDisconnect: () => {
      setConnection(false);
      checkConnection();
    },
  });

  const isLoading = isPageLoading;
  const isReady = !isLoading && connection;

  return {
    isConnected: connection,
    isLoading,
    // isSessionLoading,
    isPageLoading,
    isReady,
  };
};
