import Image, { StaticImageData } from "next/image";
import React, { useEffect, useRef, useState } from "react";
import search from "@/assets/images/daos/search.png";
import texture1 from "@/assets/images/daos/texture1.png";
import oplogo from "@/assets/images/daos/op.png";
import arblogo from "@/assets/images/daos/arbitrum.jpg";
import arbcir from "@/assets/images/daos/arb.png";
import toast, { Toaster } from "react-hot-toast";
import copy from "copy-to-clipboard";
import { useRouter } from "next-nprogress-bar";
import RecordedSessionsTile from "../ComponentUtils/RecordedSessionsTile";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";
import ErrorDisplay from "../ComponentUtils/ErrorDisplay";
import { TimeoutError } from "viem";
import { CiSearch } from "react-icons/ci";
import { daoConfigs } from "@/config/daos";
import { toLowerCase } from "video.js/dist/types/utils/str";
import { DAOLogo } from "../DAOs/DAOlogos";

function RecordedSessions() {
  // const parseISO = dateFns;
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [meetingData, setMeetingData] = useState<any>([]);
  const [karmaImage, setKarmaImage] = useState<any>();
  const [displayIFrame, setDisplayIFrame] = useState<number | null>(null);
  const router = useRouter();
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null); // Track which video is hovered
  const videoRefs = useRef<any>([]);
  const [videoDurations, setVideoDurations] = useState<any>({});
  const [searchMeetingData, setSearchMeetingData] = useState<any>([]);
  const [activeButton, setActiveButton] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [openSearch, setOpenSearch] = useState(false);
  const renderStartTime = useRef<number | null>(null);

  const excludedDaos = ["arbitrumSepolia"];

  useEffect(() => {
    // Capture the start time
    renderStartTime.current = performance.now();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Capture the end time and calculate render duration
      const renderEndTime = performance.now();
      const renderDuration = renderEndTime - (renderStartTime.current || 0);
      //console.log(`RecordedSessions component rendered in ${renderDuration.toFixed(2)} ms`);
    }
  }, [isLoading]);

  useEffect(() => {
    getRecordedMeetings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openSearch &&
        !(event.target as Element).closest(".search-container")
      ) {
        setOpenSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openSearch]);

  const handleRetry = () => {
    setError(null);
    getRecordedMeetings();
  };

  const getRecordedMeetings = async (isLoadMore = false) => {
    try {
      setIsLoading(true);
      if (!isLoadMore) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
        setIsLoading(false);
      }
      setError(null);
      const response = await fetch(
        // `/api/get-recorded-meetings`, 
        `/api/get-recorded-meetings?page=${isLoadMore ? page + 1 : 1}&limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resultData = await response.json();

      if (resultData.success) {
        // setMeetingData(resultData.data);
        // setSearchMeetingData(resultData.data);
        if (isLoadMore) {
          setMeetingData([...meetingData, ...resultData.data]);
          setSearchMeetingData([...searchMeetingData, ...resultData.data]);
          setPage(page + 1);
        } else {
          setMeetingData(resultData.data);
          setSearchMeetingData(resultData.data);
          setPage(1);
        }
        setHasMore(resultData.data.length === 10);
      } else {
        throw new Error(resultData.message || "Failed to fetch meeting data");
      }
    } catch (error) {
      console.log("error in catch", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setError("Please check your internet connection and try again.");
      } else if (error instanceof TimeoutError) {
        setError(
          "The request is taking longer than expected. Please try again."
        );
      } else if (error instanceof SyntaxError) {
        setError(
          "We're having trouble processing the data. Please try again later."
        );
      } else {
        setError(
          "Unable to load recorded meetings. Please try again in a few moments."
        );
      }
    } finally {
      // setIsLoading(false);
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleLoadMore = () => {
    getRecordedMeetings(true);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = searchMeetingData.filter((item: any) => {
        const lowercaseQuery = query.toLowerCase();
        const lowercaseAddress = item.host_address.toLowerCase();
        const lowercaseTitle = item.title.toLowerCase();

        return (
          lowercaseAddress.includes(lowercaseQuery) ||
          lowercaseTitle.includes(lowercaseQuery)
        );
      });

      setMeetingData(filtered);
    } else {
      setMeetingData(searchMeetingData);
    }
  };

  const handleFilters = (params: string) => {
    if (params) {
      setActiveButton(params);
      const filtered = searchMeetingData.filter((item: any) => {
        return item.dao_name.includes(params);
      });

      setMeetingData(filtered);
    } else {
      setActiveButton("all");
      setMeetingData(searchMeetingData);
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorDisplay message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <>
      <div className="">
        <div className="flex my-4 justify-end md:justify-start items-center gap-2 sm:gap-3 md:gap-4 font-robotoMono px-4 sm:px-0">
          {/* <div
            style={{ background: "rgba(238, 237, 237, 0.36)" }}
            className="hidden md:flex border-[0.5px] border-black w-1/3 rounded-full"
          >
            <input
              type="text"
              placeholder="Search by title and host address"
              style={{ background: "rgba(238, 237, 237, 0.36)" }}
              className="pl-5 rounded-full outline-none w-full"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            ></input>
            <span className="flex items-center bg-black rounded-full px-5 py-2">
              <Image src={search} alt="search" width={20} />
            </span>
          </div> */}
          <div
            className={` hidden md:flex items-center rounded-full shadow-lg bg-gray-100 text-black cursor-pointer w-[365px]`}
          >
            <CiSearch
              className={`text-base transition-all duration-700 ease-in-out ml-3`}
            />
            <input
              type="text"
              placeholder="Search by title and host address"
              className="w-[100%] pl-2 pr-4 py-2 text-sm bg-transparent outline-none"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className=" md:hidden search-container relative flex justify-end">
            <div
              className={` md:hidden transition-all duration-500 flex items-center rounded-full shadow-lg bg-gray-100 text-black cursor-pointer ${openSearch ? "w-full" : "w-7 h-7 justify-center"
                }`}
              onClick={() => {
                setOpenSearch(!openSearch);
              }}
            >
              <CiSearch
                className={`text-base transition-all duration-700 ease-in-out ${openSearch ? "ml-3" : ""
                  }`}
              />
              {openSearch && (
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-2 pr-4 py-1 sm:py-1.5 text-sm transition-all duration-700 ease-in-out bg-transparent outline-none"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </div>
          {/* <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
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
          </div> */}
        </div>

        {isLoading ? (
          <RecordedSessionsSkeletonLoader />
        ) : meetingData && meetingData.length > 0 ? (
          <>
            <RecordedSessionsTile meetingData={meetingData} />
            {hasMore && (
              <div className="flex justify-center mt-6 mb-8">
                <button
                  className="bg-blue-shade-100 text-white py-2 px-4 w-fit rounded-lg font-medium"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading..." : "View More"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <div className="text-5xl">☹️</div>{" "}
            <div className="pt-4 font-semibold text-lg">
              {searchQuery
                ? `No search results found for "${searchQuery}"`
                : "Oops, no such result available!"}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default RecordedSessions;
