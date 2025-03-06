import React, { useEffect, useState, useCallback, use } from "react";
import Image from "next/image";
import { useRouter } from "next-nprogress-bar";
import { Tooltip } from "@nextui-org/react";
import { LuDot } from "react-icons/lu";
import ProposalsSkeletonLoader from "../SkeletonLoader/ProposalsSkeletonLoader";
import { dao_details } from "@/config/daoDetails";
import ErrorDisplay from "../ComponentUtils/ErrorDisplay";
import { fetchApi } from "@/utils/api";
import VotedOnOptions from "@/assets/images/votedOnOption.png";
import { Tooltip as NextUITooltip } from "@nextui-org/react";
import ProposalStatus from "./ProposalStatus";
import Alert from "../Alert/Alert";
import { daoConfigs } from "@/config/daos";
import { ProposalStatusBadge } from "./ProposalStatusBadge";

interface Proposal {
  proposalId: string;
  blockTimestamp: number;
  description?: string;
  votesLoaded?: boolean;
  support0Weight?: number;
  support1Weight?: number;
  support2Weight?: number;
  votersCount?: number;
  proposalData?: string;
  status?: string;
  proposer: string;
  queueStartTime?: number;
  queueEndTime?: number;
  endBlock: string;
  transactionHash: string;
  extension?: {
    extendedDeadline: string;
  }
  startTime?: string;
  endTime?: string;
}
interface Vote {
  voter: string;
  blockTimestamp: string | number;
  weight: string;
  support: number;
}
interface FetchVotesResponse {
  voteCastWithParams: Vote[];
  voteCasts: Vote[];
}
interface GTMEvent {
  event: string;
  category: string;
  action: string;
  label: string;
}
const cache: any = {
  optimism: null,
  arbitrum: null,
};
let optimismCache: any = null;
let arbitrumCache: any = null;

