"use client";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Image from "next/image";
import logo from "@/assets/images/daos/CCLogo2.png";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import op from "@/assets/images/daos/op.png";
import arb from "@/assets/images/daos/arb.png";
import { useSidebar } from "@/app/hooks/useSidebar";
import { createPublicClient, http } from "viem";
import { optimism, arbitrum } from "viem/chains";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
import { useAccount } from "wagmi";
import { usePathname, useRouter } from "next/navigation";
import ConnectWalletHomePage from "./ConnectwalletHomePage";
import PopupGenerateLink from "./PopupGenerateLink";

interface DaoSelectionProps {
  onClose: () => void;
  joinAsDelegate?: boolean;
  feature?: boolean;
  featureSchedule?: boolean;
}

function DaoSelection({
  onClose,
  joinAsDelegate,
  feature,
  featureSchedule,
}: DaoSelectionProps) {
  const router = useRouter();
  const { address } = useAccount();
  const [showError, setShowError] = useState(false);
  const path = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  const [dao, setDao] = useState("");

  const handleOptimism = () => {
    checkDelegateStatus("optimism");
    setDao("optimism");
  };

  const handleArbitrum = () => {
    checkDelegateStatus("arbitrum");
    setDao("arbitrum");
  };

  const checkDelegateStatus = async (network: "optimism" | "arbitrum") => {
    setShowError(false);
    const contractAddress =
      network === "optimism"
        ? "0x4200000000000000000000000000000000000042"
        : network === "arbitrum"
        ? "0x912CE59144191C1204E64559FE8253a0e49E6548"
        : "";

    try {
      const public_client = createPublicClient({
        chain: network === "optimism" ? optimism : arbitrum,
        transport: http(),
      });

      const delegateTx = (await public_client.readContract({
        address: contractAddress as `0x${string}`,
        abi: dao_abi.abi,
        functionName: "delegates",
        args: [address],
      })) as string;

      const isSelfDelegate =
        delegateTx.toLowerCase() === address?.toLowerCase();
      {
        console.log(isSelfDelegate, "self delegate 123");
      }
      if (isSelfDelegate) {
        if (feature) {
          setShowPopup(true);
        } else if (joinAsDelegate) {
          router.push(
            `${path}profile/${address}?active=sessions&session=schedule`
          );
        } else if (featureSchedule) {
          router.push(
            path + `profile/${address}?active=sessions&session=schedule`
          );
        }
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error("Error in reading contract", error);
      setShowError(true);
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
          <div className="p-10 bg-white rounded-3xl shadow-xl text-center max-w-md transform transition duration-300 hover:scale-105 mx-2">
            <div className="bg-black rounded-full size-5 p-px flex justify-center items-center absolute top-5 right-5">
              <IoClose
                className="cursor-pointer w-5 h-5 text-white "
                onClick={onClose}
              />
            </div>
            {/* <h2 className="font-bold text-3xl text-gray-900 mb-4">
              Select The DAO
            </h2>
            <p className="text-gray-700 mb-8">
              Select a DAO to begin your delegation journey
            </p> */}
            {joinAsDelegate ? (
              <>
                <h2 className="font-bold text-3xl text-gray-900 mb-4">
                  Start Your Journey!
                </h2>
                <p className="text-gray-700 mb-8">
                  To kick things off, let us know which DAO you are a delegate
                  for.
                </p>
              </>
            ) : featureSchedule ? (
              <>
                <h2 className="font-bold text-3xl text-gray-900 mb-4">
                  Select the DAO you represent!
                </h2>
                <p className="text-gray-700 mb-8">
                  Choose your DAO to set your availability and start hosting
                  sessions.
                </p>
              </>
            ) : feature ? (
              <>
                <h2 className="font-bold text-3xl text-gray-900 mb-4">
                  Select the DAO you represent!
                </h2>
                <p className="text-gray-700 mb-8">
                  Select a DAO to generate your personalized Farcaster frame
                  link and start sharing.
                </p>
              </>
            ) : (
              ""
            )}

            {showError && (
              <p className="text-red-500 mb-4">
                You are not a delegate of this DAO. Please select another DAO.
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <button
                className="flex-1 p-6 rounded-xl border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-red-50 to-red-100 transition-all duration-300 group"
                onClick={handleOptimism}
              >
                <div className="flex flex-col items-center gap-3">
                  <Image src={op} alt="" className="w-12 h-12" />
                  <span className="font-semibold text-gray-800">Optimism</span>
                </div>
              </button>

              <button
                className="flex-1 p-6 rounded-xl border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300 group"
                onClick={handleArbitrum}
              >
                <div className="flex flex-col items-center gap-3">
                  <Image src={arb} alt="" className="w-12 h-12" />
                  <span className="font-semibold text-gray-800">Arbitrum</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <PopupGenerateLink onclose={() => setShowPopup(false)} dao={dao} />
      )}
    </>
  );
}

export default DaoSelection;
