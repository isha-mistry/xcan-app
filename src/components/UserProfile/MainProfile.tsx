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
import { ChevronDownIcon } from "lucide-react";
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
  const tabs = [
    { name: "Info", value: "info" },
    ...(selfDelegate ? [{ name: "Past Votes", value: "votes" }] : []),
    { name: "Sessions", value: "sessions" },
    { name: "Office Hours", value: "officeHours" },
    ...(selfDelegate ? [{ name: "Instant Meet", value: "instant-meet" }] : []),
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
      } else if (tabValue === "officeHours") {
        router.push(path + `?active=${tabValue}&hours=schedule`);
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

  return (
    <>
      <div className="lg:hidden pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
        <Heading />
      </div>
      {!isPageLoading ? (
        <div className="font-tektur">
          <div className="relative flex pb-5 lg:py-5 px-4 md:px-6 lg:px-14 items-start">
            <div className="flex flex-col xs:flex-row xs:items-start xs:justify-start items-center lg:items-start justify-center lg:justify-start w-full lg:w-auto">
              <div
                className={`${userData.displayImage ? "h-full" : "h-[80vw] xs:h-auto"
                  } relative object-cover rounded-3xl w-full xs:w-auto`}
                style={{
                  backgroundColor: "#fcfcfc",
                  border: "2px solid #E9E9E9 ",
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
                  <div className="font-bold text-[22px] xs:text-xl sm:text-xl lg:text-[22px] pr-4">
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
                        className="bg-gray-200 hover:bg-gray-300 text-xs sm:text-sm "
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
                        <IoShareSocialSharp />
                        {isCopied ? "Copied" : "Share profile"}
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-4 md:right-6 lg:right-14 hidden lg:flex gap-1 xs:gap-2 items-center">
              <RewardButton />
            </div>
          </div>

          <div className=" ">
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

            <div
              className={`bg-[#c2defd22] hidden md:flex overflow-x-auto whitespace-nowrap gap-6 xs:gap-8 sm:gap-12 pl-6 xs:pl-8 sm:pl-16 ${style.hideScrollbarColor} ${style.scrollContainter}`}
            >
              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 ${searchParams.get("active") === "info"
                  ? "text-blue-300 font-semibold border-b-2 border-blue-300"
                  : "border-transparent"
                  }`}
                onClick={() => router.push(path + "?active=info")}
              >
                Info
              </button>

              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 ${searchParams.get("active") === "sessions"
                  ? "text-blue-300 font-semibold border-b-2 border-blue-300"
                  : "border-transparent"
                  }`}
                onClick={() =>
                  router.push(
                    path +
                    `?active=sessions&session=schedule`
                  )
                }
              >
                Sessions
              </button>
              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 ${searchParams.get("active") === "officeHours"
                  ? "text-blue-300 font-semibold border-b-2 border-blue-300"
                  : "border-transparent"
                  }`}
                onClick={() =>
                  router.push(path + "?active=officeHours&hours=schedule")
                }
              >
                Office Hours
              </button>

              {<button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 ${searchParams.get("active") === "instant-meet"
                  ? "text-blue-300 font-semibold border-b-2 border-blue-300"
                  : "border-transparent"
                  }`}
                onClick={() => router.push(path + "?active=instant-meet")}
              >
                Instant Meet
              </button>
              }
            </div>

            <div>
              {/* {console.log("loading states",selfDelegate,isDelegate,isDelegateLoading)  } */}
              {searchParams.get("active") === "info" ? (
                <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
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

              {searchParams.get("active") === "officeHours" ? (
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
            </div>
          </div>
        </div>
      ) : (
        <>
          <MainProfileSkeletonLoader />
        </>
      )}
    </>
  );
}

export default MainProfile;
