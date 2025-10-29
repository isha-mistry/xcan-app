"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Tooltip } from "@nextui-org/react";
import EventTile from "../../ComponentUtils/EventTile";
import { useAccount } from "wagmi";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { Oval } from "react-loader-spinner";
import SessionTileSkeletonLoader from "@/components/SkeletonLoader/SessionTileSkeletonLoader";
import ErrorDisplay from "@/components/ComponentUtils/ErrorDisplay";
import RecordedSessionsSkeletonLoader from "@/components/SkeletonLoader/RecordedSessionsSkeletonLoader";
import { usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import NoResultsFound from "@/utils/Noresult";
import { useConnection } from "@/app/hooks/useConnection";

function AttendingUserSessions() {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const [sessionDetails, setSessionDetails] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount()
  const { isConnected } = useConnection()
  const { user, ready, getAccessToken, authenticated } = usePrivy();
  const handleRetry = () => {
    setError(null);
    getUserMeetingData();
    window.location.reload();
  };

  const getUserMeetingData = async () => {
    try {
      setPageLoading(true);
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };
      const response = await fetchApi(`/get-session-data/${address}`, {
        method: "GET",
        headers: myHeaders,
      });

      const result = await response.json();

      if (result.success) {
        const resultData = await result.attending;
        setSessionDetails(resultData);
      }
    } catch (error) {
      setError("Unable to load sessions. Please try again in a few moments.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      getUserMeetingData();
    }
  }, [searchParams.get("session")]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorDisplay message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pageLoading ? (
        <RecordedSessionsSkeletonLoader />
      ) : sessionDetails.length > 0 ? (
        <div
          className={`grid min-[475px]:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10 py-8 font-robotoMono`}
        >
          {sessionDetails.map((data, index) => (
            <EventTile
              key={index}
              tileIndex={index}
              data={data}
              isEvent="Attending"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center">
          {/* <div className="text-5xl">☹️</div>{" "}
          <div className="pt-4 font-semibold text-lg">
            Oops, no such result available!
          </div> */}
          <NoResultsFound />
        </div>
      )}
    </div>
  );
}
export default AttendingUserSessions;
