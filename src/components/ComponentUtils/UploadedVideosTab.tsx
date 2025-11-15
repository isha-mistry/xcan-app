"use client";

import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import { UploadedVideo } from "@/types/UploadedVideoTypes";
import OfficeHourTile from "./OfficeHourTile";
import RecordedSessionsSkeletonLoader from "../SkeletonLoader/RecordedSessionsSkeletonLoader";
import NoResultsFound from "@/utils/Noresult";
import { CiSearch } from "react-icons/ci";
import { OfficeHoursProps } from "@/types/OfficeHoursTypes";
import useSWR from "swr";

interface UploadedVideosTabProps {
  userAddress?: string; // If provided, shows only that user's videos; otherwise shows all
}

function UploadedVideosTab({ userAddress }: UploadedVideosTabProps) {
  const { getAccessToken } = usePrivy();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState<UploadedVideo[]>([]);
  const [originalVideos, setOriginalVideos] = useState<UploadedVideo[]>([]);

  // SWR fetcher function
  const fetcher = async (url: string) => {
    const token = await getAccessToken();
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  };

  // Build API URL
  const apiUrl = userAddress
    ? `/api/get-uploaded-videos?user_address=${userAddress}`
    : `/api/get-uploaded-videos`;

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Update videos when data changes
  useEffect(() => {
    if (data?.success && data?.data) {
      setOriginalVideos(data.data);
      setFilteredVideos(data.data);
    }
  }, [data]);

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm);

    if (!searchTerm.trim()) {
      setFilteredVideos(originalVideos);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = originalVideos.filter(
      (video) =>
        video.title.toLowerCase().includes(term) ||
        video.description.toLowerCase().includes(term) ||
        video.user_address.toLowerCase().includes(term)
    );

    setFilteredVideos(filtered);
  };

  // Convert UploadedVideo to OfficeHoursProps format for reuse of OfficeHourTile
  const convertToOfficeHoursProps = (
    video: UploadedVideo
  ): OfficeHoursProps => {
    return {
      title: video.title,
      description: video.description,
      host_address: video.user_address,
      dao_name: "",
      meeting_status: "Recorded",
      status: "active",
      thumbnail_image: video.thumbnail_url || "",
      video_uri: video.video_link,
      startTime: video.created_at?.toString() || video.timestamp.toString(),
      endTime: video.updated_at?.toString() || video.timestamp.toString(),
      reference_id: video.uuid,
      meetingType: 0,
      isEligible: false,
      meeting_starttime: new Date(video.created_at || video.timestamp).getTime(),
      meeting_endtime: new Date(video.updated_at || video.timestamp).getTime(),
      views: video.views,
      deployedContractAddress: "",
      created_at: video.created_at?.toString(),
      meetingId: video.youtube_video_id,
    };
  };

  const officeHoursData: OfficeHoursProps[] = filteredVideos.map(
    convertToOfficeHoursProps
  );

  return (
    <div className="w-full">
      {/* Search bar */}
      {/* <div className="flex items-center rounded-full shadow-lg bg-[#c2defd22] text-white cursor-pointer w-full max-w-md mb-6">
        <CiSearch className="text-xl text-gray-400 ml-4" />
        <input
          type="text"
          placeholder="Search by title, description, or address"
          className="w-full pl-3 pr-4 py-3 font-robotoMono text-base bg-transparent outline-none text-gray-100 placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div> */}

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <RecordedSessionsSkeletonLoader />
        ) : error ? (
          <div className="flex flex-col justify-center items-center">
            <p className="text-gray-400">Error loading videos</p>
          </div>
        ) : officeHoursData.length > 0 ? (
          <OfficeHourTile
            isUploaded={true}
            data={officeHoursData}
          />
        ) : (
          <NoResultsFound />
        )}
      </div>
    </div>
  );
}

export default UploadedVideosTab;