function Proposals({ props }: { props: string }) {
  const router = useRouter();
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [displayedProposals, setDisplayedProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [canceledProposals, setCanceledProposals] = useState<any[]>([]);
  const proposalsPerPage = 7;
  const isOptimism = props === "optimism";
  const currentCache = isOptimism ? optimismCache : arbitrumCache;
  const [visible, setVisible] = useState(true);
  const [isShowing, setIsShowing] = useState(true);
  const [fetchingProposalIds, setFetchingProposalIds] = useState<Set<string>>(
    new Set()
  );
  const [proposalTiming, setProposalTiming] = useState<any>(null);
  const [page, setPage] = useState(1); // Track the number of times "View More" is clicked
  const[showAlert, setShowAlert]=useState(true)
  const [proposalStatuses, setProposalStatuses] = useState<{ [key: string]: string }>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const pushToGTM = (eventData: GTMEvent) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push(eventData);
    }
  };

  const weiToEther = (wei: string): number => {
    return Number(wei) / 1e18;
  };
  const formatWeight = (weight: number): string => {
    if (weight >= 1e9) {
      return (weight / 1e9).toFixed(2) + "B";
    } else if (weight >= 1e6) {
      return (weight / 1e6).toFixed(2) + "M";
    } else if (weight >= 1e3) {
      return (weight / 1e3).toFixed(2) + "K";
    } else {
      return weight?.toFixed(2);
    }
  };
  const fetchProposals = async () => {
    setLoading(true);
    try {
      // Fetch canceled proposals
      const canceledResponse = await fetch(
        `/api/get-canceledproposal?dao=${props}`
      );
      if (!canceledResponse.ok) {
        throw new Error(
          `Failed to fetch canceled proposals: ${canceledResponse.status}`
        );
      }
      const canceledProposals = await canceledResponse.json();
      setCanceledProposals(canceledProposals);

      // Check cache
      if (cache[props]) {
        const filteredCache = cache[props]!.filter(
          (proposal: Proposal) =>
            !canceledProposals.some(
              (canceledProposal: any) =>
                canceledProposal.proposalId === proposal.proposalId
            )
        );
        setAllProposals(cache[props]);
        setDisplayedProposals(cache[props].slice(0, proposalsPerPage));
        setLoading(false);
        return;
      }

      const proposalEndpoint = isOptimism
        ? "/api/get-proposals"
        : daoConfigs[props]?.proposalAPIendpoint?.ProposalEndpoint;

      if (!proposalEndpoint) {
        throw new Error("Proposal endpoint is missing.");
      }

      // Fetch proposals and vote summary
      const [proposalsResponse, voteSummaryResponse] = await Promise.all([
        fetch(proposalEndpoint),
        fetch(`/api/get-vote-summary?dao=${props}`),
      ]);

      if (!proposalsResponse.ok || !voteSummaryResponse.ok) {
        throw new Error("Failed to fetch proposals or vote summary");
      }

      const responseData = await proposalsResponse.json();
      const voteSummaryData = await voteSummaryResponse.json();

      let newProposals: Proposal[] = [];

      if (isOptimism) {
        const {
          proposalCreated1S,
          proposalCreated2S,
          proposalCreated3S,
          proposalCreateds,
        } = responseData.data;
        newProposals = [
          ...proposalCreated1S,
          ...proposalCreated2S,
          ...proposalCreated3S,
          ...proposalCreateds,
        ]
          // .filter(p => !canceledProposals.some((cp:any) => cp.proposalId === p.proposalId))
          .map((p) => {
            const voteSummary = voteSummaryData.proposalVoteSummaries.find(
              (vote: any) => vote.proposalId === p.proposalId
            );

            return {
              ...p,
              votesLoaded: true,
              support0Weight: weiToEther(voteSummary?.weightAgainst) || 0,
              support1Weight: weiToEther(voteSummary?.weightFor) || 0,
              support2Weight: weiToEther(voteSummary?.weightAbstain) || 0,
            };
          });
        // Extract timing information from proposals
        const proposalTimestamp = newProposals.map(proposal => ({
          startTime: proposal.startTime,
          endTime: proposal.endTime,
          createdTransactionHash: proposal.transactionHash,
        }));
        // Set the timing state
        setProposalTiming(proposalTimestamp);
      } else {
        // Arbitrum handling
        newProposals = responseData.data
          .filter(
            (p: any) =>
              !canceledProposals.some(
                (cp: any) => cp.proposalId === p.proposalId
              )
          )
          .map((p: any) => {
            const voteSummary = voteSummaryData.proposalVoteSummaries.find(
              (vote: any) => vote.proposalId === p.proposalId
            );
            return {
              ...p,
              votesLoaded: true,
              support0Weight: weiToEther(voteSummary?.weightAgainst) || 0,
              support1Weight: weiToEther(voteSummary?.weightFor) || 0,
              support2Weight: weiToEther(voteSummary?.weightAbstain) || 0,
            };
          });

        // Fetch queue info for DAO
        const queueEndpoint=daoConfigs[props].proposalAPIendpoint?.ProposalQueueEndpoint;
        const queueResponse = await fetch(`${queueEndpoint}`);
        if (!queueResponse.ok) {
          throw new Error("Failed to fetch queue information");
        }
        const queueData = await queueResponse.json();

        newProposals = newProposals.map((proposal) => {
          const queueInfo = queueData.data.proposalQueueds.find(
            (q: any) => q.proposalId === proposal.proposalId
          );
          return {
            ...proposal,
            queueStartTime: queueInfo?.blockTimestamp,
            queueEndTime: queueInfo?.eta,
          };
        });
      }

      // Sort proposals by timestamp
      newProposals.sort((a, b) => b.blockTimestamp - a.blockTimestamp);
    
      // Update cache and state
      cache[props] = newProposals;
      setAllProposals(newProposals);

      setDisplayedProposals(newProposals.slice(0, proposalsPerPage));
    } catch (error: any) {
      console.error("Error fetching data:", error);
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        setError("Please check your internet connection and try again.");
      } else if (error.name === "TimeoutError") {
        setError(
          "The request is taking longer than expected. Please try again."
        );
      } else if (error.name === "SyntaxError") {
        setError(
          "We're having trouble processing the data. Please try again later."
        );
      } else {
        setError(
          "We're experiencing technical difficulties. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchProposalTiming = async (reset = false) => {
    try {
      const response = await fetch(`/api/get-proposal-time?dao=${props}&page=${page}`);
      if (!response.ok) throw new Error("Failed to fetch proposal timing");
      const data = await response.json();
      setPage(data.currentPage + 1); // Increment page
      console.log("arbitrum data",data) 
      setProposalTiming((prevProposals: any) => {
        if (reset) {
          return [...data.proposals]; // Reset state with new data
        }

        // Use a Map to ensure unique proposals based on transaction hash
        const proposalMap = new Map(prevProposals.map((p: any) => [p.createdTransactionHash, p]));

        data.proposals.forEach((proposal: any) => {
          proposalMap.set(proposal.createdTransactionHash, proposal);
        });

        return Array.from(proposalMap.values());
      });
    } catch (error) {
      console.error("Error fetching proposal timing:", error);
    }
  };



  // Initial fetch when component mounts
  useEffect(() => {
    if (props === "arbitrum") {
      fetchProposalTiming(true); // Reset data on first load
    }
  }, []);
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const fetchVotePage = async (
    proposalId: string,
    lastBlockTimestamp: string,
    batchSize: number,
    retryCount = 0
  ): Promise<{ votes: Vote[]; nextBlockTimestamp: string | null }> => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds

    try {
      const response = await fetchApi(
        `/get-voters?proposalId=${proposalId}&blockTimestamp=${lastBlockTimestamp}&first=${batchSize}&dao=${props}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FetchVotesResponse = await response.json();
      const votes = [...(data?.voteCasts || [])];
      const votesWithParams = [...(data?.voteCastWithParams || [])];
      // Merge votes and votesWithParams
      const combinedVotes = [...votes, ...votesWithParams];

      if (combinedVotes.length === 0) {
        return { votes: [], nextBlockTimestamp: null };
      }

      // Sort votes by blockTimestamp to ensure proper ordering
      const sortedVotes = votes.sort((a, b) => {
        const timeA =
          typeof a.blockTimestamp === "string"
            ? parseInt(a.blockTimestamp)
            : a.blockTimestamp;
        const timeB =
          typeof b.blockTimestamp === "string"
            ? parseInt(b.blockTimestamp)
            : b.blockTimestamp;
        return timeA - timeB;
      });

      // Get the last timestamp and add 1 for the next page
      const lastVote = sortedVotes[sortedVotes.length - 1];
      const nextBlock =
        typeof lastVote.blockTimestamp === "string"
          ? (parseInt(lastVote.blockTimestamp) + 1).toString()
          : (lastVote.blockTimestamp + 1).toString();
      return {
        votes: combinedVotes,
        nextBlockTimestamp: votes.length >= batchSize ? nextBlock : null,
      };
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        await sleep(RETRY_DELAY * Math.pow(2, retryCount));
        return fetchVotePage(
          proposalId,
          lastBlockTimestamp,
          batchSize,
          retryCount + 1
        );
      }
      throw error;
    }
  };

  const fetchVotes = useCallback(
    async (proposal: Proposal): Promise<Proposal> => {
      if (fetchingProposalIds.has(proposal.proposalId)) {
        throw new Error("Already fetching votes for this proposal");
      }

      setFetchingProposalIds((prev) => new Set(prev).add(proposal.proposalId));

      const BATCH_SIZE = 1000;
      let allVotes = new Map<string, Vote>(); // Use Map for efficient deduplication
      let lastBlockTimestamp = "0";
      let hasMore = true;
      let totalPages = 0;
      const MAX_PAGES = 50; // Safety limit

      try {
        while (hasMore && totalPages < MAX_PAGES) {
          totalPages++;

          const { votes, nextBlockTimestamp } = await fetchVotePage(
            proposal.proposalId,
            lastBlockTimestamp,
            BATCH_SIZE
          );

          // Process and deduplicate votes
          votes.forEach((vote) => {
            const key = `${vote.voter}-${vote.blockTimestamp}`;
            if (!allVotes.has(key)) {
              allVotes.set(key, vote);
            }
          });

          if (!nextBlockTimestamp) {
            hasMore = false;
          } else {
            lastBlockTimestamp = nextBlockTimestamp;
            // Add small delay between pages to prevent rate limiting
            await sleep(200);
          }

          // Log progress
        }

        if (totalPages >= MAX_PAGES) {
          // console.warn(`Reached maximum pages for proposal ${proposal.proposalId}`);
        }

        // Calculate vote weights
        const voteWeights = Array.from(allVotes.values()).reduce(
          (acc, vote) => {
            const weightInEther = weiToEther(vote.weight);
            const supportKey =
              `support${vote.support}Weight` as keyof typeof acc;
            acc[supportKey] += weightInEther;
            return acc;
          },
          { support0Weight: 0, support1Weight: 0, support2Weight: 0 }
        );

        return {
          ...proposal,
          ...voteWeights,
          votersCount: allVotes.size,
          votesLoaded: true,
        };
      } catch (error) {
        console.error(
          `Error fetching votes for proposal ${proposal.proposalId}:`,
          error
        );
        throw error;
      } finally {
        setFetchingProposalIds((prev) => {
          const next = new Set(prev);
          next.delete(proposal.proposalId);
          return next;
        });
      }
    },
    [props, fetchingProposalIds]
  );

  useEffect(() => {
    const fetchVotesForDisplayedProposals = async () => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        // Process proposals in smaller chunks
        const CHUNK_SIZE = 2;
        const proposalsToFetch = displayedProposals.filter(
          (p) => !p.votesLoaded && !fetchingProposalIds.has(p.proposalId)
        );

        for (let i = 0; i < proposalsToFetch.length; i += CHUNK_SIZE) {
          const chunk = proposalsToFetch.slice(i, i + CHUNK_SIZE);

          // Fetch votes for current chunk
          const results = await Promise.allSettled(chunk.map(fetchVotes));

          // Update state with results
          setDisplayedProposals((prevProposals) => {
            const updatedProposals = [...prevProposals];

            results.forEach((result, index) => {
              const currentProposal = chunk[index];
              const proposalIndex = updatedProposals.findIndex(
                (p) => p.proposalId === currentProposal.proposalId
              );

              if (proposalIndex !== -1) {
                if (result.status === "fulfilled") {
                  updatedProposals[proposalIndex] = result.value;
                } else {
                  console.error(
                    `Failed to fetch votes for proposal ${currentProposal.proposalId}:`,
                    result.reason
                  );
                  // Mark as not loaded so it can be retried
                  updatedProposals[proposalIndex] = {
                    ...updatedProposals[proposalIndex],
                    votesLoaded: false,
                  };
                }
              }
            });

            return updatedProposals;
          });

          // Add delay between chunks
          if (i + CHUNK_SIZE < proposalsToFetch.length) {
            await sleep(500);
          }
        }
      } catch (error: any) {
        console.error("Error in batch fetching:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const unfetchedProposals = displayedProposals.some(
      (p) => !p.votesLoaded && !fetchingProposalIds.has(p.proposalId)
    );

    if (unfetchedProposals) {
      fetchVotesForDisplayedProposals();
    }
  }, [displayedProposals, fetchVotes, fetchingProposalIds, loading]);
  useEffect(() => {
    const proposals = async () => {
      if (currentCache && currentCache.props === props) {
        setDisplayedProposals(currentCache.updatedProposals);
        setLoading(false);
      } else {
        const allData = await fetchProposals();
      }
    };
    proposals();
  }, [props]);

  const isProposalCanceled = (proposalId: string, canceledProposals: any[]) => {
    return (
      Array.isArray(canceledProposals) &&
      canceledProposals.some((item) => item.proposalId === proposalId)
    );
  };

  const hasVotingStarted = (proposal: any) => {
    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
    return currentTime >= proposal.blockTimestamp;
  };

  const getProposalStatusYet = (
    proposal: any,
    canceledProposals: any[]
  ): { text: string; style: string } => {
    const noVotes =
      proposal.support1Weight === 0 &&
      proposal.support0Weight === 0 &&
      proposal.support2Weight === 0;

    if (isProposalCanceled(proposal.proposalId, canceledProposals)) {
      return {
        text:
          proposal.support1Weight! > proposal.support0Weight!
            ? `${formatWeight(proposal.support1Weight!)} FOR`
            : `${formatWeight(proposal.support0Weight!)} AGAINST`,
        style:
          proposal.support1Weight! > proposal.support0Weight!
            ? "text-[#639b55] border-[#639b55] bg-[#dbf8d4]"
            : "bg-[#fa989a] text-[#e13b15] border-[#e13b15]",
      };
    }

    if (noVotes) {
      return {
        text: !hasVotingStarted(proposal) ? "Yet to start" : "No votes",
        style: "bg-[#FFEDD5] border-[#F97316] text-[#F97316]",
      };
    }

    return {
      text:
        proposal.support1Weight! > proposal.support0Weight!
          ? `${formatWeight(proposal.support1Weight!)} FOR`
          : `${formatWeight(proposal.support0Weight!)} AGAINST`,
      style:
        proposal.support1Weight! > proposal.support0Weight!
          ? "text-[#639b55] border-[#639b55] bg-[#dbf8d4]"
          : "bg-[#fa989a] text-[#e13b15] border-[#e13b15]",
    };
  };

  const loadMoreProposals = useCallback(async () => {
    setLoadingMore(true);
    try{
    if (props === "optimism") {
      let nextPage;
      if (currentCache) {
        nextPage =
          Math.ceil(currentCache.updatedProposals.length / proposalsPerPage) +
          1;
      } else {
        nextPage = currentPage + 1;
      }
      const startIndex = (nextPage - 1) * proposalsPerPage;
      const endIndex = startIndex + proposalsPerPage;
      const newProposals = cache[props].slice(startIndex, endIndex);

      // Use a Set to ensure uniqueness based on proposalId
      const uniqueProposals = new Set(
        [...displayedProposals, ...newProposals].map((p) => JSON.stringify(p))
      );
      setDisplayedProposals(
        Array.from(uniqueProposals).map((p) => JSON.parse(p))
      );

      setCurrentPage(nextPage);
    } else {
      // For Arbitrum
      // setPage((prevPage) => prevPage + 1); // Increment page
      await fetchProposalTiming(); // Fetch more proposals
      const currentLength = displayedProposals.length;
      const moreProposals = cache[props].slice(
        currentLength,
        currentLength + proposalsPerPage
      );

      // Use a Set to ensure uniqueness based on proposalId
      const uniqueProposals = new Set(
        [...displayedProposals, ...moreProposals].map((p) => JSON.stringify(p))
      );
      setDisplayedProposals(
        Array.from(uniqueProposals).map((p) => JSON.parse(p))
      );

      if (currentLength + proposalsPerPage >= cache[props].length) {
        fetchProposals();
      }
    }
  } catch (error) {
    console.error("Error loading more proposals:", error);
  } finally {
    setLoadingMore(false); // Stop loading regardless of success or failure
  }
  }, [
    props,
    allProposals,
    currentPage,
    displayedProposals,
    currentCache,
    cache,
    proposalsPerPage,
    fetchProposals,
  ]);

  const truncateText = (text: string, charLimit: number) => {
    const cleanedText = text.replace(/#/g, "");

    return cleanedText.length <= charLimit
      ? cleanedText
      : cleanedText.slice(0, charLimit) + "...";
  };

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

  if (loading && displayedProposals.length === 0)
    return <ProposalsSkeletonLoader />;

  const handleRetry = () => {
    setError(null);
    fetchProposals();
    window.location.reload();
  };

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorDisplay message={error} onRetry={handleRetry} />
      </div>
    );

  if (!visible) return null;
  const VoteLoader = () => (
    <div className=" flex justify-center items-center w-28 xs:w-32">
      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black-shade-900"></div>
    </div>
  );
  const StatusLoader = () => (
    <div className="flex items-center justify-center w-[84px] xs:w-24">
      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black-shade-900"></div>
    </div>
  );

  const handleClick = (proposal: Proposal) => {
    pushToGTM({
      event: "proposal_click",
      category: "Proposal Engagement",
      action: "Proposal Click",
      label: `Proposal Click - Proposal ID: ${proposal.proposalId}`,
    });
    router.push(`/${props}/proposals/${proposal.proposalId}`);
  };

  const handleClose = () => {
    setIsShowing(false);
  };

  return (
    <>
      {/* {showAlert && !isOptimism && (
        <Alert
          message={
            <>
            ⚠️ <b>Important Notice:</b> The statuses <b>&quot;Closed&quot;</b> and{" "}
            <b>&quot;Succeeded&quot;</b> displayed for Proposals 2 & 3 are incorrect. 🛠️
            Voting has been extended and remains open. ✅ We are actively
            working to fix this issue. Please check back later to cast your
            vote! 🗳️
          </>
          }
          type="error"
          onClose={handleCloseAlert}
        />
      )} */}
      <div className="rounded-[2rem] mt-4">
        {displayedProposals.map((proposal: Proposal, index: number) => (
          <div
            key={index}
            className="flex flex-col 1.5md:flex-row px-2 py-4 0.5xs:p-4 text-lg mb-2 gap-2 1.5md:gap-5 bg-gray-100  hover:bg-gray-50 rounded-3xl transition-shadow duration-300 ease-in-out shadow-lg cursor-pointer 1.5md:items-center group"
            onClick={() => handleClick(proposal)}
          >
            <div className="flex items-center 1.5md:w-[55%] 2md:w-[60%]">
              <Image
                src={dao_details[props as keyof typeof dao_details].logo}
                alt={`${dao_details[props as keyof typeof dao_details].title
                  } logo`}
                className="size-10 ml-0 mr-[2px] 0.2xs:mr-2 xs:mx-5 rounded-full flex-shrink-0"
              />

              <div>
                <p className="text-base font-medium group-hover:text-blue-500 transition-colors duration-300">
                  {proposal.proposalId ===
                    "109425185690543736048728494223916696230797128756558452562790432121529327921478"
                    ? `[Cancelled] ${truncateText(
                      proposal.description || "",
                      65
                    )}`
                    : truncateText(proposal.description || "", 65)}
                </p>
                <div className="flex gap-1">
                  {/* <Image src={user} alt="" className="size-4" /> */}
                  <p className="flex text-[9px] xs:text-[11px] font-normal items-center">
                    <span className="text-[#004DFF]"> Created at </span>&nbsp;
                    {formatDate(proposal.blockTimestamp)}
                    <span>
                      <LuDot />
                    </span>
                    <span className="font-bold text-xs xs:text-sm text-blue-shade-200">
                      OnChain
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center 1.5md:w-[45%] 2md:w-[40%] mt-2 1.5md:mt-0 gap-1 2md:gap-2 mx-auto 1.5md:mx-0">
              {proposal.votesLoaded ? (
                <ProposalStatus
                  proposal={proposal}
                  canceledProposals={canceledProposals}
                  networkType={props} // or whatever network you're using
                  proposalTiming={proposalTiming?.find((timing: any) => timing.createdTransactionHash === proposal.transactionHash)}
                />
              ) : (
                <StatusLoader />
              )}

              {proposal.votesLoaded ? (
                <div
                  className={`py-0.5 rounded-md text-xs xs:text-sm font-medium flex justify-center items-center w-28 xs:w-32 
                  ${proposal?.proposalData ? '' : getProposalStatusYet(proposal, canceledProposals).style}`}
                >
                  {proposal?.proposalData
                    ? <NextUITooltip content='Multiple Options'><Image src={VotedOnOptions} alt="Multiple Options" className="w-6 h-6" /></NextUITooltip>
                    : getProposalStatusYet(proposal, canceledProposals).text}
                </div>
              ) : (
                <VoteLoader />
              )}
              <div className="rounded-full bg-[#F4D3F9] border border-[#77367A] flex text-[#77367A] text-[10px] xs:text-xs h-[22px] items-center justify-center w-[92px] xs:h-fit py-[1px] xs:py-0.5 font-medium px-2 ">
                <ProposalStatusBadge
                  proposal={proposal} matchedProposal={proposalTiming?.find((timing: any) => timing.createdTransactionHash === proposal.transactionHash)} canceledProposals={canceledProposals}
                />              
                </div>
            </div>
          </div>
        ))}
        {displayedProposals?.length < cache[props]?.length && (
          <div className="flex items-center justify-center">
            <button
              onClick={loadMoreProposals}
              className="bg-blue-shade-100 text-white py-2 px-4 w-[115px] flex justify-center items-center rounded-lg font-medium"
            >
                {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                </>
                ) : (
                "View More"
                )}
              </button>
            </div>
           )}
      </div>
    </>
  );
}

export default Proposals;
