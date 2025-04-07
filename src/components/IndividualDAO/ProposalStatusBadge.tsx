import React, { useState, useEffect, useCallback, useRef } from 'react';

export const ProposalStatusBadge = ({ 
  proposal, 
  matchedProposal, 
  canceledProposals, 
  networkType 
}: any) => {
  const [status, setStatus] = useState("Loading");
  const pendingApiCallsRef = useRef<{ [key: string]: boolean }>({});
  
  // Use useRef instead of state for pending API calls to prevent re-renders
  const markApiCallPending = (cacheKey: string) => {
    pendingApiCallsRef.current[cacheKey] = true;
  };
  
  const clearPendingApiCall = (cacheKey: string) => {
    delete pendingApiCallsRef.current[cacheKey];
  };
  const getRemainingTime = (startTimestamp: number) => {
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    const startTime = Math.floor(startTimestamp/1000); // Ensure startTimestamp is in seconds

    console.log("currentTime:", currentTime, "startTime:", startTime);

    const timeDiff = startTime - currentTime; // Time difference in seconds
    console.log("timeDiff:", timeDiff);

    if (timeDiff <= 0) {
        return "Starting now"; // Handle case when time difference is zero or negative
    }

    const days = Math.floor(timeDiff / (3600 * 24));
    const hours = Math.floor((timeDiff % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeDiff % 3600) / 60);

    // Build the message dynamically, filtering out zeros
    const timeParts = [];
    if (days > 0) timeParts.push(`${days}d`);
    if (hours > 0) timeParts.push(`${hours}h`);
    if (minutes > 0) timeParts.push(`${minutes}m`);

    console.log("timeParts:", timeParts);
    
    return `Starts in ${timeParts.join(" ")}`;
};

  // Get proposal status without dependencies that change frequently
  const getProposalStatus = useCallback(async (proposal: any) => {
    // First check if proposal has its own startTime and endTime
    if (proposal.startTime && proposal.endTime) {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = proposal.startTime;
      const endTime = proposal.endTime;
      if (
        Array.isArray(canceledProposals) &&
        canceledProposals.some((item: any) => item.proposalId === proposal.proposalId)
      ) {
        return "Closed";
      }
      if (currentTime < startTime) {
        // return getRemainingTime(startTime.getTime());
        return "Upcoming";
      } else if (currentTime >= startTime && currentTime <= endTime) {
        return "Active";
      } else {
        return "Closed";
      }
    }
  
    // Logic for transaction hash matching and API calling
    if (proposal.proposalId) {
      // If we found the proposal in our cache, use that data
      if (matchedProposal) {
        const currentTime = new Date();
        const startTime = new Date(matchedProposal.startTime);
        const endTime = new Date(matchedProposal.endTime);

        if (currentTime < startTime) {
          // return getRemainingTime(startTime.getTime());
          return "Upcoming";
        } else if (currentTime >= startTime && currentTime <= endTime) {
          return "Active2";
        } else {
          return "Closed";
        }
      } 
      // Otherwise, make API call only for proposals not in our cache
      else {
        try {
          // Create a cache key for this proposal
          const governorId = `eip155:42161:${proposal.contractSource?.contractAddress}`;
          const cacheKey = `${proposal.proposalId}-${governorId}`;
          
          // Check if we already have a pending request for this proposal
          if (pendingApiCallsRef.current[cacheKey]) {
            return "Loading";
          }
          
          if (!governorId || governorId.endsWith('undefined')) {
            console.error("No valid governor ID available for API call");
            return "Unknown";
          }
          
          // Mark this request as pending using ref
          markApiCallPending(cacheKey);
          
          // Make API call for this proposal
          const response = await fetch(`/api/get-tally-proposal?onchainId=${proposal.proposalId}&governorId=${governorId}`);
          console.log("response",response)
          if (response.ok) {
            const data = await response.json();
            console.log("data is ",data);
            if (data.success && data.proposal) {
              let startTimestamp, endTimestamp;
              if (data.proposal.start?.timestamp) {
                startTimestamp = data.proposal.start.timestamp;
              }
              
              if (data.proposal.end?.timestamp) {
                endTimestamp = data.proposal.end.timestamp;
              }
              
              if (startTimestamp && endTimestamp) {
                const startTime = new Date(startTimestamp);
                const endTime = new Date(endTimestamp);
                const currentTime = new Date();
                
                // Clear the pending API call flag
                clearPendingApiCall(cacheKey);
                if (currentTime < startTime) {
                  // return getRemainingTime(startTime.getTime());
                  return "Upcoming";
                 } else if (currentTime >= startTime && currentTime <= endTime) {
                  return "Active3";
                } else {
                  return "Closed";
                }
              }
            }
          } else {
            console.error("API error for proposal", proposal.proposalId, ":", response.status);
          }
          
          // Clear the pending API call flag on error as well
          clearPendingApiCall(cacheKey);
        } catch (error) {
          console.error("Error fetching proposal timing data for proposal", proposal.proposalId, ":", error);
          
          // Clear the pending API call flag on error
          const governorId = `eip155:42161:${proposal.contractSource?.contractAddress}`;
          const cacheKey = `${proposal.proposalId}-${governorId}`;
          
          clearPendingApiCall(cacheKey);
        }
      }
    }
    
    // Check if proposal is canceled
    if (
      Array.isArray(canceledProposals) &&
      canceledProposals.some((item: any) => item.proposalId === proposal.proposalId)
    ) {
      return "Closed";
    }
    
    return "Unknown";
  }, [matchedProposal, canceledProposals]);

  // Effect to get and set the status when the proposal changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchStatus = async () => {
      const result = await getProposalStatus(proposal);
      if (isMounted) {
        setStatus(result ?? "Unknown");
      }
    };
    
    fetchStatus();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [proposal, getProposalStatus]);

  if (status === "Loading") {
    return (
      <div className="flex items-center justify-center space-x-1">
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="none" 
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <>{status}</>
  );
};