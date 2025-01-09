import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";
import OfficeHoursAlertMessage from "../AlertMessage/OfficeHoursAlertMessage";
import { OfficeHoursProps } from "@/types/OfficeHoursTypes";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";
import OfficeHourTile from "../ComponentUtils/OfficeHourTile";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
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

function DelegateOfficeHrs({ props }: { props: Type }) {
  const [activeSection, setActiveSection] = useState("ongoing");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const { user, ready, getAccessToken, authenticated } = usePrivy();
  const { walletAddress } = useWalletAddress();
  const [dataLoading, setDataLoading] = useState(true);
  const dao_name = props.daoDelegates;
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  // props.daoDelegates.charAt(0).toUpperCase() + props.daoDelegates.slice(1);
  const [upcomingOfficeHours, setUpcomingOfficeHours] = useState<
    OfficeHoursProps[]
  >([]);
  const [ongoingOfficeHours, setOngoingOfficeHours] = useState<
    OfficeHoursProps[]
  >([]);
  const [hostedOfficeHours, setHostedOfficeHours] = useState<
    OfficeHoursProps[]
  >([]);
  const [attendedOfficeHours, setAttendedOfficeHours] = useState<
    OfficeHoursProps[]
  >([]);

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
    const fetchUserOfficeHours = async () => {
      const response = await fetchApi(
        `/get-office-hours?host_address=${props.individualDelegate}&dao_name=${props.daoDelegates}`,
        {
          headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
          },
        }
      );

      const result = await response.json();

      console.log("result", result);
      setOngoingOfficeHours(result.data.ongoing);
      setUpcomingOfficeHours(result.data.upcoming);
      setHostedOfficeHours(result.data.hosted);
      setAttendedOfficeHours(result.data.attended);
      setDataLoading(false);
    };

    if (walletAddress != null) {
      fetchUserOfficeHours();
    }
  }, []); // Re-fetch data when filter changes

  return (
    <div>
      <div className="pt-3">
        <div
          className="flex gap-10 sm:gap-16 border-1 border-[#7C7C7C] px-6 rounded-xl text-sm overflow-x-auto whitespace-nowrap relative"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <button
            className={`py-2  ${
              searchParams.get("hours") === "ongoing"
                ? "text-[#3E3D3D] font-bold"
                : "text-[#7C7C7C]"
            }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=ongoing")
            }
          >
            Ongoing
          </button>
          <button
            className={`py-2 ${
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
          {searchParams.get("hours") === "ongoing" &&
            (dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : ongoingOfficeHours.length === 0 ? (
              <div className="flex flex-col justify-center items-center pt-10">
                <div className="text-5xl">☹️</div>{" "}
                <div className="pt-4 font-semibold text-lg">
                  Oops, no such result available!
                </div>
              </div>
            ) : (
              <OfficeHourTile isOngoing={true} data={ongoingOfficeHours} />
            ))}

          {searchParams.get("hours") === "upcoming" &&
            (dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : upcomingOfficeHours.length === 0 ? (
              <div className="flex flex-col justify-center items-center pt-10">
                <div className="text-5xl">☹️</div>{" "}
                <div className="pt-4 font-semibold text-lg">
                  Oops, no such result available!
                </div>
              </div>
            ) : (
              <OfficeHourTile isUpcoming={true} data={upcomingOfficeHours} />
            ))}

          {searchParams.get("hours") === "hosted" &&
            (dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : hostedOfficeHours.length === 0 ? (
              <div className="flex flex-col justify-center items-center pt-10">
                <div className="text-5xl">☹️</div>{" "}
                <div className="pt-4 font-semibold text-lg">
                  Oops, no such result available!
                </div>
              </div>
            ) : (
              <OfficeHourTile isRecorded={true} data={hostedOfficeHours} />
            ))}

          {searchParams.get("hours") === "attended" &&
            (dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : attendedOfficeHours.length === 0 ? (
              <div className="flex flex-col justify-center items-center pt-10">
                <div className="text-5xl">☹️</div>{" "}
                <div className="pt-4 font-semibold text-lg">
                  Oops, no such result available!
                </div>
              </div>
            ) : (
              <OfficeHourTile isRecorded={true} data={attendedOfficeHours} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default DelegateOfficeHrs;
