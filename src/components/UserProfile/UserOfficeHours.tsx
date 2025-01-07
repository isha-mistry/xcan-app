import React, { useState, useEffect, useRef } from "react";
import UserScheduledHours from "./UserAllOfficeHrs/UserScheduledHours";
import UserRecordedHours from "./UserAllOfficeHrs/UserRecordedHours";
import UserUpcomingHours from "./UserAllOfficeHrs/UserUpcomingHours";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import Tile from "../ComponentUtils/Tile";
import { useAccount } from "wagmi";
import text1 from "@/assets/images/daos/texture1.png";
import { Oval } from "react-loader-spinner";
import { RxCross2 } from "react-icons/rx";
import SessionTileSkeletonLoader from "../SkeletonLoader/SessionTileSkeletonLoader";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";
import OfficeHoursAlertMessage from "../AlertMessage/OfficeHoursAlertMessage";
import OfficeHourTile from "../ComponentUtils/OfficeHourTile";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";

interface UserOfficeHoursProps {
  isDelegate: boolean | undefined;
  selfDelegate: boolean;
  daoName: string;
}

interface Session {
  _id: string;
  host_address: string;
  office_hours_slot: string;
  title: string;
  description: string;
  meeting_status: "ongoing" | "active" | "inactive"; // Define the possible statuses
  dao_name: string;
  attendees: any[];
}

function UserOfficeHours({
  isDelegate,
  selfDelegate,
  daoName,
}: UserOfficeHoursProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const [sessionDetails, setSessionDetails] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(true);
  const { user, ready, getAccessToken, authenticated } = usePrivy();
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const token=await getAccessToken();
        const myHeaders: HeadersInit = {
          "Content-Type": "application/json",
          ...(walletAddress && {
            "x-wallet-address": walletAddress,
            Authorization: `Bearer ${token}`,
          }),
        };
        const raw = JSON.stringify({
          address: walletAddress,
        });

        const requestOptions: RequestInit = {
          method: "POST",
          headers: myHeaders,
          body: raw,
        };

        const response = await fetchApi(
          "/get-officehours-address",
          requestOptions
        );
        const result = await response.json();

        //api for individual attendees
        const rawData = JSON.stringify({
          attendee_address: walletAddress,
        });

        const requestOption: RequestInit = {
          method: "POST",
          headers: myHeaders,
          body: rawData,
        };

        const responseData = await fetchApi(
          "/get-attendee-individual",
          requestOption
        );
        const resultData = await responseData.json();

        if (
          searchParams.get("hours") === "ongoing" ||
          searchParams.get("hours") === "upcoming" ||
          searchParams.get("hours") === "hosted"
        ) {
          const filteredSessions = result.filter((session: Session) => {
            if (searchParams.get("hours") === "ongoing") {
              return (
                session.meeting_status === "ongoing" &&
                session.dao_name === daoName
              );
            } else if (searchParams.get("hours") === "upcoming") {
              return (
                session.meeting_status === "active" &&
                session.dao_name === daoName
              );
            } else if (searchParams.get("hours") === "hosted") {
              return (
                session.meeting_status === "inactive" &&
                session.dao_name === daoName
              );
            }
          });
          setSessionDetails(filteredSessions);
        } else if (searchParams.get("hours") === "attended") {
          const filteredSessions = resultData.filter((session: Session) => {
            return (
              session.attendees.some(
                (attendee: any) => attendee.attendee_address === walletAddress
              ) && session.dao_name === daoName
            );
          });
          setSessionDetails(filteredSessions);
        }

        setDataLoading(false);
      } catch (error) {
        console.error(error);
        setDataLoading(false);
      }
    };

    if (walletAddress != null) {
      fetchData();
    }
  }, [searchParams.get("hours")]); // Re-fetch data when filter changes

  useEffect(() => {
    // Set initial session details
    setSessionDetails([]);
    setDataLoading(true);
  }, [address, walletAddress]);

  useEffect(() => {
    if (!selfDelegate && searchParams.get("hours") === "schedule") {
      router.replace(path + "?active=officeHours&hours=attended");
    }
  }, [isDelegate, selfDelegate, searchParams.get("hours")]);

  return (
    <div>
      <div className="pt-3">
        <div className="flex gap-10 sm:gap-16  border-1 border-[#7C7C7C] px-6 rounded-xl text-sm overflow-x-auto whitespace-nowrap relative"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        >
          {selfDelegate === true && (
            <button
              className={`py-2  ${
                searchParams.get("hours") === "schedule"
                  ? "text-[#3E3D3D] font-bold"
                  : "text-[#7C7C7C]"
              }`}
              onClick={() =>
                router.push(path + "?active=officeHours&hours=schedule")
              }
            >
              Schedule
            </button>
          )}

          {selfDelegate === true && (
            <button
              className={`py-2  ${
                searchParams.get("hours") === "upcoming"
                  ? "text-[#3E3D3D] font-bold"
                  : "text-[#7C7C7C]"
              }`}
              onClick={() =>
                router.push(path + "?active=officeHours&hours=upcoming")
              }
            >
              Upcoming
            </button>
          )}
          {selfDelegate === true && (
            <button
              className={`py-2 ${
                searchParams.get("hours") === "hosted"
                  ? "text-[#3E3D3D] font-bold"
                  : "text-[#7C7C7C]"
              }`}
              onClick={() =>
                router.push(path + "?active=officeHours&hours=hosted")
              }
            >
              Hosted
            </button>
          )}
          <button
            className={`py-2 ${
              searchParams.get("hours") === "attended"
                ? "text-[#3E3D3D] font-bold"
                : "text-[#7C7C7C]"
            }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=attended")
            }
          >
            Attended
          </button>
        </div>

        <div className="py-10">
          {selfDelegate === true &&
            searchParams.get("hours") === "schedule" && (
              <UserScheduledHours daoName={daoName} />
            )}
          {selfDelegate === true &&
            searchParams.get("hours") === "upcoming" && <UserUpcomingHours />}

          {searchParams.get("hours") === "hosted" &&
            (dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : (
              // <Tile
              //   sessionDetails={sessionDetails}
              //   dataLoading={dataLoading}
              //   isEvent="Recorded"
              //   isOfficeHour={true}
              // />
              <OfficeHourTile isHosted={true}/>
            ))}
          {searchParams.get("hours") === "attended" &&
            (dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : (
              // <Tile
              //   sessionDetails={sessionDetails}
              //   dataLoading={dataLoading}
              //   isEvent="Recorded"
              //   isOfficeHour={true}
              // />
              <OfficeHourTile isAttended={true}/>
            ))}
        </div>

        {/* <div className="py-10">
          <OfficeHoursAlertMessage />
        </div> */}
      </div>
    </div>
  );
}

export default UserOfficeHours;
