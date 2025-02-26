import ProposalVoted from "../ComponentUtils/ProposalVoted";
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
