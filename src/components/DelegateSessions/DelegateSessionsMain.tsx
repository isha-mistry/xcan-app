"use client";

import React, { useState, useEffect } from "react";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import AvailableSessions from "./AvailableSessions";
import RecordedSessions from "./RecordedSessions";
import { FaCircleInfo } from "react-icons/fa6";
import { Tooltip } from "@nextui-org/react";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import SidebarMainMobile from "../MainSidebar/SidebarMainMobile";
import Heading from "../ComponentUtils/Heading";
import { BookOpen, Users } from "lucide-react";

function DelegateSessionsMain() {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      <div className="">
        <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
          <Heading />
        </div>

        <div className="flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap xs:pl-4 ml-4 md:ml-6 lg:ml-14 font-poppins">
          <Tooltip
            showArrow
            content={
              <div className="font-poppins">
                Explore available delegates by DAO, date, and time to book
                sessions and unlock Web3 opportunities.
              </div>
            }
            placement="right"
            className="rounded-md bg-opacity-90 max-w-96"
            closeDelay={1}
          >
          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
              searchParams.get("active") === "availableDelegates"
                ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                : "text-[#3E3D3D] bg-white"
            }`}
            onClick={() => router.push(path + "?active=availableDelegates")}
          >
              {/* <div className=""> */}
                {" "}
                 <Users size={16} className="drop-shadow-lg" />
                Available Delegates
              {/* </div> */}
          </button>
            </Tooltip>
            <Tooltip
              showArrow
              content={
                <div className="font-poppins">
                  Browse previously recorded sessions.
                </div>
              }
              placement="right"
              className="rounded-md bg-opacity-90 max-w-96"
              closeDelay={1}
            >
          <button
            className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-[#f5f5f5] shadow-md ${
              searchParams.get("active") === "recordedSessions"
                ? "text-[#0500FF] font-semibold bg-[#f5f5f5]"
                : "text-[#3E3D3D] bg-white"
            }`}
            onClick={() => router.push(path + "?active=recordedSessions")}
          >
              {/* <div className=""> */}
              <BookOpen size={16} className="drop-shadow-lg" />
                Library
                {/* </div> */}
          </button>
            </Tooltip>
        </div>

        {searchParams.get("active") === "recordedSessions" ? (
          <div className="py-6 sm:px-20 md:px-6 lg:px-14">
            <RecordedSessions />
          </div>
        ) : (
          ""
        )}
        {searchParams.get("active") === "availableDelegates" ? (
          <div className="py-6 sm:px-8 md:px-6 lg:px-14 xl:px-14">
            <AvailableSessions />
          </div>
        ) : (
          ""
        )}

        {/* <div className="mt-1">
          <AvailableSessions />
        </div> */}
      </div>
    </>
  );
}

export default DelegateSessionsMain;
