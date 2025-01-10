"use client"
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAccount, useSwitchChain } from "wagmi";
import OPLogo from "@/assets/images/daos/op.png";
import ArbLogo from "@/assets/images/daos/arb.png";
import { createPublicClient, http } from "viem";
import { optimism, arbitrum } from "viem/chains";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
import { useRouter } from "next-nprogress-bar";

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent" />
);

const SelectDaoButton: React.FC<{ daoName: string }> = ({ daoName }) => {
  const router = useRouter();
  const { switchChain, chains } = useSwitchChain();
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [selfDelegate, setSelfDelegate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDelegateLoading, setIsDelegateLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverDelay = 300;
  const currentChain = chains.find((chain) => chain.id === chain?.id);
  const desiredChains = [
    { id: 10, name: "Optimism", icon: OPLogo },
    { id: 42161, name: "Arbitrum", icon: ArbLogo },
    // { id: 421614, name: "Arbitrum Sepolia", icon: ArbLogo },
  ];

  //   const currentChainLogo = currentChain
  //     ? desiredChains.find((chain) => chain.id === currentChain.id)?.icon
  //     : desiredChains[0].icon;

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, hoverDelay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const checkDelegateStatus = async (network: "optimism" | "arbitrum") => {
    // setShowError(false);
    // setIsLoading(true);
    setIsDelegateLoading(true);
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

      setSelfDelegate(isSelfDelegate);
    } catch (error) {
      console.error("Error in reading contract", error);
      // setShowError(true);
    } finally {
      setIsDelegateLoading(false);
    }
  };

  const handleChainSwitch = async (chainId: number) => {
    setIsLoading(true);
    try {
      await switchChain?.({ chainId });
      
      if (!selfDelegate && address) {
        // Redirect to profile page if not self-delegated
        router.push(`/profile/${address}?active=info`);
      }
    } catch (error) {
      console.error("Error switching chain:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {isConnected && (
        <div
          className="relative bg-gray-100 py-2 px-2 md:px-4 rounded-full 2.3sm:w-auto w-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-full flex justify-center">
            <div className="w-fit capitalize text-lg bg-white-200 outline-none cursor-pointer flex items-center justify-center transition duration-500 ">
              <div className="mr-2 flex items-center truncate gap-1">
                <Image
                  src={daoName === "optimism" ? OPLogo : ArbLogo}
                  alt="Current Chain"
                  width={48}
                  height={48}
                  className="size-6"
                />
                <div>
                  <h1 className="text-sm md:text-lg font-medium text-gray-900">
                    {daoName.charAt(0).toUpperCase() + daoName.slice(1)}
                  </h1>
                </div>
              </div>
              {(isLoading || isDelegateLoading) ? (
                <LoadingSpinner />
              ) : (
              <svg
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5 md:mr-2 flex-shrink-0 ${
                  isOpen
                    ? "transform rotate-180 transition-transform duration-300"
                    : "transition-transform duration-300"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
              )}
            </div>
            <div
              className={`absolute top-10 mt-1 p-1.5 w-full min-w-[200px] sm:w-56 md:w-64 lg:w-72 border border-white-shade-100 rounded-xl bg-white shadow-md z-50 ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              style={{ transition: "opacity 0.3s" }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {desiredChains.map((chain, index) => (
                <div key={chain.id}>
                  <div
                    className={`option flex items-center cursor-pointer px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 capitalize`}
                    // onClick={() => switchChain?.({ chainId: chain.id })}
                    onClick={() => handleChainSwitch(chain.id)}
                  >
                          <div className="flex items-center">
                    <Image
                      src={chain.icon}
                      alt={chain.name}
                      width={20}
                      height={20}
                      className="mr-2 w-5 h-5"
                    />
                    {chain.name}
                  </div>
                  {isLoading && chain.id === currentChain?.id && (
                      <LoadingSpinner />
                    )}
                       </div>
                  {index !== desiredChains.length - 1 && <hr />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectDaoButton;
