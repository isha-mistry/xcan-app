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
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  // const [proposalTiming, setProposalTiming] = useState<ProposalTiming | null>(null);

  const StatusLoader = () => (
    <div className="flex items-center justify-center p-2">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const currentTime = new Date();
        let status;
        if (networkType === "arbitrum") {
          // Arbitrum network logic
          if (proposalTiming && currentTime.getTime() < new Date(proposalTiming.endTime).getTime()) {
            // If current time is less than endTime, status is PENDING
            status = "PENDING";
          } else if (
            proposal.queueStartTime &&
            proposal.queueEndTime &&
            currentTime >= proposal.queueStartTime &&
            currentTime < proposal.queueEndTime
          ) {
            // If current time is between queueStartTime and queueEndTime, status is QUEUED
            status = "QUEUED";
          } else if (proposal.queueEndTime && currentTime >= proposal.queueEndTime) {
            // If current time is more than queueEndTime, check support for SUCCEEDED or DEFEATED
            status = proposal.support1Weight! > proposal.support0Weight! ? "SUCCEEDED" : "DEFEATED";
          } else {
            // Default case for arbitrum if timing conditions aren't met
            status = "PENDING";
          }
        } else {
          // Other DAO networks logic
          // First check if proposal is cancelled
          if (
            Array.isArray(canceledProposals) &&
            canceledProposals.some((item) => item.proposalId === proposal.proposalId)
          ) {
            status = "CANCELLED";
          } else if (proposal && currentTime.getTime() / 1000 > proposal.endTime) {
            // Otherwise check support for SUCCEEDED or DEFEATED
            status = proposal.support1Weight! > proposal.support0Weight! ? "SUCCEEDED" : "DEFEATED";
            
          } else {
            // If current time is less than endTime, status is PENDING
            status = "PENDING";
          }
        }

        setStatus(status);
        setLoading(false);
      } catch (error) {
        console.error("Error calculating proposal status:", error);
        setLoading(false);
      }
    };

    fetchStatus();
  }, [proposal, canceledProposals, networkType, proposalTiming]);

  const getStatusStyles = (status: string) => {
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
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
      {status}
    </div>
  );
};

export default ProposalStatus;