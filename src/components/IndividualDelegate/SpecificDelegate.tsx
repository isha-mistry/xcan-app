"use client";
import Image from "next/image";
import React, { use, useEffect, useRef, useState } from "react";
import {
  FaXTwitter,
  FaDiscord,
  FaGithub,
  FaEnvelope,
} from "react-icons/fa6";
import { BiSolidMessageRoundedDetail } from "react-icons/bi";
import { IoCopy, IoShareSocialSharp } from "react-icons/io5";
import DelegateInfo from "./DelegateInfo";
import DelegateSessions from "./DelegateSessions";
import DelegateOfficeHrs from "./DelegateOfficeHrs";
import copy from "copy-to-clipboard";
import { Button, Tooltip, useDisclosure } from "@nextui-org/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useAccount } from "wagmi";
import ccLogo from "@/assets/images/icon.svg";
import MainProfileSkeletonLoader from "../SkeletonLoader/MainProfileSkeletonLoader";
import { fetchEnsNameAndAvatar } from "@/utils/ENSUtils";
import Confetti from "react-confetti";
import { connected } from "process";
import { IoMdNotifications } from "react-icons/io";
import { IoMdNotificationsOff } from "react-icons/io";
import { BASE_URL } from "@/config/constants";
import { getChainAddress, getDaoName } from "@/utils/chainUtils";
import { optimism, arbitrum } from "viem/chains";
import RewardButton from "../ClaimReward/RewardButton";
import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { ChevronDownIcon, CloudCog } from "lucide-react";
import Heading from "../ComponentUtils/Heading";
import { SessionRecords } from "@/types/UserProfileTypes";
import { calculateTempCpi } from "@/actions/calculatetempCpi";
import { createPublicClient, http } from "viem";
import ErrorComponent from "../Error/ErrorComponent";
import { Address } from "viem";
import { daoConfigs } from "@/config/daos";
import { RiTelegram2Fill } from "react-icons/ri";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

