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
import { CiSearch } from "react-icons/ci";

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
  meeting_status: "ongoing" | "active" | "inactive";
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
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

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

  // Get current data based on selected tab
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
      try {
        const response = await fetchApi(
          `/get-office-hours?host_address=${props.individualDelegate}&dao_name=${props.daoDelegates}`,
          {
            headers: {
              Authorization: `Bearer ${await getAccessToken()}`,
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
        setDataLoading(false);
      } catch (error) {
        console.error("Error fetching office hours:", error);
        setDataLoading(false);
      }
    };

    if (walletAddress != null) {
      fetchUserOfficeHours();
    }
  }, [
    props.individualDelegate,
    props.daoDelegates,
    walletAddress,
    getAccessToken,
  ]);

  return (
    <div>
      <div className="pt-3">
        <div
          className="flex gap-10 sm:gap-16 border-1 border-[#7C7C7C] px-6 rounded-xl text-sm overflow-x-auto whitespace-nowrap relative"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <button
            className={`py-2 ${
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

        <div className="py-10">
          {dataLoading ? (
            <RecordedSessionsSkeletonLoader />
          ) : getCurrentData().length === 0 ? (
            <div className="flex flex-col justify-center items-center pt-10">
              <div className="text-5xl">☹️</div>
              <div className="pt-4 font-semibold text-lg">
                Oops, no such result available!
              </div>
            </div>
          ) : (
            <OfficeHourTile
              isOngoing={searchParams.get("hours") === "ongoing"}
              isUpcoming={searchParams.get("hours") === "upcoming"}
              isHosted={searchParams.get("hours") === "hosted"}
              isAttended={searchParams.get("hours") === "attended"}
              isRecorded={["hosted", "attended"].includes(
                searchParams.get("hours") || ""
              )}
              data={getCurrentData()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DelegateOfficeHrs;
