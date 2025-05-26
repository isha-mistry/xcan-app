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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
        <Heading />
      </div>

      <div className="relative w-full px-4 md:px-6 lg:px-14 pb-8 font-tektur">
        {/* <div className="max-w-7xl mx-auto"> */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
          <div className="flex gap-2 0.5xs:gap-4 rounded-xl text-sm flex-wrap mb-6">
            <Tooltip
              showArrow
              content={
                <div className="font-tektur">
                  Explore available delegates by DAO, date, and time to book
                  sessions and unlock Web3 opportunities.
                </div>
              }
              placement="right"
              className="rounded-md bg-opacity-90 max-w-96 bg-gray-700"
              closeDelay={1}
            >
              <button
                className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-gray-700 shadow-md ${searchParams.get("active") === "availableDelegates"
                  ? "text-blue-400 font-semibold bg-gray-700"
                  : "text-gray-300 bg-gray-800"
                  }`}
                onClick={() => router.push(path + "?active=availableDelegates")}
              >
                <Users size={16} className="drop-shadow-lg" />
                Available Delegates
              </button>
            </Tooltip>
            <Tooltip
              showArrow
              content={
                <div className="font-tektur">
                  Browse previously recorded sessions.
                </div>
              }
              placement="right"
              className="rounded-md bg-opacity-90 max-w-96 bg-gray-700"
              closeDelay={1}
            >
              <button
                className={`py-2 px-4 flex gap-1 items-center rounded-full transition-all duration-200 whitespace-nowrap hover:bg-gray-700 shadow-md ${searchParams.get("active") === "recordedSessions"
                  ? "text-blue-400 font-semibold bg-gray-700"
                  : "text-gray-300 bg-gray-800"
                  }`}
                onClick={() => router.push(path + "?active=recordedSessions")}
              >
                <BookOpen size={16} className="drop-shadow-lg" />
                Library
              </button>
            </Tooltip>
          </div>

          <div className="mt-6">
            {searchParams.get("active") === "recordedSessions" && (
              <RecordedSessions />
            )}
            {searchParams.get("active") === "availableDelegates" && (
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
