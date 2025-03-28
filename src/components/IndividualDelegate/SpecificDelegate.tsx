"use client";
import Image from "next/image";
import React, { use, useEffect, useRef, useState } from "react";
import user from "@/assets/images/daos/profile.png";
import {
  FaXTwitter,
  FaDiscord,
  FaGithub,
  FaVoicemail,
  FaEnvelope,
} from "react-icons/fa6";
import { BiSolidMessageRoundedDetail } from "react-icons/bi";
import { IoCopy, IoShareSocialSharp } from "react-icons/io5";
import DelegateInfo from "./DelegateInfo";
import DelegateVotes from "./DelegateVotes";
import DelegateSessions from "./DelegateSessions";
import DelegateOfficeHrs from "./DelegateOfficeHrs";
import copy from "copy-to-clipboard";
import { Button, Tooltip, useDisclosure } from "@nextui-org/react";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  Provider,
  cacheExchange,
  createClient,
  fetchExchange,
  gql,
} from "urql";
import WalletAndPublicClient from "@/helpers/signer";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
// import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import OPLogo from "@/assets/images/daos/op.png";
import ArbLogo from "@/assets/images/daos/arb.png";
import ccLogo from "@/assets/images/daos/CCLogo2.png";
import { Oval } from "react-loader-spinner";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import {
  arb_client,
  DELEGATE_CHANGED_QUERY,
  GET_LATEST_DELEGATE_VOTES_CHANGED,
  op_client,
  DELEGATE_QUERY,
  letsgrow_client,
} from "@/config/staticDataUtils";
// import { getEnsNameOfUser } from "../ConnectWallet/ENSResolver";
import DelegateTileModal from "../ComponentUtils/DelegateTileModal";
// import { cacheExchange, createClient, fetchExchange, gql } from "urql/core";
import { set } from "video.js/dist/types/tech/middleware";
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
import MobileResponsiveMessage from "../MobileResponsiveMessage/MobileResponsiveMessage";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { ChevronDownIcon, CloudCog } from "lucide-react";
import Heading from "../ComponentUtils/Heading";
import { MeetingRecords } from "@/types/UserProfileTypes";
import { useApiData } from "@/contexts/ApiDataContext";
import { calculateTempCpi } from "@/actions/calculatetempCpi";
import { createPublicClient, http } from "viem";
import ErrorComponent from "../Error/ErrorComponent";
import { Address } from "viem";
import { daoConfigs } from "@/config/daos";

interface Type {
  daoDelegates: string;
  individualDelegate: string;
}

interface GTMEvent {
  event: string;
  category: string;
  action: string;
  label: string;
  value?: number;
  delegateFrom?: "delegateList" | "specificDelegate";
  delegationStatus?: "success" | "failure" | "pending";
}

