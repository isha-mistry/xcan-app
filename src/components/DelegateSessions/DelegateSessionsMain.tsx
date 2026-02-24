"use client";

import React, { useState, useEffect } from "react";
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
    <div className="relative overflow-hidden">
      <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
        <Heading />
      </div>

      <div className="relative w-full px-4 md:px-6 lg:px-14 pb-8 font-robotoMono">
        {/* <div className="max-w-7xl mx-auto"> */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-white/10">
          <div className="flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap mb-6">
            <Tooltip
              showArrow
              content={
                <div className="font-robotoMono">
                  Explore available experts by date and time to book
                  sessions and unlock Web3 opportunities.
                </div>
              }
              placement="right"
              className="rounded-md bg-opacity-90 max-w-96 bg-blue-shade-400"
              closeDelay={1}
            >
              <button
                className={`py-2 px-6 flex gap-2 items-center rounded-full transition-all duration-300 whitespace-nowrap text-[11px] font-black uppercase tracking-widest border ${searchParams.get("active") === "availableExperts"
                  ? "text-black bg-white border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "text-white/40 bg-white/5 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/10"
                  }`}
                onClick={() => router.push(path + "?active=availableExperts")}
              >
                <Users size={14} className={searchParams.get("active") === "availableExperts" ? "text-black" : "text-blue-400"} />
                Available Experts
              </button>
            </Tooltip>
            <Tooltip
              showArrow
              content={
                <div className="font-robotoMono">
                  Browse previously recorded sessions.
                </div>
              }
              placement="right"
              className="rounded-md bg-opacity-90 max-w-96 bg-gray-700"
              closeDelay={1}
            >
              <button
                className={`py-2 px-6 flex gap-2 items-center rounded-full transition-all duration-300 whitespace-nowrap text-[11px] font-black uppercase tracking-widest border ${searchParams.get("active") === "recordedSessions"
                  ? "text-black bg-white border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "text-white/40 bg-white/5 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/10"
                  }`}
                onClick={() => router.push(path + "?active=recordedSessions")}
              >
                <BookOpen size={14} className={searchParams.get("active") === "recordedSessions" ? "text-black" : "text-blue-400"} />
                Library
              </button>
            </Tooltip>
          </div>

          <div className="mt-6">
            {searchParams.get("active") === "recordedSessions" && (
              <RecordedSessions />
            )}
            {searchParams.get("active") === "availableExperts" && (
              <AvailableSessions />
            )}
          </div>
        </div>
        {/* </div> */}
      </div>
    </div>
  );
}

export default DelegateSessionsMain;
