import WatchComponentMain from "@/components/WatchMeeting/WatchComponentMain";
import React, { useEffect } from "react";
import { Metadata } from "next";
import {
  processAddressOrEnsName,
  resolveENSProfileImage,
  getMetaAddressOrEnsName,
  fetchEnsNameAndAvatar,
  fetchEnsName,
  getMetadataEnsData,
} from "@/utils/ENSUtils";
import { getEnsAvatar } from "@wagmi/core";
import { getFrameMetadata } from "@coinbase/onchainkit/core";
import { IMAGE_URL } from "@/config/staticDataUtils";
import { BASE_URL } from "@/config/constants";
interface Type {
  id: string;
}

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
  return result.data[0]; // Assuming your API returns data in this structure
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
    const address = watchData.host_address || "";
    const ensOrTruncatedAddress = await getMetaAddressOrEnsName(
      dao_name,
      address
    );
    const defaultAvatar = IMAGE_URL;
    const avatarUrl =
      `https://gateway.lighthouse.storage/ipfs/${watchData.hostProfileInfo.image}` ||
      defaultAvatar;
    const ensData = await getMetadataEnsData(address);

    const formattedDaoName = dao_name
      ? dao_name.charAt(0).toUpperCase() + dao_name.slice(1)
      : "Unknown DAO"; //Provide a default

    console.log(
      address,
      "address",
      avatarUrl,
      "ens avatar",
      ensData,
      "ens data",
      ensData.formattedAddress,
      "ens name or address"
    );

    if (description.length > 55) {
      description = description.substring(0, 55) + "...";
    }

    // Construct the URL for the image API (assuming it's at /api/og-image)
    const imageApiUrl = `${BASE_URL}/api/images/og/video?title=${encodeURIComponent(
      title
    )}&desc=${encodeURIComponent(description)}&dao_name=${encodeURIComponent(
      dao_name
    )}&address=${ensData.formattedAddress}&avatar=${encodeURIComponent(
      avatarUrl
    )}`;

    return {
      title: "Chora Club",
      description: `Watch this video hosted on ${formattedDaoName} DAO on ${title}`,
      openGraph: {
        title: "Chora Club",
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
