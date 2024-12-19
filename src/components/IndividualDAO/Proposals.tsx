import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next-nprogress-bar";
import { Tooltip } from "@nextui-org/react";
import { LuDot } from "react-icons/lu";
import opLogo from "@/assets/images/daos/op.png";
import user from "@/assets/images/daos/user1.png";
import chain from "@/assets/images/daos/chain.png";
import ProposalsSkeletonLoader from "../SkeletonLoader/ProposalsSkeletonLoader";
import ArbLogo from "@/assets/images/daos/arb.png";
import { dao_details } from "@/config/daoDetails";
import ErrorDisplay from "../ComponentUtils/ErrorDisplay";

interface Proposal {
  proposalId: string;
  blockTimestamp: number;
  description?: string;
  votesLoaded?: boolean;
  support0Weight?: number;
  support1Weight?: number;
  support2Weight?: number;
  votersCount?: number;
  status?: string;
  proposer: string;
  queueStartTime?: number;
  queueEndTime?: number;
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

  // useEffect(() => {
  //   const fetchCanacelledProposals = async () => {
  //     const response = await fetch(`/api/get-canceledproposal?dao=${props}`);
  //     const result = await response.json();
  //     setCanceledProposals(result);
  //   };
  //   fetchCanacelledProposals();
  // }, []);
  // const fetchCanceledProposals = async () => {
  //   try {
  //     const response = await fetch(`/api/get-canceledproposal?dao=${props}`);
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch canceled proposals: ${response.status}`);
  //     }
  //     const result = await response.json();
  //     setCanceledProposals(result);
  //   } catch (error: any) {
  //     console.error("Error fetching canceled proposals:", error);
  //     setError("Failed to fetch canceled proposals. Please try again later.");
  //   }
  // };

  // useEffect(() => {
  //   fetchCanceledProposals();
  // }, [props]);

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
      const canceledResponse = await fetch(`/api/get-canceledproposal?dao=${props}`);
      if (!canceledResponse.ok) {
        throw new Error(`Failed to fetch canceled proposals: ${canceledResponse.status}`);
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

      // Fetch proposals and vote summary
      const [proposalsResponse, voteSummaryResponse] = await Promise.all([
        fetch(isOptimism ? "/api/get-proposals" : "/api/get-arbitrumproposals"),
        fetch(`/api/get-vote-summary?dao=${props}`)
      ]);

      if (!proposalsResponse.ok || !voteSummaryResponse.ok) {
        throw new Error("Failed to fetch proposals or vote summary");
      }

      const responseData = await proposalsResponse.json();
      const voteSummaryData = await voteSummaryResponse.json();

      let newProposals: Proposal[] = [];

      if (isOptimism) {
        const { proposalCreated1S, proposalCreated2S, proposalCreated3S, proposalCreateds } = responseData.data;
        newProposals = [...proposalCreated1S, ...proposalCreated2S, ...proposalCreated3S, ...proposalCreateds]
          // .filter(p => !canceledProposals.some((cp:any) => cp.proposalId === p.proposalId))
          .map(p => {
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
      } else {
        // Arbitrum handling
        newProposals = responseData.data.proposalCreateds
          .filter((p:any) => !canceledProposals.some((cp:any) => cp.proposalId === p.proposalId))
          .map((p:any) => {
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

        // Fetch queue info for Arbitrum
        const queueResponse = await fetch("/api/get-arbitrum-queue-info");
        if (!queueResponse.ok) {
          throw new Error("Failed to fetch queue information");
        }
        const queueData = await queueResponse.json();
        
        newProposals = newProposals.map(proposal => {
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
        setError("The request is taking longer than expected. Please try again.");
      } else if (error.name === "SyntaxError") {
        setError("We're having trouble processing the data. Please try again later.");
      } else {
        setError("We're experiencing technical difficulties. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const proposals = async () => {
      if (currentCache && currentCache.props === props) {
        setDisplayedProposals(currentCache.updatedProposals);
        setLoading(false);
      } else {
        const allData = await fetchProposals();
        console.log("allData", allData);
      }
    };
    proposals();
  }, [props]);

  const getProposalStatus = (proposal: Proposal): string => {
    const currentTime = Date.now() / 1000; // Convert to seconds

    if (props === "arbitrum") {
      if (proposal.queueStartTime && proposal.queueEndTime) {
        if (currentTime < proposal.queueStartTime) {
          return "PENDING";
        } else if (
          currentTime >= proposal.queueStartTime &&
          currentTime < proposal.queueEndTime
        ) {
          return "QUEUED";
        } else {
          return proposal.support1Weight! > proposal.support0Weight!
            ? "SUCCEEDED"
            : "DEFEATED";
        }
      } else {
        const proposalAge = currentTime - proposal.blockTimestamp;
        if (proposalAge <= 17 * 24 * 60 * 60) {
          return "PENDING";
        } else {
          return proposal.support1Weight! > proposal.support0Weight!
            ? "SUCCEEDED"
            : "DEFEATED";
        }
      }
    } else {
      if (
        Array.isArray(canceledProposals) &&
        canceledProposals.some(
          (item) => item.proposalId === proposal.proposalId
        )
      ) {
        return "CANCELLED";
      }
      const proposalAge = currentTime - proposal.blockTimestamp;
      if (proposalAge <= 7 * 24 * 60 * 60) {
        return "PENDING";
      } else {
        return proposal.support1Weight! > proposal.support0Weight!
          ? "SUCCEEDED"
          : "DEFEATED";
      }
    }
  };
  const isProposalCanceled = (proposalId: string, canceledProposals: any[]) => {
    return Array.isArray(canceledProposals) && 
      canceledProposals.some(item => item.proposalId === proposalId);
  };
  
  const hasVotingStarted = (proposal: any) => {
    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
    return currentTime >= proposal.blockTimestamp;
  };
  
  const getProposalStatusYet = (proposal: any, canceledProposals: any[]): { text: string; style: string } => {
    const noVotes = proposal.support1Weight === 0 && 
      proposal.support0Weight === 0 && 
      proposal.support2Weight === 0;
  
    if (isProposalCanceled(proposal.proposalId, canceledProposals)) {
      return {
        text: proposal.support1Weight! > proposal.support0Weight!
          ? `${formatWeight(proposal.support1Weight!)} FOR`
          : `${formatWeight(proposal.support0Weight!)} AGAINST`,
        style: proposal.support1Weight! > proposal.support0Weight!
          ? "text-[#639b55] border-[#639b55] bg-[#dbf8d4]"
          : "bg-[#fa989a] text-[#e13b15] border-[#e13b15]"
      };
    }
  
    if (noVotes) {
      return {
        text: !hasVotingStarted(proposal) ? "Yet to start" : "No votes",
        style: "bg-[#FFEDD5] border-[#F97316] text-[#F97316]"
      };
    }
  
    return {
      text: proposal.support1Weight! > proposal.support0Weight!
        ? `${formatWeight(proposal.support1Weight!)} FOR`
        : `${formatWeight(proposal.support0Weight!)} AGAINST`,
      style: proposal.support1Weight! > proposal.support0Weight!
        ? "text-[#639b55] border-[#639b55] bg-[#dbf8d4]"
        : "bg-[#fa989a] text-[#e13b15] border-[#e13b15]"
    };
  };

  const loadMoreProposals = useCallback(() => {
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
    router.push(`/${props}/proposals/${proposal.proposalId}`);
  };

  const handleClose = () => {
    setIsShowing(false);
  };

  return (
    <>
      <div className="rounded-[2rem] mt-4">
        {isShowing && props === "arbitrum" && (
          <div
            className="bg-yellow-200 border border-gray-300 rounded-md shadow-md text-gray-700 flex items-center p-3 w-100 mb-4"
            style={{ width: "100%" }}
          >
            <span>
              We&apos;re facing a temporary rate limit issue, which may affect
              data accuracy. We&apos;re working to resolve it quickly. Thank you
              for your patience!
            </span>{" "}
            &nbsp;
            <button
              className="flex ml-auto items-center justify-center p-1 text-gray-500 hover:text-red-500 bg-white border border-gray-300 rounded-md"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        )}
        {displayedProposals.map((proposal: Proposal, index: number) => (
          <div
            key={index}
            className="flex flex-col 1.5md:flex-row px-2 py-4 0.5xs:p-4 text-lg mb-2 gap-2 1.5md:gap-5 bg-gray-100  hover:bg-gray-50 rounded-3xl transition-shadow duration-300 ease-in-out shadow-lg cursor-pointer 1.5md:items-center group"
            onClick={() => handleClick(proposal)}
          >
            <div className="flex items-center 1.5md:w-[60%]">
              <Image
                src={dao_details[props as keyof typeof dao_details].logo}
                alt={`${
                  dao_details[props as keyof typeof dao_details].title
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

            <div className="flex flex-wrap justify-between items-center 1.5md:w-[40%] mt-2 1.5md:mt-0 gap-1 2md:gap-2 mx-auto 1.5md:mx-0">
              {/* <Tooltip
                showArrow
                content={<div className="font-poppins">OnChain</div>}
                placement="bottom"
                className="rounded-md bg-opacity-90"
                closeDelay={1}
              >
                <div>
                  <Image src={chain} alt="" className="size-8" />
                </div>
              </Tooltip> */}
              {proposal.votesLoaded ? (
                <div
                  className={`rounded-full flex items-center justify-center text-[10px] xs:text-xs h-[22px] xs:h-fit py-[1px] xs:py-0.5 border font-medium w-[84px] xs:w-24 ${
                    getProposalStatus(proposal) === "SUCCEEDED"
                      ? "bg-green-200 border-green-600 text-green-600"
                      : getProposalStatus(proposal) === "DEFEATED" ||
                        getProposalStatus(proposal) === "CANCELLED"
                      ? "bg-red-200 border-red-500 text-red-500"
                      : getProposalStatus(proposal) === "QUEUED"
                      ? "bg-yellow-200 border-yellow-600 text-yellow-600"
                      : "bg-yellow-200 border-yellow-600 text-yellow-600"
                  }`}
                >
                  {getProposalStatus(proposal)}
                </div>
              ) : (
                <StatusLoader />
              )}
{/* 
              {proposal.votesLoaded ? (
                <div
                  className={`py-0.5 rounded-md text-xs xs:text-sm font-medium border flex justify-center items-center w-28 xs:w-32 
                ${
                  Array.isArray(canceledProposals) &&
                  canceledProposals.some(
                    (item) => item.proposalId === proposal.proposalId
                  )
                    ? proposal.support1Weight! > proposal.support0Weight!
                      ? "text-[#639b55] border-[#639b55] bg-[#dbf8d4]" // Styles for proposals with more 'FOR' votes
                      : "bg-[#fa989a] text-[#e13b15] border-[#e13b15]"
                    : proposal.support1Weight! === 0 &&
                      proposal.support0Weight! === 0 &&
                      proposal.support2Weight! === 0
                    ? "bg-[#FFEDD5] border-[#F97316] text-[#F97316]" // Styles for proposals that haven't started
                    : proposal.support1Weight! > proposal.support0Weight!
                    ? "text-[#639b55] border-[#639b55] bg-[#dbf8d4]" // Styles for proposals with more 'FOR' votes
                    : "bg-[#fa989a] text-[#e13b15] border-[#e13b15]" // Styles for proposals with more 'AGAINST' votes
                }`}
                >
                  {Array.isArray(canceledProposals) &&
                  canceledProposals.some(
                    (item) => item.proposalId === proposal.proposalId
                  )
                    ? proposal.support1Weight! > proposal.support0Weight!
                      ? `${formatWeight(proposal.support1Weight!)} FOR`
                      : `${formatWeight(proposal.support0Weight!)} AGAINST`
                    : proposal.support1Weight! === 0 &&
                      proposal.support0Weight! === 0 &&
                      proposal.support2Weight! === 0
                    ? "Yet to start"
                    : proposal.support1Weight! > proposal.support0Weight!
                    ? `${formatWeight(proposal.support1Weight!)} FOR`
                    : `${formatWeight(proposal.support0Weight!)} AGAINST`}
                </div>
              ) : (
                <VoteLoader />
              )} */}
                {proposal.votesLoaded ? (
                  <div
                    className={`py-0.5 rounded-md text-xs xs:text-sm font-medium border flex justify-center items-center w-28 xs:w-32 
                      ${getProposalStatusYet(proposal, canceledProposals).style}`}
                  >
                    {getProposalStatusYet(proposal, canceledProposals).text}
                  </div>
                ) : (
                  <VoteLoader />
                )}
              {/* <div className="flex items-center justify-center w-[15%]"> */}
              <div className="rounded-full bg-[#f4d3f9] border border-[#77367a] flex text-[#77367a] text-[10px] xs:text-xs h-[22px] items-center justify-center w-[19%] xs:h-fit py-[1px] xs:py-0.5 font-medium px-2 ">
                {(() => {
                  if (
                    Array.isArray(canceledProposals) &&
                    canceledProposals.some(
                      (item) => item.proposalId === proposal.proposalId
                    )
                  ) {
                    return "Closed";
                  }

                  const currentTime: any = new Date();
                  const proposalTime: any = new Date(
                    proposal.blockTimestamp * 1000
                  );
                  const timeDifference = currentTime - proposalTime;
                  const daysDifference = timeDifference / (24 * 60 * 60 * 1000);

                  if (props === "arbitrum") {
                    if (daysDifference <= 3) {
                      const daysLeft = Math.ceil(3 - daysDifference);
                      return `${daysLeft} day${
                        daysLeft !== 1 ? "s" : ""
                      } to go`;
                    } else if (daysDifference <= 17) {
                      return "Active";
                    } else {
                      return "Closed";
                    }
                  } else {
                    if (daysDifference <= 7) {
                      return "Active";
                    } else {
                      return "Closed";
                    }
                  }
                })()}
                {/* </div> */}
              </div>
            </div>
          </div>
        ))}
        {displayedProposals?.length < cache[props]?.length && (
          <div className="flex items-center justify-center">
            <button
              onClick={loadMoreProposals}
              className="bg-blue-shade-100 text-white py-2 px-4 w-fit rounded-lg font-medium"
            >
              View More
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Proposals;
