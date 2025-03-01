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
  
  // Get proposal status without dependencies that change frequently
  const getProposalStatus = useCallback(async (proposal: any) => {
    // First check if proposal has its own startTime and endTime
    if (proposal.startTime && proposal.endTime) {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = proposal.startTime;
      const endTime = proposal.endTime;
  
      if (currentTime < startTime) {
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
          return "Upcoming";
        } else if (currentTime >= startTime && currentTime <= endTime) {
          return "Active";
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
                  return "Upcoming";
                } else if (currentTime >= startTime && currentTime <= endTime) {
                  return "Active";
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
        setStatus(result);
      }
    };
    
    fetchStatus();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [proposal, getProposalStatus]);

  return (
    <>{status}</>
  );
};