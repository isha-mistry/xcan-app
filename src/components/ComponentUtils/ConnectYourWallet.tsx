import Image from "next/image";
import React from "react";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import logo from "@/assets/images/icon.svg";

function ConnectYourWallet() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-transparent">
      <div className="p-10 bg-[#2c548d6a] rounded-3xl shadow-xl text-center max-w-md transform transition duration-300 hover:scale-105 mx-2">
        <div className="flex items-center justify-center mb-5">
          <Image src={logo} alt="image" width={100} />
        </div>
        <h2 className="font-bold text-3xl text-gray-200 mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-400 mb-8">
          Please connect your wallet and sign in to continue.
        </p>
        <div className="flex items-center justify-center">
          <ConnectWalletWithENS />
        </div>
      </div>
    </div>
  );
}

export default ConnectYourWallet;
