"use client";

import React, { useState, useEffect } from "react";
import search from "@/assets/images/daos/search.png";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import text1 from "@/assets/images/daos/texture1.png";
import text2 from "@/assets/images/daos/texture2.png";
import { StaticImageData } from "next/image";
import Tile from "../ComponentUtils/Tile";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
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
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";
import OfficeHoursAlertMessage from "../AlertMessage/OfficeHoursAlertMessage";
import { OfficeHoursProps } from "@/types/OfficeHoursTypes";
import OfficeHourTile from "../ComponentUtils/OfficeHourTile";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";
import { BookOpen, Calendar, Clock } from "lucide-react";
import NoResultsFound from "@/utils/Noresult";
import oplogo from "@/assets/images/daos/op.png";
import arbcir from "@/assets/images/daos/arb.png";
import { daoConfigs } from "@/config/daos";
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
  const { walletAddress } = useWalletAddress();
  const [dataLoading, setDataLoading] = useState(true);
  const [activeButton, setActiveButton] = useState("all");
  const excludedDaos = ["arbitrumSepolia"]

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
  walletAddress ? '/get-office-hours' : null,
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

  const pushToGTM = (eventData: GTMEvent) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(eventData);
    }
  };

  const handleNavigation = (url: string, category: string, action: string, label: string) => {
    //setIsNavigating(true); // If you still want to use this in your loading state
    pushToGTM({
      event: 'tab_selection',
      category: category,
      action: action,
      label: label,
    });
    router.push(url);
   const tab = url.includes('?hours=') ? url.split('?hours=')[1] : '';
  
  // Force revalidate data when switching to certain tabs
  if (tab === 'ongoing' || tab === 'upcoming' || tab==='recorded') {
    mutate(); // This will re-fetch fresh data from the API
   }
  };

  // const handleTabChange = (tab:string,  category: string, action: string, label: string) => {
  //   router.push(path + "?hours=" + tab);
  //   pushToGTM({
  //     event: 'tab_selection',
  //     category: category,
  //     action: action,
  //     label: label,
  //   });
    
  //   // Force revalidate data when switching to certain tabs
  //   if (tab === 'ongoing' || tab === 'upcoming') {
  //     mutate(); // This will re-fetch fresh data from the API
  //   }
  // };

  return (
    <>
      {/* For Mobile Screen */}
      <MobileResponsiveMessage />

      {/* For Desktop Screen */}
      <div className="hidden md:block pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
        <Heading />

        <div className="pt-4 font-poppins">
          {/* Tab buttons */}
          <div className="flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap">
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
                searchParams.get("hours") === "ongoing"
                  ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                  : "text-[#3E3D3D] bg-white"
              }`}
              onClick={() => handleNavigation(path + '?hours=ongoing', 'Office Hours Navigation', 'Live Tab Clicked', 'Live')}
            >
              <Clock size={16} className="drop-shadow-lg" />
              Live
            </button>
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
                searchParams.get("hours") === "upcoming"
                  ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                  : "text-[#3E3D3D] bg-white"
              }`}
              // onClick={() => router.push(path + "?hours=upcoming")}
              onClick={() => handleNavigation(path + "?hours=upcoming", 'Office Hours Navigation', 'Scheduled Tab Clicked', 'Scheduled')}
            >
              <Calendar size={16} className="drop-shadow-lg" />
              Scheduled
            </button>
            <button
              className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
                searchParams.get("hours") === "recorded"
                  ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                  : "text-[#3E3D3D] bg-white"
              }`}
              // onClick={() => router.push(path + "?hours=recorded")}
              onClick={() => handleNavigation(path + "?hours=recorded", 'Office Hours Navigation', 'Library Tab Clicked', 'Library')}
            >
              <BookOpen size={16} className="drop-shadow-lg" />
              Library
            </button>
          </div>
          <div className="flex gap-2 sm:gap-3 md:gap-4">
            {/* Search input */}
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
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <button
                className={` px-3 md:px-5 py-1 sm:py-1.5 rounded-lg text-sm lg:text-base ${
                  activeButton === "all"
                    ? "bg-[#8E8E8E] text-white"
                    : "bg-[#F5F5F5] text-[#3E3D3D]"
                }`}
                onClick={() => handleFilters("")}
              >
                All
              </button>

              {Object.entries(daoConfigs)
                .filter(([key]) => !excludedDaos.includes(key)) // Exclude unwanted DAOs
                .map(([key, dao]) => (
                  <button
                    key={key}
                    className="flex items-center justify-center size-[26px] sm:size-[29px] md:size-[29px]"
                    onClick={() => handleFilters(dao.name.toLocaleLowerCase())}
                  >
                    <Image
                      src={dao.logo}
                      width={100}
                      height={100}
                      alt={`${dao.name} logo`}
                      className={`size-full rounded-full ${
                        activeButton === dao.name.toLocaleLowerCase()
                          ? "opacity-100"
                          : "opacity-50"
                      }`}
                    />
                  </button>
                ))}
            </div>
          </div>

          {/* Content area */}
          <div className="py-5">
            {dataLoading ? (
              <RecordedSessionsSkeletonLoader />
            ) : getCurrentData().length === 0 ? (
              <div className="flex flex-col justify-center items-center">
                {/* <div className="text-5xl">☹️</div>
                <div className="pt-4 font-semibold text-lg">
                  Oops, no such result available!
                </div> */}
                <NoResultsFound />
              </div>
            ) : (
              <OfficeHourTile
                isOngoing={searchParams.get("hours") === "ongoing"}
                isUpcoming={searchParams.get("hours") === "upcoming"}
                isRecorded={searchParams.get("hours") === "recorded"}
                data={getCurrentData()}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DaoOfficeHours;
