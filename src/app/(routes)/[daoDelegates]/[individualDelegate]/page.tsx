import SpecificDelegate from "@/components/IndividualDelegate/SpecificDelegate";
import { BASE_URL } from "@/config/constants";
import {
  processAddressOrEnsName,
  resolveENSProfileImage,
  getMetaAddressOrEnsName,
  fetchEnsNameAndAvatar,
  getMetadataEnsData,
} from "@/utils/ENSUtils";
import { Metadata } from "next";
import React, { useEffect } from "react";
import { getFrameMetadata } from "@coinbase/onchainkit/core";
import { IMAGE_URL } from "@/config/staticDataUtils";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

export async function generateMetadata({
  params,
}: {
  params: Type;
}): Promise<Metadata> {
  const name = "Chora Club";

  const address = await getMetaAddressOrEnsName(
    params.daoDelegates,
    params.individualDelegate
  );

  const ensOrTruncatedAddress = await getMetaAddressOrEnsName(
    params.daoDelegates,
    params.individualDelegate
  );

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
        console.log("Successfully fetched avatar from API:", avatarUrl);
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
  const tokenName = "Optimism";

  console.log(ensData,"ens data", ensData.formattedAddress, "formatted address", avatarUrl,"avatarurl")

  const imgParams = [
    `avatar=${encodeURIComponent(avatarUrl)}`,
    dao_name ? `dao_name=${encodeURIComponent(dao_name)}` : null,
  ].filter((param): param is string => param !== null);

  const preview = `${BASE_URL}/api/images/og/ccTest?${imgParams.join(
    "&"
  )}&address=${ensData.formattedAddress}`;

  const frameMetadata = getFrameMetadata({
    buttons: [
      {
        label: "Delegate",
        action: "tx",
        target: `https://farcaster-frames-ivory.vercel.app/api/transaction`,
      },
    ],
    image: preview,
    post_url: preview,
  });

  return {
    title: name,
    description: "Chora Club",
    openGraph: {
      title: name,
      description: "Delegate",
      images: [preview],
    },
    other: {
      ...frameMetadata,
      "fc:frame:image:aspect_ratio": "1.91:1",
    },
  };
}

function sanitizeAvatarUrl(url: string, defaultUrl: string): string {
  try {
    // Check if the URL is empty or null
    if (!url) return defaultUrl;
    
    // Try to create a URL object to validate it
    const urlObj = new URL(url);
    
    // Check for common image file extensions
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
      console.log(`Unsupported URL protocol: ${urlObj.protocol}`);
      return defaultUrl;
    }

    if (url.includes('/ipfs/')) {
      const ipfsHashMatch = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
      if (ipfsHashMatch && ipfsHashMatch[1]) {
        if (url.includes('cloudflare-ipfs.com')) {
          console.log('Switching from Cloudflare IPFS to IPFS.io gateway');
          return `https://ipfs.io/ipfs/${ipfsHashMatch[1]}`;
        }
      }
    }

    if (url.includes('<svg') || url.includes('</svg>')) {
      console.log('Found SVG content in URL, using default instead');
      return defaultUrl;
    }
    
    return url;
  } catch (error) {
    console.error("Error validating avatar URL:", error);
    return defaultUrl;
  }
}

function page({ params }: { params: Type }) {
  return (
    <div>
      <SpecificDelegate props={params} />
    </div>
  );
}

export default page;
