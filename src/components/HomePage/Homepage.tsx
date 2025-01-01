"use client";
import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import PageBackgroundPattern from "../ComponentUtils/PageBackgroundPattern";
import { IoArrowForward } from "react-icons/io5";
import delegate from "@/assets/images/Homepage/daos.svg";
import user from "@/assets/images/Homepage/human.svg";
import Image from "next/image";
import styles from "./HomePage.module.css";
import bell from "@/assets/images/Homepage/bell.svg";
import chain from "@/assets/images/Homepage/chain.svg";
import setting from "@/assets/images/Homepage/settings.svg";
import watch from "@/assets/images/Homepage/watch.svg";
import feature1 from "@/assets/images/Homepage/feature1.png";
import feature2 from "@/assets/images/Homepage/feature2.png";
import feature3 from "@/assets/images/Homepage/feature3.png";
import feature4 from "@/assets/images/Homepage/feature4.png";
import { useSidebar } from "@/app/hooks/useSidebar";

const Homepage = () => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonHoveredTwo, setIsButtonHoveredTwo] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const progressCircle = useRef<SVGCircleElement>(null);
  const SLIDE_DURATION = 5;
  const { walletAddress, } = useSidebar();
  const features = [
    {
      title: "Share on Warpcast",
      description:
        "Share your delegate profile on Warpcast with a single click and attract delegations effortlessly.",
      buttonText: "Generate Link",
      image: feature1,
      href: "https://app.chora.club/sessions?active=availableDelegates",
      target: "_self",
    },
    {
      title: "Build Your Credibility",
      description: "Earn attestations for every session you host or attend.",
      buttonText: "Book Session",
      image: feature2,
      href: "https://app.chora.club/sessions?active=availableDelegates",
      target: "_self",
    },
    {
      title: "Turn Sessions into Earnings",
      description:
        "As a Delegate Host impactful sessions and earn every time someone mints your session NFT.",
      buttonText: "Schedule Now",
      image: feature3,
      href: `https://app.chora.club/profile/${walletAddress}?active=sessions&session=schedule`,
      target: "_self",
    },
    {
      title: "Grow and Earn More",
      description:
        "Refer creators or users to Chora Club and earn rewards for every mint and engagement.",
      buttonText: "Learn How to Earn",
      image: feature4,
      href: "https://docs.chora.club/earn-rewards/create-referral-reward",
      target: "_blank",
    },
  ];

  // Auto-rotate every 5 seconds
  //  useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentIndex((prev) => (prev + 1) % features.length);
  //   }, 5000);

  //   return () => clearInterval(timer);
  // }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setCurrentIndex((prev) => (prev + 1) % features.length);
          return SLIDE_DURATION;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, features.length]);

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

  return (
    <div className="md:h-[calc(100vh-60px)] flex flex-col overflow-hidden">
      <PageBackgroundPattern />
      <div className="flex flex-col justify-between h-full">
        <div className="flex-grow w-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6 ">
          <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto gap-8 h-full">
            {/* Left Card - Join as Delegate */}
            <div className="flex items-center justify-center group relative overflow-hidden rounded-2xl bg-white shadow-lg h-full transition-all duration-700 ease-in-out hover:shadow-2xl hover:transform hover:scale-105 p-3 max-h-[350px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col items-center text-center justify-between">
                <Image src={delegate} alt="" className="size-28" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Join as Delegate
                </h2>
                <p className="text-gray-600 max-w-sm">
                  Become a delegate and help shape the future of decentralized
                  governance. Lead, propose, and make impactful decisions.
                </p>
                <Link
                  href="https://mirror.xyz/0x30d644CBf785167D8CaBcB35602959E19D9004Db"
                  className="mt-4 "
                  target="_blank"
                >
                  <motion.button
                    className="w-[200px] bg-gradient-to-r from-[#3b82f6] to-[#31316d] text-white font-medium py-2.5 px-4 rounded-3xl overflow-hidden relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={() => setIsButtonHovered(false)}
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
                </Link>
              </div>
            </div>

            {/* Right Card - Join as User */}
            <div className="flex items-center group relative overflow-hidden rounded-2xl bg-white justify-center shadow-lg h-full transition-all duration-700 ease-in-out hover:shadow-2xl hover:transform hover:scale-105 p-3 max-h-[350px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col items-center text-center justify-between">
                <Image src={user} alt="" className="size-28" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Join as User
                </h2>
                <p className="text-gray-600 max-w-sm">
                  Participate in governance, vote on proposals, and be part of a
                  thriving decentralized community.
                </p>
                <Link
                  href="https://mirror.xyz/0x30d644CBf785167D8CaBcB35602959E19D9004Db"
                  className="mt-4 "
                  target="_blank"
                >
                  <motion.button
                    className="w-[200px] bg-gradient-to-r from-[#3b82f6] to-[#31316d] text-white font-medium py-2.5 px-4 rounded-3xl overflow-hidden relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setIsButtonHoveredTwo(true)}
                    onMouseLeave={() => setIsButtonHoveredTwo(false)}
                  >
                    <div className="flex items-center justify-center space-x-2">
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
                    </div>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* carousel */}
        <div className="relative h-[40vh] w-full overflow-hidden bg-gradient-to-br from-blue-50 to-white p-3">
          {/* Timer */}
          <div className="absolute top-4 right-4 z-10">
            <div className="relative w-10 h-10">
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
                    transition: "stroke-dashoffset 0.3s ease",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 1000 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -1000 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full w-full"
            >
              <div className="flex h-full w-full items-center justify-center xm:px-4">
                <div className="max-w-7xl xm:max-w-6xl w-full rounded-2xl bg-white shadow-lg m-auto h-[35vh] xm:h-[30vh] relative">
                  <div className="flex flex-col xm:flex-row items-center md:space-x-8 space-y-4 md:space-y-0 h-full">
                    {/* Image Container */}
                    <div className="w-full xm:w-1/3 h-full flex items-center justify-center p-4">
                      <div className="relative w-full h-full perspective-1000 group">
                        <div className="absolute inset-0 bg-blue-200 rounded-2xl opacity-20 blur-2xl" />
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="relative w-full h-full flex items-center justify-center transform transition-all duration-500 ease-in-out group-hover:rotate-y-12"
                        >
                          <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-xl transition-all duration-500 ease-in-out group-hover:shadow-2xl">
                            <Image
                              src={features[currentIndex].image}
                              alt={features[currentIndex].title}
                              className="object-contain rounded-2xl transition-transform duration-500 ease-in-out group-hover:scale-110"
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-4 items-center xm:items-start justify-center p-4 w-full xm:w-2/3">
                      <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-2xl xm:text-3xl md:text-4xl font-bold text-center xm:text-left"
                      >
                        {features[currentIndex].title}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-gray-600 text-center xm:text-left text-sm xm:text-base md:text-lg max-w-xl"
                      >
                        {features[currentIndex].description}
                      </motion.p>
                      <Link
                        href={features[currentIndex].href}
                        target={features[currentIndex].target}
                      >
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2 xm:py-3 px-6 xm:px-8 rounded-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          {features[currentIndex].buttonText}
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot Navigation */}
          <div className="absolute bottom-2 right-[4vw] transform -translate-x-1/2 flex space-x-3">
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
      </div>
    </div>
  );
};

export default Homepage;
