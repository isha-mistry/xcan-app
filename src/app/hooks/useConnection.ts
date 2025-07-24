"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

export const useConnection = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const [connection, setConnection] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const checkConnection = useCallback(() => {
    setConnection(Boolean(authenticated));
  }, [authenticated]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    if (document.readyState === "complete") {
      setIsPageLoading(false);
    } else {
      const handleLoad = () => setIsPageLoading(false);
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  const isLoading = isPageLoading;
  const isReady = !isLoading && connection;

  return {
    isConnected: connection,
    isLoading,
    isPageLoading,
    isReady,
  };
};
