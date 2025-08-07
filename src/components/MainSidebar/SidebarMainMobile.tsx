"use client";
import { IoClose, IoMenu } from "react-icons/io5";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { HiArrowSmLeft } from "react-icons/hi";
import { IoIosRocket, IoMdNotifications } from "react-icons/io";
import { SiGitbook } from "react-icons/si";
import { PiUsersThreeFill } from "react-icons/pi";
import { FaBusinessTime, FaCodeBranch, FaUser } from "react-icons/fa6";
import { BiSolidMessageSquareAdd, BiSolidWallet } from "react-icons/bi";
import { FiArrowUpRight, FiCodesandbox } from "react-icons/fi";
import { useSidebar } from "../../app/hooks/useSidebar";
import { Badge, Tooltip, VisuallyHidden } from "@nextui-org/react";
import Image from "next/image";
import styles from "./sidebar.module.css";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ConnectWallet } from "../ConnectWallet/ConnectWallet";
import cclogo from "@/assets/images/daos/CCLogo.png";
import { IoGiftSharp } from "react-icons/io5";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { usePrivy } from "@privy-io/react-auth";
import logo from "@/assets/images/icon.svg";
import ConnectYourWallet from "../ComponentUtils/ConnectYourWallet";
import { MdHub } from "react-icons/md";

