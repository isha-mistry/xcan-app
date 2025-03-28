"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import OPLogo from "@/assets/images/daos/op.png";
import { useAccount, useSwitchChain } from "wagmi";
import { useRouter } from "next-nprogress-bar";
import { daoConfigs } from "@/config/daos";

const SelectDaoButton: React.FC<{ daoName: string }> = ({ daoName }) => {
  const { switchChain, chains } = useSwitchChain();
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverDelay = 300;
  const currentChain = chains.find((chain) => chain.id === chain?.id);
  const excludedDaos = ["arbitrumSepolia"];
  const currentDaoConfig = daoConfigs[daoName];

  const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent" />
  );

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

  const handleChainSwitch = async (chainId: number) => {
    setIsLoading(true);
    try {
      await switchChain?.({ chainId });
      if (address) {
        router.push(`/profile/${address}?active=info`);
      }
    } catch (error) {
      console.error("Error switching chain:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
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
                  src={daoConfigs[daoName?.toLowerCase()]?.logo || OPLogo}
                  alt="Current Chain"
                  width={48}
                  height={48}
                  className="size-6 rounded-full"
                  priority={true}
                />
                <div>
                  <h1 className="text-sm md:text-lg font-medium text-gray-900">
                    {currentDaoConfig?.name.charAt(0).toUpperCase() +
                      currentDaoConfig?.name.slice(1)}
                  </h1>
                </div>
              </div>
              {isLoading ? (
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
              {Object.entries(daoConfigs)
                .filter(([key]) => !excludedDaos.includes(key)) // Dynamically filter excluded DAOs
                .map(([key, dao], index, filteredArray) => (
                  <div key={dao.chainId}>
                    <div
                      className="option flex items-center cursor-pointer px-2 sm:px-3 py-1.5 sm:py-2 
                   rounded-lg transition duration-300 ease-in-out transform hover:scale-105 capitalize"
                      onClick={() => handleChainSwitch(dao.chainId)}
                    >
                      <div className="flex items-center">
                        <Image
                          src={dao.logo || "/images/op.png"} // Fallback for missing logos
                          alt={dao.name}
                          width={20}
                          height={20}
                          className="mr-2 w-5 h-5 rounded-full"
                          priority={true}
                        />
                        {dao.name}1
                      </div>

                      {isLoading && dao.chainId === currentChain?.id && (
                        <LoadingSpinner />
                      )}
                    </div>
                    {index < filteredArray.length - 1 && <hr />}
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
