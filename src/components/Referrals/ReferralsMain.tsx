"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import InviteCreators from "./InviteCreators";
import { Oval, TailSpin } from "react-loader-spinner";
import MobileResponsiveMessage from "../MobileResponsiveMessage/MobileResponsiveMessage";
import ConnectYourWallet from "../ComponentUtils/ConnectYourWallet";
import { useConnection } from "@/app/hooks/useConnection";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
function ReferralsMain() {
  const { address } = useAccount();
  const { isConnected, isLoading, isPageLoading, isReady } =
    useConnection();
    const { ready, authenticated, login, logout, user } = usePrivy();  
    const {walletAddress}=useWalletAddress();


  const renderContent = () => {
    // if (isPageLoading) {
    //   return (
    //     <div className="flex items-center justify-center h-screen">
    //       <TailSpin
    //         visible={true}
    //         height="40"
    //         width="40"
    //         color="#0356fc"
    //         ariaLabel="tail-spin-loading"
    //         radius="1"
    //       />
    //       <p className="ml-4 text-black">Loading...</p>
    //     </div>
    //   );
    // }
    
    if (!authenticated) {
      return <ConnectYourWallet />;
    }

    if (walletAddress==null || !ready) {
      // console.log(`${ready} and walletaddress ${walletAddress}`);
      return (
        <div className="flex items-center justify-center h-screen">
          <Oval
            visible={true}
            height="40"
            width="40"
            color="#0500FF"
            secondaryColor="#cdccff"
            ariaLabel="oval-loading"
          />
          <p className="ml-4 text-black">Loading...</p>
        </div>
      );
    }

    

    if (ready && authenticated) {
      return <InviteCreators userAddress={walletAddress} />;
    }

    return (
      <div className="text-black">Something went wrong. Please try again.</div>
    );
  };

  return (
    <>
      <MobileResponsiveMessage />
      <div className="hidden md:block font-poppins">{renderContent()}</div>
    </>
  );
}

export default ReferralsMain;
