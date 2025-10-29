"use client";

import React, { useState, useEffect } from "react";
import search from "@/assets/images/daos/search.png";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import text1 from "@/assets/images/daos/texture1.png";
import text2 from "@/assets/images/daos/texture2.png";
import { StaticImageData } from "next/image";
import { Oval } from "react-loader-spinner";
import { Tooltip } from "@nextui-org/react";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { RxCross2 } from "react-icons/rx";
import SessionTileSkeletonLoader from "../SkeletonLoader/SessionTileSkeletonLoader";
import { useAccount } from "wagmi";
import SidebarMainMobile from "../MainSidebar/SidebarMainMobile";
import MobileResponsiveMessage from "../MobileResponsiveMessage/MobileResponsiveMessage";
import Heading from "../ComponentUtils/Heading";
import { CiSearch } from "react-icons/ci";
import { usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import OfficeHoursAlertMessage from "../AlertMessage/OfficeHoursAlertMessage";
import { OfficeHoursProps } from "@/types/OfficeHoursTypes";
import OfficeHourTile from "../ComponentUtils/OfficeHourTile";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";
import { BookOpen, Calendar, Clock } from "lucide-react";
import NoResultsFound from "@/utils/Noresult";
import useSWR from 'swr'
interface Type {
  img: StaticImageData;
  title: string;
  dao: string;
  participant: number;
  attendee: string;
  host: string;
  started: string;
  desc: string;
}
interface GTMEvent {
  event: string;
  category: string;
  action: string;
  label: string;
  value?: number;
}

function DaoOfficeHours() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const { getAccessToken } = usePrivy();
  const [dataLoading, setDataLoading] = useState(true);
  const [activeButton, setActiveButton] = useState("all");
  const { address } = useAccount()

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

  // Fetch data from API
  // useEffect(() => {
  //   const fetchOfficeHours = async () => {
  //     try {
  //       setDataLoading(true);
  //       const response = await fetchApi(`/get-office-hours`, {
  //         headers: {
  //           Authorization: `Bearer ${await getAccessToken()}`,
  //         },
  //       });

  //       const result = await response.json();

  //       const data = {
  //         ongoing: result.data.ongoing,
  //         upcoming: result.data.upcoming,
  //         recorded: result.data.recorded,
  //       };

  //       setOriginalData(data);
  //       setFilteredData(data); // Initially, filtered data is same as original
  //     } catch (error) {
  //       console.error("Error fetching office hours:", error);
  //     } finally {
  //       setDataLoading(false);
  //     }
  //   };

  //   if (walletAddress) {
  //     fetchOfficeHours();
  //   }
  // }, [walletAddress]);

  // In your DaoOfficeHours component
  const { data, error, mutate } = useSWR(
    address ? '/get-office-hours' : null,
    async () => {
      const response = await fetchApi(`/get-office-hours`, {
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });
      return response.json();
    },
    {
      revalidateOnFocus: true,  // Revalidate when user comes back to the tab
      revalidateOnMount: true,  // Revalidate when component mounts
      dedupingInterval: 10000,  // Don't make duplicate requests within 10 seconds
    }
  );

  // Process data when it arrives
  useEffect(() => {
    if (data) {
      const processedData = {
        ongoing: data.data.ongoing,
        upcoming: data.data.upcoming,
        recorded: data.data.recorded,
      };

      setOriginalData(processedData);
      setFilteredData(processedData);
      setDataLoading(false);
    }
  }, [data]);

  // Search function
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
          item.title.toLowerCase().includes(term) ||
          item.host_address.toLowerCase().includes(term)
      ),
      upcoming: originalData.upcoming.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.host_address.toLowerCase().includes(term)
      ),
      recorded: originalData.recorded.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.host_address.toLowerCase().includes(term)
      ),
    };

    setFilteredData(newFilteredData);
  };

  const applyFilters = (searchTerm: string, daoFilter: string) => {
    const term = searchTerm.toLowerCase();

    const filterBySearchAndDao = (items: OfficeHoursProps[]) => {
      return items.filter((item) => {
        const matchesSearch =
          !term ||
          item.title.toLowerCase().includes(term) ||
          item.host_address.toLowerCase().includes(term);

        const matchesDao =
          daoFilter === "all" ||
          item.dao_name.toLowerCase().includes(daoFilter.toLowerCase());

        return matchesSearch && matchesDao;
      });
    };

    const newFilteredData = {
      ongoing: filterBySearchAndDao(originalData.ongoing),
      upcoming: filterBySearchAndDao(originalData.upcoming),
      recorded: filterBySearchAndDao(originalData.recorded),
    };

    setFilteredData(newFilteredData);
  };

  const handleFilters = (daoName: string) => {
    const newActiveButton = daoName || "all";
    setActiveButton(newActiveButton);
    applyFilters(searchQuery, newActiveButton);
  };

  // Get current data based on selected tab
  const getCurrentData = () => {
    const currentTab = searchParams.get("hours") as keyof typeof filteredData;
    return filteredData[currentTab] || [];
  };

  const handleNavigation = (url: string, category: string, action: string, label: string) => {

    router.push(url);
    const tab = url.includes('?hours=') ? url.split('?hours=')[1] : '';

    // Force revalidate data when switching to certain tabs
    if (tab === 'ongoing' || tab === 'upcoming' || tab === 'recorded') {
      mutate(); // This will re-fetch fresh data from the API
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
        <Heading />
      </div>

      <div className="relative w-full px-4 md:px-6 lg:px-14 pb-8 font-robotoMono">
        <div className="bg-blue-shade-500 rounded-xl shadow-lg p-6 mb-8 border border-blue-shade-200">
          {/* Tab buttons */}
          <div className="flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap mb-6">
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-blue-shade-300 shadow-md ${searchParams.get("hours") === "ongoing"
                ? "text-gray-200 font-semibold bg-blue-shade-300"
                : "text-dark-text-secondary bg-blue-shade-500"
                }`}
              onClick={() => handleNavigation(path + '?hours=ongoing', 'Lectures Navigation', 'Live Tab Clicked', 'Live')}
            >
              <Clock size={16} className="drop-shadow-lg" />
              Live
            </button>
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-blue-shade-300 shadow-md ${searchParams.get("hours") === "upcoming"
                ? "text-gray-200 font-semibold bg-blue-shade-300"
                : "text-dark-text-secondary bg-blue-shade-500"
                }`}
              onClick={() => handleNavigation(path + "?hours=upcoming", 'Lectures Navigation', 'Scheduled Tab Clicked', 'Scheduled')}
            >
              <Calendar size={16} className="drop-shadow-lg" />
              Scheduled
            </button>
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-blue-shade-300 shadow-md ${searchParams.get("hours") === "recorded"
                ? "text-gray-200 font-semibold bg-blue-shade-300"
                : "text-dark-text-secondary bg-blue-shade-500"
                }`}
              onClick={() => handleNavigation(path + "?hours=recorded", 'Lectures Navigation', 'Recorded Tab Clicked', 'Recorded')}
            >
              <BookOpen size={16} className="drop-shadow-lg" />
              Recorded
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center rounded-full shadow-lg bg-[#c2defd22] text-white cursor-pointer w-full max-w-md mb-6">
            <CiSearch className="text-xl text-gray-400 ml-4" />
            <input
              type="text"
              placeholder="Search by title or host address"
              className="w-full pl-3 pr-4 py-3 font-robotoMono text-base bg-transparent outline-none text-gray-100 placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="mt-6">
            {dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : getCurrentData().length > 0 ? (
              <OfficeHourTile
                isOngoing={searchParams.get("hours") === "ongoing"}
                isUpcoming={searchParams.get("hours") === "upcoming"}
                isRecorded={searchParams.get("hours") === "recorded"}
                data={getCurrentData()}
              />
            ) : (
              <NoResultsFound />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DaoOfficeHours;
