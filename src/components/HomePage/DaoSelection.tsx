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
import letsgrowdao from "@/assets/images/daos/letsGrow.jpg";

interface DaoSelectionProps {
  onClose: () => void;
  joinAsDelegate?: boolean;
  feature?: boolean;
  featureSchedule?: boolean;
}

interface GTMEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
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
  const [selectedDao, setSelectedDao] = useState<"optimism" | "arbitrum" | "letsgrow" | "">("");

    useEffect(() => {
      if (authenticated && selectedDao && showWalletPopup) {
        setShowWalletPopup(false); 
        checkDelegateStatus(selectedDao); 
      }
    }, [authenticated, selectedDao]);
  

  const pushToGTM = (eventData: GTMEvent) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(eventData);
    }
  };

  const handleNavigation = (url: string) => {
    setIsNavigating(true);
    router.push(url);
  };

  const handleOptimism = () => {
    pushToGTM({
      event: 'dao_selection',
      category: 'DAO Selection',
      action: 'Optimism DAO Selected',
      label: 'optimism',
      value: joinAsDelegate ? 1 : feature ? 2 : 3
    });
    handleDaoSelection("optimism");
  };
  const handleLetsGrow = () => {
    handleDaoSelection("letsgrow");
  };
  
  const handleArbitrum = () => {
    pushToGTM({
      event: 'dao_selection',
      category: 'DAO Selection',
      action: 'Arbitrum DAO Selected',
      label: 'arbitrum',
      value: joinAsDelegate ? 1 : feature ? 2 : 3
    });
    handleDaoSelection("arbitrum");
  };

  const handleDaoSelection = (network: "optimism" | "arbitrum" | "letsgrow") => {
    setDao(network);
    setSelectedDao(network);
    
    if (!authenticated) {
      setShowWalletPopup(true);
      return;
    }
    
    checkDelegateStatus(network);
  };


  const checkDelegateStatus = async (network: "optimism" | "arbitrum" | "letsgrow") => {
    setShowError(false);
    setIsLoading(true);
    try {
      let isDelegate = false;
      // Check contract delegate status for Optimism and Arbitrum
      if (network === "optimism" || network === "arbitrum") {
        const contractAddress =
          network === "optimism"
            ? "0x4200000000000000000000000000000000000042"
            : "0x912CE59144191C1204E64559FE8253a0e49E6548";

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

          isDelegate = delegateTx.toLowerCase() === address?.toLowerCase();
        } catch (error) {
          console.error("Error in reading contract:", error);
        }
      } 
      
      // Check subgraph for Let's Grow DAO
      if (network === "letsgrow") {
        const letsgrowSubgraphUrl = "https://api.studio.thegraph.com/query/68573/lets_grow_dao_votingtoken/v0.0.2"; // Replace with actual subgraph URL
        
        try {
          const response = await fetch(letsgrowSubgraphUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                  query MyQuery($address: Bytes!) {
                    delegates(where: {id: $address}) {
                      id
                      lastUpdated
                    }
                  }
              `,
              variables: {
                address: address?.toLowerCase()
              }
            })
          });

          const result = await response.json();
          isDelegate = result.data.delegates.length > 0;
        } catch (error) {
          console.error("Error querying Let's Grow DAO subgraph:", error);
        }
      }

      // Check API status as a fallback
      if (!isDelegate) {
        try {
          const response = await fetch(
            `/api/search-delegate?address=${address}&dao=${network}`
          );
          const details = await response.json();
          isDelegate = details.length > 0;
        } catch (error) {
          console.error("Error fetching from API:", error);
        }
      }

      if (isDelegate) {
        pushToGTM({
          event: 'delegate_verification',
          category: 'Verification',
          action: 'Delegate Success',
          label: network,
          value: 1
        });
        if (feature) {
          setShowPopup(true);
        } else if (joinAsDelegate || featureSchedule) {
          handleNavigation(
            `/profile/${address}?active=sessions&session=schedule`
          );
        }
      } else {
        pushToGTM({
          event: 'delegate_verification',
          category: 'Verification',
          action: 'Delegate Failed',
          label: network,
          value: 0
        });
        setShowError(true);
      }
    } catch (error) {
      pushToGTM({
        event: 'delegate_verification',
        category: 'Verification',
        action: 'Delegate Failed',
        label: error instanceof Error ? error.message : 'Unknown error',
        value: 0
      });
      console.error("Error in delegate status check:", error);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden p-4">
        <div
          className="absolute inset-0 backdrop-blur-md"
          onClick={onClose}
        ></div>
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
          <div className="p-6 bg-white rounded-3xl shadow-2xl text-center max-w-2xl w-full transform transition duration-300 hover:scale-105 mx-2">
            <div className="bg-black rounded-full size-8 p-1 flex justify-center items-center absolute top-6 right-6">
              <IoClose
                className="cursor-pointer w-6 h-6 text-white"
                onClick={onClose}
              />
            </div>
            {joinAsDelegate ? (
              <>
                <h2 className="font-bold text-3xl text-gray-900 my-6">
                  Start Your Journey!
                </h2>
                <p className="text-gray-700 mb-10 text-base">
                  To kick things off, let us know which DAO you are a delegate
                  for.
                </p>
              </>
            ) : featureSchedule ? (
              <>
                <h2 className="font-bold text-3xl text-gray-900 my-6">
                  Select the DAO you represent!
                </h2>
                <p className="text-gray-700 mb-10 text-base">
                  Choose your DAO to set your availability and start hosting
                  sessions.
                </p>
              </>
            ) : feature ? (
              <>
                <h2 className="font-bold text-3xl text-gray-900 my-6">
                  Select the DAO you represent!
                </h2>
                <p className="text-gray-700 mb-10 text-base">
                  Select a DAO to generate your personalized Farcaster frame
                  link and start sharing.
                </p>
              </>
            ) : (
              ""
            )}

            {showError && (
              <p className="text-red-500 mb-6 text-base">
                You are not a delegate of this DAO. Please select another DAO.
              </p>
            )}

            {isLoading || isNavigating ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="flex gap-6 justify-center">
                <button
                  className="flex-1 p-4 rounded-2xl border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-red-50 to-red-100 transition-all duration-300 group"
                  onClick={handleOptimism}
                >
                  <div className="flex flex-col items-center gap-4">
                    <Image 
                      src={op} 
                      alt="" 
                      className="w-20 h-20 rounded-full" 
                    />
                    <span className="font-semibold text-lg text-gray-800">
                      Optimism
                    </span>
                  </div>
                </button>

                <button
                  className="flex-1 p-4 rounded-2xl border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300 group"
                  onClick={handleArbitrum}
                >
                  <div className="flex flex-col items-center gap-4">
                    <Image 
                      src={arb} 
                      alt="" 
                      className="w-20 h-20 rounded-full" 
                    />
                    <span className="font-semibold text-lg text-gray-800">
                      Arbitrum
                    </span>
                  </div>
                </button>
                <button
                  className="flex-1 p-4 rounded-2xl border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300 group"
                  onClick={handleLetsGrow}
                >
                  <div className="flex flex-col items-center gap-4">
                    <Image 
                      src={letsgrowdao} 
                      alt="" 
                      className="w-20 h-20 rounded-full" 
                    />
                    <span className="font-semibold text-lg text-gray-800">
                      Let&apos;s Grow DAO
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
        <ConnectWalletHomePage 
          onClose={() => setShowWalletPopup(false)} 
        />
      )}
    </>
  );
}

export default DaoSelection;