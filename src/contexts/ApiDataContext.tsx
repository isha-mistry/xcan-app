"use client";

import { fetchApi } from "@/utils/api";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ApiData {
  // Define your API data structure here
  // For example:
  // id: string;
  // name: string;
  // Add more properties as needed
}

export interface ApiDataContextType {
  apiData: any;
  loading: boolean;
  error: Error | null;
  refetchData: () => Promise<void>;
}

const ApiDataContext = createContext<ApiDataContextType | undefined>(undefined);

export function ApiDataProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [apiData, setApiData] = useState<ApiData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow",
      };

      const response = await fetchApi("/calculate-cpi", requestOptions);
      const data: ApiData = await response.json();
      setApiData(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("An error occurred while fetching data")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchData();
    }
  }, [isMounted]);

  const refetchData = () => fetchData();

  const contextValue: ApiDataContextType = {
    apiData,
    loading,
    error,
    refetchData,
  };

  return (
    <ApiDataContext.Provider value={contextValue}>
      {children}
    </ApiDataContext.Provider>
  );
}

export function useApiData() {
  const context = useContext(ApiDataContext);
  if (context === undefined) {
    throw new Error("useApiData must be used within an ApiDataProvider");
  }
  return context;
}