function SpecificDelegate({ props }: { props: Type }) {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [displayImage, setDisplayImage] = useState("");
  const [description, setDescription] = useState("");
  const [attestationStatistics, setAttestationStatistics] =
    useState<SessionRecords | null>(null);
  const [displayEnsName, setDisplayEnsName] = useState<any>(null);
  const [emailId, setEmailId] = useState<string>();
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Info");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isFromDatabase, setFromDatabase] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [avatar, setAvatar] = useState("");
  const { address } = useAccount();


  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
    setCopiedAddress(addr);
    setTimeout(() => {
      setCopiedAddress(null);
    }, 4000);
  };

  const tabs = [
    { name: "Info", value: "info" },
    { name: "Past Votes", value: "pastVotes" },
    { name: "Sessions", value: "delegatesSession" },
    { name: "Lectures", value: "lectures" },
  ];


  const handleTabChange = (tabValue: string) => {
    // console.log(tabValue);
    const selected = tabs.find((tab) => tab.value === tabValue);
    // console.log(selected);
    if (selected) {
      setSelectedTab(selected.name);
      setIsDropdownOpen(false);
      if (tabValue === "sessions") {
        router.push(path + "?active=delegatesSession&session=book");
      } else if (tabValue === "lectures") {
        router.push(path + `?active=${tabValue}&lectures=ongoing`);
      } else {
        router.push(path + `?active=${tabValue}`);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.matches(":hover")) {
        setIsDropdownOpen(false);
      }
    }, 100);
  };

  useEffect(() => {
    const activeTab = searchParams.get("active");
    if (activeTab) {
      const tab = tabs.find((t) => t.value === activeTab);
      setSelectedTab(tab?.name || "Info");
    }
  }, [searchParams, tabs]);

  useEffect(() => {
    // Lock scrolling when the modal is open
    if (delegateOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [delegateOpen]);

  const [socials, setSocials] = useState({
    twitter: "",
    discord: "",
    github: "",
    telegram: "",
  });


  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error || event.message);
      setErrorOccurred(true);
    };

    // Listen to global error events
    window.addEventListener("error", handleGlobalError);

    return () => {
      // Cleanup
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from your backend API to check if the address exists

        // const dbResponse = await axios.get(`/api/profile/${address}`);

        const token = await getAccessToken();
        const myHeaders: HeadersInit = {
          "Content-Type": "application/json",
          ...(address && {
            "x-wallet-address": address,
            Authorization: `Bearer ${token}`,
          }),
        };

        // const raw = JSON.stringify({
        //   address: props.individualDelegate,
        //   // daoName: props.daoDelegates,
        // });

        const requestOptions: any = {
          method: "GET",
          headers: myHeaders,
          // body: raw,
          redirect: "follow",
        };
        const res = await fetchApi(
          `/profile/${props.individualDelegate}`,
          requestOptions
        );

        const dbResponse = await res.json();

        if (
          dbResponse &&
          Array.isArray(dbResponse.data) &&
          dbResponse.data.length > 0
        ) {
          // Iterate over each item in the response data array
          for (const item of dbResponse.data) {

            if (item.image) {
              setFromDatabase(true);
              setDisplayImage(item.image);
            }
            if (item.isEmailVisible) {
              setIsEmailVisible(true);
              setEmailId(item.emailId);
            }

            setDescription(item.description);
            setAttestationStatistics(item?.meetingRecords ?? null);
            setDisplayName(item.displayName);
            setSocials({
              twitter: item.socialHandles.twitter,
              discord: item.socialHandles.discord,
              github: item.socialHandles.github,
              telegram: item.socialHandles.telegram,
            });
            setIsPageLoading(false);
          }
        } else {
          console.log(
            "Data not found in the database, fetching from third-party API"
          );
          const { avatar: fetchedAvatar } = await fetchEnsNameAndAvatar(
            props.individualDelegate
          );
          setDisplayImage(fetchedAvatar ? fetchedAvatar : "");
          setIsPageLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [props]);

  useEffect(() => {
    const fetchEnsName = async () => {
      // const ensName = await fetchEnsNameAndAvatar(props.individualDelegate);
      const { ensName: fetchedName, avatar: fetchedAvatar } =
        await fetchEnsNameAndAvatar(props.individualDelegate);
      setDisplayEnsName(fetchedName);
      setAvatar(avatar);
    };
    fetchEnsName();
  }, [props]);

  const getImageSource = () => {
    if (!displayImage) {
      return (ccLogo)
    }

    // If image is from database, prepend the IPFS gateway URL
    if (isFromDatabase) {
      return `https://gateway.lighthouse.storage/ipfs/${displayImage}`;
    }

    // If image is from ENS or other source, use it directly
    return displayImage;
  };

  const getImageClassName = () => {
    if (displayImage) {
      return "w-full xs:w-28 xs:h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-3xl";
    }
    return "w-14 h-14 sm:w-20 sm:h-20 lg:w-20 lg:h-20 rounded-3xl";
  };

  return (
    <>
      {/* For Mobile Screen */}
      {/* <MobileResponsiveMessage /> */}

      {/* For Desktop Screen  */}
      <div className="">
        <div className="lg:hidden pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
          <Heading />
        </div>
        {
          isPageLoading ? (
            <MainProfileSkeletonLoader />
          ) :
            errorOccurred == false ? (
              <div className="font-robotoMono">
                {/* {followed && <Confetti recycle={false} numberOfPieces={550} />} */}
                <div className="flex flex-col md:flex-row pb-5 lg:py-5 px-4 md:px-6 lg:px-14 justify-between items-start">
                  <div className="flex flex-col xs:flex-row xs:items-start xs:justify-start items-center lg:items-start justify-center lg:justify-start w-full lg:w-auto">
                    <div
                      className={`${displayImage ? "h-full" : "h-[80vw] xs:h-auto"
                        } relative object-cover rounded-3xl w-full xs:w-auto my-4 xs:my-0`}
                      style={{
                        backgroundColor: "#fcfcfc",
                        border: "2px solid #E9E9E9 ",
                      }}
                    >
                      <div className="w-full h-full xs:w-28 xs:h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 flex items-center justify-center ">
                        {/* <div className="flex justify-center items-center w-40 h-40"> */}
                        <Image
                          src={getImageSource()}
                          alt="user"
                          width={256}
                          height={256}
                          className={getImageClassName()}
                        />
                      </div>
                    </div>
                    <div className="px-4 mt-4 xs:mt-0 md:mt-2 lg:mt-4 w-full xs:w-auto">
                      <div className=" flex items-center py-1">
                        <div className="font-bold text-[22px] xs:text-xl sm:text-xl lg:text-[22px] pr-4">
                          {displayEnsName ||
                            displayName || (
                              <>
                                {props.individualDelegate.slice(0, 6)}...
                                {props.individualDelegate.slice(-4)}
                              </>
                            )}
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                          {/* {socials.discord + socials.discourse + socials.github + socials.twitter} */}
                          <Link
                            href={
                              socials.twitter
                                ? `https://x.com/${socials.twitter}`
                                : ""
                            }
                            className={`border-[0.5px] border-white rounded-full h-fit p-1 ${socials.twitter == ""
                              ? "hidden"
                              : ""
                              }`}
                            style={{
                              backgroundColor: "rgba(217, 217, 217, 0.42)",
                            }}
                            target="_blank"
                          >
                            <FaXTwitter color="white" size={12} />
                          </Link>
                          <Link
                            href={`https://t.me/${socials.telegram}`}
                            className={`border-[0.5px] border-white rounded-full h-fit p-1  ${socials.telegram == ""
                              ? "hidden"
                              : ""
                              }`}
                            style={{
                              backgroundColor: "rgba(217, 217, 217, 0.42)",
                            }}
                            target="_blank"
                          >
                            <RiTelegram2Fill
                              color="white"
                              size={12}
                            />
                          </Link>
                          <Link
                            href={
                              socials.discord
                                ? `https://discord.com/${socials.discord}`
                                : ""
                            }
                            className={`border-[0.5px] border-white rounded-full h-fit p-1 ${socials.discord == ""
                              ? "hidden"
                              : ""
                              }`}
                            style={{
                              backgroundColor: "rgba(217, 217, 217, 0.42)",
                            }}
                            target="_blank"
                          >
                            <FaDiscord color="white" size={12} />
                          </Link>
                          {isEmailVisible && (
                            <Link
                              href={`mailto:${emailId}`}
                              className="border-[0.5px] border-white rounded-full h-fit p-1"
                              style={{
                                backgroundColor: "rgba(217, 217, 217, 0.42)",
                              }}
                              target="_blank"
                            >
                              <FaEnvelope color="white" size={12} />
                            </Link>
                          )}
                          <Link
                            href={
                              socials.github
                                ? `https://github.com/${socials.github}`
                                : ""
                            }
                            className={`border-[0.5px] border-white rounded-full h-fit p-1 ${socials.github == ""
                              ? "hidden"
                              : ""
                              }`}
                            style={{
                              backgroundColor: "rgba(217, 217, 217, 0.42)",
                            }}
                            target="_blank"
                          >
                            <FaGithub color="white" size={12} />
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center py-1">
                        <div>
                          {props.individualDelegate.slice(0, 6)} ...{" "}
                          {props.individualDelegate.slice(-4)}
                        </div>
                        <Tooltip
                          content="Copy"
                          placement="bottom"
                          closeDelay={1}
                          showArrow
                          className="bg-gray-700"
                        >
                          <span className="px-2 cursor-pointer" color="#3E3D3D">
                            <IoCopy
                              onClick={() => handleCopy(`${props.individualDelegate}`)}
                              className={`transition-colors duration-300 ${copiedAddress === `${props.individualDelegate}`
                                ? "text-blue-500"
                                : ""
                                }`}
                            />
                          </span>
                        </Tooltip>
                        <div className="flex space-x-2">
                          <Tooltip
                            content="Copy profile URL to share on Warpcast or Twitter."
                            placement="bottom"
                            closeDelay={1}
                            showArrow
                            className="bg-gray-700"
                          >
                            <Button
                              className="bg-gray-200 hover:bg-gray-300 text-xs sm:text-sm "
                              onClick={() => {
                                if (typeof window === "undefined") return;
                                navigator.clipboard.writeText(
                                  `${BASE_URL}/${props.daoDelegates}/${props.individualDelegate}?active=info`
                                );
                                setIsCopied(true);
                                setTimeout(() => {
                                  setIsCopied(false);
                                }, 3000);
                              }}
                            >
                              <IoShareSocialSharp />
                              {isCopied ? "Copied" : "Share profile"}
                            </Button>
                          </Tooltip>
                        </div>
                        <div style={{ zIndex: "21474836462" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:flex gap-1 xs:gap-2 items-center">
                    <RewardButton />
                    {/* <ConnectWalletWithENS /> */}
                  </div>
                </div>

                <div
                  className="md:hidden mt-4 px-8 xs:px-4 sm:px-8 py-2 sm:py-[10px] bg-[#D9D9D945]"
                  ref={dropdownRef}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className="w-full flex justify-between items-center text-left font-normal rounded-full capitalize text-lg text-blue-shade-100 bg-white px-4 py-2 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onMouseEnter={handleMouseEnter}
                  >
                    <span>{selectedTab}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-700 ${isDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                  <div
                    className={`w-[calc(100vw-3rem)] mt-1 overflow-hidden transition-all duration-700 ease-in-out ${isDropdownOpen
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    <div className="p-2 border border-white-shade-100 rounded-xl bg-white shadow-md">
                      {tabs.map((tab, index) => (
                        <React.Fragment key={tab.value}>
                          <div
                            onClick={() => handleTabChange(tab.value)}
                            className="px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-100 capitalize text-base cursor-pointer"
                          >
                            {tab.name}
                          </div>
                          {index !== tabs.length - 1 && <hr className="my-1" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex gap-12 bg-[#c2defd22] pl-16">
                  <button
                    className={`border-b-2 py-4 px-2  ${searchParams.get("active") === "info"
                      ? " border-blue-300 text-blue-300 font-semibold"
                      : "border-transparent"
                      }`}
                    onClick={() => router.push(path + "?active=info")}
                  >
                    Info
                  </button>
                  <button
                    className={`border-b-2 py-4 px-2 ${searchParams.get("active") === "delegatesSession"
                      ? "text-blue-300 font-semibold border-b-2 border-blue-300"
                      : "border-transparent"
                      }`}
                    onClick={() =>
                      router.push(path + "?active=delegatesSession&session=book")
                    }
                  >
                    Expert Sessions
                  </button>
                  <button
                    className={`border-b-2 py-4 px-2 ${searchParams.get("active") === "lectures"
                      ? "text-blue-300 font-semibold border-b-2 border-blue-300"
                      : "border-transparent"
                      }`}
                    onClick={() =>
                      router.push(path + "?active=lectures&lectures=ongoing")
                    }
                  >
                    Lectures
                  </button>
                </div>

                <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
                  {searchParams.get("active") === "info" && (
                    <DelegateInfo
                      desc={description}
                      attestationCounts={attestationStatistics}
                    />
                  )}
                  {searchParams.get("active") === "delegatesSession" && (
                    <DelegateSessions props={props} />
                  )}
                  {searchParams.get("active") === "lectures" && (
                    <DelegateOfficeHrs />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center w-full h-screen">
                <ErrorComponent message="We're sorry, but something went wrong ! We're Making It Right.." />
              </div>
            )
        }
      </div>
    </>
  );
}

export default SpecificDelegate;
