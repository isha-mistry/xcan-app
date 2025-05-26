"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import InviteCreators from "./InviteCreators";
import { Oval, TailSpin } from "react-loader-spinner";
import MobileResponsiveMessage from "../MobileResponsiveMessage/MobileResponsiveMessage";
import ConnectYourWallet from "../ComponentUtils/ConnectYourWallet";
import { useConnection } from "@/app/hooks/useConnection";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { RotatingLines } from "react-loader-spinner";

function ReferralsMain() {
  const { address } = useAccount();
  const { isConnected, isLoading, isPageLoading, isReady } =
    useConnection();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();

  const isValidAuthentication = () => {
    // Check if user is authenticated AND has an active wallet
    const hasActiveWallet = wallets.some(wallet => wallet.address);
    return authenticated && isConnected && hasActiveWallet;
  };

  const canAccessProtectedResources = () => {
    if (!isValidAuthentication()) {
      return false;
    }
    return true;
  };

  const Isvalid = canAccessProtectedResources();


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

    if (!Isvalid) {
      return <ConnectYourWallet />;
    }

    if (!address|| !isConnected || !ready) {
      return (
        <div className="flex items-center justify-center h-screen">
          <RotatingLines
            strokeColor="#0356fc"
            strokeWidth="5"
            animationDuration="0.75"
            width="60"
            visible={true}
          />
        </div>
      );
    }



    if (ready && authenticated) {
      return <InviteCreators userAddress={address} />;
    }

    return (
      <div className="text-black">Something went wrong. Please try again.</div>
    );
  };

  return (
    <>
      <div className="font-poppins">{renderContent()}</div>
    </>
  );
}

export default ReferralsMain;
