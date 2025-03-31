"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import copy from "copy-to-clipboard";
import Link from "next/link";
import ccLogo from "@/assets/images/daos/CCLogo2.png";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";;
import lighthouse from "@lighthouse-web3/sdk";
import InstantMeet from "./InstantMeet";
import UserInfo from "./UserInfo";
import UserVotes from "./UserVotes";
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
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";
import { BrowserProvider, Contract } from "ethers";
import { MeetingRecords } from "@/types/UserProfileTypes";
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

interface Following {
  follower_address: string;
  isFollowing: boolean;
  isNotification: boolean;
}

function MainProfile() {
  const { isConnected, chain } = useAccount();
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { authenticated, login, logout, getAccessToken, user } = usePrivy();
  const { disconnect } = useDisconnect();
  const { walletAddress } = useWalletAddress();
  const { wallets } = useWallets();
  const [description, setDescription] = useState("");
  const [isDelegate, setIsDelegate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [karmaImage, setKarmaImage] = useState<any>();
  const [karmaEns, setKarmaEns] = useState("");
  const [karmaDesc, setKarmaDesc] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selfDelegate, setSelfDelegate] = useState(false);
  const [daoName, setDaoName] = useState("optimism");
  const [attestationStatistics, setAttestationStatistics] =useState<MeetingRecords | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [followings, setFollowings] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [userFollowings, setUserFollowings] = useState<Following[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isToggled, setToggle] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Info");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isspin, setSpin] = useState(false);
  const [modalData, setModalData] = useState({
    displayImage: "",
    displayName: "",
    emailId: "",
    twitter: "",
    discord: "",
    discourse: "",
    github: "",
  });
  const [userData, setUserData] = useState({
    displayImage: "",
    displayName: "",
    twitter: "",
    discord: "",
    discourse: "",
    github: "",
  });
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
            `?active=${tabValue}&session=${
              selfDelegate ? "schedule" : "attending"
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

  const handleDelegateVotes = async (to: string) => {
    if (!walletAddress) {
      toast.error("Please connect your wallet!");
      return;
    }

    try {
      // Get provider from Privy wallet
      const privyProvider = await wallets[0]?.getEthereumProvider();

      if (!privyProvider) {
        toast.error("Could not get wallet provider");
        return;
      }

      // Create ethers provider
      const provider = new BrowserProvider(privyProvider);

      // Get the current network
      const currentNetwork = await provider.getNetwork();
      const currentChainId = Number(currentNetwork.chainId);

      const daoKey = Object.keys(daoConfigs).find(
        (key) => daoConfigs[key].chainId == currentChainId
      );

      // Ensure daoKey is not undefined before accessing tokenContractAddress
      const ContractAddress = daoKey
        ? daoConfigs[daoKey].tokenContractAddress
        : undefined;
      if (!ContractAddress) {
        toast.error("Invalid ContractAddress address for current network");
        return;
      }

      const signer = await provider.getSigner();

      const contract = new Contract(ContractAddress, dao_abi.abi, signer);

      const tx = await contract.delegate(to);
      await tx.wait();
      toast.success("Delegation successful!");
      const currentNetworkDAO = await provider.getNetwork();

      const apiCallData = {
        address: walletAddress,
        delegation: {
          [currentNetworkDAO.name]: [
            {
              delegator: walletAddress,
              to_delegator: "0x0000000000000000000000000000000000000000",
              from_delegate: "0x0000000000000000000000000000000000000000",
              token: "0.00",
              page: "Mainprofile",
              timestamp: new Date(),
            },
          ],
        },
      };

      const Clienttoken = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${Clienttoken}`,
        }),
      };
      const response = await fetchApi("/track-delegation", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(apiCallData),
      });

      if (!response.ok) {
        throw new Error("Failed to save delegation data!");
      }
    } catch (error) {
      console.error("Delegation failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("eth_chainId is not supported")) {
        toast.error("Network Error: Please check your network connection");
      } else if (errorMessage.includes("user rejected")) {
        toast.error("Transaction was rejected by user");
      } else if (errorMessage.includes("network")) {
        toast.error(
          "Please connect to a supported network (OP Mainnet or Arbitrum One)"
        );
      } else {
        toast.error("Transaction failed. Please try again");
        console.error("Detailed error:", error);
      }
    } finally {
      // setDelegatingToAddr(false);
    }
  };

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
    setCopiedAddress(addr);
    setTimeout(() => {
      setCopiedAddress(null);
    }, 4000);
  };

  const handleUpdateFollowings = async (
    daoname: string,
    isChange: number,
    isfollowingchange: number
  ) => {
    setLoading(true);
    setIsModalLoading(true);

    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };

      const raw = JSON.stringify({
        address: walletAddress,
      });

      const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const res = await fetchApi(
        `/delegate-follow/savefollower`,
        requestOptions
      );
      const dbResponse = await res.json();

      if (isfollowingchange === 1) {
        updateFollowerState(dbResponse);
      } else {
        setIsFollowingModalOpen(true);
        if (daoname === "all") {
          const allFollowings = dbResponse.data.reduce(
            (acc: any[], item: any) => {
              const daoFollowings = item.followings.flatMap((daoItem: any) =>
                daoItem.following
                  .filter((f: Following) => f.isFollowing)
                  .map((f: Following) => ({
                    ...f,
                    dao: daoItem.dao, // Add the dao name to each following
                  }))
              );
              return [...acc, ...daoFollowings];
            },
            []
          );
          setUserFollowings(allFollowings);
        } else {
          // Filter for specific DAO
          for (const item of dbResponse.data) {
            const matchDao = item.followings.find(
              (daoItem: any) => daoItem.dao === daoname
            );

            if (matchDao) {
              const activeFollowings = matchDao.following
                .filter((f: Following) => f.isFollowing)
                .map((f: Following) => ({
                  ...f,
                  dao: matchDao.dao, // Add the dao name to each following
                }));
              if (isChange === 1) {
                setFollowings(activeFollowings.length);
              }
              setUserFollowings(activeFollowings);
            } else {
              setUserFollowings([]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating followings:", error);
      setUserFollowings([]);
    } finally {
      setLoading(false);
      setIsModalLoading(false);
    }
  };

  const toggleFollowing = async (
    index: number,
    userupdate: any,
    unfollowDao: any
  ) => {
    setUserFollowings((prevUsers) =>
      prevUsers.map((user, i) =>
        i === index ? { ...user, isFollowing: !user.isFollowing } : user
      )
    );

    if (!userupdate.isFollowing) {
      setFollowings(followings + 1);
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };
      try {
        const response = await fetchApi("/delegate-follow/savefollower", {
          method: "PUT",
          headers: myHeaders,
          body: JSON.stringify({
            delegate_address: userupdate.follower_address,
            follower_address: walletAddress,
            dao: unfollowDao,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to follow");
        }

        const data = await response.json();
      } catch (error) {
        console.error("Error following:", error);
      }
    } else {
      if (daoName === unfollowDao) {
        setFollowings(followings - 1);
      }
      setLoading(true);
      try {
        const token = await getAccessToken();
        const myHeaders: HeadersInit = {
          "Content-Type": "application/json",
          ...(walletAddress && {
            "x-wallet-address": walletAddress,
            Authorization: `Bearer ${token}`,
          }),
        };
        const response = await fetchApi("/delegate-follow/updatefollower", {
          method: "PUT",
          headers: myHeaders,
          body: JSON.stringify({
            // Add any necessary data
            delegate_address: userupdate.follower_address,
            follower_address: walletAddress,
            action: 1,
            dao: unfollowDao,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to unfollow");
        }

        const data = await response.json();
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error following:", error);
      }
    }
  };

  const toggleNotification = async (
    index: number,
    userupdate: any,
    notificationdao: any
  ) => {
    setUserFollowings((prevUsers) =>
      prevUsers.map((user, i) =>
        i === index ? { ...user, isNotification: !user.isNotification } : user
      )
    );
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };
      const response = await fetchApi("/delegate-follow/updatefollower", {
        method: "PUT",
        headers: myHeaders,
        body: JSON.stringify({
          delegate_address: userupdate.follower_address,
          follower_address: walletAddress,
          action: 2,
          dao: notificationdao,
          updatenotification: !userupdate.isNotification,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to notification");
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error following:", error);
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setModalData((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };

  const updateFollowerState = async (dbResponse: any) => {
    const userData = dbResponse?.data?.[0];

    const daoKey = Object.keys(daoConfigs).find(
      (key) => daoConfigs[key].chainName === chain?.name
    );

    let currentDaoName = daoKey;

    // Process following details
    const matchDao = userData?.followings?.find(
      (daoItem: any) =>
        daoItem.dao.toLowerCase() === currentDaoName?.toLowerCase()
    );

    if (matchDao) {
      const activeFollowings = matchDao.following?.filter(
        (f: any) => f.isFollowing
      );
      setFollowings(activeFollowings.length);
      setUserFollowings(activeFollowings);
    } else {
      setFollowings(0);
      setUserFollowings([]);
    }

    const daoFollowers = userData?.followers?.find(
      (dao: any) => dao.dao_name === currentDaoName
    );

    const followerCount = daoFollowers?.follower?.filter(
      (f: any) => f.isFollowing
    ).length;

    setFollowers(followerCount);
  };

  const handleToggle = async () => {
    setIsLoading(true);
    const isEmailVisible = !isToggled;
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };
      const raw = JSON.stringify({
        address: walletAddress,
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
      if (newDescription) {
        setDescription(newDescription);
      }
      setIsLoading(true);
      const isExisting = await checkDelegateExists(walletAddress);

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
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
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
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };
      const raw = JSON.stringify({
        address: walletAddress,
        image: modalData.displayImage,
        isDelegate: true,
        displayName: modalData.displayName,
        emailId: modalData.emailId,
        socialHandles: {
          twitter: modalData.twitter,
          discord: modalData.discord,
          github: modalData.github,
        },
        networks: [
          {
            dao_name: daoName,
            network: chain?.name,
            discourse: modalData.discourse,
            description: newDescription ? newDescription : description,
          },
        ],
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
          discourse: modalData.discourse,
          github: modalData.github,
        });
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
      walletAddress &&
      currentWalletAddress.toLowerCase() !== walletAddress.toLowerCase()
    ) {
      handleLogout();
      login();
    }
  }, [authenticated, walletAddress]);

  useEffect(() => {
    const activeTab = searchParams.get("active");
    if (activeTab) {
      const tab = tabs.find((t) => t.value === activeTab);
      setSelectedTab(tab?.name || "Info");
    }
  }, [searchParams, tabs]);
useEffect(() => {
  // Check the `dao` query parameter from the URL
  const daoParam = searchParams.get("dao");
  console.log("daoParam:", daoParam);
  if (daoParam && Object.keys(daoConfigs).includes(daoParam.toLowerCase())) {
    setDaoName(daoParam.toLowerCase());
    return;
  }

  // If no DAO is found in the URL, determine it by chain
  const daoKey = Object.keys(daoConfigs).find(
    (key) => daoConfigs[key].chainName === chain?.name
  );

  console.log("Chain name:", chain?.name);
  console.log("daoKey:", daoKey);
  
  setDaoName(daoKey || "");
}, [chain, chain?.name, path, searchParams.toString()]);  // 👈 Added `router.asPath` to trigger updates

  
  // useEffect(() => {
  //   if (!chain?.name) return;
  
  //   const matchingDaos = Object.entries(daoConfigs)
  //     .filter(([_, dao]) => dao.chainName === chain.name);
  
  //   if (matchingDaos.length === 0) {
  //     setDaoName("");
  //     return;
  //   }
  // console.log("matchingDaos", matchingDaos);
  //   // Pick the DAO with the lowest chainId (ensures consistency)
  //   const selectedDao = matchingDaos.reduce((prev, current) =>
  //     prev[1].chainId < current[1].chainId ? prev : current
  //   );
  
  //   setDaoName(selectedDao[0]); // Set the key of the selected DAO
  // }, [chain, chain?.name]);
  
  useEffect(() => {
    if (isConnected && authenticated && path.includes("profile/undefined")) {
      const newPath = path.includes("profile/undefined")
        ? path.replace(
            "profile/undefined",
            `profile/${walletAddress}?active=info`
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
    walletAddress,
    router,
    session,
    path.includes("profile/undefined"),
  ]);

  useEffect(() => {
    const checkDelegateStatus = async () => {
      if (!walletAddress || !chain) return;
      try {
        const daoKey = Object.keys(daoConfigs).find(
          (key) => daoConfigs[key].chainName === chain.name
        );

        const contractAddress = daoKey ? daoConfigs[daoKey].tokenContractAddress : null;
        const network = daoKey;

        const predefinedChains: Record<string, any> = {
          optimism,
          arbitrum,
          mantle,
        };

        const chainMappings: Record<string, any> = Object.fromEntries(
          Object.entries(daoConfigs).map(([key, config]) => {
            // Use predefined viem chains if available, otherwise define it dynamically
            return [
              key,
              predefinedChains[key] || {
                id: config.chainId,
                name: config.name,
                network: key,
                nativeCurrency: {
                  name: config.tokenSymbol,
                  symbol: config.tokenSymbol,
                  decimals: 18,
                },
                rpcUrls: { default: { http: [`https://rpc.${key}.xyz`] } }, // Update with actual RPC URL
                blockExplorers: {
                  default: {
                    name: `${config.name} Explorer`,
                    url: config.explorerUrl,
                  },
                },
              },
            ];
          })
        );
        const viemChain = daoKey ? chainMappings[daoKey] : null;

        const public_client = createPublicClient({
          chain: viemChain || optimism,
          transport: http(),
        });

        const delegateTx = (await public_client.readContract({
          address: contractAddress as `0x${string}`,
          abi: dao_abi.abi,
          functionName: "delegates",
          args: [walletAddress],
        })) as string;

        const isSelfDelegate =
          delegateTx.toLowerCase() !==
            "0x0000000000000000000000000000000000000000" &&
          delegateTx.toLowerCase() === walletAddress.toLowerCase();
        setSelfDelegate(isSelfDelegate);
      } catch (e) {
        console.log("error in function: ", e);
        setSelfDelegate(false);
      }
    };
    checkDelegateStatus();
  }, [walletAddress, chain]);

  useEffect(() => {
    if (!walletAddress) return;
    const fetchData = async () => {
      try {
        const token = await getAccessToken();

        const daoKey = Object.keys(daoConfigs).find(
          (key) => daoConfigs[key].chainName === chain?.name
        );

        let dao = daoKey;
        const myHeaders: HeadersInit = {
          "Content-Type": "application/json",
          ...(walletAddress && {
            "x-wallet-address": walletAddress,
            Authorization: `Bearer ${token}`,
          }),
        };

        const raw = JSON.stringify({
          address: walletAddress,
        });

        const requestOptions: any = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };
        const res = await fetchApi(`/profile/${walletAddress}`, requestOptions);

        const dbResponse = await res.json();

        let karmaDetails;

        try {
          const karmaRes = await fetch(
            `https://api.karmahq.xyz/api/dao/find-delegate?dao=${dao}&user=${walletAddress}`
          );
          karmaDetails = await karmaRes.json();

          if (karmaDetails.length > 0) {
            setKarmaEns(karmaDetails?.data?.delegate?.ensName);
            setKarmaImage(karmaDetails?.data?.delegate?.profilePicture);
            setKarmaDesc(
              karmaDetails?.data?.delegate?.delegatePitch?.customFields[1]
                ?.value
            );
          }
          setIsDelegate(true);
        } catch (e) {
          console.log("error: ", e);
          setIsDelegate(false);
        }

        if (dbResponse.data.length > 0) {
          setIsPageLoading(false);
          setUserData({
            displayName: dbResponse.data[0]?.displayName,
            discord: dbResponse.data[0]?.socialHandles?.discord,
            discourse:
              dbResponse.data[0]?.networks?.find(
                (network: any) => network?.dao_name === dao
              )?.discourse || "",
            twitter: dbResponse.data[0].socialHandles?.twitter,
            github: dbResponse.data[0].socialHandles?.github,
            displayImage: dbResponse.data[0]?.image,
          });
          setAttestationStatistics(dbResponse.data[0]?.meetingRecords ?? null);

          setModalData({
            displayName: dbResponse.data[0]?.displayName,
            discord: dbResponse.data[0]?.socialHandles?.discord,
            discourse:
              dbResponse.data[0]?.networks?.find(
                (network: any) => network?.dao_name === dao
              )?.discourse || "",
            emailId: dbResponse.data[0]?.emailId,
            twitter: dbResponse.data[0]?.socialHandles?.twitter,
            github: dbResponse.data[0]?.socialHandles?.github,
            displayImage: dbResponse.data[0]?.image,
          });
          setToggle(dbResponse.data[0]?.isEmailVisible);
          setDescription(
            dbResponse.data[0]?.networks?.find(
              (network: any) => network.dao_name === dao
            )?.description || ""
          );

          if (!authenticated) {
            setFollowings(0);
            setFollowers(0);
          } else {
            await handleUpdateFollowings("all", 0, 1);
          }
        } else {
          setUserData({
            displayName: karmaDetails.data.delegate.ensName,
            discord: karmaDetails.data.delegate.discordHandle,
            discourse: karmaDetails.data.delegate.discourseHandle,
            twitter: karmaDetails.data.delegate.twitterHandle,
            github: karmaDetails.data.delegate.githubHandle,
            displayImage: karmaDetails.data.delegate.profilePicture,
          });
          await handleUpdateFollowings(daoName, 0, 1);
          setIsPageLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsPageLoading(false);
      }
    };

    if (walletAddress != null) {
      fetchData();
    }
  }, [chain, walletAddress]);

  return (
    <>
      <div className="lg:hidden pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
        <Heading />
      </div>
      {!isPageLoading ? (
        <div className="font-poppins">
          <div className="relative flex pb-5 lg:py-5 px-4 md:px-6 lg:px-14 items-start">
            <div className="flex flex-col xs:flex-row xs:items-start xs:justify-start items-center lg:items-start justify-center lg:justify-start w-full lg:w-auto">
              <div
                className={`${
                  userData.displayImage ? "h-full" : "h-[80vw] xs:h-auto"
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

                  <Image
                    src={ccLogo}
                    alt="ChoraClub Logo"
                    className="absolute top-0 right-0 bg-white rounded-full"
                    style={{
                      width: "30px",
                      height: "30px",
                      marginTop: "10px",
                      marginRight: "10px",
                    }}
                    priority={true}
                  />
                </div>
              </div>

              <div className="pl-4 md:px-4 mt-4 xs:mt-0 md:mt-2 lg:mt-4 w-full xs:w-auto">
                <div className=" flex items-center py-1">
                  <div className="font-bold text-[22px] xs:text-xl sm:text-xl lg:text-[22px] pr-4">
                    {karmaEns ? (
                      karmaEns
                    ) : userData.displayName ? (
                      userData.displayName
                    ) : (
                      <>
                        {`${walletAddress}`.substring(0, 6)} ...{" "}
                        {`${walletAddress}`.substring(
                          `${walletAddress}`.length - 4
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Link
                      href={`https://twitter.com/${userData.twitter}`}
                      className={`border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 ${
                        userData.twitter == "" || userData.twitter == undefined
                          ? "hidden"
                          : ""
                      }`}
                      style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                      target="_blank"
                    >
                      <FaXTwitter color="#7C7C7C" size={12} />
                    </Link>
                    <Link
                      href={
                        daoName
                          ? `${daoConfigs[daoName]?.discourseUrl}/${userData.discourse}`
                          : ""
                      }
                      className={`border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1  ${
                        userData.discourse == "" ||
                        userData.discourse == undefined
                          ? "hidden"
                          : ""
                      }`}
                      style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                      target="_blank"
                    >
                      <BiSolidMessageRoundedDetail color="#7C7C7C" size={12} />
                    </Link>
                    <Link
                      href={`https://discord.com/${userData.discord}`}
                      className={`border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 ${
                        userData.discord == "" || userData.discord == undefined
                          ? "hidden"
                          : ""
                      }`}
                      style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                      target="_blank"
                    >
                      <FaDiscord color="#7C7C7C" size={12} />
                    </Link>
                    <Link
                      href={`https://github.com/${userData.github}`}
                      className={`border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 ${
                        userData.github == "" || userData.github == undefined
                          ? "hidden"
                          : ""
                      }`}
                      style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                      target="_blank"
                    >
                      <FaGithub color="#7C7C7C" size={12} />
                    </Link>
                    <Tooltip
                      content="Update your Profile"
                      placement="top"
                      showArrow
                    >
                      <span
                        className="border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 cursor-pointer"
                        style={{ backgroundColor: "rgba(217, 217, 217, 0.42)" }}
                        onClick={onOpen}
                      >
                        <FaPencil color="#3e3d3d" size={12} />
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
                    {`${walletAddress}`.substring(0, 6)} ...{" "}
                    {`${walletAddress}`.substring(
                      `${walletAddress}`.length - 4
                    )}
                  </div>

                  <Tooltip
                    content="Copy"
                    placement="bottom"
                    closeDelay={1}
                    showArrow
                  >
                    <span className="px-2 cursor-pointer" color="#3E3D3D">
                      <IoCopy
                        onClick={() => handleCopy(`${walletAddress}`)}
                        className={`transition-colors duration-300 ${
                          copiedAddress === `${walletAddress}`
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
                    >
                      <Button
                        className="bg-gray-200 hover:bg-gray-300 text-xs sm:text-sm "
                        onPress={() => {
                          if (typeof window === "undefined") return;
                          navigator.clipboard.writeText(
                            `${BASE_URL}/${getDaoName(
                              chain?.name
                            )}/${walletAddress}?active=info`
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

                {isFollowingModalOpen && (
                  <FollowingModal
                    userFollowings={userFollowings}
                    toggleFollowing={toggleFollowing}
                    toggleNotification={toggleNotification}
                    setIsFollowingModalOpen={setIsFollowingModalOpen}
                    isLoading={isLoading}
                    handleUpdateFollowings={handleUpdateFollowings}
                    daoName={daoName}
                  />
                )}

                {selfDelegate === false ? (
                  <div className="pt-2 flex flex-col 2.3sm:flex-row gap-2 w-full items-center">
                    <div className=" flex flex-col xs:flex-row gap-2 w-full xs:w-auto items-center">
                      <button
                        className="bg-blue-shade-200 font-bold text-white rounded-full py-[10px] px-4 xs:py-[9px] md:py-2.5 xs:px-4 sm:px-6 xs:text-xs sm:text-sm md:text-base lg:px-8 lg:py-[10px] w-full xs:w-auto h-fit"
                        onClick={() => handleDelegateVotes(`${walletAddress}`)}
                        disabled={isspin}
                      >
                        {isspin ? (
                          <div className="flex justify-center items-center">
                            <Oval color="#fff" height={20} width={20} />
                          </div>
                        ) : (
                          "Become Delegate"
                        )}
                      </button>

                      <button
                        className="bg-blue-shade-200 font-bold text-white rounded-full px-6 py-[10px] xs:py-2 md:py-2.5 md:text-base xs:text-xs sm:text-sm lg:px-8 lg:py-[10px] w-full xs:w-[160px] lg:w-[185px] flex items-center justify-center h-fit"
                        onClick={() =>
                          followings
                            ? handleUpdateFollowings(daoName, 1, 0)
                            : toast.error(
                                "You're not following anyone yet. Start exploring delegate profiles now!"
                              )
                        }
                      >
                        {isModalLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          `${followings} Following`
                        )}
                      </button>
                    </div>
                    <SelectDaoButton daoName={daoName} />
                  </div>
                ) : (
                  <div className="pt-2 flex flex-col 2.3sm:flex-row gap-2 w-full items-center">
                    <div className=" flex flex-col xs:flex-row gap-2 w-full xs:w-auto items-center">
                      <button className="bg-blue-shade-200 font-bold text-white rounded-full py-[10px] px-4 xs:py-[9px] md:py-2.5 xs:px-8 sm:px-6 xs:text-xs sm:text-sm md:text-base lg:px-8 lg:py-[10px] w-full xs:w-auto h-fit">
                        {followers}{" "}
                        {followers === 0 || followers === 1
                          ? "Follower"
                          : "Followers"}
                      </button>

                      <button
                        className="bg-blue-shade-200 font-bold text-white rounded-full px-6 py-[10px] xs:py-2 md:py-2.5 md:text-base xs:text-xs sm:text-sm lg:px-8 lg:py-[10px] w-full xs:w-[168px] lg:w-[185px] flex items-center justify-center h-fit"
                        onClick={() =>
                          followings
                            ? handleUpdateFollowings(daoName, 1, 0)
                            : toast.error(
                                "You're not following anyone yet. Start exploring delegate profiles now!"
                              )
                        }
                      >
                        {followings} Followings
                      </button>
                    </div>
                    <SelectDaoButton daoName={daoName} />
                  </div>
                )}
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
                  className={`w-4 h-4 transition-transform duration-700 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              <div
                className={`w-[calc(100vw-3rem)] mt-1 overflow-hidden transition-all duration-700 ease-in-out ${
                  isDropdownOpen
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
              className={`bg-[#D9D9D945] hidden md:flex overflow-x-auto whitespace-nowrap gap-6 xs:gap-8 sm:gap-12 pl-6 xs:pl-8 sm:pl-16 ${style.hideScrollbarColor} ${style.scrollContainter}`}
            >
              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 ${
                  searchParams.get("active") === "info"
                    ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                    : "border-transparent"
                }`}
                onClick={() => router.push(path + "?active=info&dao=" + daoName)}
              >
                Info
              </button>
              {selfDelegate === true && (
                <button
                  className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 ${
                    searchParams.get("active") === "votes"
                      ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push(path + "?active=votes&dao=" + daoName)}
                >
                  Past Votes
                </button>
              )}
              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 ${
                  searchParams.get("active") === "sessions"
                    ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                    : "border-transparent"
                }`}
                onClick={() =>
                  router.push(
                    path +
                      `?active=sessions&session=${
                        selfDelegate ? "schedule" : "attending"
                      }&dao=${daoName}`
                  )
                }
              >
                Sessions
              </button>
              <button
                className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 ${
                  searchParams.get("active") === "officeHours"
                    ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                    : "border-transparent"
                }`}
                onClick={() =>
                  router.push(path + "?active=officeHours&hours=schedule&dao=" + daoName)
                }
              >
                Office Hours
              </button>

              {selfDelegate === true && (
                <button
                  className={`border-b-2 py-3 xs:py-4 px-2 outline-none flex-shrink-0 ${
                    searchParams.get("active") === "instant-meet"
                      ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push(path + "?active=instant-meet&dao=" + daoName)}
                >
                  Instant Meet
                </button>
              )}
            </div>

            <div>
              {searchParams.get("active") === "info" ? (
                <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
                  <UserInfo
                    karmaDesc={karmaDesc}
                    description={description}
                    isDelegate={isDelegate}
                    isSelfDelegate={selfDelegate}
                    onSaveButtonClick={(newDescription?: string) =>
                      handleSave(newDescription)
                    }
                    daoName={daoName}
                    attestationCounts={attestationStatistics}
                  />
                </div>
              ) : (
                ""
              )}

              {selfDelegate === true &&
              searchParams.get("active") === "votes" ? (
                <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
                  <UserVotes daoName={daoName} />
                </div>
              ) : (
                ""
              )}

              {searchParams.get("active") === "sessions" ? (
                <UserSessions
                  isDelegate={isDelegate}
                  selfDelegate={selfDelegate}
                  daoName={daoName}
                />
              ) : (
                ""
              )}

              {searchParams.get("active") === "officeHours" ? (
                <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
                  <UserOfficeHours
                    isDelegate={isDelegate}
                    selfDelegate={selfDelegate}
                    daoName={daoName}
                  />
                </div>
              ) : (
                ""
              )}

              {selfDelegate === true &&
              searchParams.get("active") === "instant-meet" ? (
                <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
                  <InstantMeet
                    isDelegate={isDelegate}
                    selfDelegate={selfDelegate}
                    daoName={daoName}
                  />
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
