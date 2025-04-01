"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import NotificationAll from "./NotificationAll";
import SessionBookings from "./SessionBookings";
import RecordedSessions from "./RecordedSessions";
import ProposalVote from "./ProposalVote";
import Followers from "./Followers";
import Attestation from "./Attestation";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { Notification } from "./NotificationTypeUtils";
import { useAccount } from "wagmi";
import { useSocket } from "@/app/hooks/useSocket";
import { PiEnvelopeOpen } from "react-icons/pi";
import { useSession } from "next-auth/react";
import { MagnifyingGlass } from "react-loader-spinner";
import { Session } from "next-auth";
import toast, { Toaster } from "react-hot-toast";
import { useNotificationStudioState } from "@/store/notificationStudioState";
import MobileResponsiveMessage from "../MobileResponsiveMessage/MobileResponsiveMessage";
import Heading from "../ComponentUtils/Heading";
import NotificationSkeletonLoader from "../SkeletonLoader/NotificationSkeletonLoader";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useConnection } from "@/app/hooks/useConnection";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";

import { fetchApi } from "@/utils/api";
import { BellOff, ChevronDownIcon, Wallet } from "lucide-react";
import * as pushNotificationService from '@/services/pushNotificationService';

function NotificationMain() {
  const { isConnected } = useConnection();
  const { data: session } = useSession();
  const { address } = useAccount();
  const { user, ready, getAccessToken, authenticated } = usePrivy();
  const searchParams = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const socket = useSocket();
  const {
    notifications,
    newNotifications,
    combinedNotifications,
    canFetch,
    hasAnyUnreadNotification,
    setNotifications,
    setNewNotifications,
    addNotification,
    updateCombinedNotifications,
    markAllAsRead,
    setCanFetch,
    setHasAnyUnreadNotification,
  } = useNotificationStudioState();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState("Mark all as read");
  const [markAllReadCalling, setMarkAllReadCalling] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const { walletAddress } = useWalletAddress();
  const { wallets } = useWallets();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Info");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const tabs = [
    { name: "All", value: "all" },
    // { name: "Past Votes", value: "votes" },
    { name: "Meetings", value: "sessionBookings" },
    { name: "Recorded Sessions", value: "recordedSessions" },
    { name: "Followers", value: "followers" },
    { name: "Attestations", value: "attestations" },
    // { name: "Instant Meet", value: "instant-meet" }
  ];

  const isValidAuthentication = () => {
    // Check if user is authenticated AND has an active wallet
    const hasActiveWallet = wallets.some((wallet) => wallet.address);
    return authenticated && isConnected && hasActiveWallet;
  };

  const canAccessProtectedResources = () => {
    if (!isValidAuthentication()) {
      return false;
    }
    return true;
  };

  const Isvalid = canAccessProtectedResources();

  const handleTabChange = (tabValue: string) => {
    // console.log(tabValue);
    const selected = tabs.find((tab) => tab.value === tabValue);
    // console.log(selected);
    if (selected) {
      setSelectedTab(selected.name);
      setIsDropdownOpen(false);
      if (tabValue === "sessionBookings") {
        router.push(path + `?active=${tabValue}`);
      } else if (tabValue === "recordedSessions") {
        toast("Coming Soon 🚀");
      } else if (tabValue === "followers") {
        toast("Coming Soon 🚀");
      } else if (tabValue === "attestations") {
        router.push(path + `?active=${tabValue}`);
      } else if (tabValue === "officeHours") {
        router.push(path + `?active=${tabValue}`);
      } else {
        router.push(path + `?active=${tabValue}`);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.matches(":hover")) {
        setIsDropdownOpen(false);
      }
    }, 100);
  };

  useEffect(() => {
    const activeTab = searchParams.get("active");
    if (activeTab) {
      const tab = tabs.find((t) => t.value === activeTab);
      setSelectedTab(tab?.name || "Info");
    }
  }, [searchParams, tabs]);

  useEffect(() => {
    setIsPageLoading(false);
  }, [isPageLoading]);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        setSocketId(socket.id);
      });

      socket.on("disconnect", () => {
        setSocketId(null);
      });
    }
  }, [socket]);

  useEffect(() => {
    // Set canFetch based on address and session
    setCanFetch(!!walletAddress && !!authenticated);
  }, [address, walletAddress, session, setCanFetch]);

  const fetchNotifications = useCallback(async () => {
    if (!canFetch) return;
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };

      const raw = JSON.stringify({ address: walletAddress });

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };
      const response = await fetchApi("/notifications", requestOptions);
      const result = await response.json();
      if (Array.isArray(result.data)) {
        setNotifications(result.data);
        updateCombinedNotifications();
      } else {
        console.error("Fetched data is not an array:", result);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    walletAddress,
    address,
    canFetch,
    setNotifications,
    updateCombinedNotifications,
  ]);

  useEffect(() => {
    // if (canFetch) {
    fetchNotifications();
    // }
  }, [fetchNotifications, canFetch]);

  useEffect(() => {
    // Function to handle new notifications
    const handleNewNotification = async (message: Notification) => {
      console.log("New notification received:", message);

      // Create notification data
      const notificationData: Notification = {
        _id: message?._id,
        receiver_address: message.receiver_address,
        content: message.content,
        createdAt: Date.now(),
        read_status: false,
        notification_name: message.notification_name,
        notification_type: message.notification_type,
        notification_title: message.notification_title,
        additionalData: message?.additionalData,
      };

      // Add to local state
      addNotification(notificationData);
      updateCombinedNotifications();

      // Send web push notification
      try {
        await pushNotificationService.sendPushNotification({
          title: message.notification_title || 'New Notification',
          body: message.content || 'You have a new notification',
          data: notificationData
        });
      } catch (error) {
        console.error('Error handling push notification:', error);
      }
    };

    // Socket connection and event binding
    if (socket && walletAddress && socketId) {
      // Register host
      socket.emit("register_host", { hostAddress: walletAddress, socketId });

      // Listen for new notifications
      socket.on("new_notification", handleNewNotification);
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.off("new_notification", handleNewNotification);
      }
    };
  }, [
    socket,
    walletAddress,
    socketId,
    addNotification,
    hasAnyUnreadNotification,
    updateCombinedNotifications,
  ]);

  const filteredNotifications = React.useMemo(() => {
    const type = searchParams.get("active");
    if (type === "all" || !type) return combinedNotifications;

    console.log("combinedNotifications", combinedNotifications);
    const typeMap = {
      sessionBookings: "newBooking",
      recordedSessions: "recordedSession",
      followers: "newFollower",
      attestations: "attestation",
      proposalVote: "proposalVote",
      officeHours: "officeHours",
    };
    return combinedNotifications.filter(
      (item) => item.notification_type === typeMap[type as keyof typeof typeMap]
    );
  }, [combinedNotifications, searchParams]);

  const handleMarkAllAsRead = async () => {
    // if (!walletAddress || !session) return;

    const hasUnreadNotifications = combinedNotifications.some(
      (notification) => notification.read_status === false
    );

    if (!hasUnreadNotifications) {
      toast("No unread notifications");
      return;
    }

    setButtonText("Marking...");
    setMarkAllReadCalling(true);
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(walletAddress && {
          "x-wallet-address": walletAddress,
          Authorization: `Bearer ${token}`,
        }),
      };

      const raw = JSON.stringify({
        markAll: true,
        receiver_address: walletAddress,
      });

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };
      const response = await fetchApi(
        "/notifications/mark-as-read",
        requestOptions
      );
      if (response.ok) {
        markAllAsRead();
        updateCombinedNotifications();
        setButtonText("Marked!");
        setTimeout(() => setButtonText("Mark all as read"), 2000);
        toast.success("All notifications marked as read");
      } else {
        console.error("Failed to mark all as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Error marking all as read");
    } finally {
      setMarkAllReadCalling(false);
    }
  };

  const handleTabClick = (tab: string) => {
    if (
      tab === "recordedSessions" ||
      tab === "followers" ||
      tab === "attestations"
    ) {
      toast("Coming Soon 🚀");
    } else {
      router.push(`${path}?active=${tab}`);
    }
  };

  const renderContent = () => {
    if (isPageLoading) {
      return <NotificationSkeletonLoader />;
    }

    if (Isvalid == false) {
      return (
        <div className="flex flex-col justify-center items-center min-h-[16rem] px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 bg-gradient-to-b from-blue-50/50 to-white">
          <div
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 sm:p-10 md:p-12 max-w-md w-full mx-auto 
        shadow-[0_20px_50px_rgba(59,130,246,0.15)] hover:shadow-[0_25px_60px_rgba(59,130,246,0.2)]
        border border-blue-100 transition-all duration-500"
          >
            <div className="flex flex-col items-center space-y-8">
              {/* Enhanced Animated Icon Container */}
              <div className="relative group">
                <div
                  className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-40 group-hover:opacity-60 
              transition-all duration-500 animate-pulse"
                ></div>
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-300/40 to-blue-200/40 rounded-full 
              blur-xl rotate-180 transform group-hover:rotate-0 transition-transform duration-700"
                ></div>
                <div
                  className="relative bg-gradient-to-br from-blue-300 to-blue-400 p-6 rounded-full
              shadow-[0_8px_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_10px_25px_rgba(59,130,246,0.35)]
              transform transition-all duration-300 group-hover:scale-105"
                >
                  <Wallet
                    className="w-12 h-12 sm:w-14 sm:h-14 text-white transform group-hover:rotate-12 transition-transform duration-300"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Enhanced Text Content */}
              <div className="text-center space-y-4">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl font-bold 
              bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent
              tracking-tight"
                >
                  Connect Your Wallet
                </h3>
                <p className="text-sm sm:text-base text-gray-600/90 max-w-sm leading-relaxed">
                  Please connect your wallet and sign in to view your
                  notifications and activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <MagnifyingGlass
            color={"#123abc"}
            visible={isLoading}
            height="80"
            width="80"
          />
        </div>
      );
    }

    const activeTab = searchParams.get("active") || "all";

    if (filteredNotifications.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center min-h-[16rem] px-4 py-8">
          <div
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 sm:p-10 
        shadow-[0_20px_50px_rgba(59,130,246,0.15)] 
        border border-blue-100 
        transform transition-all duration-500 hover:shadow-[0_25px_60px_rgba(59,130,246,0.2)]"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-30 group-hover:opacity-50 animate-pulse"></div>
                <div
                  className="relative bg-gradient-to-br from-blue-300 to-blue-400 p-5 rounded-full
              shadow-[0_8px_16px_rgba(59,130,246,0.2)]
              transform transition-all duration-300 group-hover:scale-105"
                >
                  <BellOff
                    className="w-8 h-8 sm:w-10 sm:h-10 text-white transform group-hover:rotate-12 transition-transform duration-300"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3
                  className="text-xl sm:text-2xl font-semibold 
              bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent"
                >
                  No New Notifications
                </h3>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const components = {
      all: NotificationAll,
      sessionBookings: SessionBookings,
      recordedSessions: RecordedSessions,
      followers: Followers,
      attestations: Attestation,
    };
    const Component =
      components[activeTab as keyof typeof components] || NotificationAll;
    return <Component notifications={filteredNotifications} />;
  };

  return (
    <>
      {/* <Toaster
        toastOptions={{
          style: {
            fontSize: "14px",
            backgroundColor: "#3E3D3D",
            color: "#fff",
            boxShadow: "none",
            borderRadius: "50px",
            padding: "3px 5px",
          },
        }}
      /> */}
      <div className="font-poppins mb-12">
        <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
          <Heading />
        </div>
        <div
          className="md:hidden mt-4 px-8 xs:px-4 sm:px-8 py-2 sm:py-[10px] bg-[#D9D9D945]"
          ref={dropdownRef}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="w-full flex justify-between items-center text-left font-normal rounded-full capitalize text-lg text-blue-shade-100 bg-white px-4 py-2 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onMouseEnter={handleMouseEnter}
          >
            <span>{selectedTab}</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-700 ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </div>
          <div
            className={`w-[calc(100vw-3rem)] mt-1 overflow-hidden transition-all duration-700 ease-in-out ${isDropdownOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="p-2 border border-white-shade-100 rounded-xl bg-white shadow-md">
              {tabs.map((tab, index) => (
                <React.Fragment key={tab.value}>
                  <div
                    onClick={() => handleTabChange(tab.value)}
                    className="px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-100 capitalize text-base cursor-pointer"
                  >
                    {tab.name}
                  </div>
                  {index !== tabs.length - 1 && <hr className="my-1" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="hidden md:flex bg-[#D9D9D945]">
          <div className="flex gap-8 1.5lg:gap-12 lg:pl-16 pl-8">
            <button
              className={`py-4 px-2 outline-none ${searchParams.get("active") === "all"
                ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                : "border-transparent"
                }`}
              onClick={() => router.push(path + "?active=all")}
            >
              All
            </button>
            <button
              className={`py-4 px-2 outline-none ${searchParams.get("active") === "sessionBookings"
                ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                : "border-transparent"
                }`}
              onClick={() => router.push(path + "?active=sessionBookings")}
            >
              Meetings
            </button>
            <button
              className={`py-4 px-2 outline-none ${searchParams.get("active") === "recordedSessions"
                ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                : "border-transparent"
                }`}
              // onClick={() => router.push(path + "?active=recordedSessions")}
              onClick={() => toast("Coming Soon 🚀")}
            >
              Recorded Sessions
            </button>
            <button
              className={`py-4 px-2 outline-none ${searchParams.get("active") === "followers"
                ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                : "border-transparent"
                }`}
              // onClick={() => router.push(path + "?active=followers")}
              onClick={() => toast("Coming Soon 🚀")}
            >
              Followers
            </button>
            <button
              className={`py-4 px-2 outline-none ${searchParams.get("active") === "attestations"
                ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                : "border-transparent"
                }`}
              onClick={() => router.push(path + "?active=attestations")}
            >
              Attestations
            </button>
            <button
              className={`py-4 px-2 outline-none ${searchParams.get("active") === "proposalVote"
                ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                : "border-transparent"
                }`}
              onClick={() => router.push(path + "?active=proposalVote")}
            >
              ProposalVote
            </button>
            <button
              className={`py-4 px-2 outline-none ${searchParams.get("active") === "officeHours"
                ? "text-blue-shade-200 font-semibold border-b-2 border-blue-shade-200"
                : "border-transparent"
                }`}
              onClick={() => router.push(path + "?active=officeHours")}
            >
              Office Hours
            </button>
          </div>
          <div className="hidden 2md:block ml-auto 1.5lg:pe-16 pe-8">
            <button
              className="my-4 py-2 px-4 border w-52 border-blue-shade-100 text-blue-shade-100 rounded-xl flex items-center shadow-md hover:bg-blue-shade-100 hover:text-white transition duration-300 ease-in-out font-bold"
              onClick={handleMarkAllAsRead}
              disabled={markAllReadCalling}
            >
              <PiEnvelopeOpen className="h-5 w-5 mr-2" />
              {buttonText}
            </button>
          </div>
        </div>
        <div className="flex justify-end 2md:hidden ml-auto pe-8">
          <button
            className="my-4 py-2 px-4 border w-52 border-blue-shade-100 text-blue-shade-100 rounded-xl flex items-center shadow-md hover:bg-blue-shade-100 hover:text-white transition duration-300 ease-in-out font-bold"
            onClick={handleMarkAllAsRead}
            disabled={markAllReadCalling}
          >
            <PiEnvelopeOpen className="h-5 w-5 mr-2" />
            {buttonText}
          </button>
        </div>
        <div className="flex flex-col pt-7 px-4 md:px-6 lg:px-16">
          {renderContent()}
        </div>
      </div>
    </>
  );
}

export default NotificationMain;
