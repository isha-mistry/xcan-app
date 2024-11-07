import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import ProposalVoted from "../ComponentUtils/ProposalVoted";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";

function UserVotes({ daoName }: { daoName: string }) {
  const { address,isConnected } = useAccount();
  const {authenticated,user } = usePrivy();
  const {walletAddress}=useWalletAddress();

  return <ProposalVoted daoName={daoName} address={walletAddress} />;
}

export default UserVotes;
