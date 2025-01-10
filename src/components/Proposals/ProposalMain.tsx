"use client";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  RefObject,
} from "react";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import Image from "next/image";
import user1 from "@/assets/images/daos/user1.png";
import { IoArrowBack } from "react-icons/io5";
import { IoShareSocialSharp } from "react-icons/io5";
import { useSearchParams } from "next/navigation";
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
import { useAccount } from "wagmi";
import { hash } from "crypto";
import { marked } from "marked";
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
  ResponsiveContainer,
} from "recharts";
import { RiArrowRightUpLine, RiExternalLinkLine } from "react-icons/ri";
import ProposalMainVotersSkeletonLoader from "../SkeletonLoader/ProposalMainVotersSkeletonLoader";
import ProposalMainDescriptionSkeletonLoader from "../SkeletonLoader/ProposalMainDescriptionSkeletonLoader";
import DOMPurify from "dompurify";
import MobileResponsiveMessage from "../MobileResponsiveMessage/MobileResponsiveMessage";
import { Transaction } from "ethers";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { fetchApi } from "@/utils/api";
import { GiConsoleController } from "react-icons/gi";
import { fetchEnsNameAndAvatar, getENSName } from "@/utils/ENSUtils";
import ConnectwalletHomePage from "../HomePage/ConnectwalletHomePage";

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

  const getContractAddress = async (txHash: `0x${string}`) => {
    try {
      const transaction = await client.getTransaction({ hash: txHash });
      const transactionReceipt = await client.getTransactionReceipt({
        hash: txHash,
      });

      if (transaction.to) {
        return transaction.to;
      } else {
        return "Not a contract interaction or creation";
      }
    } catch (error) {
      console.error("Error:", error);
      return "Error retrieving transaction information";
    }
  };

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
    if (walletClient?.chain.name === "OP Mainnet") {
      chain = "optimism";
    } else if (walletClient?.chain.name === "Arbitrum One") {
      chain = "arbitrum";
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
    let chainAddress;
    let currentChain;
    if (chain?.name === "OP Mainnet") {
      chainAddress = "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10";
      currentChain = "optimism";
    } else if (chain?.name === "Arbitrum One") {
      chainAddress = await getContractAddress(data.transactionHash);
      currentChain = "arbitrum";
    } else {
      currentChain = "";
      return;
    }

    if (currentChain === "") {
      toast.error("Please connect your wallet!");
    } else if (comment) {
      if (currentChain === props.daoDelegates) {
        try {
          const delegateTx = await walletClient.writeContract({
            address: chainAddress,
            chain: props.daoDelegates === "arbitrum" ? arbitrum : optimism,
            abi:
              props.daoDelegates === "arbitrum"
                ? arb_proposals_abi
                : op_proposals_abi,
            functionName: "castVoteWithReason",
            args: [proposalId, vote, comment],
            account: walletAddress,
          });
          StoreData(voteData);
        } catch (e) {
          toast.error("Transaction failed");
        }
      }
    } else if (!comment) {
      if (currentChain === props.daoDelegates) {
        try {
          const delegateTx = await walletClient.writeContract({
            address: chainAddress,
            chain: props.daoDelegates === "arbitrum" ? arbitrum : optimism,
            abi:
              props.daoDelegates === "arbitrum"
                ? arb_proposals_abi
                : op_proposals_abi,
            functionName: "castVote",
            args: [proposalId, vote],
            account: walletAddress,
          });
          StoreData(voteData);
        } catch (e) {
          toast.error("Transaction failed");
        }
      }
    }
  };

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

      const data = await response.json();

      setHasVoted(data.voterExists);
    } catch (error) {
      console.error("Error fetching vote status:", error);
    }
  };

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

  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
      } else {
        contentRef.current.style.maxHeight = "141px"; // 6 lines * 24px line-height
      }
    }
  }, [isExpanded, data?.description]);
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
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
      const response = await fetch(`/api/get-canceledproposal`);
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

          if (proposalCreated1S.length > 0) {
            setData(proposalCreated1S[0]);
          } else if (proposalCreated2S.length > 0) {
            setData(proposalCreated2S[0]);
          } else if (proposalCreated3S.length > 0) {
            setData(proposalCreated3S[0]);
          } else if (proposalCreateds.length > 0) {
            setData(proposalCreateds[0]);
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
          const response = await fetch(
            `/api/get-arbitrumproposals?proposalId=${props.id}`
          );
          const result = await response.json();
          setData(result.data.proposalCreateds[0]);

          const queueResponse = await fetch("/api/get-arbitrum-queue-info");
          const queueData = await queueResponse.json();

          const queueInfo = queueData.data.proposalQueueds.find(
            (q: any) => q.proposalId === props.id
          );
          setQueueStartTime(queueInfo?.blockTimestamp);
          setQueueEndTime(queueInfo?.eta);
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
    // Transform the data directly from the new query
    const processedData = data.map((summary) => ({
      name: summary.dayString,
      For: parseFloat(summary.weightFor) / 1e18,
      Against: parseFloat(summary.weightAgainst) / 1e18,
      Abstain: parseFloat(summary.weightAbstain) / 1e18,
      totalVotes: parseFloat(summary.totalVotes) / 1e18,
      date: new Date(summary.dayString), // Assuming 'day' is a valid date string
    }));

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
    if (props.daoDelegates === "optimism") {
      router.push(`/optimism/${address}?active=info`);
    } else {
      router.push(`/arbitrum/${address}?active=info`);
    }
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

  const getProposalStatus = (data: any, props: any, canceledProposals: any) => {
    if (!data || !data.blockTimestamp)
      return { status: null, votingPeriodEnd: null };

    const proposalTime: any = new Date(data.blockTimestamp * 1000);
    const currentTime: any = new Date();
    const timeDifference = currentTime - proposalTime;
    const daysDifference = timeDifference / (24 * 60 * 60 * 1000);
    const votingPeriod = props.daoDelegates === "arbitrum" ? 17 : 7;
    const votingPeriodEnd = new Date(
      proposalTime.getTime() + votingPeriod * 24 * 60 * 60 * 1000
    );
    console.log("day diffrence", daysDifference);
    if (canceledProposals.some((item: any) => item.proposalId === props.id)) {
      return { status: "Closed", votingPeriodEnd };
    }

    if (props.daoDelegates === "arbitrum") {
      if (daysDifference <= 3) {
        const daysLeft = Math.ceil(3 - daysDifference);
        return {
          status: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} to go`,
          votingPeriodEnd,
        };
      } else if (daysDifference <= 17) {
        return { status: "Active", votingPeriodEnd };
      }
    } else {
      if (daysDifference <= 7) {
        return { status: "Active", votingPeriodEnd };
      }
    }

    return { status: "Closed", votingPeriodEnd };
  };

  const { status, votingPeriodEnd } = getProposalStatus(
    data,
    props,
    canceledProposals
  );
  const isActive = status === "Active" && !(props.daoDelegates === "optimism");
  const getVotingPeriodEnd = () => {
    if (!data || !data.blockTimestamp) return null;

    const baseTimestamp = new Date(data.blockTimestamp * 1000);
    const votingPeriod = props.daoDelegates === "arbitrum" ? 17 : 7;
    return new Date(
      baseTimestamp.getTime() + votingPeriod * 24 * 60 * 60 * 1000
    );
  };

  const votingPeriodEndData = getVotingPeriodEnd();
  const currentDate = new Date();

  const getProposalStatusData = () => {
    if (!data || !data.blockTimestamp) return null;
    const proposalTime: any = new Date(data.blockTimestamp * 1000);
    const currentTime: any = new Date();
    const timeDifference = currentTime - proposalTime;
    const daysDifference = timeDifference / (24 * 60 * 60 * 1000);

    if (canceledProposals.some((item) => item.proposalId === props.id)) {
      return "CANCELLED";
    }

    if (props.daoDelegates === "arbitrum") {
      if (queueStartTime && queueEndTime) {
        const currentTime = currentDate.getTime() / 1000; // Convert to seconds
        if (currentTime < queueStartTime) {
          return currentDate <= votingPeriodEndData! ? "PENDING" : "QUEUED";
        } else if (
          currentTime >= queueStartTime &&
          currentTime < queueEndTime
        ) {
          return "QUEUED";
        } else {
          return support1Weight! > support0Weight! ? "SUCCEEDED" : "DEFEATED";
        }
      } else {
        return !votingPeriodEndData
          ? "PENDING"
          : currentDate > votingPeriodEndData
          ? support1Weight > support0Weight
            ? "SUCCEEDED"
            : "DEFEATED"
          : "PENDING";
      }
    } else {
      console.log("endinggg propossal ", votingPeriodEndData, currentDate);

      return currentDate > votingPeriodEndData!
        ? support1Weight! > support0Weight!
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
  console.log(
    "proposal status",
    proposal_status,
    data,
    support1Weight >= 0,
    support1Weight
  );
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

      <div
        className={`rounded-[1rem] mx-4 md:mx-6 px-4 lg:mx-16 pb-6 pt-[68px] transition-shadow duration-300 ease-in-out shadow-xl bg-gray-50 font-poppins relative ${
          isExpanded ? "h-fit" : "h-fit"
        }`}
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
              <Image src={chainImg} alt="" className="w-6 h-6 cursor-pointer" />
            </Tooltips>
          </div>
          {isActive && (
            <button
              className="rounded-full bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg shadow-md px-3 py-1.5"
              type="button"
              onClick={voteOnchain}
              disabled={hasVoted}
            >
              Vote onchain
            </button>
          )}
          <div className="flex-shrink-0">
            <div
              className={`rounded-full flex items-center justify-center text-xs py-1 px-2 font-medium ${
                status
                  ? status === "Closed"
                    ? "bg-[#f4d3f9] border border-[#77367a] text-[#77367a]"
                    : "bg-[#f4d3f9] border border-[#77367a] text-[#77367a]"
                  : "bg-gray-200 animate-pulse rounded-full"
              }`}
            >
              {status ? status : <div className="h-4 w-16"></div>}
            </div>
          </div>
        </div>
        <div className="w-full mb-4 md:mb-0">
          <div className="flex gap-2 items-center">
            {loading ? (
              <div className="h-5 bg-gray-200 animate-pulse w-[50vw] rounded-full"></div>
            ) : (
              <p className="text-xl md:text-2xl font-semibold">
                {formattedTitle}
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
                  isExpanded ? "max-h-full" : "max-h-36"
                }`}
              >
                <div
                  className="description-content"
                  dangerouslySetInnerHTML={{ __html: formattedDescription }}
                />
              </div>
              {contentRef.current && contentRef.current.scrollHeight > 144 && (
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

      <h1 className="my-8 mx-4 md:mx-6 lg:mx-16 text-2xl lg:text-4xl font-semibold text-blue-shade-100 font-poppins">
        Voters
      </h1>
      <div className="flex mb-20 mx-4 md:mx-6 lg:mx-16">
        <div className="flex flex-col 2md:flex-row gap-8 items-center w-full">
          <div className="h-[500px] w-full 2md:w-[40%] font-poppins px-2 0.2xs:px-4 flex items-center justify-center rounded-2xl bg-gray-50 transition-shadow duration-300 ease-in-out shadow-xl">
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

          {isChartLoading ? (
            <div
              className="w-full 2md:w-[60%] h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl"
              style={{ boxShadow: "0px 4px 26.7px 0px rgba(0, 0, 0, 0.10)" }}
            >
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black-shade-900"></div>
            </div>
          ) : voterList.length === 0 && chartData.length === 0 ? (
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
                    labelStyle={{ color: "#2d3748", fontWeight: "bold" }}
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
          )}
        </div>
      </div>
    </>
  );
}

export default ProposalMain;
