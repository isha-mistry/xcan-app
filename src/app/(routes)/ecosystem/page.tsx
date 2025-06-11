"use client"
import ConnectYourWallet from "@/components/ComponentUtils/ConnectYourWallet";
import ExploreDAOs from "@/components/DAOs/ExploreDAOs";
import AboutDao from "@/components/IndividualDAO/AboutDao";
import { useAccount } from "wagmi";

function Page() {
  // const { isConnected } = useAccount();
  return (
    <>
      {/* <ExploreDAOs /> */}
      <AboutDao props={"arbitrum"} />
    </>
  );
}

export default Page;