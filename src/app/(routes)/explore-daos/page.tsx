"use client"
import ConnectYourWallet from "@/components/ComponentUtils/ConnectYourWallet";
import ExploreDAOs from "@/components/DAOs/ExploreDAOs";
import { useAccount } from "wagmi";

function Page() {
  // const { isConnected } = useAccount();
  return (
    <>
      <ExploreDAOs />
    </>
  );
}

export default Page;