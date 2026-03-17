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
import { BookOpen, Calendar, Clock, VideoIcon } from "lucide-react";
import NoResultsFound from "@/utils/Noresult";
import useSWR from 'swr'
import UploadedVideosTab from "../ComponentUtils/UploadedVideosTab";
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
    uploaded: [] as OfficeHoursProps[],
  });

  // Filtered data based on search
  const [filteredData, setFilteredData] = useState({
    ongoing: [] as OfficeHoursProps[],
    upcoming: [] as OfficeHoursProps[],
    recorded: [] as OfficeHoursProps[],
    uploaded: [] as OfficeHoursProps[],
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
      revalidateOnFocus: false,  // Revalidate when user comes back to the tab
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      errorRetryCount: 0,
      revalidateOnMount: true,  // Revalidate when component mounts
      dedupingInterval: 10000,  // Don't make duplicate requests within 10 seconds
    }
  );

  // Process data when it arrives
  useEffect(() => {
    if (data) {
      const processedData = {
        ongoing: data.data.ongoing || [],
        upcoming: data.data.upcoming || [],
        recorded: data.data.recorded || [],
        uploaded: [] as OfficeHoursProps[],
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
      uploaded: originalData.uploaded.filter(
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
      uploaded: filterBySearchAndDao(originalData.uploaded),
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
    <div className="min-h-screen">
      <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
        <Heading />
      </div>

      <div className="relative w-full px-4 md:px-6 lg:px-14 pb-8 font-robotoMono">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-6 sm:p-8 mb-8 border border-white/10 shadow-2xl">
          {/* Tab buttons */}
          <div className="flex gap-2 0.5xs:gap-3 rounded-xl text-sm flex-wrap mb-8">
            <button
              className={`py-2.5 px-5 flex gap-2 items-center rounded-full transition-all duration-300 whitespace-nowrap border ${searchParams.get("hours") === "ongoing"
                  ? "text-white font-semibold bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "text-white/60 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              onClick={() => handleNavigation(path + '?hours=ongoing', 'Lectures Navigation', 'Live Tab Clicked', 'Live')}
            >
              <Clock size={16} className={searchParams.get("hours") === "ongoing" ? "text-primary" : "text-white/40"} />
              Live
            </button>
            <button
              className={`py-2.5 px-5 flex gap-2 items-center rounded-full transition-all duration-300 whitespace-nowrap border ${searchParams.get("hours") === "upcoming"
                  ? "text-white font-semibold bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "text-white/60 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              onClick={() => handleNavigation(path + "?hours=upcoming", 'Lectures Navigation', 'Scheduled Tab Clicked', 'Scheduled')}
            >
              <Calendar size={16} className={searchParams.get("hours") === "upcoming" ? "text-primary" : "text-white/40"} />
              Scheduled
            </button>
            <button
              className={`py-2.5 px-5 flex gap-2 items-center rounded-full transition-all duration-300 whitespace-nowrap border ${searchParams.get("hours") === "recorded"
                  ? "text-white font-semibold bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "text-white/60 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              onClick={() => handleNavigation(path + "?hours=recorded", 'Lectures Navigation', 'Recorded Tab Clicked', 'Recorded')}
            >
              <BookOpen size={16} className={searchParams.get("hours") === "recorded" ? "text-primary" : "text-white/40"} />
              Recorded
            </button>
            <button
              className={`py-2.5 px-5 flex gap-2 items-center rounded-full transition-all duration-300 whitespace-nowrap border ${searchParams.get("hours") === "uploaded"
                  ? "text-white font-semibold bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "text-white/60 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              onClick={() => handleNavigation(path + "?hours=uploaded", 'Lectures Navigation', 'Uploaded Tab Clicked', 'Uploaded')}
            >
              <VideoIcon size={16} className={searchParams.get("hours") === "uploaded" ? "text-primary" : "text-white/40"} />
              Uploaded
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center rounded-2xl bg-white/[0.05] border border-white/10 text-white cursor-pointer w-full max-w-md mb-8 focus-within:border-primary/50 focus-within:bg-white/[0.08] transition-all group">
            <CiSearch className="text-xl text-white/40 ml-4 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by title or host address"
              className="w-full pl-3 pr-4 py-3.5 font-robotoMono text-base bg-transparent outline-none text-white placeholder-white/30"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="mt-6">
            {searchParams.get("hours") === "uploaded" ? (
              <UploadedVideosTab />
            ) : dataLoading ? (
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
