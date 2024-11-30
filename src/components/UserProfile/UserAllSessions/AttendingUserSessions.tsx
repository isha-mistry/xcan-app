"use client";

import React, { useState, useEffect } from "react";
import text1 from "@/assets/images/daos/texture1.png";
import text2 from "@/assets/images/daos/texture2.png";
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
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";

function AttendingUserSessions({ daoName }: { daoName: string }) {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const { address,isConnected } = useAccount();
  const [sessionDetails, setSessionDetails] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, ready, getAccessToken,authenticated } = usePrivy();
  const {walletAddress}=useWalletAddress();

  const handleRetry = () => {
    setError(null);
    getUserMeetingData();
    window.location.reload();
  };

  const getUserMeetingData = async () => {
    try {
      setPageLoading(true);
      const myHeaders = new Headers();
      const token=await getAccessToken();
      myHeaders.append("Content-Type", "application/json");
      if (walletAddress) {
        myHeaders.append("x-wallet-address", walletAddress);
        myHeaders.append("Authorization",`Bearer ${token}`);
      }
      const response = await fetchApi(`/get-session-data/${walletAddress}`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          dao_name: daoName,
        }),
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
    if(walletAddress!=null){
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
          className={`grid min-[475px]:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10 py-8 font-poppins`}
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
          <div className="text-5xl">☹️</div>{" "}
          <div className="pt-4 font-semibold text-lg">
            Oops, no such result available!
          </div>
        </div>
      )}
    </div>
  );
}
export default AttendingUserSessions;
