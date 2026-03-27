"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import copy from "copy-to-clipboard";
import Link from "next/link";
import ccLogo from "@/assets/images/icon.svg";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";;
import lighthouse from "@lighthouse-web3/sdk";
import InstantMeet from "./InstantMeet";
import UserInfo from "./UserInfo";
import UserSessions from "./UserSessions";
import UserOfficeHours from "./UserOfficeHours";
import FollowingModal from "../ComponentUtils/FollowingModal";
import style from "./MainProfile.module.css";
import UpdateProfileModal from "../ComponentUtils/UpdateProfileModal";
import MainProfileSkeletonLoader from "../SkeletonLoader/MainProfileSkeletonLoader";
import SelectDaoButton from "../ComponentUtils/SelectDaoButton";
import RewardButton from "../ClaimReward/RewardButton";
import Heading from "../ComponentUtils/Heading";
import toast, { Toaster } from "react-hot-toast";
import { ChevronDownIcon, ExternalLink } from "lucide-react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { fetchApi } from "@/utils/api";
import { BrowserProvider, Contract } from "ethers";
import { SessionRecords } from "@/types/UserProfileTypes";
import { Tooltip } from "@nextui-org/react";
import { FaXTwitter, FaDiscord, FaGithub } from "react-icons/fa6";
import { BiSolidMessageRoundedDetail } from "react-icons/bi";
import { IoCopy, IoShareSocialSharp } from "react-icons/io5";
import { createPublicClient, http } from "viem";
import { optimism, arbitrum, mantle } from "viem/chains";
import { daoConfigs } from "@/config/daos";
import { FaPencil } from "react-icons/fa6";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { Button, useDisclosure } from "@nextui-org/react";
import { useAccount, useDisconnect } from "wagmi";
import { Oval } from "react-loader-spinner"
import { useSession } from "next-auth/react";
import { BASE_URL, LIGHTHOUSE_BASE_API_KEY } from "@/config/constants";
import { getDaoName } from "@/utils/chainUtils";
import { checkLetsGrowDAODelegateStatus } from "@/utils/checkLetsGrowDAODelegateStatus"
import { useConnection } from "@/app/hooks/useConnection";
import { RiTelegram2Fill } from "react-icons/ri";
import UploadVideoButton from "../ComponentUtils/UploadVideoButton";
import UploadedVideosTab from "../ComponentUtils/UploadedVideosTab";
import ProfileSection from "../BuilderPods/ProfileSection";
import confetti from "canvas-confetti";
import { getBuilderPodBadgeMeta } from "@/lib/builder-pods/badge-ui";
interface Following {
  follower_address: string;
  isFollowing: boolean;
  isNotification: boolean;
}

