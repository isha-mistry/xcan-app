import React, { useState, useEffect, useRef, useCallback } from "react";
import OfficeHourTile from "../ComponentUtils/OfficeHourTile";
import UserScheduledHours from "./UserAllOfficeHrs/UserScheduledHours";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";
import NoResultsFound from "@/utils/Noresult";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import { OfficeHoursProps } from "@/types/OfficeHoursTypes";
import { CiSearch } from "react-icons/ci";
import { Calendar, CalendarCheck, CheckCircle, Clock, Users, } from "lucide-react";
import useSWR from "swr";
import { useAccount } from "wagmi";
import { useConnection } from "@/app/hooks/useConnection";

function UserOfficeHours() {
  const { getAccessToken } = usePrivy();
  const { address } = useAccount()
  const { isConnected } = useConnection()
  const [searchQuery, setSearchQuery] = useState("");
  // const [dataLoading, setDataLoading] = useState(true);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const currentTab = searchParams.get("hours") || "";

  // SWR fetcher function
  const fetcher = async (url: string) => {
    const token = await getAccessToken();
    const response = await fetchApi(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  };

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR(
    address && isConnected
      ? `/get-office-hours?host_address=${address}&type=${currentTab}`
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  );

  // Original data from API
  const [originalData, setOriginalData] = useState({
    ongoing: [] as OfficeHoursProps[],
    upcoming: [] as OfficeHoursProps[],
    hosted: [] as OfficeHoursProps[],
    attended: [] as OfficeHoursProps[],
  });

  // Filtered data based on search
  const [filteredData, setFilteredData] = useState({
    ongoing: [] as OfficeHoursProps[],
    upcoming: [] as OfficeHoursProps[],
    hosted: [] as OfficeHoursProps[],
    attended: [] as OfficeHoursProps[],
  });

  // Update data when SWR data changes
  useEffect(() => {
    if (data) {
      const newData = {
        ongoing: data.data.ongoing,
        upcoming: data.data.upcoming,
        hosted: data.data.hosted,
        attended: data.data.attended,
      };
      setOriginalData(newData);
      setFilteredData(newData);
    }
  }, [data]);

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);

    if (!searchTerm.trim()) {
      // If search is empty, restore original data
      setFilteredData(originalData);
      return;
    }

    const term = searchTerm.toLowerCase();

    // Filter all categories
    const newFilteredData = {
      ongoing: originalData.ongoing.filter(
        (item) =>
          item.title?.toLowerCase().includes(term) ||
          item.host_address?.toLowerCase().includes(term)
      ),
      upcoming: originalData.upcoming.filter(
        (item) =>
          item.title?.toLowerCase().includes(term) ||
          item.host_address?.toLowerCase().includes(term)
      ),
      hosted: originalData.hosted.filter(
        (item) =>
          item.title?.toLowerCase().includes(term) ||
          item.host_address?.toLowerCase().includes(term)
      ),
      attended: originalData.attended.filter(
        (item) =>
          item.title?.toLowerCase().includes(term) ||
          item.host_address?.toLowerCase().includes(term)
      ),
    };

    setFilteredData(newFilteredData);
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

  const getCurrentData = () => {
    const currentTab = searchParams.get("hours") as keyof typeof filteredData;
    return filteredData[currentTab] || [];
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


  return (
    <div>
      <div className="pt-3">
        <div
          className="flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${searchParams.get("hours") === "schedule"
              ? "text-blue-shade-100 font-semibold bg-[#f5f5f5]"
              : "text-[#3E3D3D] bg-white"
              }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=schedule")
            }
          >
            <CalendarCheck size={16} className="drop-shadow-lg" />
            Calender
          </button>

          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${searchParams.get("hours") === "ongoing"
              ? "text-blue-shade-100 font-semibold bg-[#f5f5f5]"
              : "text-[#3E3D3D] bg-white"
              }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=ongoing")
            }
          >
            <Clock size={16} className="drop-shadow-lg" />
            Live
          </button>

          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${searchParams.get("hours") === "upcoming"
              ? "text-blue-shade-100 font-semibold bg-[#f5f5f5]"
              : "text-[#3E3D3D] bg-white"
              }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=upcoming")
            }
          >
            <Calendar size={16} className="drop-shadow-lg" />
            Scheduled
          </button>

          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${searchParams.get("hours") === "hosted"
              ? "text-blue-shade-100 font-semibold bg-[#f5f5f5]"
              : "text-[#3E3D3D] bg-white"
              }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=hosted")
            }
          >
            <Users size={16} className="drop-shadow-lg" />
            Hosted
          </button>
          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${searchParams.get("hours") === "attended"
              ? "text-blue-shade-100 font-semibold bg-[#f5f5f5]"
              : "text-[#3E3D3D] bg-white"
              }`}
            onClick={() =>
              router.push(path + "?active=officeHours&hours=attended")
            }
          >
            <CheckCircle size={16} className="drop-shadow-lg" />
            Attended
          </button>
        </div>

        {searchParams.get("hours") !== "schedule" && (
          <div className="flex items-center my-8 rounded-full shadow-lg bg-gray-100 text-black cursor-pointer w-[300px] xs:w-[365px]">
            <CiSearch className="text-base transition-all duration-700 ease-in-out ml-3" />
            <input
              type="text"
              placeholder="Search by title or host address"
              className="w-[100%] pl-2 pr-4 py-1.5 font-tektur md:py-2 text-sm bg-transparent outline-none"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        )}

        <div
          className={
            searchParams.get("hours") === "schedule" ? `py-10` : `pb-10`
          }
        >
          {searchParams.get("hours") === "schedule" && (
            <UserScheduledHours
              // onScheduleSave={fetchUserOfficeHours}
              onScheduleSave={() => mutate()}
            />
          )}

          {searchParams.get("hours") !== "schedule" && (
            <>
              {/* {dataLoading ? ( */}
              {isLoading ? (
                <RecordedSessionsSkeletonLoader />
              ) : getCurrentData().length === 0 ? (
                <div className="flex flex-col justify-center items-center">
                  <NoResultsFound />
                </div>
              ) : (
                <OfficeHourTile
                  isOngoing={searchParams.get("hours") === "ongoing"}
                  isUpcoming={searchParams.get("hours") === "upcoming"}
                  isHosted={searchParams.get("hours") === "hosted"}
                  isAttended={searchParams.get("hours") === "attended"}
                  isUserProfile={searchParams.get("hours") === "upcoming"}
                  isRecorded={["hosted", "attended"].includes(
                    searchParams.get("hours") || ""
                  )}
                  data={getCurrentData()}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserOfficeHours;
