import React from "react";
import { IoClose } from "react-icons/io5";
import Image from "next/image";
import logo from "@/assets/images/daos/CCLogo2.png";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { Wallet } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

interface ConnectWalletHomePageProps {
  onClose: () => void;
}

function ConnectWalletHomePage({ onClose }: ConnectWalletHomePageProps) {
  const { authenticated, login, user, connectWallet } = usePrivy();
  const handleLogin = async () => {
    if (!authenticated) {
      try {
        await login();
      } catch (error) { }
    } else {
      if (!user?.google && !user?.farcaster) {
        try {
          await connectWallet();
        } catch (error) { }
      }
    }
  };
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50  overflow-hidden p-4">
        <div
          className="absolute inset-0 backdrop-blur-md"
          onClick={onClose}
        ></div>
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
          <div className="p-3 0.2xs:p-6 xs:p-10 bg-white rounded-3xl shadow-xl text-center max-w-md transform transition duration-300 hover:scale-105 mx-2">
            <div className="bg-black rounded-full size-5 p-px flex justify-center items-center absolute top-5 right-5">
              <IoClose
                className="cursor-pointer w-5 h-5 text-white "
                onClick={onClose}
              />
            </div>
            <div className="flex items-center justify-center mb-5">
              <Image src={logo} alt="image" width={100} />
            </div>
            <h2 className="font-bold text-2xl 0.2xs:text-3xl text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-700 mb-8 text-sm 0.2xs:text-base">
              To continue, please connect your wallet.
            </p>
            <div className="flex items-center justify-center">
              <button
                onClick={handleLogin}
                type="button"
                className="flex items-center justify-center  bg-gradient-to-br from-blue-50 to-blue-100 text-blue-shade-200 px-4 py-3 rounded-full  shadow-lg hover:shadow-xl  transition-all duration-300  group relative overflow-hidden transform-none hover:scale-105 text-xs font-medium"
              >
                <Wallet
                  size={16}
                  className="mr-2 size-5  group-hover:rotate-6 transition-transform"
                />
                <span className="font-robotoMono mt-1 ">Connect Wallet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConnectWalletHomePage;