function MainProfile() {
  const { address, chain } = useAccount();
  const { isConnected } = useConnection();
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { authenticated, login, logout, getAccessToken, user } = usePrivy();
  const { disconnect } = useDisconnect();
  const { wallets } = useWallets();
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selfDelegate, setSelfDelegate] = useState(false);
  const [daoName, setDaoName] = useState("");
  const [attestationStatistics, setAttestationStatistics] = useState<SessionRecords | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isToggled, setToggle] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Info");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [modalData, setModalData] = useState({
    displayImage: "",
    displayName: "",
    emailId: "",
    twitter: "",
    discord: "",
    github: "",
    telegram: "",
  });
  const [userData, setUserData] = useState({
    displayImage: "",
    displayName: "",
    twitter: "",
    discord: "",
    github: "",
    telegram: "",
    description: "",
  });
  // const [isDelegateLoading, setIsDelegateLoading] = useState(true);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [newBadges, setNewBadges] = useState<any[]>([]);
  const tabs = [
    { name: "Info", value: "info" },
    ...(selfDelegate ? [{ name: "Past Votes", value: "votes" }] : []),
    { name: "Sessions", value: "sessions" },
    { name: "Lectures", value: "lectures" },
    ...(selfDelegate ? [{ name: "Instant Meet", value: "instant-meet" }] : []),
    { name: "Uploaded", value: "uploaded" },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  //Functions
  const handleTabChange = (tabValue: string) => {
    const selected = tabs.find((tab) => tab.value === tabValue);
    if (selected) {
      setSelectedTab(selected.name);
      setIsDropdownOpen(false);
      if (tabValue === "sessions") {
        router.push(
          path +
          `?active=${tabValue}&session=${selfDelegate ? "schedule" : "attending"
          }`
        );
      } else if (tabValue === "lectures") {
        router.push(path + `?active=${tabValue}&lectures=schedule`);
      } else {
        router.push(path + `?active=${tabValue}`);
      }
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("persistentWalletAddress");
    await logout();
    disconnect();
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.matches(":hover")) {
        setIsDropdownOpen(false);
      }
    }, 100);
  };

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const uploadImage = async (selectedFile: any) => {
    const apiKey = LIGHTHOUSE_BASE_API_KEY ? LIGHTHOUSE_BASE_API_KEY : "";

    const output = await lighthouse.upload(selectedFile, apiKey);

    setModalData((prevUserData) => ({
      ...prevUserData,
      displayImage: output.data.Hash,
    }));
  };

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
    setCopiedAddress(addr);
    setTimeout(() => {
      setCopiedAddress(null);
    }, 4000);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setModalData((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };

  const handleToggle = async () => {
    setIsLoading(true);
    const isEmailVisible = !isToggled;
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };
      const raw = JSON.stringify({
        address: address,
        isEmailVisible: isEmailVisible,
      });

      const requestOptions: any = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const response = await fetchApi("/profile/emailstatus", requestOptions);

      if (!response.ok) {
        throw new Error("Failed to toggle");
      }

      const data = await response.json();
      setToggle(!isToggled);
    } catch (error) {
      console.error("Error following:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (newDescription?: string) => {
    try {
      // Check if the delegate already exists in the database
      if (typeof newDescription === 'string') {
        setDescription(newDescription);
      }
      setIsLoading(true);
      const isExisting = await checkDelegateExists(address);

      if (isExisting) {
        // If delegate exists, update the delegate
        await handleUpdate(newDescription);
        setIsLoading(false);
        onClose();
      } else {
        // If delegate doesn't exist, add a new delegate
        setIsLoading(false);
        onClose();
      }

      toast.success("Saved");
    } catch (error) {
      console.error("Error handling delegate:", error);
      toast.error("Error saving");
      setIsLoading(false);
    }
  };

  const checkDelegateExists = async (address: any) => {
    try {
      // Make a request to your backend API to check if the address exists
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };

      const raw = JSON.stringify({
        address: address,
      });

      const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const res = await fetchApi(`/profile/${address}`, requestOptions);

      const response = await res.json();

      if (Array.isArray(response.data) && response.data.length > 0) {
        for (const item of response.data) {
          const dbAddress = item.address;
          if (dbAddress.toLowerCase() === address.toLowerCase()) {
            return true; // Return true if match found
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking delegate existence:", error);
      return false;
    }
  };

  const handleUpdate = async (newDescription?: string) => {
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };
      const descriptionToSave = typeof newDescription === 'string' ? newDescription : description;
      const raw = JSON.stringify({
        address: address,
        image: modalData.displayImage,
        isDelegate: true,
        displayName: modalData.displayName,
        emailId: modalData.emailId,
        socialHandles: {
          twitter: modalData.twitter,
          discord: modalData.discord,
          github: modalData.github,
          telegram: modalData.telegram,
        },
        description: descriptionToSave,
      });

      const requestOptions: any = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const response = await fetchApi("/profile", requestOptions);
      const result = await response.json();
      if (response.status === 200) {
        setIsLoading(false);
        setUserData({
          displayImage: modalData.displayImage,
          displayName: modalData.displayName,
          twitter: modalData.twitter,
          discord: modalData.discord,
          github: modalData.github,
          telegram: modalData.telegram,
          description: descriptionToSave,
        });
        // toast.success("Profile updated successfully!");
      } else {
        console.error("Failed to update delegate:", result.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error calling PUT API:", error);
      setIsLoading(false);
    }
  };

  //Hooks
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

  useEffect(() => {
    const currentWalletAddress = user?.wallet?.address;
    if (
      currentWalletAddress &&
      address &&
      currentWalletAddress.toLowerCase() !== address.toLowerCase()
    ) {
      handleLogout();
      login();
    }
  }, [authenticated, address]);

  useEffect(() => {
    const activeTab = searchParams.get("active");
    if (activeTab) {
      const tab = tabs.find((t) => t.value === activeTab);
      setSelectedTab(tab?.name || "Info");
    }
  }, [searchParams, tabs]);

  useEffect(() => {
    if (isConnected && authenticated && path.includes("profile/undefined")) {
      const newPath = path.includes("profile/undefined")
        ? path.replace(
          "profile/undefined",
          `profile/${address}?active=info`
        )
        : path;
      router.replace(`${newPath}`);
    } else if (!isConnected && !authenticated) {
      if (!authenticated) {
        login();
        return;
      } else {
        console.error("openConnectModal is not defined");
      }
    }
  }, [
    isConnected,
    address,
    router,
    session,
    path.includes("profile/undefined"),
  ]);

  useEffect(() => {
    if (!address) return;
    const fetchData = async () => {
      try {
        // setIsDelegateLoading(true);
        const token = await getAccessToken();
        const myHeaders: HeadersInit = {
          "Content-Type": "application/json",
          ...(address && {
            "x-wallet-address": address,
            Authorization: `Bearer ${token}`,
          }),
        };

        const raw = JSON.stringify({
          address: address,
        });

        const requestOptions: any = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };
        const res = await fetchApi(`/profile/${address}`, requestOptions);

        const dbResponse = await res.json();


        if (dbResponse.data.length > 0) {
          setIsPageLoading(false);
          setUserData({
            displayName: dbResponse.data[0]?.displayName,
            discord: dbResponse.data[0]?.socialHandles?.discord,
            twitter: dbResponse.data[0].socialHandles?.twitter,
            github: dbResponse.data[0].socialHandles?.github,
            telegram: dbResponse.data[0]?.socialHandles?.telegram,
            displayImage: dbResponse.data[0]?.image,
            description: dbResponse.data[0]?.description
          });
          setAttestationStatistics(dbResponse.data[0]?.meetingRecords ?? null);

          setModalData({
            displayName: dbResponse.data[0]?.displayName,
            discord: dbResponse.data[0]?.socialHandles?.discord,
            emailId: dbResponse.data[0]?.emailId,
            twitter: dbResponse.data[0]?.socialHandles?.twitter,
            github: dbResponse.data[0]?.socialHandles?.github,
            telegram: dbResponse.data[0]?.socialHandles?.telegram,
            displayImage: dbResponse.data[0]?.image,
          });
          setToggle(dbResponse.data[0]?.isEmailVisible);
          // setDescription(
          //   dbResponse.data[0]?.networks?.find(
          //     (network: any) => network.dao_name === dao
          //   )?.description || ""
          // );

        } else {
          setIsPageLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsPageLoading(false);
      }
    };

    if (address) {
      fetchData();
    }
  }, [address]);

  // Detect newly earned Builder Pods badges and celebrate with confetti.
  // Uses profile API data (already fetched by ProfileSection) to avoid duplicate calls.
  useEffect(() => {
    if (!address) return;
    const wallet = address.toLowerCase();
    const storageKey = `builderPods.badgeIds.${wallet}`;

    const checkBadges = async () => {
      try {
        const res = await fetch(`/api/builder-pods/profile/${wallet}`);
        const data = await res.json();
        if (!data?.success || !Array.isArray(data.badges)) return;

        const ids: string[] = data.badges.map((b: any) => String(b._id));
        const sortedIds = [...ids].sort().join(",");
        const prev = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;

        if (prev && prev !== sortedIds) {
          const prevSet = new Set(prev.split(",").filter(Boolean));
          const newlyEarned = data.badges.filter((b: any) => !prevSet.has(String(b._id)));
          if (newlyEarned.length > 0) {
            setNewBadges(newlyEarned);
            setShowBadgeCelebration(true);
            try {
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.4 },
              });
            } catch {
              // ignore confetti errors
            }
          }
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, sortedIds);
        }
      } catch (e) {
        console.error("Error checking Builder Pods badges:", e);
      }
    };

    checkBadges();
  }, [address]);

  // Poll Builder Pods notifications and celebrate only after on-chain attestation (easUid exists).
  // Tracks processed notification IDs to avoid re-processing the same notifications on every poll.
  // Uses exponential back-off for badge attestation polling (max 3 retries) instead of 60s busy-loop.
  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    const wallet = address.toLowerCase();
    const celebratedKey = `builderPods.celebratedEasUids.${wallet}`;
    const processedNotifIds = new Set<string>();

    const getCelebratedSet = () => {
      try {
        const raw = localStorage.getItem(celebratedKey) || "";
        return new Set(raw.split(",").filter(Boolean));
      } catch {
        return new Set<string>();
      }
    };

    const addCelebrated = (uids: string[]) => {
      try {
        const set = getCelebratedSet();
        uids.forEach((u) => set.add(u));
        localStorage.setItem(celebratedKey, Array.from(set).sort().join(","));
      } catch {
        // ignore storage errors
      }
    };

    const waitForAttestedBadge = async (expectedSlug: string) => {
      const delays = [5000, 10000, 20000];
      for (const delay of delays) {
        if (cancelled) return null;
        try {
          const res = await fetch(`/api/builder-pods/badges/user/${wallet}`);
          const data = await res.json();
          const badges = Array.isArray(data?.badges) ? data.badges : [];
          const match = badges.find(
            (b: any) =>
              b?.badgeSnapshot?.slug === expectedSlug &&
              typeof b?.easUid === "string" &&
              b.easUid.length > 10
          );
          if (match) return match;
        } catch {
          // ignore and retry
        }
        await new Promise((r) => setTimeout(r, delay));
      }
      return null;
    };

    const handleNotification = async (n: any) => {
      const nId = String(n?._id || n?.id || "");
      if (!nId || processedNotifIds.has(nId)) return;
      processedNotifIds.add(nId);

      const type = String(n?.type || "");
      if (type !== "member_approved" && type !== "role_assigned" && type !== "badge_awarded") return;

      const candidateSlugs = ["builder_pod_member", "builder_pod_lead"];
      for (const slug of candidateSlugs) {
        if (cancelled) return;
        const attestedBadge = await waitForAttestedBadge(slug);
        if (!attestedBadge?.easUid) continue;
        const celebrated = getCelebratedSet();
        if (celebrated.has(attestedBadge.easUid)) continue;

        setNewBadges([attestedBadge]);
        setShowBadgeCelebration(true);
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.4 },
          });
        } catch {
          // ignore confetti errors
        }
        addCelebrated([attestedBadge.easUid]);
        break;
      }
    };

    let focusThrottleTimer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/builder-pods/notifications?limit=10`, {
          credentials: "include",
        });
        const data = await res.json();
        const notifications = Array.isArray(data?.notifications) ? data.notifications : [];
        for (const n of notifications.slice(0, 3)) {
          if (cancelled) break;
          await handleNotification(n);
        }
      } catch {
        // ignore polling errors
      }
    };

    poll();
    const interval = setInterval(poll, 60000);
    const onFocus = () => {
      if (focusThrottleTimer) return;
      focusThrottleTimer = setTimeout(() => { focusThrottleTimer = null; }, 30000);
      poll();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (focusThrottleTimer) clearTimeout(focusThrottleTimer);
      window.removeEventListener("focus", onFocus);
    };
  }, [address]);

  const closeBadgeCelebration = () => {
    setShowBadgeCelebration(false);
    setNewBadges([]);
  };

  return (
    <>
      <div className="lg:hidden pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
        <Heading />
      </div>
      {!isPageLoading ? (
        <div className="font-robotoMono">
          <div className="relative flex pb-5 lg:py-5 px-4 md:px-6 lg:px-14 items-start">
            <div className="flex flex-col xs:flex-row xs:items-start xs:justify-start items-center lg:items-start justify-center lg:justify-start w-full lg:w-auto">
              <div
                className={`${userData.displayImage ? "h-full" : "h-[80vw] xs:h-auto"
                  } relative object-cover rounded-3xl w-full xs:w-auto`}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="w-full h-full xs:w-28 xs:h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 flex items-center justify-center ">
                  <Image
                    src={
                      userData.displayImage
                        ? `https://gateway.lighthouse.storage/ipfs/${userData.displayImage}`
                        : daoName && typeof daoConfigs === 'object' && daoConfigs[daoName.toLowerCase()]
                          ? daoConfigs[daoName.toLowerCase()].logo || ccLogo
                          : ccLogo
                    }
                    alt="user"
                    width={256}
                    height={256}
                    className={
                      userData.displayImage
                        ? "w-full xs:w-28 xs:h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-3xl"
                        : "w-14 h-14 sm:w-20 sm:h-20 lg:w-20 lg:h-20 rounded-3xl"
                    }
                    priority={true}
                  />
                </div>
              </div>

              <div className="pl-4 md:px-4 mt-4 xs:mt-0 md:mt-2 lg:mt-4 w-full xs:w-auto">
                <div className=" flex items-center py-1">
                  <div className="font-black text-[22px] xs:text-xl sm:text-xl lg:text-[22px] pr-4 text-white font-unbounded tracking-tight">
                    {userData.displayName ? (
                      userData.displayName
                    ) : (
                      <>
                        {`${address}`.substring(0, 6)} ...{" "}
                        {`${address}`.substring(
                          `${address}`.length - 4
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Link
                      href={`https://x.com/${userData.twitter}`}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1 ${userData.twitter == "" || userData.twitter == undefined
                        ? "hidden"
                        : ""
                        }`}
                      style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                      target="_blank"
                    >
                      <FaXTwitter color="white" size={12} />
                    </Link>
                    <Link
                      href={`https://t.me/${userData.telegram}`}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1  ${userData.telegram == "" ||
                        userData.telegram == undefined
                        ? "hidden"
                        : ""
                        }`}
                      style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                      target="_blank"
                    >
                      <RiTelegram2Fill color="white" size={12} />
                    </Link>
                    <Link
                      href={`https://discord.com/${userData.discord}`}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1 ${userData.discord == "" || userData.discord == undefined
                        ? "hidden"
                        : ""
                        }`}
                      style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                      target="_blank"
                    >
                      <FaDiscord color="white" size={12} />
                    </Link>
                    <Link
                      href={`https://github.com/${userData.github}`}
                      className={`border-[0.5px] border-white rounded-full h-fit p-1 ${userData.github == "" || userData.github == undefined
                        ? "hidden"
                        : ""
                        }`}
                      style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                      target="_blank"
                    >
                      <FaGithub color="white" size={12} />
                    </Link>
                    <Tooltip
                      content="Update your Profile"
                      placement="top"
                      showArrow
                      className="bg-gray-700"
                    >
                      <span
                        className="border-[0.5px] border-white rounded-full h-fit p-1 cursor-pointer"
                        style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                        onClick={onOpen}
                      >
                        <FaPencil color="white" size={10} />
                      </span>
                    </Tooltip>
                    <UpdateProfileModal
                      isOpen={isOpen}
                      onClose={onClose}
                      modalData={modalData}
                      handleInputChange={handleInputChange}
                      uploadImage={uploadImage}
                      fileInputRef={fileInputRef}
                      isLoading={isLoading}
                      handleSave={handleSave}
                      handleToggle={handleToggle}
                      isToggled={isToggled}
                    />
                  </div>
                </div>

                <div className="flex items-center py-1">
                  <div>
                    {`${address}`.substring(0, 6)} ...{" "}
                    {`${address}`.substring(
                      `${address}`.length - 4
                    )}
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
                        onClick={() => handleCopy(`${address}`)}
                        className={`transition-colors duration-300 ${copiedAddress === `${address}`
                          ? "text-blue-500"
                          : ""
                          }`}
                      />
                    </span>
                  </Tooltip>
                  <div className="flex space-x-2">
                    <Tooltip
                      content="Copy your profile URL to share on Warpcast or Twitter."
                      placement="bottom"
                      closeDelay={1}
                      showArrow
                      className="bg-gray-700"
                    >
                      <Button
                        className="bg-white/5 hover:bg-white/10 text-white/60 text-xs sm:text-sm border border-white/10 rounded-full"
                        onPress={() => {
                          if (typeof window === "undefined") return;
                          navigator.clipboard.writeText(
                            `${BASE_URL}/user/${address}?active=info`
                          );
                          setIsCopied(true);
                          setTimeout(() => {
                            setIsCopied(false);
                          }, 3000);
                        }}
                      >
                        <IoShareSocialSharp className="text-blue-400" />
                        {isCopied ? "Copied" : "Share profile"}
                      </Button>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest px-6 py-2 rounded-full transition-all shadow-lg hover:shadow-blue-500/20" onClick={() => {
                    router.push(`/invite`)
                  }}  >Invite</button>
                  <UploadVideoButton userAddress={address || ""} />
                </div>
              </div>
            </div>
            <div className="absolute right-4 md:right-6 lg:right-14 hidden lg:flex gap-1 xs:gap-2 items-center">
              <RewardButton />
            </div>
          </div>

          <div className=" ">
            <div
              className="md:hidden mt-4 px-8 xs:px-4 sm:px-8 py-2 sm:py-[10px] bg-white/[0.02] border-y border-white/5"
              ref={dropdownRef}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="w-full flex justify-between items-center text-left font-bold rounded-full capitalize text-sm text-white bg-white/5 border border-white/10 px-4 py-2.5 cursor-pointer backdrop-blur-xl"
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
                <div className="p-2 border border-white/10 rounded-2xl bg-[#0D1117] shadow-2xl">
                  {tabs.map((tab, index) => (
                    <React.Fragment key={tab.value}>
                      <div
                        onClick={() => handleTabChange(tab.value)}
                        className="px-4 py-3 rounded-xl transition duration-300 ease-in-out hover:bg-white/5 capitalize text-sm font-bold text-white/70 hover:text-white cursor-pointer"
                      >
                        {tab.name}
                      </div>
                      {index !== tabs.length - 1 && <hr className="my-1 border-white/5" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`bg-white/[0.02] border-y border-white/5 hidden md:flex overflow-x-auto whitespace-nowrap gap-6 xs:gap-8 sm:gap-12 pl-6 xs:pl-8 sm:pl-16 ${style.hideScrollbarColor} ${style.scrollContainter}`}
            >
              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 text-sm font-bold tracking-widest uppercase transition-all ${searchParams.get("active") === "info"
                  ? "text-blue-400 border-blue-400"
                  : "text-white/40 border-transparent hover:text-white/60"
                  }`}
                onClick={() => router.push(path + "?active=info")}
              >
                Info
              </button>

              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 text-sm font-bold tracking-widest uppercase transition-all ${searchParams.get("active") === "sessions"
                  ? "text-blue-400 border-blue-400"
                  : "text-white/40 border-transparent hover:text-white/60"
                  }`}
                onClick={() =>
                  router.push(
                    path +
                    `?active=sessions&session=schedule`
                  )
                }
              >
                Expert Sessions
              </button>
              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 text-sm font-bold tracking-widest uppercase transition-all ${searchParams.get("active") === "lectures"
                  ? "text-blue-400 border-blue-400"
                  : "text-white/40 border-transparent hover:text-white/60"
                  }`}
                onClick={() =>
                  router.push(path + "?active=lectures&lectures=schedule")
                }
              >
                Lectures
              </button>

              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 text-sm font-bold tracking-widest uppercase transition-all ${searchParams.get("active") === "instant-meet"
                  ? "text-blue-400 border-blue-400"
                  : "text-white/40 border-transparent hover:text-white/60"
                  }`}
                onClick={() => router.push(path + "?active=instant-meet")}
              >
                Instant Meet
              </button>
              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 text-sm font-bold tracking-widest uppercase transition-all ${searchParams.get("active") === "uploaded"
                  ? "text-blue-400 border-blue-400"
                  : "text-white/40 border-transparent hover:text-white/60"
                  }`}
                onClick={() => router.push(path + "?active=uploaded")}
              >
                Uploaded
              </button>
            </div>

            <div>
              {/* {console.log("loading states",selfDelegate,isDelegate,isDelegateLoading)  } */}
              {searchParams.get("active") === "info" ? (
                <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14 space-y-6">
                  {address && <ProfileSection walletAddress={address} />}
                  <UserInfo
                    description={description}
                    onSaveButtonClick={(newDescription?: string) =>
                      handleSave(newDescription)
                    }
                    attestationCounts={attestationStatistics} />
                </div>
              ) : ("")}

              {searchParams.get("active") === "sessions" ? (
                <UserSessions />
              ) : (
                ""
              )}

              {searchParams.get("active") === "lectures" ? (
                <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
                  <UserOfficeHours />
                </div>
              ) : (
                ""
              )}

              {searchParams.get("active") === "instant-meet" ? (
                <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
                  <InstantMeet />
                </div>
              ) : (
                ""
              )}

              {searchParams.get("active") === "uploaded" ? (
                <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
                  <UploadedVideosTab userAddress={address || ""} />
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <MainProfileSkeletonLoader />
        </>
      )}
      {showBadgeCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden glass-container rounded-[2rem] p-6 md:p-8 border border-white/10">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-400/20 via-amber-300/15 to-transparent blur-3xl animate-pulse" />
            <h2 className="relative text-lg font-black text-white font-unbounded tracking-tight mb-2">
              New Builder Pods Badge!
            </h2>
            <p className="relative text-xs text-white/75 font-robotoMono mb-4">
              {newBadges.length > 1
                ? "You just unlocked a new set of Builder Pods badges."
                : "You just unlocked a new Builder Pods badge."}
            </p>

            <div className={`relative mb-5 grid gap-4 ${newBadges.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {newBadges.map((b) => {
                const badgeMeta = getBuilderPodBadgeMeta(b);

                return (
                  <div
                    key={b._id}
                    className={`relative overflow-hidden rounded-[1.75rem] border p-4 md:p-5 ${badgeMeta.surfaceClass}`}
                  >
                    <div className="relative flex flex-col">
                      <div
                        className={`relative overflow-hidden rounded-[1.35rem] border border-white/10 ${badgeMeta.imagePanelClass}`}
                      >
                        <div className={`pointer-events-none absolute inset-x-10 top-6 h-24 rounded-full bg-gradient-to-br ${badgeMeta.glowGradientClass} blur-3xl opacity-90 animate-pulse`} />
                        <div className={`pointer-events-none absolute inset-x-10 top-8 h-20 rounded-full blur-3xl ${badgeMeta.auraClass}`} />
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_55%)]" />
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <Image
                            src={badgeMeta.imageSrc}
                            alt={badgeMeta.label}
                            fill
                            sizes="(min-width: 768px) 20vw, 100vw"
                            className="object-contain p-6 drop-shadow-[0_18px_36px_rgba(0,0,0,0.48)]"
                          />
                        </div>
                      </div>

                      <div className="mt-4 text-left">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-white/45 font-robotoMono">
                          Earned Badge
                        </p>
                        <p className={`mt-2 text-sm font-bold font-robotoMono ${badgeMeta.titleClass}`}>
                          {badgeMeta.label}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-white/65 font-robotoMono">
                          {badgeMeta.description}
                        </p>

                        {b.easUid && (
                          <a
                            href={`https://sepolia.easscan.org/attestation/view/${b.easUid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] font-robotoMono transition-all ${badgeMeta.buttonClass}`}
                          >
                            View EAS
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={closeBadgeCelebration}
              className="mt-1 w-full px-4 py-2.5 bg-white text-black rounded-xl text-[11px] font-bold uppercase tracking-widest font-robotoMono hover:shadow-lg hover:shadow-white/10 transition-all"
            >
              Awesome
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MainProfile;
