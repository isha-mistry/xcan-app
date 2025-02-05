import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import ErrorDisplay from "../ComponentUtils/ErrorDisplay";
import { CiSearch } from "react-icons/ci";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";
import { OfficeHoursProps } from "@/types/OfficeHoursTypes";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";
import OfficeHourTile from "../ComponentUtils/OfficeHourTile";

function OfficeHours({ props }: { props: string }) {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const { getAccessToken } = usePrivy();
  const { walletAddress } = useWalletAddress();

  // Original data from API
  const [originalData, setOriginalData] = useState({
    ongoing: [] as OfficeHoursProps[],
    upcoming: [] as OfficeHoursProps[],
    recorded: [] as OfficeHoursProps[],
  });

  // Filtered data based on search
  const [filteredData, setFilteredData] = useState({
    ongoing: [] as OfficeHoursProps[],
    upcoming: [] as OfficeHoursProps[],
    recorded: [] as OfficeHoursProps[],
  });

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data only once when component mounts
  const fetchOfficeHours = async () => {
    try {
      setDataLoading(true);
      const response = await fetchApi(`/get-office-hours?dao_name=${props}`, {
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });

      const result = await response.json();

      const data = {
        ongoing: result.data.ongoing,
        upcoming: result.data.upcoming,
        recorded: result.data.recorded,
      };

      setOriginalData(data);
      setFilteredData(data); // Initially, filtered data is same as original
    } catch (err) {
      setError("Failed to fetch office hours data");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchOfficeHours();
    }
  }, [walletAddress]);

  // Filter data based on search term
  const filterData = (searchTerm: string) => {
    const term = searchTerm.toLowerCase().trim();

    // If search term is empty, restore original data
    if (!term) {
      setFilteredData(originalData);
      return;
    }

    // Filter all categories based on search term
    const newFilteredData = {
      ongoing: originalData.ongoing.filter(
        (meeting) =>
          meeting.title.toLowerCase().includes(term) ||
          meeting.host_address.toLowerCase().includes(term)
      ),
      upcoming: originalData.upcoming.filter(
        (meeting) =>
          meeting.title.toLowerCase().includes(term) ||
          meeting.host_address.toLowerCase().includes(term)
      ),
      recorded: originalData.recorded.filter(
        (meeting) =>
          meeting.title.toLowerCase().includes(term) ||
          meeting.host_address.toLowerCase().includes(term)
      ),
    };

    setFilteredData(newFilteredData);
  };

  // Handle input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchInput(newValue);

    // If search input is cleared, restore original data
    if (!newValue.trim()) {
      setFilteredData(originalData);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      filterData(searchInput);
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    setError(null);
    fetchOfficeHours();
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorDisplay message={error} onRetry={handleRetry} />
      </div>
    );
  }

  // Get current tab data
  const getCurrentViewData = () => {
    const currentTab = searchParams.get("hours") as keyof typeof filteredData;
    return filteredData[currentTab] || [];
  };

  return (
    <div>
      <div className="flex items-center rounded-full shadow-lg my-4 bg-gray-100 text-black cursor-pointer w-[300px] xs:w-[365px]">
        <CiSearch className="text-base transition-all duration-700 ease-in-out ml-3" />
        <input
          type="text"
          placeholder="Search by title and host address (press Enter)"
          className="w-[100%] pl-2 pr-4 py-1.5 font-poppins md:py-2 text-sm bg-transparent outline-none"
          value={searchInput}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="pr-36 pt-3">
        <div className="flex gap-16 border-1 border-[#7C7C7C] pl-6 rounded-xl text-sm">
          <button
            className={`py-2 ${
              searchParams.get("hours") === "ongoing"
                ? "text-[#3E3D3D] font-bold"
                : "text-[#7C7C7C]"
            }`}
            onClick={() =>
              router.push(`${path}?active=officeHours&hours=ongoing`)
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
              router.push(`${path}?active=officeHours&hours=upcoming`)
            }
          >
            Upcoming
          </button>
          <button
            className={`py-2 ${
              searchParams.get("hours") === "recorded"
                ? "text-[#3E3D3D] font-bold"
                : "text-[#7C7C7C]"
            }`}
            onClick={() =>
              router.push(`${path}?active=officeHours&hours=recorded`)
            }
          >
            Recorded
          </button>
        </div>

        <div className="py-10">
          {dataLoading ? (
            <RecordedSessionsSkeletonLoader />
          ) : getCurrentViewData().length === 0 ? (
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
              isRecorded={searchParams.get("hours") === "recorded"}
              data={getCurrentViewData()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default OfficeHours;
