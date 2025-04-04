"use client";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  RefObject,
  PureComponent,
} from "react";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import Image from "next/image";
import user1 from "@/assets/images/daos/user1.png";
import { IoArrowBack } from "react-icons/io5";
import { IoShareSocialSharp } from "react-icons/io5";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import IndividualDaoHeader from "../ComponentUtils/IndividualDaoHeader";
import { LuDot } from "react-icons/lu";
import chainImg from "@/assets/images/daos/chain.png";
import user2 from "@/assets/images/user/user2.svg";
import user5 from "@/assets/images/user/user5.svg";
// import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";
import VotingPopup from "./VotingPopup";
import arb_proposals_abi from "../../artifacts/Dao.sol/arb_proposals_abi.json";
import op_proposals_abi from "../../artifacts/Dao.sol/op_proposals_abi.json";
import WalletAndPublicClient from "@/helpers/signer";
import toast, { Toaster } from "react-hot-toast";
import { useAccount, useReadContract } from "wagmi";
import { hash } from "crypto";
import { marked, options } from "marked";
import { createPublicClient, http } from "viem";
import { optimism, arbitrum } from "viem/chains";
import { Tooltip as Tooltips } from "@nextui-org/react";
import style from "./proposalMain.module.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Treemap,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { RiArrowRightUpLine, RiExternalLinkLine } from "react-icons/ri";
import ProposalMainVotersSkeletonLoader from "../SkeletonLoader/ProposalMainVotersSkeletonLoader";
import ProposalMainDescriptionSkeletonLoader from "../SkeletonLoader/ProposalMainDescriptionSkeletonLoader";
import DOMPurify from "dompurify";
import MobileResponsiveMessage from "../MobileResponsiveMessage/MobileResponsiveMessage";
import { Transaction, ethers } from "ethers";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";
import { GiConsoleController } from "react-icons/gi";
import { fetchEnsNameAndAvatar, getENSName } from "@/utils/ENSUtils";
import ConnectwalletHomePage from "../HomePage/ConnectwalletHomePage";
import VotingTreemap from "./VotingOptions";
import { set } from "video.js/dist/types/tech/middleware";
import calculateEthBlockMiningTime from "@/utils/calculateBlockMiningTime";
import { daoConfigs } from "@/config/daos";
import ProposalMainStatus from "./ProposalMainStatus";
import ProposalVote from "../Notification/ProposalVote";
import Proposalvotes from "./Proposalvotes";
import ProposalvotesSkeletonLoader from "../SkeletonLoader/ProposalVotesSkeletonLoader";
import ProposalMainStatusSkeletonLoader from "../SkeletonLoader/ProposalStatusSkeletonLoader";

// Create a client
const client = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

interface ArbitrumVote {
  voter: {
    name: string;
    picture: string;
    address: string;
    twitter: string;
  };
  amount: string;
  type: string;
}

interface VoteCast {
  weight: string;
  support: number;
  blockNumber: string;
  voter: string;
  transactionHash: string;
  blockTimestamp: string;
  id: string;
  reason?: string;
}
interface Props {
  id: string;
  daoDelegates: string;
}
interface Proposal {
  proposalId: string;
  blockTimestamp: number;
  description?: string;
  votesLoaded?: boolean;
  support0Weight?: number;
  support1Weight?: number;
  support2Weight?: number;
  votersCount?: number;
  queueStartTime?: number;
  queueEndTime?: number;
}

interface VoteData {
  address: string;
  proposalId: string;
  choice: string[];
  votingPower?: number;
  network: string;
}

interface GTMEvent {
  event: string;
  category: string;
  action: string;
  label: string;
  // [key: string]: any;
}

