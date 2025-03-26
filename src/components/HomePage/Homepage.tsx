"use client";
import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import PageBackgroundPattern from "../ComponentUtils/PageBackgroundPattern";
import { IoArrowForward } from "react-icons/io5";
import delegate from "@/assets/images/Homepage/daos.svg";
import user from "@/assets/images/Homepage/human.svg";
import Image from "next/image";
import styles from "./HomePage.module.css";
import feature1 from "@/assets/images/Homepage/feature1.png";
import feature2 from "@/assets/images/Homepage/feature2.png";
import feature3 from "@/assets/images/Homepage/feature3.png";
import feature4 from "@/assets/images/Homepage/feature4.png";
import ConnectWalletHomePage from "./ConnectwalletHomePage";
import DaoSelection from "./DaoSelection";
import { createPublicClient, http } from "viem";
import { arbitrum, optimism } from "viem/chains";
import dao_abi from "../../artifacts/Dao.sol/GovernanceToken.json";
import { useAccount } from "wagmi";
import { usePathname, useRouter } from "next/navigation";
import ErrorPopup from "./ErrorPopup";
import { usePrivy } from "@privy-io/react-auth";
import { IoIosPause } from "react-icons/io";

interface GTMEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

const Homepage = () => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonHoveredTwo, setIsButtonHoveredTwo] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const progressCircle = useRef<SVGCircleElement>(null);
  const SLIDE_DURATION = 5;
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const [showConnectWalletGenerate, setShowConnectWalletGenerate] =
    useState(false);
  const [showConnectWalletDelegate, setShowConnectWalletDelegate] =
    useState(false);
  const [ShowConnectWalletBookSession, setShowConnectWalletBookSession] =
    useState(false);
  const [showConnectWalletFeature, setShowConnectWalletFeature] =
    useState(false);
  const [showDaoSelection, setShowDaoSelection] = useState(false);
  const [showDaoSelectionFeature, setShowDaoSelectionFeature] = useState(false);
  const [showDaoSelectionSchedule, setShowDaoSelectionSchedule] =
    useState(false);
  const [showError, setShowError] = useState(false);
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const path = usePathname();
  const [isPaused, setIsPaused] = useState(false);
  const [isPauseButton, setIsPauseButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFeature, setLoadingFeature] = useState<number | null>(null);
  const { authenticated } = usePrivy();

  const pushToGTM = (eventData: GTMEvent) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(eventData);
    }
  };

  const features = [
    {
      title: "Share on Warpcast",
      description:
        "Share your delegate profile on Warpcast with a single click and attract delegations effortlessly.",
      buttonText: "Generate Link",
      image: feature1,
      onclick: () => {
        pushToGTM({
          event: 'feature_button_click',
          category: 'Feature Engagement',
          action: 'Button Click',
          label: 'Generate Link',
          value: 1
        });
          setShowDaoSelectionFeature(true);
      },
    },
    {
      title: "Build Your Credibility",
      description: "Earn attestations for every session you host or attend.",
      buttonText: "Book Session",
      image: feature2,
      onclick: async () => {
        pushToGTM({
          event: 'feature_button_click',
          category: 'Feature Engagement',
          action: 'Button Click',
          label: 'Book Session',
          value: 2
        });
        setLoadingFeature(1);
        try {
          if (!isConnected) {
            setShowConnectWalletBookSession(true);
          } else {
            if (authenticated) {
              await router.push("/sessions?active=availableDelegates");
            } else {
              setShowConnectWalletBookSession(true);
              console.log("not authenticated");
            }
          }
        } finally {
          setLoadingFeature(null);
        }
      },
    },
    {
      title: "Turn Sessions into Earnings",
      description:
        "As a Delegate Host impactful sessions and earn every time someone mints your session NFT.",
      buttonText: "Schedule Now",
      image: feature3,
      // onclick: handleSchedule,
      onclick: () => {
        pushToGTM({
          event: 'feature_button_click',
          category: 'Feature Engagement',
          action: 'Button Click',
          label: 'Schedule Now',
          value: 3
        });
          setShowDaoSelectionSchedule(true);
      },
    },
    {
      title: "Grow and Earn More",
      description:
        "Refer creators or users to Chora Club and earn rewards for every mint and engagement.",
      buttonText: "Learn How to Earn",
      image: feature4,
      onclick: () => {
        pushToGTM({
          event: 'feature_button_click',
          category: 'Feature Engagement',
          action: 'Button Click',
          label: 'Learn How to Earn',
          value: 4
        });
        router.push(
          "https://docs.chora.club/earn-rewards/create-referral-reward"
        );
      },
    },
  ];

  useEffect(() => {
    if (isConnected && authenticated && ShowConnectWalletBookSession) {
      // Close the wallet modal and redirect
      setShowConnectWalletBookSession(false);
      router.push("/sessions?active=availableDelegates");
    }
  }, [isConnected, ShowConnectWalletBookSession, router, path, authenticated]);

  const handleJoinAsUser = () => {
    router.push("/sessions?active=recordedSessions");
  };
  const checkDelegateStatus = async (network: string) => {
    setShowError(false);

    let delegateTxAddr = "";
    const contractAddress =
      network === "optimism"
        ? "0x4200000000000000000000000000000000000042"
        : network === "arbitrum"
        ? "0x912CE59144191C1204E64559FE8253a0e49E6548"
        : "";

    try {
      let delegateTx;
      const public_client = createPublicClient({
        chain: network === "optimism" ? optimism : arbitrum,
        transport: http(),
      });

      delegateTx = (await public_client.readContract({
        address: contractAddress as `0x${string}`,
        abi: dao_abi.abi,
        functionName: "delegates",
        args: [address],
      })) as string;

      delegateTxAddr = delegateTx;
      if (delegateTxAddr.toLowerCase() === address?.toLowerCase()) {
        router.push(`/profile/${address}?active=sessions&session=schedule`
        );
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error("Error in reading contract", error);
      setShowError(true);
    }
  };

  useEffect(() => {
    if (isPaused) {
      setIsPauseButton(true);
      return;
    }

    setIsPauseButton(false);

    const interval = setInterval(() => {
      setIsPauseButton(false);
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setCurrentIndex((prev) => (prev + 1) % features.length);
          return SLIDE_DURATION;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, features.length, isPaused]);

  // Handle dot navigation
  useEffect(() => {
    if (progressCircle.current) {
      const progress = ((SLIDE_DURATION - timeLeft) / SLIDE_DURATION) * 100;
      const circumference = 2 * Math.PI * 20; // r=20
      const offset = circumference - (progress / 100) * circumference;
      progressCircle.current.style.strokeDasharray = `${circumference} ${circumference}`;
      progressCircle.current.style.strokeDashoffset = `${offset}`;
    }
  }, [timeLeft]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setTimeLeft(SLIDE_DURATION);
  };

  useEffect(() => {
    if (isConnected && showConnectWallet) {
      // Close the wallet modal and redirect
      setShowConnectWallet(false);
      router.push("/sessions?active=recordedSessions");
    }
  }, [isConnected, showConnectWallet, router, path]);

  const handleGetStarted = () => {
    setIsLoading(true);
    pushToGTM({
      event: 'get_started_click',
      category: 'User Flow',
      action: 'Button Click',
      label: 'Join As a User',
      value: 1
    });
    if (!isConnected) {
      setShowConnectWallet(true);
      setIsLoading(false);
    } else if (!authenticated) {
      setShowConnectWallet(true);
      setIsLoading(false);
    } else {
      router.push("/sessions?active=recordedSessions");
    }
  };
  const handleGetStartedDelegate = () => {
    pushToGTM({
      event: 'get_started_click',
      category: 'User Flow',
      action: 'Button Click',
      label: 'Join As a Delegate',
      value: 2
    });
      setShowDaoSelection(true);
  };

  return (
    <>
      {/* {console.log(isConnected, "is connect?", authenticated, "authenicate")} */}
      <div className="md:h-[calc(100vh-60px)] flex flex-col overflow-hidden">
        <PageBackgroundPattern />
        <div className="flex flex-col justify-between h-full">
          <div className="flex-grow w-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4 0.7xs:p-6 ">
            <div className="flex flex-col md:flex-row items-center max-w-4xl 0.7xs:max-w-6xl mx-auto gap-4 0.7xs:gap-8 h-full">
              {/* Left Card - Join as Delegate */}
              <div className="flex items-center justify-center group relative overflow-hidden rounded-2xl bg-white shadow-lg h-full transition-all duration-700 ease-in-out hover:shadow-2xl hover:transform hover:scale-105 p-4 md:p-3 max-h-[290px] 1.5md:max-h-[230px]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center gap-3 text-left justify-between">
                  <Image
                    src={delegate}
                    alt=""
                    className="size-24 0.7xs:size-28"
                  />
                  <div className="gap-1 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Join as a Delegate
                    </h2>
                    <p className="text-gray-600 max-w-sm text-sm 0.7xs:text-base">
                      Engage with your community—host meaningful sessions, grow
                      your influence, and lead with purpose as a delegate today!
                    </p>
                    <motion.button
                      className="w-[160px] 0.2xs:w-[200px] bg-blue-shade-100 text-white font-medium py-2 px-1 0.2xs:py-2.5 0.2xs:px-4 rounded-3xl overflow-hidden relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      onMouseEnter={() => setIsButtonHovered(true)}
                      onMouseLeave={() => setIsButtonHovered(false)}
                      onClick={handleGetStartedDelegate}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <motion.span
                          animate={{ x: isButtonHovered ? -10 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          Get Started
                        </motion.span>
                        <motion.div
                          animate={{
                            x: isButtonHovered ? 5 : 0,
                            opacity: isButtonHovered ? 1 : 0.7,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <IoArrowForward size={20} />
                        </motion.div>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Right Card - Join as User */}
              <div className="flex items-center group relative overflow-hidden rounded-2xl bg-white justify-center shadow-lg h-full transition-all duration-700 ease-in-out hover:shadow-2xl hover:transform hover:scale-105 p-4 md:p-3 max-h-[290px] 1.5md:max-h-[230px]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center gap-3 text-left justify-between">
                  <Image src={user} alt="" className="size-24 0.7xs:size-28" />
                  <div className="gap-1 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Join as a User
                    </h2>
                    <p className="text-gray-600 max-w-sm text-sm 0.7xs:text-base">
                      Connect with delegates—master the basics, start
                      participating, and make an impact in DAOs from day one!
                    </p>
                    <div className="mt-4">
                      <motion.button
                        className="w-[160px] 0.2xs:w-[200px] bg-blue-shade-100 text-white font-medium py-2 px-1 0.2xs:py-2.5 0.2xs:px-4 rounded-3xl overflow-hidden relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleGetStarted}
                        onMouseEnter={() => setIsButtonHoveredTwo(true)}
                        onMouseLeave={() => setIsButtonHoveredTwo(false)}
                        disabled={isLoading}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Loading...</span>
                            </div>
                          ) : (
                            <>
                              <motion.span
                                animate={{ x: isButtonHoveredTwo ? -10 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                Get Started
                              </motion.span>
                              <motion.div
                                animate={{
                                  x: isButtonHoveredTwo ? 5 : 0,
                                  opacity: isButtonHoveredTwo ? 1 : 0.7,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <IoArrowForward size={20} />
                              </motion.div>
                            </>
                          )}
                        </div>
                      </motion.button>
                    </div>
                    {/* )} */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {showConnectWallet && (!isConnected || !authenticated) && (
            <ConnectWalletHomePage
              onClose={() => setShowConnectWallet(false)}
            />
          )}
          {showConnectWalletDelegate && (!isConnected || !authenticated) && (
            <ConnectWalletHomePage
              onClose={() => setShowConnectWalletDelegate(false)}
            />
          )}
          {ShowConnectWalletBookSession && (
            <ConnectWalletHomePage
              onClose={() => setShowConnectWalletBookSession(false)}
            />
          )}
          {showConnectWalletGenerate && (!isConnected || !authenticated) && (
            <ConnectWalletHomePage
              onClose={() => setShowConnectWalletGenerate(false)}
            />
          )}
          {showDaoSelection && (
            <DaoSelection
              onClose={() => setShowDaoSelection(false)}
              joinAsDelegate={true}
            />
          )}
          {showDaoSelectionFeature && (
            <DaoSelection
              onClose={() => setShowDaoSelectionFeature(false)}
              feature={true}
            />
          )}
          {showDaoSelectionSchedule && (
            <DaoSelection
              onClose={() => setShowDaoSelectionSchedule(false)}
              featureSchedule={true}
            />
          )}

          {/* carousel */}
          <div className=" relative h-[60vh] 0.2xs:h-[60vh] xs:h-[65vh] md:h-[50vh] w-full overflow-hidden p-3 mb-5 md:mb-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 1000 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -1000 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="h-full w-full"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="flex h-full w-full items-center justify-center xm:px-4">
                  <div className="max-w-7xl xm:max-w-6xl w-full rounded-2xl  bg-gradient-to-br from-blue-50 to-white shadow-lg m-auto h-[50vh] 0.2xs:h-[50vh] xs:h-[55vh] xm:h-[40vh] relative">
                    <div className="flex flex-col xm:flex-row items-center justify-between md:space-x-8  md:space-y-0 h-full">
                      {/* Image Container */}
                      <div className="w-full h-fit xm:w-2/3 xm:h-full flex items-center justify-center pl-4 pr-4 xm:pr-0 md:pl-6 py-4">
                        <div className=" rounded-2xl relative w-full aspect-video perspective-1000 group">
                          <div className="absolute inset-0  rounded-2xl" />
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative w-full h-full flex items-center justify-center transform transition-all duration-500 ease-in-out group-hover:rotate-y-12"
                          >
                            <div className="relative w-full h-full overflow-hidden rounded-2xl transition-all duration-500 ease-in-out ">
                              <Image
                                src={features[currentIndex].image}
                                alt={features[currentIndex].title}
                                className="object-cover rounded-2xl transition-transform duration-500 ease-in-out group-hover:scale-110"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 64vw, 64vw"
                              />
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col gap-4 items-center xm:items-start justify-end p-4 w-full xm:w-2/3">
                        <motion.h2
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className={`text-blue-shade-100 text-xl 0.2xs:text-2xl xm:text-3xl md:text-4xl font-bold text-center xm:text-left`}
                        >
                          {features[currentIndex].title}
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          className="text-gray-600 text-center xm:text-left text-xs 0.2xs:text-sm xm:text-base md:text-lg max-w-xl"
                        >
                          {features[currentIndex].description}
                        </motion.p>
                        <div className="flex justify-end items-center">
                          <div
                            onClick={() =>
                              loadingFeature === null &&
                              (features[currentIndex].onclick?.() ??
                                console.log("No onclick handler defined"))
                            }
                          >
                            <motion.button
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                              disabled={loadingFeature === currentIndex}
                              className="bg-blue-shade-100 text-white font-semibold py-2 xm:py-3 px-6 xm:px-8 rounded-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                            >
                              {loadingFeature === currentIndex ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                features[currentIndex].buttonText
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className=" absolute bottom-[18px] right-[18px] xm:bottom-2 xm:right-2 z-10">
                      <div className="relative size-8 md:size-10">
                        <svg
                          className="w-full h-full transform -rotate-90"
                          viewBox="0 0 48 48"
                        >
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            className="stroke-gray-200 fill-none"
                            strokeWidth="4"
                          />
                          <circle
                            ref={progressCircle}
                            cx="24"
                            cy="24"
                            r="20"
                            className="stroke-blue-600 fill-none"
                            strokeWidth="4"
                            strokeLinecap="round"
                            style={{
                              transition: "stroke-dashoffset 1s ease",
                            }}
                          />
                        </svg>
                        <div className="flex absolute inset-0 items-center justify-center">
                          <span className="text-xs md:text-sm font-bold text-blue-600">
                            {isPauseButton ? <IoIosPause /> : timeLeft}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dot Navigation */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {features.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-blue-600 w-8"
                      : "bg-gray-300 hover:bg-gray-400 w-3"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          {showError && <ErrorPopup onClose={() => setShowError(false)} />}
          {showConnectWalletFeature && (!isConnected || !authenticated) && (
            <ConnectWalletHomePage
              onClose={() => setShowConnectWalletFeature(false)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Homepage;
