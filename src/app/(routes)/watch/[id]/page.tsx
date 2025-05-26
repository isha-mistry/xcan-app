import WatchComponentMain from "@/components/WatchMeeting/WatchComponentMain";
import React, { useEffect } from "react";
import { Metadata } from "next";
import { getMetadataEnsData } from "@/utils/ENSUtils";
import { IMAGE_URL } from "@/config/staticDataUtils";
import { BASE_URL } from "@/config/constants";
interface Type {
  id: string;
}

export const revalidate = 0;

async function getWatchData(id: string) {
  const requestOptions: RequestInit = {
    method: "GET",
    redirect: "follow",
    cache: "no-store", // Important for dynamic data!
  };
  const response = await fetch(
    `${BASE_URL}/api/get-watch-data/${id}`,
    requestOptions
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch watch data: ${response.status}`);
  }

  const result = await response.json();
  return result.data[0];
}

async function prepareOgImage(watchData: any) {
  let title = watchData.title || "";
  let description = watchData.description || "";
  const dao_name = watchData.dao_name || "";
  const address = watchData.host_address || "";

  const ensData = await getMetadataEnsData(address);
  const defaultAvatar = IMAGE_URL;
  const avatarUrl = watchData.hostProfileInfo?.image
    ? `https://gateway.lighthouse.storage/ipfs/${watchData.hostProfileInfo.image}`
    : defaultAvatar;

  // Trim description if needed
  if (description.length > 60) {
    description = description.substring(0, 60) + "...";
  }
  if (title.length > 45) {
    title = title.substring(0, 45) + "...";
  }

  console.log(title,"title of vifeo")
  // Construct the URL for the image API
  const imageApiUrl = `${BASE_URL}/api/images/og/video?title=${encodeURIComponent(
    title
  )}&desc=${encodeURIComponent(description)}&dao_name=${encodeURIComponent(
    dao_name
  )}&address=${encodeURIComponent(
    ensData.formattedAddress
  )}&avatar=${encodeURIComponent(avatarUrl)}`;

  try {
    // This will trigger the API call and ensure the image is generated
    const imgResponse = await fetch(imageApiUrl);
    if (!imgResponse.ok) {
      console.error("Failed to generate OG image:", imgResponse.status);
    }
  } catch (error) {
    console.error("Error pre-warming OG image:", error);
  }

  return imageApiUrl;
}

export async function generateMetadata({
  params,
}: {
  params: Type;
}): Promise<Metadata> {
  try {
    const watchData = await getWatchData(params.id);

    if (!watchData) {
      return {
        title: "Watch Session Not Found",
        description: "The requested watch session could not be found.",
      };
    }

    const title = watchData.title || "";
    let description = watchData.description || "";
    const dao_name = watchData.dao_name || "";

    const formattedDaoName = dao_name
      ? dao_name.charAt(0).toUpperCase() + dao_name.slice(1)
      : "Unknown DAO"; 

    if (description.length > 55) {
      description = description.substring(0, 55) + "...";
    }

    const imageApiUrl = await prepareOgImage(watchData);

    return {
      title: "Stylus University",
      description: `Watch this video hosted on ${formattedDaoName} DAO on ${title}`,
      openGraph: {
        title: "Stylus University",
        description: `Watch this video hosted on ${formattedDaoName} DAO on ${title}`,
        images: [imageApiUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
      description: "Failed to generate metadata.",
    };
  }
}

function page({ params }: { params: { id: string } }) {
  return (
    <>
      <div>
        <WatchComponentMain props={params} />
      </div>
    </>
  );
}

export default page;
