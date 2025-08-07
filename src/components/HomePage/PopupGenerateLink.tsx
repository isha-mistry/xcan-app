import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Image from "next/image";
import rectangle from "@/assets/images/Homepage/Rectangle.png";
import logo from "@/assets/images/Homepage/CC-logo.png";
import arb from "@/assets/images/daos/arb.png";
import op from "@/assets/images/daos/op.png";
import user from "@/assets/images/user/user2.svg";
import { fetchEnsNameAndAvatar, fetchEnsName } from "@/utils/ENSUtils";
import { useAccount } from "wagmi";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import { Check, Copy } from "lucide-react";

interface PopupProps {
  onclose: () => void;
  dao: string;
}
function PopupGenerateLink({ onclose, dao }: PopupProps) {
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const { address } = useAccount();
  const { authenticated } = usePrivy();
  const [copied, setCopied] = useState(false);

  const generateUrl = () => {
    return `${window.location.origin}/${dao}/${address}?active=info`;
  };

  //   const handleCopy = async () => {
  //     try {
  //       await navigator.clipboard.writeText(generateUrl());
  //       setCopied(true);
  //       setTimeout(() => setCopied(false), 2000);
  //     } catch (err) {
  //       console.error("Failed to copy text: ", err);
  //     }
  //   };

  const handleCopy = () => {
    // Logic to copy the URL to the clipboard
    navigator.clipboard.writeText(generateUrl());
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (address && authenticated) {
        try {
          // Fetch user profile from your API
          const token = await getAccessToken();
          const myHeaders: HeadersInit = {
            "Content-Type": "application/json",
            ...(address && {
              "x-wallet-address": address,
              Authorization: `Bearer ${token}`,
            }),
          };

          const raw = JSON.stringify({ address: address });

          const requestOptions: any = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          };

          const res = await fetchApi(
            `/profile/${address.toLowerCase()}`,
            requestOptions
          );
          const dbResponse = await res.json();

          if (dbResponse.data.length > 0) {
            const profileImage = dbResponse.data[0]?.image;
            setUserProfileImage(
              profileImage
                ? `https://gateway.lighthouse.storage/ipfs/${profileImage}`
                : null
            );
          }

          // Fetch ENS data
          const ensData = await fetchEnsNameAndAvatar(address);
          setEnsAvatar(ensData?.avatar || null);

          //ENs name
          const displayName = await fetchEnsName(address);
          setEnsName(displayName.ensName);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, [address]);

  const name = () => {
    console.log(ensName, "name");
    if (ensName) {
      return ensName;
    } else return address;
  };
  const userImage = () => {
    if (ensAvatar) {
      return ensAvatar;
    } else if (userProfileImage) {
      return userProfileImage;
    } else {
      return user;
    }
  };
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50  overflow-hidden p-4">
        <div
          className="absolute inset-0 backdrop-blur-md"
          onClick={onclose}
        ></div>

        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
          <div className="p-2 0.5xs:p-6 xm:p-10 bg-white rounded-3xl shadow-xl text-center max-w-[320px] 0.5xs:max-w-[380px] xs:max-w-md xm:max-w-lg transform transition duration-300 hover:scale-105 mx-2">
            <div className="bg-black rounded-full size-5 p-px flex justify-center items-center absolute top-5 right-5">
              <IoClose
                className="cursor-pointer w-5 h-5 text-white "
                onClick={onclose}
              />
            </div>
            <h2 className="font-bold text-2xl 0.2xs:text-3xl text-gray-900 my-6 0.2xs:my-4 px-2 0.2xs:px-0">
              Get More Delegations with Farcaster Frames
            </h2>

            <p className="text-left font-tektur text-xs 0.5xs:text-sm text-gray-700 mb-6 leading-relaxed bg-blue-50 p-4 rounded-lg shadow-inner">
              Copy your personalized link and share it as a Farcaster frame to
              stand out. Frames make it easy to highlight your role and invite
              others to delegate their tokens to you.
            </p>

            <div className="mb-6">
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-2xl shadow-sm">
                {/* <input
                  type="text"
                  value={generateUrl()}
                  readOnly
                  className="w-full bg-transparent text-gray-700 text-sm focus:outline-none font-medium overflow-scroll"
                /> */}
                <div className="flex-grow overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:mt-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:transition-all [&::-webkit-scrollbar]:duration-300  [&::-webkit-scrollbar-track]:rounded-full  [&::-webkit-scrollbar-thumb]:rounded-full  [&::-webkit-scrollbar-thumb]:bg-blue-200  [&::-webkit-scrollbar-track]:bg-white  hover:[&::-webkit-scrollbar-thumb]:bg-blue-200">
                  <div className="w-full bg-transparent text-gray-700 text-sm font-medium whitespace-nowrap">
                    {generateUrl()}
                  </div>
                </div>
                {/* <div className="w-full bg-transparent text-gray-700 text-sm focus:outline-none font-medium overflow-scroll">{generateUrl()}</div> */}
                <button
                  onClick={handleCopy}
                  className="p-2  rounded-lg transition-colors"
                  title={copied ? "Copied!" : "Copy to clipboard"}
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-blue-shade-200" />
                  ) : (
                    <Copy className="w-5 h-5 text-blue-shade-200 hover:text-blue-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-3 xs:p-4 flex justify-between  w-full shadow-sm font-tektur gap-1">
              <div>
                <div className="flex gap-1.5 xs:gap-3 my-2">
                  <Image
                    src={userImage()}
                    alt=""
                    width={44}
                    height={44}
                    className="size-8 xs:size-11 rounded-full"
                  />
                  <Image
                    src={dao === "optimism" ? op : arb}
                    alt=""
                    className="size-8 xs:size-11"
                  />
                </div>
                <h2 className="text-xs xs:text-sm text-left font-medium">
                  {" "}
                  You are invited to delegate
                  <br /> your Voting Power on
                </h2>
                <div className="flex gap-1 xm:gap-2 items-center text-[10px] xs:text-sm mt-3">
                  <div className="py-1 px-2 xs:py-2 xs:px-4 bg-blue-shade-200 rounded-full text-white">
                    {dao.charAt(0).toUpperCase() + dao.slice(1)}
                  </div>
                  to
                  <div className="py-1 px-2 xs:py-2 xs:px-4 bg-blue-shade-200 rounded-full text-white">
                    {ensName || address?.slice(0, 4) + "..." + address?.slice(-4)}
                  </div>
                </div>
              </div>

              <div className="relative">
                <Image
                  src={rectangle}
                  alt=""
                  className="h-auto w-32 xs:w-36 bg-blue-shade-100 rounded-2xl"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <Image src={logo} alt="Logo" className="size-10 xs:size-16" />
                  <span className="text-white font-medium mt-2 text-xs">
                    Xcan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PopupGenerateLink;
