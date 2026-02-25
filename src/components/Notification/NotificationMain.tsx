"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import NotificationAll from "./NotificationAll";
import SessionBookings from "./SessionBookings";
import RecordedSessions from "./RecordedSessions";
import Attestation from "./Attestation";
import OfficeHours from "./OfficeHours";
import { Notification } from "./NotificationTypeUtils";
import { useAccount } from "wagmi";
import { useSocket } from "@/app/hooks/useSocket";
import { PiEnvelopeOpen } from "react-icons/pi";
import { useSession } from "next-auth/react";
import { MagnifyingGlass } from "react-loader-spinner";
import toast, { Toaster } from "react-hot-toast";
import { useNotificationStudioState } from "@/store/notificationStudioState";
import Heading from "../ComponentUtils/Heading";
import NotificationSkeletonLoader from "../SkeletonLoader/NotificationSkeletonLoader";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useConnection } from "@/app/hooks/useConnection";
import { fetchApi } from "@/utils/api";
import { BellOff, ChevronDownIcon, Wallet } from "lucide-react";

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
    combinedNotifications,
    canFetch,
    hasAnyUnreadNotification,
    setNotifications,
    addNotification,
    updateCombinedNotifications,
    markAllAsRead,
    setCanFetch,
  } = useNotificationStudioState();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState("Mark all as read");
  const [markAllReadCalling, setMarkAllReadCalling] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const { wallets } = useWallets();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Info");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const tabs = [
    { name: "All", value: "all" },
    { name: "Meetings", value: "sessionBookings" },
    { name: "Recorded Sessions", value: "recordedSessions" },
    // { name: "Followers", value: "followers" },
    { name: "Attestations", value: "attestations" },
    // { name: "Proposal Vote", value: "proposalVote" },
    { name: "Lectures", value: "lectures" }
  ];


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
      } else if (tabValue === "attestations") {
        router.push(path + `?active=${tabValue}`);
      } else if (tabValue === "lectures") {
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
    setCanFetch(!!address && !!authenticated);
  }, [address, address, session, setCanFetch]);

  const fetchNotifications = useCallback(async () => {
    if (!canFetch) return;
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };

      const raw = JSON.stringify({ address: address });

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
    address,
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

    };

    // Socket connection and event binding
    if (socket && address && socketId) {
      // Register host
      socket.emit("register_host", { hostAddress: address, socketId });

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
    address,
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
      // followers: "newFollower",
      attestations: "attestation",
      // proposalVote: "proposalVote",
      lectures: "lectures",
    };
    return combinedNotifications.filter(
      (item) => item.notification_type === typeMap[type as keyof typeof typeMap]
    );
  }, [combinedNotifications, searchParams]);

  const handleMarkAllAsRead = async () => {

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
        ...(address && {
          "x-wallet-address": address,
          Authorization: `Bearer ${token}`,
        }),
      };

      const raw = JSON.stringify({
        markAll: true,
        receiver_address: address,
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

  // const handleTabClick = (tab: string) => {
  //   if (
  //     tab === "recordedSessions" ||
  //     tab === "followers" ||
  //     tab === "attestations"
  //   ) {
  //     toast("Coming Soon 🚀");
  //   } else {
  //     router.push(`${path}?active=${tab}`);
  //   }
  // };

  const renderContent = () => {
    if (isPageLoading) {
      return <NotificationSkeletonLoader />;
    }

    if (!address) {
      return (
        <div className="flex flex-col justify-center items-center min-h-[50vh] px-4">
          <div
            className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] p-8 sm:p-12 max-w-md w-full mx-auto 
        shadow-2xl border border-white/10 transition-all duration-500 hover:border-primary/30 group"
          >
            <div className="flex flex-col items-center space-y-8">
              {/* Enhanced Animated Icon Container */}
              <div className="relative">
                <div
                  className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500 animate-pulse"
                ></div>
                <div
                  className="relative bg-gradient-to-br from-primary to-primary-accent p-7 rounded-[24px]
              shadow-[0_10px_30px_rgba(59,130,246,0.3)] transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                >
                  <Wallet
                    className="w-14 h-14 text-white"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Enhanced Text Content */}
              <div className="text-center space-y-4">
                <h3
                  className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-unbounded"
                >
                  Connect Wallet
                </h3>
                <p className="text-sm sm:text-base text-white/50 max-w-sm leading-relaxed">
                  Join the community to view your notifications and stay updated with your activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="w-full">
          <NotificationSkeletonLoader />
        </div>
      );
    }

    const activeTab = searchParams.get("active") || "all";

    if (filteredNotifications.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center min-h-[40vh] px-4 py-8">
          <div
            className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] p-10 sm:p-14 border border-white/10 shadow-2xl group"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500 animate-pulse"></div>
                <div
                  className="relative bg-white/5 p-6 rounded-[20px] border border-white/10
              shadow-lg transform transition-all duration-500 group-hover:scale-110"
                >
                  <BellOff
                    className="w-10 h-10 text-white/40 group-hover:text-primary transition-colors duration-500"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3
                  className="text-2xl font-bold text-white tracking-tight font-unbounded opacity-60"
                >
                  No Notifications
                </h3>
                <p className="text-white/30 text-sm">We'll notify represent you when something happens.</p>
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
      attestations: Attestation,
      lectures: OfficeHours,
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
      <div className="font-robotoMono mb-12">
        <div className="pt-2 xs:pt-4 sm:pt-6 px-4 md:px-6 lg:px-14">
          <Heading />
        </div>
        <div
          className="md:hidden mt-4 px-8 xs:px-4 sm:px-8 py-2 sm:py-[10px] bg-white/[0.02] border-y border-white/5"
          ref={dropdownRef}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="w-full flex justify-between items-center text-left font-bold rounded-full capitalize text-sm text-white bg-white/5 border border-white/10 px-4 py-2.5 cursor-pointer backdrop-blur-xl"
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
            <div className="p-2 border border-white/10 rounded-2xl bg-slate-900 shadow-2xl">
              {tabs.map((tab, index) => (
                <React.Fragment key={tab.value}>
                  <div
                    onClick={() => handleTabChange(tab.value)}
                    className="px-4 py-3 rounded-xl transition duration-300 ease-in-out hover:bg-white/5 capitalize text-sm font-bold text-white/70 hover:text-white cursor-pointer"
                  >
                    {tab.name}
                  </div>
                  {index !== tabs.length - 1 && <hr className="my-1 border-white/5" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="hidden md:flex bg-white/[0.02] border-y border-white/5 overflow-x-auto">
          <div className="flex gap-10 lg:pl-16 pl-8">
            <button
              className={`py-4 px-2 outline-none text-sm font-bold tracking-wide uppercase transition-all duration-300 ${searchParams.get("active") === "all" || !searchParams.get("active")
                ? "text-primary border-b-2 border-primary"
                : "text-white/50 border-b-2 border-transparent hover:text-white"
                }`}
              onClick={() => router.push(path + "?active=all")}
            >
              All
            </button>
            <button
              className={`py-4 px-2 outline-none text-sm font-bold tracking-wide uppercase transition-all duration-300 ${searchParams.get("active") === "sessionBookings"
                ? "text-primary border-b-2 border-primary"
                : "text-white/50 border-b-2 border-transparent hover:text-white"
                }`}
              onClick={() => router.push(path + "?active=sessionBookings")}
            >
              Meetings
            </button>
            <button
              className={`py-4 px-2 outline-none text-sm font-bold tracking-wide uppercase transition-all duration-300 ${searchParams.get("active") === "recordedSessions"
                ? "text-primary border-b-2 border-primary"
                : "text-white/50 border-b-2 border-transparent hover:text-white"
                }`}
              // onClick={() => router.push(path + "?active=recordedSessions")}
              onClick={() => toast("Coming Soon 🚀")}
            >
              Recorded Sessions
            </button>
            <button
              className={`py-4 px-2 outline-none text-sm font-bold tracking-wide uppercase transition-all duration-300 ${searchParams.get("active") === "attestations"
                ? "text-primary border-b-2 border-primary"
                : "text-white/50 border-b-2 border-transparent hover:text-white"
                }`}
              onClick={() => router.push(path + "?active=attestations")}
            >
              Attestations
            </button>
            <button
              className={`py-4 px-2 outline-none text-sm font-bold tracking-wide uppercase transition-all duration-300 ${searchParams.get("active") === "lectures" || searchParams.get("active") === "officeHours"
                ? "text-primary border-b-2 border-primary"
                : "text-white/50 border-b-2 border-transparent hover:text-white"
                }`}
              onClick={() => router.push(path + "?active=lectures")}
            >
              Lectures
            </button>
          </div>
          <div className="hidden 2md:flex items-center ml-auto 1.5lg:pe-16 pe-8">
            <button
              className="py-2 px-6 border border-primary/50 text-white bg-primary/10 rounded-lg flex items-center shadow-lg hover:bg-primary hover:text-white transition duration-300 ease-in-out font-bold text-xs uppercase tracking-wider"
              onClick={handleMarkAllAsRead}
              disabled={markAllReadCalling}
            >
              <PiEnvelopeOpen className="h-4 w-4 mr-2" />
              {buttonText}
            </button>
          </div>
        </div>
        <div className="flex justify-start 2md:hidden ml-auto px-4 mt-4">
          <button
            className="py-2.5 px-6 border border-primary/50 text-white bg-primary/10 rounded-2xl flex items-center shadow-lg hover:bg-primary hover:text-white transition duration-300 ease-in-out font-bold text-xs uppercase tracking-wider"
            onClick={handleMarkAllAsRead}
            disabled={markAllReadCalling}
          >
            <PiEnvelopeOpen className="h-4 w-4 mr-2" />
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
