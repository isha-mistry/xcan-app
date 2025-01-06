"use client";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Image from "next/image";
import op from "@/assets/images/daos/op.png";
import arb from "@/assets/images/daos/arb.png";
import { createPublicClient, http } from "viem";
import { optimism, arbitrum } from "viem/chains";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
import { useAccount } from "wagmi";
import { usePathname, useRouter } from "next/navigation";
import PopupGenerateLink from "./PopupGenerateLink";
import { usePrivy } from "@privy-io/react-auth";
import ConnectWalletHomePage from "./ConnectwalletHomePage";

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
  const { address, isConnected } = useAccount();
  const [showError, setShowError] = useState(false);
  const path = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  const [dao, setDao] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { authenticated } = usePrivy();
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  const handleNavigation = (url: string) => {
    setIsNavigating(true);
    router.push(url);
  };

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
    setIsLoading(true);
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
        } else if (joinAsDelegate || featureSchedule) {
          if (authenticated) {
            handleNavigation(
              `${path}profile/${address}?active=sessions&session=schedule`
            );
          } else {
            setShowWalletPopup(true);
            console.log("not authenticated");
          }
        }
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error("Error in reading contract", error);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && authenticated && showWalletPopup) {
      // Close the wallet modal and redirect
      setShowWalletPopup(false);
      handleNavigation(
        `${path}profile/${address}?active=sessions&session=schedule`
      );
    }
  }, [isConnected, showWalletPopup, router, path, authenticated]);

  const handlePopupClose = () => {
    setShowPopup(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50  overflow-hidden p-4">
        <div
          className="absolute inset-0 backdrop-blur-md"
          onClick={onClose}
        ></div>
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
          <div className="p-4 0.2xs:p-6 xs:p-10 bg-white rounded-3xl shadow-xl text-center max-w-md transform transition duration-300 hover:scale-105 mx-2">
            <div className="bg-black rounded-full size-5 p-px flex justify-center items-center absolute top-5 right-5">
              <IoClose
                className="cursor-pointer w-5 h-5 text-white "
                onClick={onClose}
              />
            </div>
            {joinAsDelegate ? (
              <>
                <h2 className="font-bold text-2xl 0.2xs:text-3xl text-gray-900 my-4">
                  Start Your Journey!
                </h2>
                <p className="text-gray-700 mb-8 text-sm 0.2xs:text-base">
                  To kick things off, let us know which DAO you are a delegate
                  for.
                </p>
              </>
            ) : featureSchedule ? (
              <>
                <h2 className="font-bold text-2xl 0.2xs:text-3xl text-gray-900 my-4">
                  Select the DAO you represent!
                </h2>
                <p className="text-gray-700 mb-8 text-sm 0.2xs:text-base">
                  Choose your DAO to set your availability and start hosting
                  sessions.
                </p>
              </>
            ) : feature ? (
              <>
                <h2 className="font-bold text-2xl 0.2xs:text-3xl text-gray-900 my-4">
                  Select the DAO you represent!
                </h2>
                <p className="text-gray-700 mb-8 text-sm 0.2xs:text-base">
                  Select a DAO to generate your personalized Farcaster frame
                  link and start sharing.
                </p>
              </>
            ) : (
              ""
            )}

            {showError && (
              <p className="text-red-500 mb-4 text-sm 0.2xs:text-base">
                You are not a delegate of this DAO. Please select another DAO.
              </p>
            )}

            {isLoading || isNavigating ? (
              <div className="flex justify-center items-center py-6 0.2xs:py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                <button
                  className="flex-1 p-2 0.2xs:p-6 rounded-xl border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-red-50 to-red-100 transition-all duration-300 group"
                  onClick={handleOptimism}
                >
                  <div className="flex flex-col items-center gap-2 0.2xs:gap-3">
                    <Image src={op} alt="" className="w-12 h-12" />
                    <span className="font-semibold text-gray-800">
                      Optimism
                    </span>
                  </div>
                </button>

                <button
                  className="flex-1 p-3 0.2xs:p-6 rounded-xl border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300 group"
                  onClick={handleArbitrum}
                >
                  <div className="flex flex-col items-center gap-2 0.2xs:gap-3">
                    <Image src={arb} alt="" className="w-12 h-12" />
                    <span className="font-semibold text-gray-800">
                      Arbitrum
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showPopup && <PopupGenerateLink onclose={handlePopupClose} dao={dao} />}
      {showWalletPopup && (
        <ConnectWalletHomePage onClose={() => setShowWalletPopup(false)} />
      )}
    </>
  );
}

export default DaoSelection;
