import React, { useState, useEffect, useRef } from "react";
import BookSession from "./AllSessions/BookSession";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import RecordedSessionsTile from "../ComponentUtils/RecordedSessionsTile";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";
import ErrorDisplay from "../ComponentUtils/ErrorDisplay";
import text1 from "@/assets/images/daos/texture1.png";
import SessionTile from "../ComponentUtils/SessionTiles";
import { Oval } from "react-loader-spinner";
import SessionTileSkeletonLoader from "../SkeletonLoader/SessionTileSkeletonLoader";
import { useAccount } from "wagmi";
import { SessionInterface } from "@/types/MeetingTypes";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function DelegateSessions({ props }: { props: Type }) {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const [dataLoading, setDataLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState([]);
  const dao_name = props.daoDelegates;
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { walletAddress } = useWalletAddress();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  useEffect(() => {
    const checkForOverflow = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setShowRightShadow(container.scrollWidth > container.clientWidth);
      }
    };

    checkForOverflow();
    window.addEventListener("resize", checkForOverflow);
    return () => window.removeEventListener("resize", checkForOverflow);
  }, []);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftShadow(container.scrollLeft > 0);
      setShowRightShadow(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  // const dao_name = daoName.charAt(0).toUpperCase() + daoName.slice(1);

  const getMeetingData = async () => {
    setDataLoading(true);
    try {
      const token=await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };
      const raw = JSON.stringify({
        dao_name: dao_name,
        address: props.individualDelegate,
      });
      const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch("/api/get-dao-sessions", requestOptions);
      const result = await response.json();

      if (result) {
        const resultData = await result.data;
        if (Array.isArray(resultData)) {
          let filteredData: any = resultData;
          if (searchParams.get("session") === "upcoming") {
            filteredData = resultData.filter((session: SessionInterface) => {
              return session.meeting_status === "Upcoming";
            });
            setSessionDetails(filteredData);
          } else if (searchParams.get("session") === "hosted") {
            filteredData = resultData.filter((session: SessionInterface) => {
              return (
                session.meeting_status === "Recorded" &&
                session.host_address?.toLowerCase() ===
                  props.individualDelegate?.toLowerCase()
              );
            });
            setSessionDetails(filteredData);
          } else if (searchParams.get("session") === "attended") {
            filteredData = resultData.filter((session: SessionInterface) => {
              return (
                session.meeting_status === "Recorded" &&
                session.attendees?.some(
                  (attendee) =>
                    attendee.attendee_address?.toLowerCase() ===
                    props.individualDelegate?.toLowerCase()
                )
              );
            });
          }
          setSessionDetails(filteredData);
        }
      }
    } catch (error) {
      setError(
        "An unexpected error occurred. Please refresh the page and try again."
      );
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    // if (walletAddress != null) {
    //   getMeetingData();
    // }
    getMeetingData();
  }, [
    props.daoDelegates,
    props.individualDelegate,
    searchParams.get("session"),
  ]);

  const handleRetry = () => {
    setError(null);
    getMeetingData();
    window.location.reload();
  };

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorDisplay message={error} onRetry={handleRetry} />
      </div>
    );

  return (
    <div>
      <div className=" pt-4 relative">
        <div
          className={`flex gap-10 sm:gap-16 border-1 border-[#7C7C7C] px-6 rounded-xl text-sm overflow-x-auto whitespace-nowrap relative`}
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <button
            className={`py-2  ${
              searchParams.get("session") === "book"
                ? "text-[#3E3D3D] font-bold"
                : "text-[#7C7C7C]"
            }`}
            onClick={() =>
              router.push(path + "?active=delegatesSession&session=book")
            }
          >
            Book
          </button>
          <button
            className={`py-2 ${
              searchParams.get("session") === "hosted"
                ? "text-[#3E3D3D] font-bold"
                : "text-[#7C7C7C]"
            }`}
            onClick={() =>
              router.push(path + "?active=delegatesSession&session=hosted")
            }
          >
            Hosted
          </button>
          <button
            className={`py-2 ${
              searchParams.get("session") === "attended"
                ? "text-[#3E3D3D] font-bold"
                : "text-[#7C7C7C]"
            }`}
            onClick={() =>
              router.push(path + "?active=delegatesSession&session=attended")
            }
          >
            Attended
          </button>
        </div>

        <div className="py-10">
          {searchParams.get("session") === "book" && (
            <BookSession props={props} />
          )}
          {searchParams.get("session") === "hosted" &&
            (dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : sessionDetails.length === 0 ? (
              <div className="flex flex-col justify-center items-center pt-10">
                <div className="text-5xl">☹️</div>{" "}
                <div className="pt-4 font-semibold text-lg">
                  Oops, no such result available!
                </div>
              </div>
            ) : (
              <RecordedSessionsTile meetingData={sessionDetails} />
            ))}
          {searchParams.get("session") === "attended" &&
            (dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : sessionDetails.length === 0 ? (
              <div className="flex flex-col justify-center items-center pt-10">
                <div className="text-5xl">☹️</div>{" "}
                <div className="pt-4 font-semibold text-lg">
                  Oops, no such result available!
                </div>
              </div>
            ) : (
              <RecordedSessionsTile meetingData={sessionDetails} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default DelegateSessions;