function SpecificDelegate({ props }: { props: Type }) {
  const { chain } = useAccount();
  // const { openChainModal } = useChainModal();
  const [delegateInfo, setDelegateInfo] = useState<any>();
  const router = useRouter();
  const path = usePathname();
  // const { openConnectModal } = useConnectModal();
  const searchParams = useSearchParams();
  const [selfDelegate, setSelfDelegate] = useState<boolean>();
  const [isDelegate, setIsDelegate] = useState<boolean>();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [displayImage, setDisplayImage] = useState("");
  const [description, setDescription] = useState("");
  const [attestationStatistics, setAttestationStatistics] =
    useState<MeetingRecords | null>(null);
  // const provider = new ethers.BrowserProvider(window?.ethereum);
  // const [displayEnsName, setDisplayEnsName] = useState<any>();
  const [displayEnsName, setDisplayEnsName] = useState<any>(null);
  const [delegate, setDelegate] = useState("");
  const [same, setSame] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  // const [followed, isFollowed] = useState(false);
  const [isOpenunfollow, setUnfollowmodel] = useState(false);
  // const [isOpenNotification, setNotificationmodel] = useState(false);
  const [notification, isNotification] = useState(false);
  // const [daoname, setDaoName] = useState("");
  const [emailId, setEmailId] = useState<string>();
  const [isEmailVisible, setIsEmailVisible] = useState(false);

  const [delegateOpen, setDelegateOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [followerCountLoading, setFollowerCountLoading] = useState(true);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [isFollowStatusLoading, setIsFollowStatusLoading] = useState(true);
  const [delegatingToAddr, setDelegatingToAddr] = useState(false);
  const { isConnected } = useAccount();
  const [confettiVisible, setConfettiVisible] = useState(false);
  const network = useAccount().chain;
  const { publicClient, walletClient } = WalletAndPublicClient();
  const { ready, authenticated, login, logout, getAccessToken, user } =
    usePrivy();
  const { walletAddress } = useWalletAddress();
  const { wallets } = useWallets();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Info");

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [tempCpi, setTempCpi] = useState();
  const [tempCpiCalling, setTempCpiCalling] = useState(true);
  const [isFromDatabase, setFromDatabase] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [avatar, setAvatar] = useState("");
    const dao_name = path.split("/").filter(Boolean)[0] || "";
  const client = createClient({
    url: daoConfigs[props.daoDelegates]?.delegateChangedsUrl || "",
    exchanges: [cacheExchange, fetchExchange],
  });
  const pushToGTM = (eventData: GTMEvent) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push(eventData);
    }
  };
  const handlePastVoteClick =()=>{
    if(dao_name !== 'letsgrowdao'){
      router.push(path + "?active=pastVotes");
    }else{
      toast("Coming Soon! 🚀");
    }
  }

  const handleCopy = (addr: string) => {
    copy(addr);
    toast("Address Copied");
    setCopiedAddress(addr);
    setTimeout(() => {
      setCopiedAddress(null);
    }, 4000);
  };

  const { data: accountBalance }: any = useReadContract({
    abi: dao_abi.abi,
    address: daoConfigs[props.daoDelegates].chainAddress as `0x${string}`,
    functionName: "balanceOf",
    // args:['0x6eda5acaff7f5964e1ecc3fd61c62570c186ca0c' as Address]
    args: [walletAddress as Address],
    chainId:daoConfigs[props.daoDelegates].chainId  
  });

  const tabs = [
    { name: "Info", value: "info" },
    { name: "Past Votes", value: "pastVotes" },
    { name: "Sessions", value: "delegatesSession" },
    { name: "Office Hours", value: "officeHours" },
  ];

  const handleTabChange = (tabValue: string) => {
    // console.log(tabValue);
    const selected = tabs.find((tab) => tab.value === tabValue);
    // console.log(selected);
    if (selected) {
      setSelectedTab(selected.name);
      setIsDropdownOpen(false);
      if (tabValue === "pastVotes" && dao_name !== "letsgrowdao") {
        router.push(path + "?active=pastVotes");
      }else if(tabValue === "pastVotes" && dao_name === "letsgrowdao"){
        toast("Coming Soon! 🚀");
      } else if (tabValue === "sessions") {
        router.push(path + "?active=delegatesSession&session=book");
      } else if (tabValue === "officeHours") {
        router.push(path + `?active=${tabValue}&hours=ongoing`);
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

  function getDaoNameFromUrl() {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const currentDAO=daoConfigs[props.daoDelegates];
      if (url.includes(currentDAO.name)) return currentDAO.name
      // if (url.includes("arbitrum")) return "arbitrum";
    }
    return "";
  }

  const handleDelegateModal = async () => {
    pushToGTM({
      event: "delegate_button_click",
      category: "Delegate Engagement",
      action: "Delegate Button Click",
      label: `Delegate Button Click - Specific Delegate - ${getDaoNameFromUrl()}`,
      delegateFrom: "specificDelegate",
    });
    if (!isConnected) {
      if (!authenticated) {
        // openConnectModal();
        // alert('open modal!');
        login();
      }
    } else {
      pushToGTM({
        event: "delegate_modal_open",
        category: "Delegate Engagement",
        action: "Delegate Modal Open",
        label: "Delegate Modal Open - Specific Delegate",
        delegateFrom: "specificDelegate",
      });
      const delegatorAddress = walletAddress;
      const toAddress = props.individualDelegate;
      setDelegateOpen(true);
      setLoading(true);
      try {
        let data: any;

        let currentDAO=daoConfigs[props.daoDelegates];

        const client = createClient({
          url: currentDAO.delegateChangedsUrl,
          exchanges: [cacheExchange, fetchExchange],
        });

        data=await client.query(DELEGATE_CHANGED_QUERY,{delegator:walletAddress});

        // if (props.daoDelegates === "optimism") {
        //   data = await op_client.query(DELEGATE_CHANGED_QUERY, {
        //     delegator: walletAddress,
        //   });

          try {
            setTempCpiCalling(true);
            const token = await getAccessToken();
            const result = await calculateTempCpi(
              delegatorAddress,
              toAddress,
              walletAddress,
              token
            );
            // console.log("result:::::::::", result);
            if (result?.data?.results[0].cpi) {
              const data = result?.data?.results[0].cpi;
              setTempCpi(data);
              setTempCpiCalling(false);
            }
          } catch (error) {
            console.log("Error in calculating temp CPI", error);
          }finally{
            setTempCpiCalling(false);
          }
        // } else {
        //   data = await arb_client.query(DELEGATE_CHANGED_QUERY, {
        //     delegator: walletAddress,
        //   });
        // }

        const delegate = data.data.delegateChangeds[0]?.toDelegate;

        setSame(
          delegate.toLowerCase() === props.individualDelegate.toLowerCase()
        );
        // ens
        // ? setDelegate(ens)
        // :
        setDelegate(delegate);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

      setDelegateOpen(true);
    }
  };

  const handleCloseDelegateModal = () => {
    setDelegateOpen(false);
  };
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
  const [votingPower, setVotingPower] = useState<number>();

  const [karmaSocials, setKarmaSocials] = useState({
    twitter: "",
    discord: "",
    discourse: "",
    github: "",
  });

  const [socials, setSocials] = useState({
    twitter: "",
    discord: "",
    discourse: "",
    github: "",
  });
  const [delegatorsCount, setDelegatorsCount] = useState<number>();
  const [votesCount, setVotesCount] = useState<number>();

  const totalCount = `query Delegate($input: DelegateInput!) {
  delegate(input: $input) {
    id
    votesCount
    delegatorsCount
  }
}
 `;
  const variables = {
    input: {
      address: `${props.individualDelegate}`,
      governorId: "",
      organizationId: null as number | null,
    },
  };
  if (props.daoDelegates === "arbitrum") {
    variables.input.governorId =
      "eip155:42161:0x789fC99093B09aD01C34DC7251D0C89ce743e5a4";
    variables.input.organizationId = 2206072050315953936;
  } else {
    variables.input.governorId =
      "eip155:10:0xcDF27F107725988f2261Ce2256bDfCdE8B382B10";
    variables.input.organizationId = 2206072049871356990;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        let data: any;
        if(props.daoDelegates==="letsgrowdao"){
          
          data= await client.query(DELEGATE_QUERY,{id:props.individualDelegate.toString()}).toPromise();
          console.log(client,data,DELEGATE_QUERY,props.individualDelegate.toString());
          setVotingPower(data.data.delegates[0].delegatedBalance ? data.data.delegates[0].delegatedBalance : 0);
        }else{
         data = await client
          .query(GET_LATEST_DELEGATE_VOTES_CHANGED, {
            delegate: props.individualDelegate.toString(),
          })
          .toPromise();
          console.log(data);
          setVotingPower(data.data.delegates[0].latestBalance ? data.data.delegates[0].latestBalance : 0);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    if (props.individualDelegate) {
      fetchData();
    }
  }, [op_client, props.individualDelegate]);

  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      try {
        // const res = await fetch(
        //   `https://api.karmahq.xyz/api/dao/find-delegate?dao=${props.daoDelegates}&user=${props.individualDelegate}`
        // );
        // const details = await res.json();
        const res = await fetch(
          `/api/search-delegate?address=${props.individualDelegate}&dao=${props.daoDelegates}`
        );
        const details = await res.json();
        // setDelegateInfo(details.data.delegate);
        if (details.length > 0) {
          setIsDelegate(true);
        }
        // await updateFollowerState();
        // await setFollowerscount();

        // Only fetch delegate data if we have a wallet address
        // if (walletAddress) {
        //   await fetchDelegateData();
        // }

        await fetchDelegateData();

        setIsPageLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, [props.daoDelegates, props.individualDelegate, walletAddress]);

  // useEffect(() => {
  //   if (errorOccurred) {
  //     console.log("An error occurred! Triggering side effect...");
  //     // Perform any side effect here, such as logging or showing a fallback UI
  //   }
  // }, [errorOccurred]);

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

  // For Optimism Governance Token
  const optimismTokenAddress = "0x4200000000000000000000000000000000000042";

  // useEffect(() => {
  //   const checkDelegateStatus = async () => {
  //     setIsPageLoading(true);
  //     //   const addr = await walletClient.getAddresses();
  //     //   const address1 = addr[0];
  //     let delegateTxAddr = "";
  //     const contractAddress =
  //       props.daoDelegates === "optimism"
  //         ? "0x4200000000000000000000000000000000000042"
  //         : props.daoDelegates === "arbitrum"
  //         ? "0x912CE59144191C1204E64559FE8253a0e49E6548"
  //         : "";

  //     console.log("Line 414:",contractAddress);
  //     console.log('Line 415:',props.daoDelegates,props.individualDelegate);

  //     try {
  //       const delegateTx = await publicClient.readContract({
  //         address: contractAddress,
  //         abi: dao_abi.abi,
  //         functionName: "delegates",
  //         args: [props.individualDelegate],
  //         // account: address1,
  //       });
  //       console.log("Line 425:",delegateTx);
  //       delegateTxAddr = delegateTx;
  //       if (
  //         delegateTxAddr.toLowerCase() ===
  //         props.individualDelegate?.toLowerCase()
  //       ) {
  //         setSelfDelegate(true);
  //       }
  //       setIsPageLoading(false);
  //     } catch (error) {
  //       console.error("Error in reading contract", error);
  //       setIsPageLoading(false);
  //     }
  //   };
  //   checkDelegateStatus();
  // }, [props]);

  useEffect(() => {
    const checkDelegateStatus = async () => {
      // setIsPageLoading(true);
      //   const addr = await walletClient.getAddresses();
      //   const address1 = addr[0];
      let currentDAO=daoConfigs[props.daoDelegates];
      let delegateTxAddr = "";
      const contractAddress = currentDAO?currentDAO.chainAddress:"";
        // props.daoDelegates === "optimism"
        //   ? "0x4200000000000000000000000000000000000042"
        //   : props.daoDelegates === "arbitrum"
        //   ? "0x912CE59144191C1204E64559FE8253a0e49E6548"
        //   : "";

      try {
        let delegateTx;
        //If user is not connected and check delagate session
        const public_client = createPublicClient({
          // chain: props.daoDelegates === "optimism" ? optimism : arbitrum,
          chain:daoConfigs[props.daoDelegates].viemchain,
          transport: http(),
        });

        delegateTx = (await public_client.readContract({
          address: contractAddress as `0x${string}`,
          abi: dao_abi.abi,
          functionName: "delegates",
          args: [props.individualDelegate],
        })) as string;

        delegateTxAddr = delegateTx;
        if (
          delegateTxAddr.toLowerCase() ===
          props.individualDelegate?.toLowerCase()
        ) {
          setSelfDelegate(true);
        }
        // setIsPageLoading(false);
      } catch (error) {
        console.error("Error in reading contract", error);
        // setIsPageLoading(false);
      }
    };
    checkDelegateStatus();
  }, [props]);

  const formatNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(2) + "m";
    } else if (number >= 1000) {
      return (number / 1000).toFixed(2) + "k";
    } else {
      return number.toFixed(2);
    }
  };

  const fetchDelegateData = async () => {
    setIsFollowStatusLoading(true);

    const headers = new Headers({
      "Content-Type": "application/json",
    });
    const requestOptions: any = {
      method: "GET",
      headers,
    };

    try {
      // Add delegate address as query parameter
      const resp = await fetchApi(
        `/delegate-follow/savefollower?address=${props.individualDelegate}`,
        requestOptions
      );

      if (!resp.ok) {
        throw new Error("Failed to fetch delegate data");
      }

      const data = await resp.json();

      if (!data.success || !data.data || data.data.length === 0) {
        setFollowers(0); // Show 0 if no data
        return;
      }

      const followerData = data.data[0];
      const currentDaoName = props.daoDelegates.toLowerCase();
      const daoFollowers = followerData.followers.find(
        (dao: any) => dao.dao_name.toLowerCase() === currentDaoName
      );

      // console.log("daoFollowersdaoFollowers: ", daoFollowers);

      if (daoFollowers) {
        const followerCount = daoFollowers?.follower?.filter(
          (f: any) => f.isFollowing
        ).length;

        // console.log("followerCountfollowerCount: ", followerCount);

        setFollowers(followerCount);
        setFollowerCountLoading(false);

        if (walletAddress) {
          const userFollow = daoFollowers.follower.find(
            (f: any) => f.address.toLowerCase() === walletAddress.toLowerCase()
          );

          setIsFollowing(userFollow?.isFollowing ?? false);
          isNotification(userFollow?.isNotification ?? false);
        } else {
          setIsFollowing(false);
          isNotification(false);
        }
      } else {
        setFollowers(0);
        setFollowerCountLoading(false);
        setIsFollowing(false);
        isNotification(false);
      }
    } catch (error) {
      console.error("Error in fetchDelegateData:", error);
      setFollowers(0);
      setIsFollowing(false);
      isNotification(false);
    } finally {
      setFollowerCountLoading(false);
      setIsFollowStatusLoading(false);
    }
  };

  const handleConfirm = async (action: number) => {
    let delegate_address: string;
    // let follower_address: string;
    let dao: string;
    dao = props.daoDelegates;
    // let address = await walletClient.getAddresses();
    // follower_address = address[0];
    delegate_address = props.individualDelegate;

    if (action == 1) {
      setLoading(true);
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };
      try {
        const response = await fetchApi("/delegate-follow/updatefollower", {
          method: "PUT",
          headers: myHeaders,
          body: JSON.stringify({
            // Add any necessary data
            delegate_address: delegate_address,
            follower_address: walletAddress,
            action: action,
            dao: dao,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to unfollow");
        }

        const data = await response.json();
        setLoading(false);
        setUnfollowmodel(false);
        setIsFollowing(false);
        isNotification(false);
        // setFollowers(followers - 1);
        setFollowers((prev) => prev - 1);
        // isFollowed(false);
        toast.success("You have unfollowed the Delegate.");
      } catch (error) {
        console.error("Error following:", error);
      }
    } else if (action == 2) {
      if (!isConnected) {
        toast.error("Please connect your wallet!");
      } else if (!isFollowing) {
        toast.error(
          "You have to follow delegate first in order to get notification!"
        );
      } else {
        let updatenotification: boolean;
        updatenotification = !notification;
        setNotificationLoading(true);
        const token = await getAccessToken();
        const myHeaders: HeadersInit = {
          "Content-Type": "application/json",
          ...(walletAddress && {
            "x-wallet-address": walletAddress,
            Authorization: `Bearer ${token}`,
          }),
        };
        try {
          const response = await fetchApi("/delegate-follow/updatefollower", {
            method: "PUT",
            headers: myHeaders,
            body: JSON.stringify({
              // Add any necessary data
              delegate_address: delegate_address,
              follower_address: walletAddress,
              action: action,
              dao: dao,
              updatenotification: updatenotification,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to notification");
          }

          toast.success("Successfully updated notification status!");
          const data = await response.json();
          isNotification(!notification);
        } catch (error) {
          console.error("Error following:", error);
        } finally {
          setNotificationLoading(false);
        }
      }
    }
  };

  const handleFollow = async () => {
    if (!isConnected) {
      if (!authenticated) {
        // openConnectModal();
        login();
      }
    } else if (isFollowing) {
      setUnfollowmodel(true);
    } else {
      // let address = await walletClient.getAddresses();
      if (walletAddress === props.individualDelegate) {
        toast.error("You can't follow your own profile!");
      } else {
        setLoading(true);
        let delegate_address: string;
        let follower_address: any;
        let dao: string;
        dao = props.daoDelegates;
        // let address = await walletClient.getAddresses();
        follower_address = walletAddress;
        delegate_address = props.individualDelegate;
        const token = await getAccessToken();
        try {
          const response = await fetchApi("/delegate-follow/savefollower", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-wallet-address": follower_address,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              // Add any necessary data
              delegate_address: delegate_address,
              follower_address: follower_address,
              dao: dao,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to follow");
          }

          const data = await response.json();
          setLoading(false);
          toast.success(
            "Successfully followed the Delegate! Stay tuned for their updates."
          );
          // setFollowers(followers + 1);
          setFollowers((prev) => prev + 1);
          // setTimeout(() => isFollowed(true), 1000);
          setIsFollowing(true);
          isNotification(true);

          // Then update the follower count from the server
          await fetchDelegateData();
        } catch (error) {
          setLoading(false);
          console.error("Error following:", error);
        }
      }
    }
  };
  // const handleDelegateVotes = async (to: string) => {
  //   // let address;
  //   // let address1;

  //   // try {
  //   //   address = await walletClient.getAddresses();
  //   //   address1 = address[0];
  //   // } catch (error) {
  //   //   console.error("Error getting addresses:", error);
  //   //   toast.error("Please connect your MetaMask wallet!");
  //   //   return;
  //   // }

  //   if (!address || !walletAddress) {
  //     toast.error("Please connect your MetaMask wallet!");
  //     return;
  //   }

  //   let chainAddress;
  //   if (props.daoDelegates === "optimism") {
  //     chainAddress = "0x4200000000000000000000000000000000000042";
  //   } else if (props.daoDelegates === "arbitrum") {
  //     chainAddress = "0x912CE59144191C1204E64559FE8253a0e49E6548";
  //   } else {
  //     return;
  //   }

  //   if (walletClient?.chain === "") {
  //     toast.error("Please connect your wallet!");
  //   } else {
  //     let network;
  //     if (props.daoDelegates === "optimism") {
  //       network = "OP Mainnet";
  //     } else if (props.daoDelegates === "arbitrum") {
  //       network = "Arbitrum One";
  //     }

  //     if (walletClient?.chain.name === network) {
  //       try {
  //         setDelegatingToAddr(true);
  //         const delegateTx = await walletClient.writeContract({
  //           address: chainAddress,
  //           chain: props.daoDelegates === "arbitrum" ? arbitrum : optimism,
  //           abi: dao_abi.abi,
  //           functionName: "delegate",
  //           args: [to],
  //           account: walletAddress,
  //         });

  //         setDelegatingToAddr(false);
  //         setConfettiVisible(true);
  //         setTimeout(() => setConfettiVisible(false), 5000);
  //       } catch (e) {
  //         toast.error("Transaction failed");
  //         console.log(e);
  //         setDelegatingToAddr(false);
  //       }
  //     } else {
  //       toast.error("Please switch to appropriate network to delegate!");

  //       // if (openChainModal) {
  //       //   // openChainModal();
  //       // }
  //     }
  //   }
  // };

  const handleDelegateVotes = async (
    to: string,
    from_delegate: string,
    tokens: any
  ) => {
    if (!walletAddress) {
      toast.error("Please connect your wallet!");
      pushToGTM({
        event: "delegation_attempt",
        category: "Delegate Engagement",
        action: "Delegation Attempt",
        label: "Delegation Attempt - Specific Delegate",
        delegateFrom: "specificDelegate",
        delegationStatus: "failure",
      });
      return;
    }

    const chainAddress = getChainAddress(chain?.name);
    if (!chainAddress) {
      toast.error("Invalid chain address,try again!");
      pushToGTM({
        event: "delegation_attempt",
        category: "Delegate Engagement",
        action: "Delegation Attempt",
        label: "Delegation Attempt - Specific Delegate",
        delegateFrom: "specificDelegate",
        delegationStatus: "failure",
      });
      return;
    }

    // const network =
    //   props.daoDelegates === "optimism" ? "OP Mainnet" : "Arbitrum One";
    const network=daoConfigs[props.daoDelegates].chainName;
    // const chainId = props.daoDelegates === "optimism" ? 10 : 42161;
    const chainId=daoConfigs[props.daoDelegates].chainId;

    try {
      setDelegatingToAddr(true);
      pushToGTM({
        event: "delegation_attempt",
        category: "Delegate Engagement",
        action: "Delegation Attempt",
        label: "Delegation Attempt - Specific Delegate",
        delegateFrom: "specificDelegate",
        delegationStatus: "pending",
      });

      // For Privy wallets, we should get the provider from the wallet instance
      const privyProvider = await wallets[0]?.getEthereumProvider();

      if (!privyProvider) {
        toast.error("Could not get wallet provider");
        pushToGTM({
          event: "delegation_attempt",
          category: "Delegate Engagement",
          action: "Delegation Attempt",
          label: "Delegation Attempt - Specific Delegate",
          delegateFrom: "specificDelegate",
          delegationStatus: "failure",
        });
        return;
      }

      // // Create ethers provider
      const provider = new BrowserProvider(privyProvider);

      // // Get the current network
      const currentNetwork = await provider.getNetwork();
      const currentChainId = Number(currentNetwork.chainId);

      // Check if we're on the correct network
      if (currentChainId !== chainId) {
        toast.error(`Please switch to ${network} (Chain ID: ${chainId})`);

        // Try to switch network
        try {
          await privyProvider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
        } catch (switchError) {
          console.error("Failed to switch network:", switchError);
          pushToGTM({
            event: "delegation_attempt",
            category: "Delegate Engagement",
            action: "Delegation Attempt",
            label: "Delegation Attempt - Specific Delegate",
            delegateFrom: "specificDelegate",
            delegationStatus: "failure",
          });
          return;
        }
        return;
      }

      const signer = await provider.getSigner();

      const contract = new Contract(chainAddress, dao_abi.abi, signer);

      const tx = await contract.delegate(to);
      await tx.wait();
      pushToGTM({
        event: "delegation_success",
        category: "Delegate Engagement",
        action: "Delegation Success",
        label: `Delegation Success - Specific Delegate - ${getDaoNameFromUrl()}`,
        delegateFrom: "specificDelegate",
        delegationStatus: "success",
      });

      setConfettiVisible(true);
      setTimeout(() => setConfettiVisible(false), 5000);
      toast.success("Delegation successful!");

      const currentNetworkDAO = await provider.getNetwork();
      const Token =
        tokens === BigInt(0) || tokens === undefined
          ? "0.00"
          : Number(tokens / BigInt(Math.pow(10, 18))).toFixed(2); //For serialize bigInt

      const apiCallData = {
        address: walletAddress,
        delegation: {
          [currentNetworkDAO.name]: [
            {
              delegator: walletAddress,
              to_delegator: to,
              from_delegate:
                from_delegate === "N/A"
                  ? "0x0000000000000000000000000000000000000000"
                  : from_delegate,
              token: Token,
              page: "Specificdelegate",
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
        toast.error(`Network Error: Make sure you're connected to ${network}`);
      } else if (errorMessage.includes("user rejected")) {
        toast.error("Transaction was rejected by user");
      } else if (errorMessage.includes("network")) {
        toast.error(`Please connect to ${network} (Chain ID: ${chainId})`);
      } else {
        toast.error("Transaction failed. Please try again");
        console.error("Detailed error:", error);
      }
      pushToGTM({
        event: "delegation_failure",
        category: "Delegate Engagement",
        action: "Delegation Failure",
        label: `Delegation Failure - Specific Delegate - ${getDaoNameFromUrl()}`,
        delegateFrom: "specificDelegate",
        delegationStatus: "failure",
      });
    } finally {
      setDelegatingToAddr(false);
    }
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // Fetch data from your backend API to check if the address exists

  //       // const dbResponse = await axios.get(`/api/profile/${address}`);

  //       const token = await getAccessToken();
  //       const myHeaders: HeadersInit = {
  //         "Content-Type": "application/json",
  //         ...(walletAddress && {
  //           "x-wallet-address": walletAddress,
  //           Authorization: `Bearer ${token}`,
  //         }),
  //       };

  //       // const raw = JSON.stringify({
  //       //   address: props.individualDelegate,
  //       //   // daoName: props.daoDelegates,
  //       // });

  //       const requestOptions: any = {
  //         method: "GET",
  //         headers: myHeaders,
  //         // body: raw,
  //         redirect: "follow",
  //       };
  //       const res = await fetchApi(
  //         `/profile/${props.individualDelegate}`,
  //         requestOptions
  //       );

  //       const dbResponse = await res.json();

  //       if (
  //         dbResponse &&
  //         Array.isArray(dbResponse.data) &&
  //         dbResponse.data.length > 0
  //       ) {
  //         // Iterate over each item in the response data array
  //         for (const item of dbResponse.data) {
  //           // Check if address and daoName match

  //           // if (
  //           //   item.daoName === dao &&
  //           //   item.address === props.individualDelegate
  //           // ) {
  //           // Data found in the database, set the state accordingly
  //           // setResponseFromDB(true);

  //           if (item.image) {
  //             setFromDatabase(true);
  //             setDisplayImage(item.image);
  //           }

  //           setDescription(item.description);
  //           setAttestationStatistics(item?.meetingRecords ?? null);
  //           if (item.isEmailVisible) {
  //             setIsEmailVisible(true);
  //             setEmailId(item.emailId);
  //           }
  //           const matchingNetwork = item.networks?.find(
  //             (network: any) => network.dao_name === props.daoDelegates
  //           );

  //           // If a matching network is found, set the discourse ID
  //           if (matchingNetwork) {
  //             setDescription(matchingNetwork.description);
  //           } else {
  //             // Handle the case where no matching network is found
  //             console.log(
  //               "No matching network found for the specified dao_name"
  //             );
  //           }
  //           setDisplayName(item.displayName);

  //           if (!authenticated) {
  //             setIsFollowing(false);
  //             isNotification(false);
  //             await fetchDelegateData();
  //           } else {
  //             // await updateFollowerState();
  //             // await setFollowerscount();
  //             await fetchDelegateData();
  //             console.log("Followers count!", followers);
  //             setFollowerCountLoading(false);
  //             setIsFollowStatusLoading(false);
  //           }
  //           setSocials({
  //             twitter: item.socialHandles.twitter,
  //             discord: item.socialHandles.discord,
  //             discourse: item.socialHandles.discourse,
  //             github: item.socialHandles.github,
  //           });
  //           // Exit the loop since we found a match
  //           //   break;
  //           // }
  //         }
  //       } else {
  //         console.log(
  //           "Data not found in the database, fetching from third-party API"
  //         );
  //         const { avatar: fetchedAvatar } = await fetchEnsNameAndAvatar(
  //           props.individualDelegate
  //         );
  //         setDisplayImage(fetchedAvatar ? fetchedAvatar : "");
  //         setFollowerCountLoading(false);
  //         setIsFollowStatusLoading(false);
  //         // Data not found in the database, fetch data from the third-party API
  //         // }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();
  // }, [props]);

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
      return (
        delegateInfo?.profilePicture ||
        daoConfigs?daoConfigs[props.daoDelegates].logo:ccLogo)
      //   (props.daoDelegates === "optimism"
      //     ? OPLogo
      //     : props.daoDelegates === "arbitrum"
      //     ? ArbLogo
      //     : ccLogo)
      // );
    }

    // If image is from database, prepend the IPFS gateway URL
    if (isFromDatabase) {
      return `https://gateway.lighthouse.storage/ipfs/${displayImage}`;
    }

    // If image is from ENS or other source, use it directly
    return displayImage;
  };

  const getDisplayImageUrl = () => {
    // Case 1: Image from database (IPFS)
    if (displayImage && isFromDatabase) {
      return `https://gateway.lighthouse.storage/ipfs/${displayImage}`;
    }

    // Case 2: ENS Avatar
    if (avatar && !isFromDatabase) {
      return avatar;
    }

    // Case 3: Profile picture from delegateInfo
    if (delegateInfo?.profilePicture) {
      return delegateInfo.profilePicture;
    }
 
    if(daoConfigs){
      return daoConfigs[props.daoDelegates].logo || ccLogo;
    }

  };
  const getImageClassName = () => {
    if (displayImage || delegateInfo?.profilePicture) {
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
          ) : // {!isPageLoading &&
          (isDelegate || selfDelegate) && errorOccurred == false ? (
            <div className="font-poppins">
              {/* {followed && <Confetti recycle={false} numberOfPieces={550} />} */}
              <div className="flex flex-col md:flex-row pb-5 lg:py-5 px-4 md:px-6 lg:px-14 justify-between items-start">
                <div className="flex flex-col xs:flex-row xs:items-start xs:justify-start items-center lg:items-start justify-center lg:justify-start w-full lg:w-auto">
                  <div
                    className={`${
                      displayImage ? "h-full" : "h-[80vw] xs:h-auto"
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
                      {/* </div> */}

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
                      />
                    </div>
                  </div>
                  <div className="px-4 mt-4 xs:mt-0 md:mt-2 lg:mt-4 w-full xs:w-auto">
                    <div className=" flex items-center py-1">
                      <div className="font-bold text-[22px] xs:text-xl sm:text-xl lg:text-[22px] pr-4">
                        {delegateInfo?.ensName ||
                          displayEnsName ||
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
                              ? `https://twitter.com/${socials.twitter}`
                              : karmaSocials.twitter
                          }
                          className={`border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 ${
                            socials.twitter == "" && karmaSocials.twitter == ""
                              ? "hidden"
                              : ""
                          }`}
                          style={{
                            backgroundColor: "rgba(217, 217, 217, 0.42)",
                          }}
                          target="_blank"
                        >
                          <FaXTwitter color="#7C7C7C" size={12} />
                        </Link>
                        <Link
                          href={
                            socials.discourse?`${daoConfigs[props.daoDelegates].discourseUrl}/${socials.discourse}`:karmaSocials.discourse
                              // ? props.daoDelegates === "optimism"
                              //   ? `https://gov.optimism.io/u/${socials.discourse}`
                              //   : props.daoDelegates === "arbitrum"
                              //   ? `https://forum.arbitrum.foundation/u/${socials.discourse}`
                              //   : ""
                              // : karmaSocials.discourse
                          }
                          className={`border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1  ${
                            socials.discourse == "" &&
                            karmaSocials.discourse == ""
                              ? "hidden"
                              : ""
                          }`}
                          style={{
                            backgroundColor: "rgba(217, 217, 217, 0.42)",
                          }}
                          target="_blank"
                        >
                          <BiSolidMessageRoundedDetail
                            color="#7C7C7C"
                            size={12}
                          />
                        </Link>
                        <Link
                          href={
                            socials.discord
                              ? `https://discord.com/${socials.discord}`
                              : karmaSocials.discord
                          }
                          className={`border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 ${
                            socials.discord == "" && karmaSocials.discord == ""
                              ? "hidden"
                              : ""
                          }`}
                          style={{
                            backgroundColor: "rgba(217, 217, 217, 0.42)",
                          }}
                          target="_blank"
                        >
                          <FaDiscord color="#7C7C7C" size={12} />
                        </Link>
                        {isEmailVisible && (
                          <Link
                            href={`mailto:${emailId}`}
                            className="border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1"
                            style={{
                              backgroundColor: "rgba(217, 217, 217, 0.42)",
                            }}
                            target="_blank"
                          >
                            <FaEnvelope color="#7C7C7C" size={12} />
                          </Link>
                        )}
                        <Link
                          href={
                            socials.github
                              ? `https://github.com/${socials.github}`
                              : karmaSocials.github
                          }
                          className={`border-[0.5px] border-[#8E8E8E] rounded-full h-fit p-1 ${
                            socials.github == "" && karmaSocials.github == ""
                              ? "hidden"
                              : ""
                          }`}
                          style={{
                            backgroundColor: "rgba(217, 217, 217, 0.42)",
                          }}
                          target="_blank"
                        >
                          <FaGithub color="#7C7C7C" size={12} />
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
                      >
                        <span className="px-2 cursor-pointer" color="#3E3D3D">
                          <IoCopy
                            onClick={() => handleCopy(`${props.individualDelegate}`)}
                            className={`transition-colors duration-300 ${
                              copiedAddress === `${props.individualDelegate}`
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
                        >
                          <Button
                            className="bg-gray-200 hover:bg-gray-300 text-xs sm:text-sm "
                            onClick={() => {
                              if (typeof window === "undefined") return;
                              navigator.clipboard.writeText(
                                `${BASE_URL}/${props.daoDelegates}/${props.individualDelegate}?active=info`
                              );
                              pushToGTM({
                                event:
                                  "share_profile_button_click_specificDelegate",
                                category: "Delegate Engagement",
                                action: "Share Profile Button Click",
                                label: `Share Profile Button Click - Specific Delegate - ${getDaoNameFromUrl()}`,
                              });
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

                    <div className="flex flex-wrap gap-2 py-1 w-auto lg:w-[310px] xl:w-auto text-sm xl:text-base">
                      <div className="text-[#4F4F4F] border-[0.5px] border-[#D9D9D9] rounded-md px-3 lg:px-2 xl:px-3 py-1 flex justify-center items-center w-[109px]">
                        {followerCountLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-shade-100"></div>
                        ) : (
                          <>
                            <span className="text-blue-shade-200 font-semibold">
                              {followers ? followers : 0}
                              &nbsp;
                            </span>
                            {followers === 0 || followers === 1
                              ? "Follower"
                              : "Followers"}
                          </>
                        )}
                      </div>
                      <div className="text-[#4F4F4F] border-[0.5px] border-[#D9D9D9] rounded-md px-3 lg:px-2 xl:px-3 py-1">
                        <span className="text-blue-shade-200 font-semibold">
                          {votingPower
                            ? formatNumber(votingPower / 10 ** 18)
                            : 0}
                          &nbsp;
                        </span>
                        delegated tokens
                      </div>
                      <div className="text-[#4F4F4F] border-[0.5px] border-[#D9D9D9] rounded-md px-3 lg:px-2 xl:px-3 py-1">
                        Delegated from
                        <span className="text-blue-shade-200 font-semibold">
                          &nbsp;
                          {delegatorsCount ? formatNumber(delegatorsCount) : 0}
                          &nbsp;
                        </span>
                        Addresses
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col xs:flex-row gap-2 w-full">
                     {props.daoDelegates !== "letsgrowdao"&&( <button
                        className="bg-blue-shade-200 font-bold text-white rounded-full py-[10px] px-6 xs:py-2 xs:px-4 sm:px-6 xs:text-xs sm:text-sm text-sm lg:px-8 lg:py-[10px] w-full xs:w-[112px] md:w-auto"
                        // onClick={() =>
                        //   handleDelegateVotes(`${props.individualDelegate}`)
                        // }

                        onClick={handleDelegateModal}
                      >
                        Delegate
                      </button>
)}
                      <div className="flex gap-2 w-full">
                        <button
                          className={`font-bold xs:text-xs sm:text-sm text-sm text-white rounded-full w-full xs:w-[112px] md:w-[128px] h-[40px] lg:py-[10px] py-[10px] xs:py-2 flex justify-center items-center ${
                            isFollowing ? "bg-blue-shade-200" : "bg-black"
                          }`}
                          onClick={handleFollow}
                        >
                          {isFollowStatusLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          ) : loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          ) : isFollowing ? (
                            "Following"
                          ) : (
                            "Follow"
                          )}
                        </button>

                        <Tooltip
                          content={
                            notification
                              ? "Click to mute delegate activity alerts."
                              : "Don't miss out! Click to get alerts on delegate activity."
                          }
                          placement="top"
                          closeDelay={1}
                          showArrow
                        >
                          <div
                            className={`border  rounded-full flex items-center justify-center p-[7px] xs:p-0 size-10  ${
                              isFollowing
                                ? "cursor-pointer border-blue-shade-200"
                                : "cursor-not-allowed border-gray-200"
                            }`}
                            onClick={() =>
                              isFollowing &&
                              !notificationLoading &&
                              handleConfirm(2)
                            }
                          >
                            {notificationLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-shade-100"></div>
                            ) : isFollowing ? (
                              notification ? (
                                <IoMdNotifications className="text-blue-shade-200 size-6" />
                              ) : (
                                <IoMdNotificationsOff className="text-blue-shade-200 size-6" />
                              )
                            ) : (
                              <IoMdNotifications className="text-gray-200 size-6" />
                            )}
                          </div>
                        </Tooltip>
                      </div>

                      {isOpenunfollow && (
                        <div className="font-poppins z-[70] fixed inset-0 flex items-center justify-center backdrop-blur-md p-4">
                          <div className="bg-white rounded-3xl overflow-hidden shadow-lg w-full max-w-lg mx-4 md:mx-auto md:w-2/3 lg:w-1/2">
                            <div className="relative">
                              <div className="flex flex-col gap-1 text-white bg-[#292929] p-3 sm:p-4 md:py-7">
                                <h2 className="text-base sm:text-lg font-semibold mx-2 sm:mx-4 text-center md:text-left">
                                  Are you sure you want to unfollow this
                                  delegate?
                                </h2>
                              </div>
                              <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4">
                                <p className="mt-2 sm:mt-4 text-center text-sm sm:text-base">
                                  By unfollowing, you will miss out on important
                                  updates, exclusive alerts of delegate. Stay
                                  connected to keep up with all the latest
                                  activities!
                                </p>
                              </div>
                              <div className="flex justify-center gap-2 xs:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4">
                                <button
                                  className="bg-gray-300 text-gray-700 px-6 xs:px-8 py-3 text-sm xs:text-base font-semibold rounded-full order-2 xs:order-1"
                                  onClick={() => setUnfollowmodel(false)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="bg-red-500 text-white px-6 xs:px-8 py-3 text-sm xs:text-base font-semibold rounded-full order-1 sm:order-2"
                                  onClick={() => handleConfirm(1)}
                                >
                                  {loading ? (
                                    <div className="flex justify-center">
                                      <Oval
                                        visible={true}
                                        height="20"
                                        width="20"
                                        color="white"
                                        secondaryColor="#cdccff"
                                        ariaLabel="oval-loading"
                                      />
                                    </div>
                                  ) : (
                                    "Unfollow"
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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

              <div className="hidden md:flex gap-12 bg-[#D9D9D945] pl-16">
                <button
                  className={`border-b-2 py-4 px-2  ${
                    searchParams.get("active") === "info"
                      ? " border-blue-shade-200 text-blue-shade-200 font-semibold"
                      : "border-transparent"
                  }`}
                  onClick={() => router.push(path + "?active=info")}
                >
                  Info
                </button>
                <button
                  className={`border-b-2 py-4 px-2 ${
                    searchParams.get("active") === "pastVotes"
                      ? "text-blue-shade-200 font-semibold border-blue-shade-200"
                      : "border-transparent"
                  }`}
                  onClick={handlePastVoteClick}
                >
                  Past Votes
                </button>
                <button
                  className={`border-b-2 py-4 px-2 ${
                    searchParams.get("active") === "delegatesSession"
                      ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                      : "border-transparent"
                  }`}
                  onClick={() =>
                    router.push(path + "?active=delegatesSession&session=book")
                  }
                >
                  Sessions
                </button>
                <button
                  className={`border-b-2 py-4 px-2 ${
                    searchParams.get("active") === "officeHours"
                      ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                      : "border-transparent"
                  }`}
                  onClick={() =>
                    router.push(path + "?active=officeHours&hours=ongoing")
                  }
                >
                  Office Hours
                </button>
              </div>

              <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
                {searchParams.get("active") === "info" && (
                  <DelegateInfo
                    props={props}
                    desc={description}
                    attestationCounts={attestationStatistics}
                  />
                )}
                {searchParams.get("active") === "pastVotes" && (
                  <DelegateVotes props={props} />
                )}
                {searchParams.get("active") === "delegatesSession" && (
                  <DelegateSessions props={props} />
                )}
                {searchParams.get("active") === "officeHours" && (
                  <DelegateOfficeHrs props={props} />
                )}
              </div>
            </div>
          ) : (
            // !isPageLoading &&
            // !(isDelegate || selfDelegate) && errorOccurred &&  (
            <div className="flex flex-col justify-center items-center w-full h-screen">
              {/* <div className="text-5xl">☹️</div>{" "}
              <div className="pt-4 font-semibold text-lg">
                Oops, no such result available!
              </div> */}

              <ErrorComponent message="We're sorry, but something went wrong ! We’re Making It Right.." />
            </div>
            // )
          )
          // }
        }
        {delegateOpen && (
          <DelegateTileModal
            tempCpi={tempCpi}
            tempCpiCalling={tempCpiCalling}
            isOpen={delegateOpen}
            closeModal={handleCloseDelegateModal}
            handleDelegateVotes={() =>
              handleDelegateVotes(
                `${props.individualDelegate}`,
                delegate ? delegate : "N/A",
                accountBalance
              )
            }
            fromDelegate={delegate ? delegate : "N/A"}
            delegateName={
              delegateInfo?.ensName ||
              displayEnsName || (
                <>
                  {props.individualDelegate.slice(0, 6)}...
                  {props.individualDelegate.slice(-4)}
                </>
              )
            }
            displayImage={getDisplayImageUrl()}
            daoName={props.daoDelegates}
            addressCheck={same}
            delegatingToAddr={delegatingToAddr}
            confettiVisible={confettiVisible}
          />
        )}
      </div>
    </>
  );
}

export default SpecificDelegate;
