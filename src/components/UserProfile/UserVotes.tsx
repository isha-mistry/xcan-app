import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import ProposalVoted from "../ComponentUtils/ProposalVoted";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";

function UserVotes({ daoName }: { daoName: string }) {
  const { walletAddress } = useWalletAddress();

  return (
    <>
      {walletAddress && (
        <ProposalVoted daoName={daoName} address={walletAddress} />
      )}
    </>
  );
}

export default UserVotes;
