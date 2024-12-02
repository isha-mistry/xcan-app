"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import InviteCreators from "./InviteCreators";
import { Oval, TailSpin } from "react-loader-spinner";
import MobileResponsiveMessage from "../MobileResponsiveMessage/MobileResponsiveMessage";
import ConnectYourWallet from "../ComponentUtils/ConnectYourWallet";
import { useConnection } from "@/app/hooks/useConnection";
import { RotatingLines } from "react-loader-spinner";

function ReferralsMain() {
  const { address } = useAccount();
  const { isConnected, isLoading, isSessionLoading, isPageLoading, isReady } =
    useConnection();

  const renderContent = () => {
    if (isPageLoading) {
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

    if (isSessionLoading) {
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

    if (!isConnected) {
      return <ConnectYourWallet />;
    }

    if (isReady) {
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
