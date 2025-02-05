"use client"
import ConnectYourWallet from "@/components/ComponentUtils/ConnectYourWallet";
import ExploreDAOs from "@/components/DAOs/ExploreDAOs";
import { useAccount } from "wagmi";

function page() {
  const { isConnected } = useAccount();
    return (
      <>
      {isConnected? (

        <ExploreDAOs />
      ):
        <ConnectYourWallet/>
      }
      </>
    );
  }
  
  export default page;