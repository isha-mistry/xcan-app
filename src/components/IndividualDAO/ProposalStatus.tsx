import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProposalTiming {
  startTime: number;
  endTime: number;
  status: string;
  proposalId: string;
}

interface ProposalStatusProps {
  proposal: any;
  canceledProposals: any[];
  networkType: string;
  proposalTiming?: ProposalTiming;
}

const ProposalStatus: React.FC<ProposalStatusProps> = ({
  proposal,
  canceledProposals,
  networkType,
  proposalTiming
}) => {
  const [status, setStatus] =  useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // const [proposalTiming, setProposalTiming] = useState<ProposalTiming | null>(null);
console.log("--------proposalStatus--------",proposal,"-----",canceledProposals,"-----",networkType,"-----",proposalTiming)
  const StatusLoader = () => (
    <div className="flex items-center justify-center p-2">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const TodayDate = new Date();
        const currentTime = Math.round(TodayDate.getTime() / 1000);
        console.log("currentTime",currentTime)
        let calculatedStatus: string | null = null;
        if (networkType === "arbitrum") {
          console.log("proposalTiming",currentTime)
          // Arbitrum network logic
          // if (proposalTiming && currentTime < new Date(proposalTiming.endTime).getTime()/1000) {
          //   // If current time is less than endTime, status is PENDING
          //   calculatedStatus  = "PENDING";
          // } else 
          console.log("proposalTiming",proposal.queueStartTime,proposal.queueEndTime,currentTime)
          if (
            proposal.queueStartTime &&
            proposal.queueEndTime &&
            currentTime >= proposal.queueStartTime &&
            currentTime < proposal.queueEndTime
          ) {
            // If current time is between queueStartTime and queueEndTime, status is QUEUED
            calculatedStatus  = "QUEUED";
          } else if ( !proposal.queueEndTime || currentTime >= proposal.queueEndTime) {
            // If current time is more than queueEndTime, check support for SUCCEEDED or DEFEATED
            calculatedStatus  = proposal.support1Weight! > proposal.support0Weight! ? "SUCCEEDED" : "DEFEATED";
          } else {
            // Default case for arbitrum if timing conditions aren't met
            calculatedStatus  = "PENDING";
          }
        } else {
          // Other DAO networks logic
          // First check if proposal is cancelled
          console.log("proposal",proposal)
          if(proposal.proposalId==="114318499951173425640219752344574142419220609526557632733105006940618608635406" || proposal.proposalId==="38506287861710446593663598830868940900144818754960277981092485594195671514829"){
            calculatedStatus ="SUCCEEDED"
          }else if (
            Array.isArray(canceledProposals) &&
            canceledProposals.some((item) => item.proposalId === proposal.proposalId)
          ) {
            calculatedStatus  = "CANCELLED";
          } else if (proposal && currentTime> proposal.endTime) {
            // Otherwise check support for SUCCEEDED or DEFEATED
            calculatedStatus  = proposal.support1Weight! > proposal.support0Weight! ? "SUCCEEDED" : "DEFEATED";
            
          } else {
            // If current time is less than endTime, status is PENDING
            calculatedStatus  = "PENDING";
          }
        }

        setStatus(calculatedStatus );
        setLoading(false);
      } catch (error) {
        console.error("Error calculating proposal status:", error);
        setLoading(false);
      }
    };

    fetchStatus();
  }, [proposal, canceledProposals, networkType, proposalTiming]);

  const getStatusStyles = (status: string|null) => {
    switch (status) {
      case "SUCCEEDED":
        return "bg-green-200 border-green-600 text-green-600";
      case "DEFEATED":
      case "CANCELLED":
        return "bg-red-200 border-red-500 text-red-500";
      case "ACTIVE":
        return "bg-blue-200 border-blue-600 text-blue-600";
      case "QUEUED":
        return "bg-yellow-200 border-yellow-600 text-yellow-600";
      case "PENDING":
        return "bg-yellow-200 border-yellow-600 text-yellow-600";
      case "CLOSED":
        return "bg-gray-200 border-gray-600 text-gray-600";
      case "NOT_STARTED":
        return "bg-purple-200 border-purple-600 text-purple-600";
      default:
        return "bg-yellow-200 border-yellow-600 text-yellow-600";
    }
  };

  if (!proposal.votesLoaded || loading) {
    return <StatusLoader />;
  }

  return (
    <div className={`w-[96px] h-[22px] xs:h-auto xs:w-[108px] inline-flex justify-center items-center px-2.5 py-0.5 rounded-full text-[10px] xs:text-xs font-medium border ${getStatusStyles(status)}`}>
       {status === null ? <StatusLoader/> : status} 
    </div>
  );
};

export default ProposalStatus;