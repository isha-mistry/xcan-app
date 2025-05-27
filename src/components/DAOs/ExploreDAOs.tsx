"use client";

import React, { useState, useEffect, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import search from "@/assets/images/daos/search.png";
import { useRouter } from "next-nprogress-bar";
import { ImCross } from "react-icons/im";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { dao_details } from "@/config/daoDetails";
import SidebarMainMobile from "../MainSidebar/SidebarMainMobile";
import RewardButton from "../ClaimReward/RewardButton";
import { useSearchParams } from "next/navigation";
import { useConnection } from "@/app/hooks/useConnection";
import { useAccount } from "wagmi";
import Link from "next/link";
import { CiSearch } from "react-icons/ci";
import { FaCirclePlus } from "react-icons/fa6";
import { motion } from "framer-motion";
import ExploreDaosSkeletonLoader from "../SkeletonLoader/ExploreDaosSkeletonLoader";
import Heading from "../ComponentUtils/Heading";
import PageBackgroundPattern from "@/components/ComponentUtils/PageBackgroundPattern";
import { usePrivy } from "@privy-io/react-auth";
import FeaturedArticles from "./FeaturedArticles";

const ExploreDAOs = () => {
  const dao_info = Object.keys(dao_details).map((key) => {
    const dao = dao_details[key];
    return {
      name: dao.title,
      value: dao.number_of_delegates,
      img: dao.logo,
      redirection: dao.dao_name,
    };
  });

  const [daoInfo, setDaoInfo] = useState(dao_info);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState(true);
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const searchParams = useSearchParams();
  // const { openConnectModal } = useConnectModal();
  const { isConnected, isLoading, isPageLoading, isReady } =
    useConnection();
  const { ready, authenticated, login, logout } = usePrivy();

  useEffect(() => {
    const storedStatus = sessionStorage.getItem("notificationStatus");
    setShowNotification(storedStatus !== "closed");
    // setIsPageLoading(false);
  }, []);

  const handleCloseNotification = () => {
    sessionStorage.setItem("notificationStatus", "closed");
    setShowNotification(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const filtered = dao_info.filter((item) =>
      item.name.toLowerCase().startsWith(query.toLowerCase())
    );
    setDaoInfo(filtered);
  };



  const handleClick = (name: string, img: StaticImageData) => {
    const formatted = name.toLowerCase();
    // const localData = JSON.parse(localStorage.getItem("visitedDao") || "{}");
    // localStorage.setItem(
    //   "visitedDao",
    //   JSON.stringify({ ...localData, [formatted]: [formatted, img] })
    // );
    router.push(`/arbitrum?active=about`);
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (openSearch && !event.target.closest(".search-container")) {
        setOpenSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openSearch]);

  useEffect(() => {
    if (searchParams.get("referrer") && login) {
      // openConnectModal();
      login()
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full -z-0">
        <PageBackgroundPattern />
      </div>
      <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
        <Heading />
      </div>

      <div className="relative w-full px-4 md:px-6 lg:px-14 pb-8 font-tektur">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-dark-text-primary mb-4">
            Explore Decentralized Autonomous Organizations
          </h2>
          <p className="text-xl text-dark-text-secondary">
            Discover, connect, and engage with innovative DAOs across various
            domains
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center rounded-full shadow-lg bg-dark-secondary text-white cursor-pointer w-full max-w-md border border-dark-accent">
            <CiSearch className="text-xl text-dark-text-secondary ml-4" />
            <input
              type="text"
              placeholder="Search DAOs"
              className="w-full pl-3 pr-4 py-3 font-tektur text-base bg-transparent outline-none text-dark-text-primary placeholder-dark-text-tertiary"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </motion.div>

        {isPageLoading ? (
          <ExploreDaosSkeletonLoader />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-none sm:w-[50%] md:w-[45%] 1.3lg:w-[35%] 1.7xl:w-[32%] gap-6 2xl:w-[30%] mx-auto"
          >
            {daoInfo.length > 0 ? (
              daoInfo.map((dao: any) => (
                <motion.div
                  key={dao.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-dark-secondary rounded-xl shadow-lg overflow-hidden cursor-pointer border border-dark-accent"
                  onClick={() => handleClick(dao.redirection, dao.img)}
                >
                  <div className="p-6">
                    <div className="flex justify-center mb-4">
                      <Image
                        src={dao.img}
                        alt={dao.name}
                        width={200}
                        height={200}
                        className="rounded-full h-20 w-20"
                        quality={100}
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-semibold text-lg text-center mb-2 capitalize text-dark-text-primary">
                      {dao.name}
                    </h3>
                    <div className="text-sm text-center bg-dark-tertiary py-2 px-3 rounded-full text-dark-text-secondary">
                      {dao.value} Participants
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-xl font-semibold text-dark-text-tertiary">
                No DAOs available for the selected category
              </div>
            )}
            {/* {daoInfo.length >0 ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer flex items-center justify-center h-[220px] md:h-full"
            >
              <Link
                href="https://app.deform.cc/form/a401a65c-73c0-49cb-8d96-63e36ef36f88"
                target="_blank"
                className="w-full h-full flex items-center justify-center relative"
              >
                <FaCirclePlus
                  size={50}
                  className={`text-[#b1b1b1] transition-all duration-200 ${
                    isHovered ? "opacity-20" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute inset-0 flex items-center justify-center text-lg font-semibold text-blue-600 transition-opacity duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Add your DAO
                </span>
              </Link>
            </motion.div>
            ): (<></>)} */}
          </motion.div>
        )}
      </div>
      {/* <FeaturedArticles /> */}
    </div>
  );
};

export default ExploreDAOs;
