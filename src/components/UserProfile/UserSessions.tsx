import React, { useState, useEffect, useRef } from "react";
import ScheduledUserSessions from "./UserAllSessions/ScheduledUserSessions";
import BookedUserSessions from "./UserAllSessions/BookedUserSessions";
import AttendingUserSessions from "./UserAllSessions/AttendingUserSessions";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { useAccount } from "wagmi";
import RecordedSessionsTile from "../ComponentUtils/RecordedSessionsTile";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";
import ErrorDisplay from "../ComponentUtils/ErrorDisplay";
import { Calendar, CalendarCheck, CheckCircle, ChevronRight, UserCheck, Users } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";
import NoResultsFound from "@/utils/Noresult";

interface UserSessionsProps {
  isDelegate: boolean | undefined;
  selfDelegate: boolean;
  daoName: string;
}

function UserSessions({
  selfDelegate,
  daoName,
}: UserSessionsProps) {

  const {getAccessToken} = usePrivy();
  const { chain } = useAccount();
  const { walletAddress } = useWalletAddress();
  const [dataLoading, setDataLoading] = useState(true);
  const [attendedDetails, setAttendedDetails] = useState([]);
  const [hostedDetails, setHostedDetails] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);


  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleRetry = () => {
    setError(null);
    getUserMeetingData();
    window.location.reload();
  };
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftShadow(container.scrollLeft > 0);
      setShowRightShadow(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };
  const getUserMeetingData = async () => {
    setDataLoading(true);
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };
      const response = await fetchApi(`/get-sessions`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          address: walletAddress,
          dao_name: daoName,
        }),
      });

      const result = await response.json();
      if (result.success) {
        const hostedData = await result.hostedMeetings;
        const attendedData = await result.attendedMeetings;
        if (searchParams.get("session") === "hosted") {
          setHostedDetails(hostedData);
        } else if (searchParams.get("session") === "attended") {
          setAttendedDetails(attendedData);
        }
      }
    } catch (error) {
      setError("Unable to load sessions. Please try again in a few moments.");
    } finally {
      setDataLoading(false);
    }
  };

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
  
  useEffect(() => {
    if (walletAddress) {
      getUserMeetingData();
    }
  }, [
    walletAddress,
    searchParams.get("session"),
    chain,
    chain?.name,
    daoName,
  ]);

  useEffect(() => {
    if (selfDelegate === false && searchParams.get("session") === "schedule") {
      router.replace(path + "?active=sessions&session=attending");
    }
  }, [selfDelegate]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorDisplay message={error} onRetry={handleRetry} />
      </div>
    );
  };

  return (
    <div>
      <div className="pt-4 relative">
        <div
          className={`pt-4 px-4 md:px-6 lg:px-14 flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap`}
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {selfDelegate === true && (
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md  ${
                searchParams.get("session") === "schedule"
                  ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                  : "text-[#3E3D3D] bg-white"
              }`}
              onClick={() =>
                router.push(path + "?active=sessions&session=schedule")
              }
            >
               <Calendar size={16} className="drop-shadow-lg" />
              Calendar
            </button>
          )}

          {selfDelegate === true && (
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md  ${
                searchParams.get("session") === "book"
                  ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                  : "text-[#3E3D3D] bg-white"
              }`}
              onClick={() =>
                router.push(path + "?active=sessions&session=book")
              }
            >
               <CalendarCheck size={16} className="drop-shadow-lg" />
              Booked
            </button>
          )}
          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
              searchParams.get("session") === "attending"
                ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                : "text-[#3E3D3D] bg-white"
            }`}
            onClick={() =>
              router.push(path + "?active=sessions&session=attending")
            }
          >
            <UserCheck size={16} className="drop-shadow-lg" />
            Attending
          </button>
          {selfDelegate === true && (
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
                searchParams.get("session") === "hosted"
                  ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                  : "text-[#3E3D3D] bg-white"
              }`}
              onClick={() =>
                router.push(path + "?active=sessions&session=hosted")
              }
            >
              <Users size={16} className="drop-shadow-lg" />
              Hosted
            </button>
          )}
          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
              searchParams.get("session") === "attended"
                ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                : "text-[#3E3D3D] bg-white"
            }`}
            onClick={() =>
              router.push(path + "?active=sessions&session=attended")
            }
          >
             <CheckCircle size={16} className="drop-shadow-lg" />
            Attended
          </button>
        </div>
        <div className="px-4 md:px-6 lg:px-14">
        </div>
        {showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 h-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        )}
        {showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-8 h-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}

        <div className="py-6 sm:py-10 sm:px-20 md:px-6 lg:px-14">
          {selfDelegate === true &&
            searchParams.get("session") === "schedule" && (
              <div className="px-3">
                <ScheduledUserSessions daoName={daoName} />
              </div>
            )}
          {selfDelegate === true && searchParams.get("session") === "book" && (
            <BookedUserSessions daoName={daoName} />
          )}
          {searchParams.get("session") === "attending" && (
            <AttendingUserSessions daoName={daoName} />
          )}
          {selfDelegate === true &&
            searchParams.get("session") === "hosted" &&
            (dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : hostedDetails.length === 0 ? (
              <div className="flex flex-col justify-center items-center pt-10">
                <NoResultsFound/>
              </div>
            ) : (
              <RecordedSessionsTile
                meetingData={hostedDetails}
                showClaimButton={true}
                session="hosted"
              />
            ))}

          {searchParams.get("session") === "attended" &&
            (dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : attendedDetails.length === 0 ? (
              <div className="flex flex-col justify-center items-center pt-10">
                <NoResultsFound/>
              </div>
            ) : (
              <RecordedSessionsTile
                meetingData={attendedDetails}
                showClaimButton={true}
                session="attended"
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default UserSessions;
