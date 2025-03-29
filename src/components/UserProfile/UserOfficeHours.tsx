import React, { useState, useEffect, useRef, useCallback } from "react";
import OfficeHourTile from "../ComponentUtils/OfficeHourTile";
import UserScheduledHours from "./UserAllOfficeHrs/UserScheduledHours";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";
import NoResultsFound from "@/utils/Noresult";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";
import { OfficeHoursProps } from "@/types/OfficeHoursTypes";
import { CiSearch } from "react-icons/ci";
import {Calendar,CalendarCheck,CheckCircle,Clock,Users,} from "lucide-react";


interface UserOfficeHoursProps {
  isDelegate: boolean | undefined;
  selfDelegate: boolean;
  daoName: string;
}

function UserOfficeHours({
  isDelegate,
  selfDelegate,
  daoName,
}: UserOfficeHoursProps) {
  

  const { getAccessToken } = usePrivy();
  const { walletAddress } = useWalletAddress();
  const [searchQuery, setSearchQuery] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const currentTab = searchParams.get("hours") || ""; 

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

  const fetchUserOfficeHours = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const response = await fetchApi(
        `/get-office-hours?host_address=${walletAddress}&dao_name=${daoName}&type=${currentTab}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      const data = {
        ongoing: result.data.ongoing,
        upcoming: result.data.upcoming,
        hosted: result.data.hosted,
        attended: result.data.attended,
      };

      setOriginalData(data);
      setFilteredData(data); // Initially, filtered data is same as original
    } catch (error) {
      console.error("Error fetching office hours:", error);
    } finally {
      setDataLoading(false);
    }
  }, [walletAddress, daoName, getAccessToken]);


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

  useEffect(() => {
    fetchUserOfficeHours();
  }, [fetchUserOfficeHours]);

  useEffect(() => {
    setDataLoading(true);
  }, [walletAddress]);

  useEffect(() => {
    if (!selfDelegate && searchParams.get("hours") === "schedule") {
      router.replace(path + "?active=officeHours&hours=attended");
    }
  }, [isDelegate, selfDelegate, searchParams.get("hours")]);

  return (
    <div>
      <div className="pt-3">
        <div
          className="flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {selfDelegate === true && (
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
                searchParams.get("hours") === "schedule"
                  ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                  : "text-[#3E3D3D] bg-white"
              }`}
              onClick={() =>
                router.push(path + "?active=officeHours&hours=schedule")
              }
            >
              <CalendarCheck size={16} className="drop-shadow-lg" />
              Calender
            </button>
          )}

          {selfDelegate === true && (
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
                searchParams.get("hours") === "ongoing"
                  ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                  : "text-[#3E3D3D] bg-white"
              }`}
              onClick={() =>
                router.push(path + "?active=officeHours&hours=ongoing")
              }
            >
              <Clock size={16} className="drop-shadow-lg" />
              Live
            </button>
          )}

          {selfDelegate === true && (
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
                searchParams.get("hours") === "upcoming"
                  ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                  : "text-[#3E3D3D] bg-white"
              }`}
              onClick={() =>
                router.push(path + "?active=officeHours&hours=upcoming")
              }
            >
              <Calendar size={16} className="drop-shadow-lg" />
              Scheduled
            </button>
          )}
          {selfDelegate === true && (
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
                searchParams.get("hours") === "hosted"
                  ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                  : "text-[#3E3D3D] bg-white"
              }`}
              onClick={() =>
                router.push(path + "?active=officeHours&hours=hosted")
              }
            >
              <Users size={16} className="drop-shadow-lg" />
              Hosted
            </button>
          )}
          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
              searchParams.get("hours") === "attended"
                ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
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
              className="w-[100%] pl-2 pr-4 py-1.5 font-poppins md:py-2 text-sm bg-transparent outline-none"
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
          {selfDelegate === true &&
            searchParams.get("hours") === "schedule" && (
              <UserScheduledHours
                daoName={daoName}
                onScheduleSave={fetchUserOfficeHours}
              />
            )}

          {searchParams.get("hours") !== "schedule" && (
            <>
              {dataLoading ? (
                <RecordedSessionsSkeletonLoader />
              ) : getCurrentData().length === 0 ? (
                <div className="flex flex-col justify-center items-center">
                  <NoResultsFound/>
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
