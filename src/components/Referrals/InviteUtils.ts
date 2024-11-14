import { BASE_URL } from "@/config/constants";
import { fetchApi } from "@/utils/api";
import { fetchEnsNameAndAvatar } from "@/utils/ENSUtils";
import { truncateAddress } from "@/utils/text";
import { cache } from "react";

export async function fetchInviteeDetails(userAddress: string) {
  const requestOptions = {
    method: "GET",
    headers: { "Content-Type": "application/json","x-api-key":process.env.NEXT_PUBLIC_API_KEY??'' },
  };

  const res = await fetch(
    `api/profile/${userAddress}`,
    requestOptions
  );
  const response = await res.json();
  // console.log("Line 20",response);  

  const displayImage = response?.data[0]?.image;
  const displayName = response?.data[0]?.displayName;
  // console.log("Line 22",displayName);

  const ensData = await fetchEnsNameAndAvatar(userAddress);
  const ensName = ensData?.ensName;
  const ensAvatar = ensData?.avatar;

  const formattedAddr = truncateAddress(userAddress);

  return {
    displayImage,
    displayName,
    ensName,
    ensAvatar,
    formattedAddr,
  };
}