function ProposalMain({ props }: { props: Props }) {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [voterList, setVoterList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any>([]);
  const [canceledProposals, setCanceledProposals] = useState<any[]>([]);
  const [support0Weight, setSupport0Weight] = useState(0);
  const [support1Weight, setSupport1Weight] = useState(0);
  const [support2Weight, setSupport2Weight] = useState(0);
  const [isArbitrum, setIsArbitrum] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);
  const [queueStartTime, setQueueStartTime] = useState<number>();
  const [queueEndTime, setQueueEndTime] = useState<number>();
  const network = useAccount().chain;
  const { publicClient, walletClient } = WalletAndPublicClient();
  const { chain } = useAccount();
  // const { openChainModal } = useChainModal();
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [dailyVotes, setDailyVotes] = useState<any[]>([]);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const { user, ready, getAccessToken, authenticated } = usePrivy();
  const { walletAddress } = useWalletAddress();
  const [optimismVoteOptions, setOptimismVoteOptions] = useState<any[]>([]);
  const [winners, setWinners] = useState<string[]>([]);
  const [votingEndTime, setVotingEndTime] = useState<any>();
  const [proposalState, setProposalState] = useState<string | null>(null);
  const [proposalTimeline, setProposalTimeline] = useState<any[]>([]);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [showViewMoreButton, setShowViewMoreButton] = useState(false);
  const [cancelledTime, setCancelledTime] = useState();
  const path = usePathname();
  // Only run queries when both contract and proposalId are available
  const dao_name = path.split("/").filter(Boolean)[0] || "";

  function getTitleFromDescription(description: string) {
    if (!description) {
      return ""; // Or a default like "No Description"
    }

    try {
      const parsedDescription = JSON.parse(description);
      return parsedDescription.title || ""; // Return title if it exists, otherwise empty string
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return description; // If parsing fails, return the original string as is
    }
  }
  function getDescriptionFromDescription(description: string) {
    if (!description) {
      return ""; // Or a default like "No Description"
    }

    try {
      const parsedDescription = JSON.parse(description);
      return parsedDescription.description || ""; // Return title if it exists, otherwise empty string
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return description; // If parsing fails, return the original string as is
    }
  }
  function getContentUriFromDescription(description: string) {
    if (!description) {
      return ""; // Or a default like "No Description"
    }

    try {
      const parsedDescription = JSON.parse(description);
      return parsedDescription.contentURI || ""; // Return title if it exists, otherwise empty string
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return description; // If parsing fails, return the original string as is
    }
  }

  const datadummy = [
    { name: "Jan", green: 400, red: 240, blue: 350 },
    { name: "Feb", green: 300, red: 139, blue: 420 },
    { name: "Mar", green: 200, red: 380, blue: 290 },
    { name: "Apr", green: 278, red: 190, blue: 410 },
    { name: "May", green: 189, red: 480, blue: 330 },
    { name: "Jun", green: 239, red: 380, blue: 250 },
    { name: "Jul", green: 349, red: 430, blue: 380 },
  ];

  useEffect(() => {
    // Update isLargeScreen on window resize and initial load
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 1100);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pushToGTM = (eventData: GTMEvent) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push(eventData);
    }
  };

  interface VoteData {
    address: string;
    proposalId: string;
    choice: string[];
    votingPower?: number;
    network: string;
  }
  // State to store ENS data for displayed voters only
  const [ensData, setEnsData] = useState<{
    [key: string]: { name: string | null; avatar: string | null };
  }>({});
  const [showConnectWallet, setShowConnectWallet] = useState(false);

  // Fetch ENS data only for displayed voters
  useEffect(() => {
    const fetchEnsDataForDisplayed = async () => {
      const displayedVoters = voterList?.slice(0, displayCount) || [];

      // Fetch ENS data only for addresses we haven't fetched yet
      const unfetchedVoters = displayedVoters.filter(
        (voter: any) => !ensData[voter.voter]
      );

      // Fetch ENS data in parallel for better performance
      const promises = unfetchedVoters.map(async (voter: any) => {
        try {
          const { ensName, avatar } = await fetchEnsNameAndAvatar(voter.voter);
          return {
            address: voter.voter,
            data: { name: ensName, avatar: avatar },
          };
        } catch (error) {
          console.error(`Error fetching ENS data for ${voter.voter}:`, error);
          return {
            address: voter.voter,
            data: { name: null, avatar: null },
          };
        }
      });

      // Update state with new ENS data
      const results = await Promise.allSettled(promises);
      const newEnsData: {
        [key: string]: { name: string | null; avatar: string | null };
      } = {};
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          newEnsData[result.value.address] = result.value.data;
        }
      });

      setEnsData((prev) => ({
        ...prev,
        ...newEnsData,
      }));
    };

    fetchEnsDataForDisplayed();
  }, [voterList, displayCount]); // Dependencies include display parameters

  const StoreData = async (voteData: VoteData) => {
    // Make the API call to submit the vote
    const token = await getAccessToken();
    const myHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...(walletAddress && {
        "x-wallet-address": walletAddress,
        Authorization: `Bearer ${token}`,
      }),
    };
    const response = await fetchApi("/submit-vote", {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(voteData),
    });
    if (!response.ok) {
      throw new Error("Failed to submit vote");
    }
  };

  useEffect(() => {
    if (walletAddress && showConnectWallet) {
      setShowConnectWallet(false);
    }
  }, [walletAddress]);

  const voteOnchain = async () => {
    if (!walletAddress) {
      setShowConnectWallet(true);
      return;
    }
    let chain;
    // if (walletClient?.chain.name === "OP Mainnet") {
    //   chain = "optimism";
    // } else if (walletClient?.chain.name === "Arbitrum One") {
    //   chain = "arbitrum";
    // } else {
    //   chain = "";
    // }

    if (
      walletClient?.chain.name ===
      daoConfigs[props.daoDelegates.toLowerCase()].chainName
    ) {
      chain = daoConfigs[props.daoDelegates.toLowerCase()].name;
    } else {
      chain = "";
    }

    if (chain !== props.daoDelegates) {
      toast.error("Please switch to appropriate network to vote!");
      // if (openChainModal) {
      //   // openChainModal();
      // }
    } else {
      setIsVotingOpen(true);
      pushToGTM({
        event: "vote_onchain_button_click",
        category: "Proposal Engagement",
        action: "Vote Onchain Button Click",
        label: `Vote Onchain Button Click - Proposal ID: ${props.id}`,
      });
    }
  };
  const handleVoteSubmit = async (
    proposalId: string,
    vote: string[],
    comment: string,
    voteData: VoteData
  ) => {
    if (!walletAddress) {
      toast.error("Please connect your MetaMask wallet!");
      return;
    }
    let tokenContractAddress;
    let currentChain;
    // if (chain?.name === "OP Mainnet") {
    //   tokenContractAddress = "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10";
    //   currentChain = "optimism";
    // } else if (chain?.name === "Arbitrum One") {
    //   tokenContractAddress = data.contractSource.contractAddress;
    //   currentChain = "arbitrum";
    // } else {
    //   currentChain = "";
    //   return;
    // }

    if (chain?.name) {
      if (
        daoConfigs[props.daoDelegates.toLowerCase()].useContractSourceAddress
          ?.Address
      ) {
        tokenContractAddress =
          daoConfigs[props.daoDelegates.toLowerCase()].useContractSourceAddress
            ?.Address;
        currentChain =
          daoConfigs[props.daoDelegates.toLowerCase()].name.toLowerCase();
      } else if (
        !daoConfigs[props.daoDelegates.toLowerCase()].useContractSourceAddress
          ?.Address
      ) {
        currentChain =
          daoConfigs[props.daoDelegates.toLowerCase()].name.toLowerCase();
        tokenContractAddress = data.contractSource.contractAddress;
      } else {
        currentChain = "";
        return;
      }
    }

    if (currentChain === "") {
      toast.error("Please connect your wallet!");
    } else if (comment) {
      if (currentChain === props.daoDelegates) {
        try {
          const delegateTx = await walletClient.writeContract({
            address: tokenContractAddress,
            // chain: props.daoDelegates === "arbitrum" ? arbitrum : optimism,
            chain: daoConfigs[props.daoDelegates].viemchain,
            abi: daoConfigs[props.daoDelegates].proposalAbi,
            // props.daoDelegates === "arbitrum"
            //   ? arb_proposals_abi
            //   : op_proposals_abi,
            functionName: "castVoteWithReason",
            args: [proposalId, vote, comment],
            account: walletAddress,
          });
          StoreData(voteData);
          pushToGTM({
            event: "vote_submitted",
            category: "Proposal Voting",
            action: "Vote Submitted",
            label: `Vote Submitted - Chain: ${currentChain}`,
          });
        } catch (e) {
          toast.error("Transaction failed");
          pushToGTM({
            event: "vote_submission_failed",
            category: "Proposal Voting",
            action: "Vote Submission Failed",
            label: `Vote Submission Failed - Chain: ${currentChain}`,
          });
        }
      }
    } else if (!comment) {
      if (currentChain === props.daoDelegates) {
        try {
          const delegateTx = await walletClient.writeContract({
            address: tokenContractAddress,
            // chain: props.daoDelegates === "arbitrum" ? arbitrum : optimism,
            chain: daoConfigs[props.daoDelegates].viemchain,
            abi: daoConfigs[props.daoDelegates].proposalAbi,
            // props.daoDelegates === "arbitrum"
            //   ? arb_proposals_abi
            //   : op_proposals_abi,
            functionName: "castVote",
            args: [proposalId, vote],
            account: walletAddress,
          });
          StoreData(voteData);
          pushToGTM({
            event: "vote_submitted",
            category: "Proposal Voting",
            action: "Vote Submitted",
            label: `Vote Submitted - Chain: ${currentChain}`,
          });
        } catch (e) {
          toast.error("Transaction failed");
          pushToGTM({
            event: "vote_submission_failed",
            category: "Proposal Voting",
            action: "Vote Submission Failed",
            label: `Vote Submission Failed - Chain: ${currentChain}`,
          });
        }
      }
    }
  };
  // const { data: hasVotedOptimism } = useReadContract({
  //   abi: op_proposals_abi,
  //   address: '0xcDF27F107725988f2261Ce2256bDfCdE8B382B10',
  //   functionName: "hasVoted",
  //   args: [props.id, walletAddress],
  // });

  // const { data: hasVotedArbitrum } = useReadContract({
  //   abi: arb_proposals_abi,
  //   address: data?.contractSource?.contractAddress,
  //   functionName: "hasVoted",
  //   args: [props.id, walletAddress],
  // });

  const { data: has_Voted } = useReadContract({
    abi: daoConfigs[props.daoDelegates.toLowerCase()].proposalAbi,
    address: daoConfigs[props.daoDelegates.toLowerCase()]
      .useContractSourceAddress?.Address
      ? daoConfigs[props.daoDelegates.toLowerCase()].useContractSourceAddress
          ?.Address
      : data?.contractSource?.contractAddress,
    functionName: "hasVoted",
    args: [props.id, walletAddress],
  });

  useEffect(() => {
    if (data) {
      setShouldFetch(true);
    }
  }, [data]);

  const quorumDataConfig = shouldFetch
    ? {
        address:
          daoConfigs[props.daoDelegates.toLowerCase()].useContractSourceAddress
            ?.Address ?? data?.contractSource?.contractAddress,
        abi: daoConfigs[props.daoDelegates.toLowerCase()].proposalAbi,
        functionName: "quorum",
        args:
          daoConfigs[props.daoDelegates.toLowerCase()].name === "arbitrum"
            ? [
                data?.startBlock !== undefined
                  ? BigInt(data.startBlock)
                  : BigInt(0),
              ]
            : [props.id !== undefined ? BigInt(props.id) : BigInt(0)],
        chainId: daoConfigs[props.daoDelegates.toLowerCase()].chainId,
      }
    : null;

  const { data: quorumData, isLoading: isQuorumLoading } = useReadContract(
    quorumDataConfig || {}
  );

  const quorum = Number(quorumData) / 10 ** 18;
  console.log("quorum", quorum, quorumDataConfig);
  // Use the appropriate data based on the network
  // const hasUserVoted = props.daoDelegates === "optimism"
  // ? Boolean(hasVotedOptimism)
  // : Boolean(hasVotedArbitrum);

  const hasUserVoted = Boolean(has_Voted);

  useEffect(() => {
    setHasVoted(hasUserVoted);
  }, [hasUserVoted]);

  const checkVoteStatus = async () => {
    const queryParams = new URLSearchParams({
      proposalId: props.id,
      network: props.daoDelegates,
      voterAddress: walletAddress,
    } as any);
    try {
      const response = await fetchApi(
        `/get-vote-detail?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // console.log("Network response was not ok");
      }
      const result = await response.json();
    } catch (error) {
      console.error("Error fetching vote status:", error);
    }
  };
  const selectWinners = (
    options: any[],
    criteria: string,
    criteriaValue: number
  ): string[] => {
    if (criteria === "TOP_CHOICES") {
      // Sort options by votes in descending order
      const sortedOptions = [...options].sort(
        (a, b) => Number(b.votes) - Number(a.votes)
      );

      // Select top winners based on criteriaValue
      return sortedOptions
        .slice(0, criteriaValue)
        .map((option) => option.option);
    }

    if (criteria === "THRESHOLD") {
      // Select options that meet or exceed the threshold
      return options
        .filter((option) => Number(option.votes) >= criteriaValue)
        .map((option) => option.option);
    }

    // If no valid criteria, return empty array
    return [];
  };
  // Updated useEffect hook
  useEffect(() => {
    const fetchOptimismOption = async () => {
      const response = await fetch(
        `/api/get-optimism-vote-options?id=${props.id}`
      );
      const result = await response.json();

      const criteriaType = {
        criteria: result.criteria,
        criteriaValue: result.criteriaValue,
      };

      // Set vote options
      setOptimismVoteOptions(result.options);

      // Select winners based on criteria
      const winners = selectWinners(
        result.options,
        criteriaType.criteria,
        criteriaType.criteriaValue
      );

      // Set winners state if you have a setter for it
      setWinners(winners);
    };

    fetchOptimismOption();
  }, [props.id]);

  useEffect(() => {
    checkVoteStatus();
  }, [props, walletAddress]);

  const loadMore = () => {
    const newDisplayCount = displayCount + 20;
    setDisplayCount(newDisplayCount);
  };

  const [formattedTitle, setFormattedTitle] = useState("");
  const [formattedDescription, setFormattedDescription] = useState("");

  useEffect(() => {
    const formatDesc = async () => {
      if (data?.description) {
        const { title, content } = await formatDescription(data.description);
        setFormattedTitle(title);
        setFormattedDescription(content);
      }
    };

    formatDesc();
  }, [data?.description]);

  useEffect(() => {
    setIsArbitrum(props?.daoDelegates === "arbitrum");
  }, []);

  // useEffect(() => {
  //   if (contentRef.current) {
  //     if (isExpanded) {
  //       contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
  //     } else {
  //       contentRef.current.style.maxHeight = "180px"; // 6 lines * 24px line-height
  //     }
  //   }
  // }, [isExpanded, data?.description]);

  useEffect(() => {
    if (contentRef.current) {
      console.log(contentRef.current.scrollHeight, "scroll height");
      const shouldShowButton = isLargeScreen
        ? contentRef.current.scrollHeight > 640
        : contentRef.current.scrollHeight > 200;
      console.log(shouldShowButton, "shouldshow button");
      setShowViewMoreButton(shouldShowButton);
    }
  }, [data?.description, isLargeScreen, loading, , formattedDescription]);

  useEffect(() => {
    if (contentRef.current) {
      const isLargeScreen = window.innerWidth > 1100; // Check screen size

      if (isExpanded) {
        contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
      } else if (!isExpanded && isLargeScreen) {
        contentRef.current.style.maxHeight = "650px"; // 6 lines * 24px line-height
      } else {
        contentRef.current.style.maxHeight = "180px";
      }
    }
  }, [isExpanded, data?.description, isLargeScreen]);
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    pushToGTM({
      event: "view_more_less_click",
      category: "Proposal Description",
      action: isExpanded ? "View Less Click" : "View More Click",
      label: `View More/Less Click - Proposal ID: ${props.id}`,
    });
  };

  const getLineCount = (text: string) => {
    const lines = text.split("\n");
    return lines.length;
  };

  useEffect(() => {
    setLink(window.location.href);
  }, []);
  const weiToEther = (wei: string): number => {
    return Number(wei) / 1e18;
  };

  const formatDescription = async (
    description: string
  ): Promise<{ title: string; content: string }> => {
    if (!description) return { title: "", content: "" };

    const renderer = new marked.Renderer();
    (renderer as any).link = function (
      this: typeof marked.Renderer,
      {
        href,
        title,
        text,
      }: { href: string; title: string | null; text: string }
    ): string {
      // strong
      const strongPattern = /^\*\*(.*)\*\*$/;
      const match = text.match(strongPattern);
      if (match) {
        text = `<strong>${match[1]}</strong>`;
      }

      const emPattern = /^\*(.*)\*$/;
      const matchem = text.match(emPattern);
      if (matchem) {
        text = `<em>${matchem[1]}</em>`;
      }

      return `<a href="${href}" title="${
        title || ""
      }" target="_blank" rel="noopener noreferrer" class="text-blue-shade-100">${text}</a>`;
    };

    marked.setOptions({
      breaks: true,
      gfm: true,
      renderer: renderer,
    });

    try {
      let htmlContent = await marked(description, { renderer });
      const titleMatch = htmlContent.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
      const title = titleMatch ? titleMatch[1].trim() : "";
      htmlContent = htmlContent.replace(/<h[12][^>]*>.*?<\/h[12]>/i, "");

      htmlContent = htmlContent.replace(/<\/p>/g, "</p><br>");
      htmlContent = htmlContent.replace(
        /<br>\s*<\/(ul|ol|blockquote)>/g,
        "</$1>"
      );
      htmlContent = htmlContent.replace(
        /<a /g,
        '<a target="_blank" rel="noopener noreferrer" class="text-blue-shade-100 " '
      );
      htmlContent = htmlContent.replace(
        /<ul>/g,
        '<ul style="list-style-type: disc; padding-left: 2em;">'
      );
      htmlContent = htmlContent.replace(
        /<ol>/g,
        '<ol style="list-style-type: decimal; padding-left: 2em;">'
      );
      htmlContent = htmlContent.replace(
        /<li>/g,
        '<li style="margin-bottom: 0.5em;">'
      );

      if (props.daoDelegates === "arbitrum") {
        htmlContent = htmlContent.replace(
          /<h1>/g,
          '<h1 style="font-weight: 500;font-size:20px; margin-bottom:8px">'
        );
        htmlContent = htmlContent.replace(
          /<h2>/g,
          '<h2 style="font-weight: 500;font-size:18px; margin-bottom:8px">'
        );
        htmlContent = htmlContent.replace(
          /<h3>/g,
          '<h3 style="font-weight: 500;font-size:16px; margin-bottom:8px">'
        );
        htmlContent = htmlContent.replace(
          /<a /g,
          '<a target="_blank" rel="noopener noreferrer" class="text-blue-shade-100 " '
        );
      }

      const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
        ADD_ATTR: ["target", "rel"], // Allow these attributes to pass through sanitization
      });
      return { title, content: sanitizedHtml };
    } catch (error) {
      console.error("Error formatting description:", error);
      return { title: "", content: "" }; // or return a default error message
    }
  };

  useEffect(() => {
    const fetchCanacelledProposals = async () => {
      const response = await fetch(`/api/get-canceledproposal?dao=${props.daoDelegates}`);
      const result = await response.json();
      
      setCanceledProposals(result);
    };
    fetchCanacelledProposals();
  }, []);
  useEffect(() => {
    const fetchDescription = async () => {
      if (props.daoDelegates === "optimism") {
        setLoading(true);
        setError(null);
        try {
          const response = await fetchApi(
            `/get-proposals?proposalId=${props.id}`
          );
          const result = await response.json();
          const {
            proposalCreated1S,
            proposalCreated2S,
            proposalCreated3S,
            proposalCreateds,
          } = result.data;

          console.log("optimism result", result.data);
          const currentTime = Date.now() / 1000;
          if (proposalCreated1S.length > 0) {
            const proposalTime = {
              publishOnchain: {
                block: proposalCreated1S[0].blockNumber,
                time: proposalCreated1S[0].blockTimestamp,
              },
              votingStart: {
                block: proposalCreated1S[0].startBlock,
                time: proposalCreated1S[0].startTime,
              },
              votingEnd: {
                block: proposalCreated1S[0].endBlock,
                time: proposalCreated1S[0].endTime,
              },
              votingExtended: 0,
              proposalQueue: 0,
              proposalExecution: {
                block: proposalCreated1S[0].endBlock,
                time: proposalCreated1S[0].endTime,
              },
            };

            setProposalTimeline([proposalTime]);
            setData(proposalCreated1S[0]);
            setProposalState(
              currentTime < proposalCreated1S[0].endTime ? "Active" : "Closed"
            );
          } else if (proposalCreated2S.length > 0) {
            const proposalTime = {
              publishOnchain: {
                block: proposalCreated2S[0].blockNumber,
                time: proposalCreated2S[0].blockTimestamp,
              },
              votingStart: {
                block: proposalCreated2S[0].startBlock,
                time: proposalCreated2S[0].startTime,
              },
              votingEnd: {
                block: proposalCreated2S[0].endBlock,
                time: proposalCreated2S[0].endTime,
              },
              votingExtended: 0,
              proposalQueue: 0,
              proposalExecution: {
                block: proposalCreated2S[0].endBlock,
                time: proposalCreated2S[0].endTime,
              },
            };
            setProposalTimeline([proposalTime]);
            setData(proposalCreated2S[0]);
            setProposalState(
              currentTime < proposalCreated2S[0].endTime ? "Active" : "Closed"
            );
          } else if (proposalCreated3S.length > 0) {
            const proposalTime = {
              publishOnchain: {
                block: proposalCreated3S[0].blockNumber,
                time: proposalCreated3S[0].blockTimestamp,
              },
              votingStart: {
                block: proposalCreated3S[0].startBlock,
                time: proposalCreated3S[0].startTime,
              },
              votingEnd: {
                block: proposalCreated3S[0].endBlock,
                time: proposalCreated3S[0].endTime,
              },
              votingExtended: 0,
              proposalQueue: 0,
              proposalExecution: {
                block: proposalCreated3S[0].endBlock,
                time: proposalCreated3S[0].endTime,
              },
            };
            setProposalTimeline([proposalTime]);
            setData(proposalCreated3S[0]);
            setProposalState(
              currentTime < proposalCreated3S[0].endTime ? "Active" : "Closed"
            );
          } else if (proposalCreateds.length > 0) {
            const proposalTime = {
              publishOnchain: {
                block: proposalCreateds[0].blockNumber,
                time: proposalCreateds[0].blockTimestamp,
              },
              votingStart: {
                block: proposalCreateds[0].startBlock,
                time: proposalCreateds[0].startTime,
              },
              votingEnd: {
                block: proposalCreateds[0].endBlock,
                time: proposalCreateds[0].endTime,
              },
              votingExtended: 0,
              proposalQueue: 0,
              proposalExecution: {
                block: proposalCreateds[0].endBlock,
                time: proposalCreateds[0].endTime,
              },
            };
            setProposalTimeline([proposalTime]);
            setData(proposalCreateds[0]);
            setProposalState(
              currentTime < proposalCreateds[0].endTime ? "Active" : "Closed"
            );
          } else {
            setData("Nothing found");
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setError(null);
        try {
          const proposalEndpoint =
            daoConfigs[props.daoDelegates].proposalAPIendpoint
              ?.ProposalEndpoint;
          const proposalQueueEndpoint =
            daoConfigs[props.daoDelegates].proposalAPIendpoint
              ?.ProposalQueueEndpoint;

          const response = await fetch(
            `${proposalEndpoint}?proposalId=${props.id}`
          );
          const result = await response.json();
          console.log("arbitrum result", result);
          const deadlineBlock =
            result.data[0].extension?.extendedDeadline ||
            result.data[0].endBlock;
          console.log("deadlineBlock", deadlineBlock);
          const proposalStarttimestamp = result.data[0]?.startBlock
            ? await calculateEthBlockMiningTime(
                Number(result.data[0].startBlock),
                props.daoDelegates
              )
            : undefined;

          const proposalEndtimestamp = deadlineBlock
            ? await calculateEthBlockMiningTime(
                Number(deadlineBlock),
                props.daoDelegates
              )
            : undefined;

          console.log(
            "proposal timestamps",
            proposalStarttimestamp,
            proposalEndtimestamp
          );

          const currentDate = Date.now() / 1000; // Convert to seconds
          console.log(
            "proposalStarttimestamp",
            proposalStarttimestamp,
            currentDate,
            proposalEndtimestamp
          );
          // Extract epoch times
          const proposalStartTime = proposalStarttimestamp?.TimeInEpoch || 0;
          const proposalEndTime = proposalEndtimestamp?.TimeInEpoch || 0;

          let state = "Closed";
          let message = "";
          if (proposalStartTime && proposalStartTime > currentDate) {
            // Proposal is yet to start, show countdown
            const timeDiff = proposalStartTime - currentDate;
            const days = Math.floor(timeDiff / (3600 * 24));
            const hours = Math.floor((timeDiff % (3600 * 24)) / 3600);
            const minutes = Math.floor((timeDiff % 3600) / 60);

            // Build the message dynamically, filtering out zeros
            const timeParts = [];
            if (days > 0) timeParts.push(`${days}d`);
            if (hours > 0) timeParts.push(`${hours}h`);
            if (minutes > 0) timeParts.push(`${minutes}m`);

            state = `Starts in ${timeParts.join(" ")}`;
          } else if (
         (  proposalStartTime &&
            proposalEndTime &&
            currentDate >= proposalStartTime &&
            currentDate < proposalEndTime) || (result.data[0].startTime && currentDate >= result.data[0].startTime && currentDate < result.data[0].endTime)
          ) {
            // Proposal is active
            state = "Active";
          } else {
            // Proposal has ended
            state = "Closed";
          }
          if (
            Array.isArray(canceledProposals) &&
            canceledProposals.some((item: any) => item.proposalId === result.data[0].proposalId)
          ) {
            state = "Closed";
          }

          setProposalState(state);

          setVotingEndTime(proposalEndTime);
          console.log("Proposal state:", state, message);

          setData(result.data[0]);

          const queueResponse = await fetch(`${proposalQueueEndpoint}`);
          const queueData = await queueResponse.json();

          const queueInfo = queueData.data.proposalQueueds.find(
            (q: any) => q.proposalId === props.id
          );
          setQueueStartTime(queueInfo?.blockTimestamp);
          setQueueEndTime(queueInfo?.eta);
          const proposalTime = {
            publishOnchain: {
              block: result.data[0].blockNumber,
              time: result.data[0].blockTimestamp,
            },
            votingStart: {
              block: result.data[0].startBlock,
              time: proposalStarttimestamp?.TimeInEpoch ?? undefined,
            },
            votingEnd: {
              block: deadlineBlock,
              time: proposalEndtimestamp?.TimeInEpoch ?? undefined,
            },
            votingExtended: {
              block: result.data[0].extension?.extendedDeadline,
              time: result.data[0].extension?.extendedDeadline,
            },
            proposalQueue: {
              block: queueInfo?.blockNumber,
              time: queueInfo?.blockTimestamp,
            },
            proposalExecution: {
              block: queueInfo?.eta,
              time: queueInfo?.eta,
            },
          };
          console.log("proposalTime", proposalTime);
          setProposalTimeline([proposalTime]);
          console.log("proposalTimeline");
        } catch (err: any) {
          setError(err.message);
        }
      }

      setLoading(false);
    };
    fetchDescription();
  }, [props]);

  const fetchVotePage = async (blockTimestamp: string, first: number) => {
    const response = await fetch(
      `/api/get-voters?proposalId=${props.id}&blockTimestamp=${blockTimestamp}&first=${first}&dao=${props.daoDelegates}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setVoterList(data.voterDetails);
    setDailyVotes(data.proposalDailyVoteSummaries);
    return data;
  };

  const fetchVotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let accumulatedVotes: VoteCast[] = [];
    let blockTimestamp = "0";
    const BATCH_SIZE = 1000;
    const MAX_RETRIES = 3;
    const MAX_PAGES = 50; // Safety limit
    let pageCount = 0;

    try {
      // while (pageCount < MAX_PAGES) {
      pageCount++;

      // Implement retry logic
      let retryCount = 0;
      let pageData = null;

      while (retryCount < MAX_RETRIES && !pageData) {
        try {
          pageData = await fetchVotePage(blockTimestamp, BATCH_SIZE);
        } catch (err) {
          retryCount++;
          if (retryCount === MAX_RETRIES) throw err;
          await new Promise((resolve) =>
            setTimeout(resolve, 2000 * retryCount)
          );
        }
      }

      if (!pageData) {
        throw new Error("Failed to fetch page after retries");
      }

      // const newVoteCastWithParams = pageData?.voteCastWithParams || [];
      const newVoteCasts = pageData?.voterDetails || [];
      const newVotes = [...newVoteCasts];

      // Break if no new votes
      // if (newVotes.length == 1000) {
      //   break;
      // }
    } finally {
      // } catch (err: any) {
      //   console.error("Error fetching votes:", err);
      //   setError(err.message);
      //   throw err;
      // }
      setIsLoading(false);
    }
  }, [props.id, props.daoDelegates]);

  useEffect(() => {
    // Only fetch if we haven't loaded votes yet
    if (!voterList?.length && isLoading) {
      fetchVotes().catch((err) => {
        console.error("Error in vote fetching effect:", err);
      });
    }
  }, [fetchVotes]); // Remove support0Weight and support1Weight from dependencies

  const formatDate = (timestamp: number): string => {
    const milliseconds = timestamp * 1000;

    const date = new Date(milliseconds);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    const formattedHours = String(hours % 12 || 12).padStart(2, "0");

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return `${day} ${month}, ${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };

  const formatWeight = (weight: number | string): string => {
    const numWeight = Number(weight);

    if (isNaN(numWeight)) {
      return "Invalid";
    }

    if (numWeight >= 1e9) {
      return (numWeight / 1e9).toFixed(2) + "B";
    } else if (numWeight >= 1e6) {
      return (numWeight / 1e6).toFixed(2) + "M";
    } else if (numWeight >= 1e3) {
      return (numWeight / 1e3).toFixed(2) + "K";
    } else {
      return numWeight.toFixed(2);
    }
  };
  const processProposalDailyVoteSummaries = (data: any[]) => {
    console.log("data", data);
    // Transform the data directly from the new query
    const processedData = data.map((summary) => ({
      name: summary.dayString,
      For: parseFloat(summary.weightFor) / 1e18,
      Against: parseFloat(summary.weightAgainst) / 1e18,
      Abstain: parseFloat(summary.weightAbstain) / 1e18,
      totalVotes: parseFloat(summary.totalVotes) / 1e18,
      date: new Date(summary.dayString), // Assuming 'day' is a valid date string
    }));
    console.log("processedData", processedData);
    // Optional: Sort the data by date
    const sortedData = processedData.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    // Optional: Create cumulative data if needed
    const cumulativeData = sortedData.reduce(
      (
        acc: {
          name: any;
          For: number;
          Against: number;
          Abstain: number;
          totalVotes: number;
          date: Date;
        }[],
        current,
        index
      ) => {
        const previousItem = index > 0 ? acc[index - 1] : null;

        const cumulativeItem = {
          ...current,
          For: previousItem ? previousItem.For + current.For : current.For,
          Against: previousItem
            ? previousItem.Against + current.Against
            : current.Against,
          Abstain: previousItem
            ? previousItem.Abstain + current.Abstain
            : current.Abstain,
        };
        return [...acc, cumulativeItem];
      },
      []
    );
    const lastCumulativeItem = cumulativeData[cumulativeData.length - 1];

    if (lastCumulativeItem) {
      // Set the final cumulative vote totals
      setSupport1Weight(lastCumulativeItem.For); // Votes "For"
      setSupport0Weight(lastCumulativeItem.Against); // Votes "Against"
      setSupport2Weight(lastCumulativeItem.Abstain); // Votes "Abstain"
    }
    // Format the data for chart
    const chartData = cumulativeData.map((item) => ({
      name: item.name,
      For: item.For,
      Against: item.Against,
      Abstain: item.Abstain,
      date: item.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    }));
    return chartData;
  };

  // Usage in your component
  useEffect(() => {
    if (dailyVotes) {
      const newChartData = processProposalDailyVoteSummaries(dailyVotes);
      setChartData(newChartData);
    }
  }, [dailyVotes]);

  const [isChartLoading, setIsChartLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChartLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleTransactionClick = (transactionHash: any) => {
    isArbitrum
      ? window.open(`https://arbiscan.io/tx/${transactionHash}`, "_blank")
      : window.open(
          `https://optimistic.etherscan.io/tx/${transactionHash}`,
          "_blank"
        );
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(link);
    const text = encodeURIComponent(
      ` ${decodeURIComponent(
        url
      )} via @ChoraClub\n\n#choraclub #session #growth`
    );

    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, "_blank");
  };

  const handleAddressClick = (address: any) => {
    const currentDAO = daoConfigs[props.daoDelegates];

    if (currentDAO) {
      router.push(`/${currentDAO.name.toLowerCase()}/${address}?active=info`);
    }

    // if (props.daoDelegates === "optimism") {
    //   router.push(`/optimism/${address}?active=info`);
    // } else {
    //   router.push(`/arbitrum/${address}?active=info`);
    // }
  };
  const date = data?.blockTimestamp;
  const formatYAxis = (value: number) => {
    return formatWeight(value);
  };

  const truncateText = (text: string, charLimit: number) => {
    const cleanedText = text?.replace(/#/g, "");

    return cleanedText?.length <= charLimit
      ? cleanedText
      : cleanedText?.slice(0, charLimit) + "...";
  };

  const isActive =
    proposalState === "Active" && (props.daoDelegates === "arbitrum");

  const currentDate = new Date();
  useEffect(() => {
    if (canceledProposals && props.id) {
      const canceledProposal = canceledProposals.find(
        (item) => item.proposalId === props.id
      );

      if (canceledProposal) {
        setCancelledTime(canceledProposal.blockTimestamp); // Pass blockTimestamp directly
      }
    }
  }, [canceledProposals, props.id]);

  const getProposalStatusData = () => {
    if (!data || !data.blockTimestamp) return null;
    const proposalTime: any = new Date(data.blockTimestamp * 1000);
    const currentTime: any = new Date();
    const timeDifference = currentTime - proposalTime;
    const daysDifference = timeDifference / (24 * 60 * 60 * 1000);

    console.log(canceledProposals, "cancle proposal");
    if (canceledProposals.some((item) => item.proposalId === props.id)) {
      return "CANCELLED";
    }

    if (props.daoDelegates === "arbitrum") {
      console.log("queue start and end", queueStartTime, queueEndTime);
      console.log(quorum, support1Weight, support0Weight);
      if (queueStartTime && queueEndTime) {
        const currentTime = currentDate.getTime() / 1000; // Convert to seconds
        console.log("currentTime", currentTime < queueStartTime, queueEndTime);
        if (currentTime < queueStartTime) {
          return currentDate <= votingEndTime! ? "PENDING" : "QUEUED";
        } else if (
          currentTime >= queueStartTime &&
          currentTime < queueEndTime
        ) {
          return "QUEUED";
        } else {
          return quorum < support1Weight + support2Weight &&
            support1Weight! > support0Weight!
            ? "SUCCEEDED"
            : "DEFEATED";
        }
      } else {
        console.log(
          "votingEndTime",
          votingEndTime,
          currentTime.getTime(),
          quorum,
          support1Weight,
          support0Weight
        );
        return !votingEndTime
          ? "PENDING"
          : currentTime.getTime() / 1000 > votingEndTime
          ? quorum < support1Weight + support2Weight &&
            support1Weight! > support0Weight!
            ? "SUCCEEDED"
            : "DEFEATED"
          : "PENDING";
      }
    } else {
      if (
        props.id ===
          "114318499951173425640219752344574142419220609526557632733105006940618608635406" ||
        props.id ===
          "38506287861710446593663598830868940900144818754960277981092485594195671514829"
      ) {
        return "SUCCEEDED";
      }
      const currentTimeEpoch = Date.now() / 1000;
      const effectiveQuorum = dailyVotes[0]?.quorum ?? quorum;
      console.log("dailyVotes", dailyVotes, quorum, effectiveQuorum);
      console.log(
        "currentTimeEpoch",
        currentTimeEpoch,
        data.endTime,
        quorum,
        support1Weight,
        support0Weight,
        support2Weight
      );
      console.log(
        "conditioncheck",
        support1Weight! > support0Weight!,
        effectiveQuorum < support1Weight + support2Weight
      );
      return currentTimeEpoch > data.endTime!
        ? effectiveQuorum < support1Weight + support2Weight &&
          support1Weight! > support0Weight!
          ? "SUCCEEDED"
          : "DEFEATED"
        : "PENDING";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return "bg-green-200 border-green-600 text-green-600";
      case "DEFEATED":
        return "bg-red-200 border-red-500 text-red-500";
      case "QUEUED":
        return "bg-yellow-200 border-yellow-600 text-yellow-600";
      case "CANCELLED":
        return "bg-red-200 border-red-500 text-red-500";
      default:
        return "bg-yellow-200 border-yellow-600 text-yellow-600";
    }
  };

  const proposal_status = getProposalStatusData();
  const Proposalstatus =
    (data && support1Weight >= 0) || support1Weight ? proposal_status : null;

  const CustomXAxisTick = ({
    x,
    y,
    payload,
    index,
    data,
    width,
  }: {
    x: number;
    y: number;
    payload: any;
    index: number;
    data: any[];
    width: number;
  }) => {
    const firstDate = data[0].date;
    const lastDate = data[data.length - 1].date;

    const leftPadding = 70;
    const rightPadding = 30;
    const fontSize = width < 400 ? 10 : 12;

    if (index === 0) {
      return (
        <g>
          <text
            x={leftPadding}
            y={y + 15}
            fill="#718096"
            fontSize={fontSize}
            textAnchor="start"
          >
            {firstDate}
          </text>
          <text
            x={width - rightPadding}
            y={y + 15}
            fill="#718096"
            fontSize={fontSize}
            textAnchor="end"
          >
            {lastDate}
          </text>
        </g>
      );
    }

    return null;
  };

  return (
    <>
      <div className="px-4 md:px-6 lg:px-16 pb-5  pt-6 font-poppins">
        <IndividualDaoHeader />
      </div>

      <div className="flex gap-4 px-4 md:px-6 lg:px-16 mb-8 mt-5 font-poppins">
        <div
          className="text-white bg-blue-shade-100 rounded-full py-1.5 px-4 flex justify-center items-center gap-1 cursor-pointer"
          onClick={handleBack}
        >
          <IoArrowBack />
          Back
        </div>
        <div
          className="text-white bg-blue-shade-100 rounded-full py-1.5 px-4 flex justify-center items-center gap-1 cursor-pointer"
          onClick={shareOnTwitter}
        >
          Share
          <IoShareSocialSharp />
        </div>
      </div>

      <div className="flex flex-col 1.3lg:flex-row gap-2 mx-4 md:mx-6 1.7lg:mx-16">
        <div
          className={`w-full ${
            dao_name !== "letsgrowdao" ? "1.3lg:w-[70%]" : ""
          }  rounded-[1rem] px-4 pb-6 pt-[68px] transition-shadow duration-300 ease-in-out shadow-xl bg-gradient-to-br from-gray-50 to-slate-50 font-poppins relative h-auto`}
        >
          <div className="w-full flex items-center justify-end gap-2 absolute top-6 right-6 sm:right-12">
            <div className="">
              <Tooltips
                showArrow
                content={<div className="font-poppins">OnChain</div>}
                placement="right"
                className="rounded-md bg-opacity-90"
                closeDelay={1}
              >
                <Image
                  src={chainImg}
                  alt=""
                  className="w-6 h-6 cursor-pointer"
                />
              </Tooltips>
            </div>
            {isActive && (
              <button
                className={`rounded-full px-3 py-1.5 text-white shadow-md ${
                  hasVoted
                    ? "bg-green-400 cursor-default"
                    : "bg-blue-600 hover:bg-blue-500 hover:shadow-lg"
                }`}
                type="button"
                onClick={!hasVoted ? voteOnchain : undefined}
                disabled={hasVoted}
              >
                {hasVoted ? "Voted" : "Vote onchain"}
              </button>
            )}
            <div className="flex-shrink-0">
              <div
                className={`rounded-full flex items-center justify-center text-xs py-1 px-2 font-medium ${
                  proposalState
                    ? proposalState === "Closed"
                      ? "bg-[#f4d3f9] border border-[#77367a] text-[#77367a]"
                      : "bg-[#f4d3f9] border border-[#77367a] text-[#77367a]"
                    : "bg-gray-200 animate-pulse rounded-full"
                }`}
              >
                {proposalState ? (
                  proposalState
                ) : (
                  <div className="h-4 w-16"></div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full mb-4 md:mb-0">
            <div className="flex gap-2 items-center">
              {loading ? (
                <div className="h-5 bg-gray-200 animate-pulse w-[50vw] rounded-full"></div>
              ) : dao_name !== "letsgrowdao" ? (
                <p className="text-xl md:text-2xl font-semibold">
                  {formattedTitle}
                </p>
              ) : (
                <p className="text-xl md:text-2xl font-semibold">
                  {getTitleFromDescription(data.description || "")}
                </p>
              )}
            </div>
          </div>
          {showConnectWallet && (
            <ConnectwalletHomePage
              onClose={() => setShowConnectWallet(false)}
            />
          )}
          <VotingPopup
            isOpen={isVotingOpen}
            onClose={() => setIsVotingOpen(false)}
            onSubmit={handleVoteSubmit}
            proposalId={props.id}
            proposalTitle={truncateText(data?.description, 50)}
            address={walletAddress || ""}
            dao={props.daoDelegates}
            customOptions={optimismVoteOptions}
          />

          <div className="flex gap-1 my-1 items-center">
            <div className="flex text-xs font-normal items-center">
              {date ? (
                formatDate(date)
              ) : (
                <div className="animate-pulse bg-gray-200  h-4 w-32 rounded-full"></div>
              )}
            </div>
            {isLoading ? (
              <div
                className={`rounded-full flex items-center justify-center text-xs h-fit py-0.5 border font-medium w-24 bg-gray-200 animate-pulse`}
              >
                <div className="h-5 w-20"></div>
              </div>
            ) : (
              <div
                className={`rounded-full flex items-center justify-center text-xs h-fit py-0.5 border font-medium w-24 ${
                  Proposalstatus
                    ? getStatusColor(Proposalstatus)
                    : "bg-gray-200 animate-pulse rounded-full"
                }`}
              >
                {Proposalstatus ? (
                  Proposalstatus
                ) : (
                  <div className="h-5 w-20"></div>
                )}
              </div>
            )}
          </div>

          <div className="text-sm mt-3">
            {loading ? (
              <ProposalMainDescriptionSkeletonLoader />
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
              <>
                <div
                  ref={contentRef}
                  className={` transition-max-height duration-500 ease-in-out overflow-hidden ${
                    isExpanded
                      ? "max-h-full"
                      : "max-h-[200px] 1.3lg:max-h-[640px]"
                  }`}
                >
                  {dao_name !== "letsgrowdao" ? (
                    <div
                      className="description-content"
                      dangerouslySetInnerHTML={{ __html: formattedDescription }}
                    />
                  ) : (
                    <>
                      <div
                        className="description-content"
                        dangerouslySetInnerHTML={{
                          __html: getDescriptionFromDescription(
                            data.description || ""
                          ),
                        }}
                      />
                      <a
                        href={getContentUriFromDescription(
                          data.description || ""
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-shade-100"
                      >
                        {getContentUriFromDescription(data.description || "")}
                      </a>
                    </>
                  )}
                </div>
                {showViewMoreButton && (
                  <button
                    className="text-sm text-blue-shade-200 mt-2"
                    onClick={toggleExpansion}
                  >
                    {isExpanded ? "View Less" : "View More"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {dao_name !== "letsgrowdao" && (
          <div className="flex flex-col md:flex-row 1.3lg:flex-col 1.3lg:w-[30%] gap-2">
            {loading ? (
              <ProposalvotesSkeletonLoader />
            ) : (
              <div className="w-full z-10 rounded-[1rem] shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-gray-50 to-slate-50 font-poppins min-h-[416px] 1.3lg:h-fit h-full">
                <Proposalvotes
                  dao={props.daoDelegates}
                  contract={
                    daoConfigs[props.daoDelegates.toLowerCase()]
                      .useContractSourceAddress?.Address
                      ? daoConfigs[props.daoDelegates.toLowerCase()]
                          .useContractSourceAddress?.Address
                      : data?.contractSource?.contractAddress
                  }
                  proposalId={props.id}
                  blockNumber={data.startBlock}
                />
                {/* Add skeleton loader when data is loading */}
                {/* <ProposalvotesSkeletonLoader/>   */}
              </div>
            )}

            <div className="w-full z-10  rounded-[1rem] shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-gray-50 to-slate-50 font-poppins h-fit min-h-[390px]">
              {loading ? (
                <ProposalMainStatusSkeletonLoader />
              ) : (
                <ProposalMainStatus
                  proposalTimeline={proposalTimeline}
                  dao={props.daoDelegates}
                  defeated={Proposalstatus === "DEFEATED"}
                  cancelled={Proposalstatus === "CANCELLED"}
                  cancelledTime={cancelledTime}
                />
              )}

              {/* Add skeleton loader when data is loading */}
            </div>
          </div>
        )}
      </div>
      {daoConfigs[props.daoDelegates.toLowerCase()].name === "optimism" &&
      optimismVoteOptions &&
      optimismVoteOptions.length > 0 ? (
        <div
          className={`rounded-[1rem] mx-4 my-3 md:mx-6 px-4 lg:mx-16 pb-6 pt-6 transition-shadow duration-300 ease-in-out shadow-xl bg-gray-50 font-poppins relative flex justify-center items-center font-extralight tracking-wide`}
        >
          {loading ? (
            <div className="flex items-center justify-center w-full h-[500px]">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black-shade-900"></div>
            </div>
          ) : (
            <VotingTreemap votingData={optimismVoteOptions} winners={winners} />
          )}
        </div>
      ) : null}

      <h1 className="my-8 mx-4 md:mx-6 1.7lg:mx-16 text-2xl lg:text-4xl font-semibold text-blue-shade-100 font-poppins">
        Voters
      </h1>
      <div className="flex mb-20 mx-4 md:mx-6 1.7lg:mx-16">
        <div className="flex flex-col 2md:flex-row gap-8 items-center w-full">
          <div className="h-[500px] w-full 2md:w-[40%] font-poppins px-2 0.2xs:px-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50 transition-shadow duration-300 ease-in-out shadow-xl">
            {isLoading ? (
              <div className="">
                <ProposalMainVotersSkeletonLoader />
              </div>
            ) : (
              <div
                className={`flex flex-col gap-2 py-3 pl-2 pr-1 w-full xl:pl-3 xl:pr-2 my-3 border-gray-200 ${
                  voterList?.length > 5
                    ? `h-[440px] overflow-y-auto ${style.scrollbar}`
                    : "h-fit"
                }`}
              >
                {voterList && voterList?.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    ⏳ No Participation: This proposal hasn&apos;t received any
                    votes yet.
                  </div>
                ) : (
                  voterList
                    ?.slice(0, displayCount)
                    .map((voter: any, index: any) => (
                      <div
                        className="flex items-center py-6 xl:px-6 px-3 bg-white w-full transition-all duration-300 rounded-2xl border-2 border-transparent hover:border-blue-200 transform hover:-translate-y-1 space-x-6"
                        key={index}
                      >
                        <div className="flex-grow flex items-center space-x-2 1.3lg:space-x-4">
                          {ensData[voter.voter]?.avatar ? (
                            <Image
                              src={
                                ensData[voter.voter].avatar ||
                                (isArbitrum ? user2 : user5)
                              }
                              alt="ENS Avatar"
                              className="xl:w-10 w-8 xl:h-10 h-8 rounded-full"
                              width={40}
                              height={40}
                            />
                          ) : (
                            <Image
                              src={isArbitrum ? user2 : user5}
                              alt="Profile"
                              className="xl:w-10 w-8 xl:h-10 h-8 rounded-full"
                            />
                          )}

                          <div className="w-[70%]">
                            <p
                              onClick={() => handleAddressClick(voter.voter)}
                              className="text-gray-800 xl:text-sm hover:text-blue-600 transition-colors duration-200 cursor-pointer text-xs xs:text-sm 2md:text-xs overflow-hidden text-ellipsis whitespace-nowrap"
                            >
                              {ensData[voter.voter]?.name ||
                                `${voter.voter.slice(
                                  0,
                                  6
                                )}...${voter.voter.slice(-4)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 0.5xs:space-x-2 1.3lg:space-x-4">
                          <div
                            className={`py-1 xs:py-2 rounded-full 1.5lg:text-sm w-24 0.2xs:w-28 xs:w-36 2md:w-28 lg:w-[100px] 1.3lg:w-28 1.5xl:w-36 flex items-center justify-center xl:font-medium text-xs ${
                              voter.support === 1
                                ? "bg-green-100 text-green-800"
                                : voter.support === 0
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {formatWeight(voter.votingPower / 10 ** 18)}
                            &nbsp;
                            {voter.support === 1
                              ? "For"
                              : voter.support === 0
                              ? "Against"
                              : "Abstain"}
                          </div>
                          <Tooltips
                            showArrow
                            content={
                              <div className="font-poppins">
                                Transaction Hash
                              </div>
                            }
                            placement="right"
                            className="rounded-md bg-opacity-90"
                            closeDelay={1}
                          >
                            <button
                              onClick={() =>
                                handleTransactionClick(voter.transactionHash)
                              }
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                              <RiExternalLinkLine className="w-5 h-5" />
                            </button>
                          </Tooltips>
                        </div>
                      </div>
                    ))
                )}
                {displayCount <= voterList?.length && (
                  <div className="flex justify-center items-center mt-6">
                    <button
                      onClick={loadMore}
                      className="bg-blue-shade-100 text-white py-2 px-4 w-fit rounded-lg font-medium"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {dao_name !== "letsgrowdao" ? (
            isChartLoading ? (
              <div
                className="w-full 2md:w-[60%] h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl"
                style={{ boxShadow: "0px 4px 26.7px 0px rgba(0, 0, 0, 0.10)" }}
              >
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black-shade-900"></div>
              </div>
            ) : voterList?.length === 0 && chartData.length === 0 ? (
              <div
                className="w-full 2md:w-[60%] h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl"
                style={{ boxShadow: "0px 4px 26.7px 0px rgba(0, 0, 0, 0.10)" }}
              >
                <p className="text-lg font-poppins text-gray-500">
                  📊 Chart Empty: No votes have been recorded on this chart.{" "}
                </p>
              </div>
            ) : (
              <div
                ref={chartContainerRef}
                className="w-full 2md:w-[60%] transition-shadow duration-300 ease-in-out shadow-xl h-[500px] rounded-2xl flex text-sm items-center justify-center bg-gray-50 font-poppins"
              >
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 30,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={(props) => (
                        <CustomXAxisTick
                          {...props}
                          data={chartData}
                          width={chartContainerRef.current?.clientWidth ?? 600}
                        />
                      )}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatYAxis}
                      tick={{ fill: "#718096", fontSize: 12 }}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <Tooltip
                      formatter={(value) => formatWeight(value as number)}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        border: "none",
                        borderRadius: "0.5rem",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        padding: "10px",
                      }}
                      labelStyle={{ color: "#000000", fontWeight: "bold" }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: "20px",
                      }}
                      iconType="circle"
                    />
                    <Line
                      type="monotone"
                      dataKey="For"
                      stroke="#4CAF50"
                      strokeWidth={3}
                      activeDot={{
                        r: 8,
                        fill: "#4CAF50",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Against"
                      stroke="#F44336"
                      strokeWidth={3}
                      activeDot={{
                        r: 8,
                        fill: "#F44336",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Abstain"
                      stroke="#004DFF"
                      strokeWidth={3}
                      activeDot={{
                        r: 8,
                        fill: "#004DFF",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )
          ) : (
            <div className="relative w-full h-[500px] bg-gray-50 rounded-2xl p-4 shadow-md">
              <ResponsiveContainer
                width="100%"
                height="100%"
                className="opacity-40"
              >
                <BarChart
                  data={datadummy}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid
                    stroke="#e0e0e0"
                    strokeDasharray="5 5"
                    strokeOpacity={0.7}
                  />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.8)",
                      borderRadius: "10px",
                    }}
                  />

                  <Bar
                    dataKey="green"
                    fill="#14532d" // text-green-800
                    fillOpacity={0.7}
                  />
                  <Bar
                    dataKey="red"
                    fill="#991b1b" // text-red-800
                    fillOpacity={0.7}
                  />
                  <Bar
                    dataKey="blue"
                    fill="#1e40af" // text-blue-800
                    fillOpacity={0.7}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-60">
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-semibold text-gray-700 font-poppins">
                    Coming Soon! 🚀
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProposalMain;
