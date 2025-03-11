import SpecificDelegate from "@/components/IndividualDelegate/SpecificDelegate";
import { BASE_URL } from "@/config/constants";
import {
  getMetadataEnsData,
} from "@/utils/ENSUtils";
import { Metadata } from "next";
import React from "react";
import { getFrameMetadata } from "@coinbase/onchainkit/core";
import { IMAGE_URL } from "@/config/staticDataUtils";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function sanitizeAvatarUrl(url: string, defaultUrl: string): string {
  try {
    if (!url) return defaultUrl;
    
    const urlObj = new URL(url);
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const hasValidExtension = validExtensions.some(ext => 
      urlObj.pathname.toLowerCase().endsWith(ext)
    );
    
    // Check for data URLs (base64 images)
    const isDataUrl = url.startsWith('data:image/');
    
    // If it's an image URL with a valid extension or a data URL, return it
    if (hasValidExtension || isDataUrl) {
      return url;
    }
    
    // If it has a protocol other than http/https that's not a data URL, use default
    if (!urlObj.protocol.match(/^https?:$/i) && !isDataUrl) {
      return defaultUrl;
    }

    if (url.includes('/ipfs/')) {
      const ipfsHashMatch = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
      if (ipfsHashMatch && ipfsHashMatch[1]) {
        if (url.includes('cloudflare-ipfs.com')) {
          return `https://ipfs.io/ipfs/${ipfsHashMatch[1]}`;
        }
      }
    }

    if (url.includes('<svg') || url.includes('</svg>')) {
      return defaultUrl;
    }
    
    return url;
  } catch (error) {
    console.error("Error validating avatar URL:", error);
    return defaultUrl;
  }
}

async function prepareOgImage(params: Type) {
  const ensData = await getMetadataEnsData(params.individualDelegate);
  const defaultAvatar = IMAGE_URL; 

  let avatarUrl = defaultAvatar;

  try {
    const response = await fetch(
      `${BASE_URL}/api/get-avatar?address=${params.individualDelegate}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.avatarUrl) {
        avatarUrl = sanitizeAvatarUrl(data.avatarUrl, defaultAvatar);
      } else {
        console.log("No avatar found from API, using default");
      }
    } else {
      console.log("Failed to fetch avatar from API, using default");
    }
  } catch (error) {
    console.error("Error fetching avatar from API:", error);
  }
  const dao_name = params.daoDelegates;

  const imgParams = [
    `avatar=${encodeURIComponent(avatarUrl)}`,
    dao_name ? `dao_name=${encodeURIComponent(dao_name)}` : null,
  ].filter((param): param is string => param !== null);

  const imageAPiUrl = `${BASE_URL}/api/images/og/ccTest?${imgParams.join(
    "&"
  )}&address=${ensData.formattedAddress}`;

  try {
    // This will trigger the API call and ensure the image is generated
    const imgResponse = await fetch(imageAPiUrl);
    if (!imgResponse.ok) {
      console.error("Failed to generate OG image:", imgResponse.status);
    }
  } catch (error) {
    console.error("Error pre-warming OG image:", error);
  }
  
  return imageAPiUrl;
}

export async function generateMetadata({
  params,
}: {
  params: Type;
}): Promise<Metadata> {
  const name = "Chora Club";

  const imageApiUrl = await prepareOgImage(params);
  const frameMetadata = getFrameMetadata({
    buttons: [
      {
        label: "Delegate",
        action: "tx",
        target: `https://farcaster-frames-ivory.vercel.app/api/transaction`,
      },
    ],
    image: imageApiUrl,
    post_url: imageApiUrl,
  });

  return {
    title: name,
    description: "Chora Club",
    openGraph: {
      title: name,
      description: "Delegate",
      images: [imageApiUrl],
    },
    other: {
      ...frameMetadata,
      "fc:frame:image:aspect_ratio": "1.91:1",
    },
  };
}



function page({ params }: { params: Type }) {
  return (
    <div>
      <SpecificDelegate props={params} />
    </div>
  );
}

export default page;
