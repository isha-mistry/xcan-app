"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaCircleCheck, FaCircleXmark, FaCirclePlay } from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";
import EventTile from "../../ComponentUtils/EventTile";
import { useAccount } from "wagmi";
import ErrorDisplay from "@/components/ComponentUtils/ErrorDisplay";
import RecordedSessionsSkeletonLoader from "@/components/SkeletonLoader/RecordedSessionsSkeletonLoader";
import { SessionInterface } from "@/types/MeetingTypes";
import { usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import NoResultsFound from "@/utils/Noresult";
import { useConnection } from "@/app/hooks/useConnection";

function BookedUserSessions() {
  const { address } = useAccount();
  const { isConnected } = useConnection()
  const { user, ready, getAccessToken, authenticated } = usePrivy();
  // const address = "0xB351a70dD6E5282A8c84edCbCd5A955469b9b032";
  const [sessionDetails, setSessionDetails] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = () => {
    setError(null);
    getMeetingData();
    window.location.reload();
  };

  const getMeetingData = async () => {
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };

      const raw = JSON.stringify({
        address: address,
      });

      const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const response = await fetchApi(
        `/get-meeting/${address}`,
        requestOptions
      );
      const result = await response.json();
      let filteredData: any = result.data;
      if (result.success) {
        const currentTime = new Date();
        const currentSlot = new Date(currentTime.getTime() - 60 * 60 * 1000);

        filteredData = result.data.filter(
          (session: SessionInterface) =>
            session.meeting_status !== "Recorded"
        );

        setSessionDetails(filteredData);
        setPageLoading(false);
      } else {
        setPageLoading(false);
      }
    } catch (error) {
      console.log("error in catch", error);
      setError("Unable to load sessions. Please try again in a few moments.");
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      getMeetingData();
    }
  }, [address]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorDisplay message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {pageLoading ? (
          <RecordedSessionsSkeletonLoader />
        ) : sessionDetails.length > 0 ? (
          <div
            className={`grid min-[475px]:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10 py-8 font-tektur`}
          >
            {sessionDetails.map((data, index) => (
              <EventTile
                key={index}
                tileIndex={index}
                data={data}
                isEvent="Book"
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
    </>
  );
}

export default BookedUserSessions;