const SidebarMainMobile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { authenticated, login } = usePrivy();
  const {
    storedDao,
    handleMouseOver,
    handleMouseOut,
    handleBadgeClick,
    badgeVisiblity,
    isPageLoading,
    session,
    status,
    address,
    isConnected,
  } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const sessionLoading = status === "loading";
  const isLoginPage = pathname === "/login";
  const authenticationCheck = isConnected || authenticated;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSidebarClick = (event: React.MouseEvent) => {
    // Prevent the click event from propagating to parent elements
    event.stopPropagation();
    toggleSidebar();
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!authenticated || !address || !isConnected) {
      // Show Privy modal if wallet is not connected
      login();
    } else {
      // Redirect to profile if wallet is connected
      window.location.href = `/profile/${address}?active=info`;
    }
    // Close sidebar after action
    setIsOpen(false);
  };

  return (
    <div className="relative z-10">
      <div className="bg-dark-secondary flex items-center justify-between w-full border-b-1 p-1">
        <div className="flex">
          <div
            className={`bg-blue-shade-200 text-white text-lg font-bold p-1.5 rounded-full cursor-pointer my-4 mx-2 0.2xs:mx-4`}
            onClick={toggleSidebar}
          >
            <IoMenu className="size-6" />
          </div>
          <div className={`flex border border-l-0 h-16`}></div>
          <Link
            className="ml-1 xs:ml-2 sm:ml-4 mt-[2px] xs:mt-[3px] text-black font-semibold text-[20px] xs:text-[24px] sm:text-[28px] md:text-[32px] font-tektur flex items-center"
            href={"/"}
          >
            <Image
              src={logo}
              alt={"Xcan Logo"}
              width={200}
              height={200}
              className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 md:h-11 md:w-11"
            />
            <span className="text-white text-[18px] sm:text-[22px] md:text-[26px] ml-1 xs:ml-2">
              Xcan
            </span>
          </Link>
        </div>
        {/* <div className="mr-2 xm:mr-4">
          {<ConnectWalletWithENS />}
        </div> */}
      </div>

      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 w-full font-tektur bg-blue-shade-200 text-white transform z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-500 ease-in-out`}
        onClick={handleSidebarClick}
      >
        <div className="">
          <div className="flex absolute top-4 left-4 items-center">
            <button
              className=" text-white border-white border rounded-full p-1.5"
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
            >
              <HiArrowSmLeft className="size-6" />
            </button>
            <Link
              className="ml-5 text-white font-semibold text-[26px] font-tektur"
              href={"https://inorbit-edu.vercel.app/"}
            >
              Xcan
            </Link>
          </div>

          <nav className="mt-20 mr-6">
            <ul className="">
              <li>
                <Link
                  href="/ecosystem"
                  className="block py-4 pl-6 sm:py-5 hover:bg-blue-shade-100 "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MdHub className="size-5 mr-4" />
                      <span>Ecosystem</span>
                    </div>
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
                <div className="h-[0.1px] w-full bg-white"></div>
              </li>
              <li>
                <Link
                  href="https://inorbit-modules.vercel.app/"
                  target="_blank"
                  className="block py-4 pl-6 sm:py-5 hover:bg-blue-shade-100 "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiCodesandbox className="size-5 mr-4" />
                      <span>Xcan</span>
                    </div>
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
                <div className="h-[0.1px] w-full bg-white"></div>
              </li>
              <li>
                <Link
                  href={"/dashboard"}
                  className="block py-4 pl-6 sm:py-5 hover:bg-blue-shade-100 "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaUser className="size-5 mr-4" />
                      <span>Dashboard</span>
                    </div>
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
                <div className="h-[0.1px] w-full bg-white"></div>
              </li>
              <li>
                <Link
                  href={"/lectures?hours=ongoing"}
                  className="block py-4 pl-6 sm:py-5 hover:bg-blue-shade-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaBusinessTime className="size-5 mr-4" />
                      <span>Lectures</span>
                    </div>
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
                <div className="h-[0.1px] w-full bg-white"></div>
              </li>
              <li>
                <Link
                  href={"/sessions?active=availableExperts"}
                  className="block py-4 pl-6 sm:py-5 hover:bg-blue-shade-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <PiUsersThreeFill className="size-5 mr-4" />
                      <span>Experts Sessions</span>
                    </div>
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
                <div className="h-[0.1px] w-full bg-white"></div>
              </li>
              {/* <li>
                <Link
                  href={"/invite"}
                  className="block py-4 pl-6 sm:py-5 hover:bg-blue-shade-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BiSolidMessageSquareAdd className="size-5 mr-4" />
                      <span>Invite</span>
                    </div>
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
                <div className="h-[0.1px] w-full bg-white"></div>
              </li> */}
              <li className=" md:hidden">
                <Link
                  href={"/claim-rewards"}
                  className="block py-4 pl-6 sm:py-5 hover:bg-blue-shade-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoGiftSharp className="size-5 mr-4" />
                      <span>Claim Rewards</span>
                    </div>
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
                <div className="h-[0.1px] w-full bg-white"></div>
              </li>
              <li>
                <Link
                  href={"/notifications?active=all"}
                  className="block py-4 pl-6 sm:py-5 hover:bg-blue-shade-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoMdNotifications className="size-5 mr-4" />
                      <span>Notification</span>
                    </div>
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </Link>
                <div className="h-[0.1px] w-full bg-white"></div>
              </li>

              {/* <Link href="#" className="block py-4 pl-6 sm:py-5 hover:bg-blue-shade-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BiSolidWallet className="size-5 mr-4" />
                      <span>Wallet</span>
                    </div>
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </Link> */}
              {/* {!isConnected || !session ? (
                <ConnectYourWallet />
              ) : ( */}
              <li>
                <button
                  // href={`/profile/${address}?active=info`}
                  onClick={handleProfileClick}
                  className="block py-4 pl-6 sm:py-5 hover:bg-blue-shade-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaUser className="size-5 mr-4" />
                      <span>Profile</span>
                    </div>
                    <FiArrowUpRight className="w-5 h-5" />
                  </div>
                </button>
              </li>
              {/* )} */}
            </ul>
          </nav>

          <>
            <div className=" flex flex-col w-[90%] gap-2 absolute bottom-4 mx-[5%] ">
              <ConnectWalletWithENS />
            </div>
          </>

        </div>
      </div>
    </div >
  );
};

export default SidebarMainMobile;
