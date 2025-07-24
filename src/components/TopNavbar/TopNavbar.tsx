"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/icon.svg";
import { usePathname } from "next/navigation";
import styles from "./TopNavbar.module.css";
import style from "../Notification/NotificationIconComponent.module.css";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useSidebar } from "@/app/hooks/useSidebar";
import { useState } from "react";
import { FaGithub, FaCopy, FaSignOutAlt, FaWallet } from "react-icons/fa";
import { useNotificationStudioState } from "@/store/notificationStudioState";
import { useEffect } from "react";
import { Badge } from "@nextui-org/react";
import { fetchApi } from "@/utils/api";

function TopNavbar() {
  const pathname = usePathname();
  const { authenticated, login, logout, user } = usePrivy();
  const { status, address, isConnected } = useSidebar();
  const sessionLoading = status === "loading";
  const {
    hasAnyUnreadNotification,
    setHasAnyUnreadNotification,
    setNotifications,
    updateCombinedNotifications
  } = useNotificationStudioState();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Get GitHub and embedded wallet info
  const githubAccount = user?.linkedAccounts?.find(a => a.type === "github_oauth");
  const embeddedWallet = user?.linkedAccounts?.find(a => a.type === "wallet" && typeof (a as any).address === "string");
  const walletAddress = embeddedWallet && typeof (embeddedWallet as any).address === "string" ? (embeddedWallet as any).address : undefined;
  const githubUsername = githubAccount?.username || githubAccount?.name || githubAccount?.email || githubAccount?.subject;

  const handleCopy = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    }
  };

  const handleLogout = async () => {
    setShowAccountMenu(false);
    await logout();
  };

  // const isHomePage = pathname === "/";
  // const isLoginPage = pathname === "/login";

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isConnected && authenticated && address) {
        try {
          const token = await getAccessToken();
          const myHeaders: HeadersInit = {
            "Content-Type": "application/json",
            "x-wallet-address": address,
            Authorization: `Bearer ${token}`,
          };

          const raw = JSON.stringify({ address: address });
          const requestOptions: RequestInit = {
            method: "POST",
            headers: myHeaders,
            body: raw,
          };

          const response = await fetchApi("/notifications", requestOptions);
          const result = await response.json();

          if (result.success && result?.data) {
            const notificationsData = result.data.map((notification: any) => ({
              _id: notification._id,
              receiver_address: notification.receiver_address,
              content: notification.content,
              createdAt: notification.createdAt,
              read_status: notification.read_status,
              notification_name: notification.notification_name,
              notification_type: notification.notification_type,
              notification_title: notification.notification_title,
            }));

            // Set notifications
            setNotifications(notificationsData);

            // Update combined notifications
            updateCombinedNotifications();

            // Check for unread notifications
            setHasAnyUnreadNotification(
              notificationsData.some((n: any) => !n.read_status)
            );
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
  }, [
    isConnected,
    authenticated,
    address,
    setNotifications,
    setHasAnyUnreadNotification,
    updateCombinedNotifications,
    getAccessToken
  ]);

  // const handleProfileClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   if (!authenticated || !address || !isConnected) {
  //     // Show Privy modal if wallet is not connected
  //     login();
  //   } else {
  //     // Redirect to profile if wallet is connected
  //     window.location.href = `/profile/${address}?active=info`;
  //   }
  // };

  return (
    <>
      <div className="relative z-10 flex justify-between items-center w-screen px-4 font-tektur py-8">
        <div className="flex gap-2 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logo}
              alt={"image"}
              width={200}
              height={200}
              className="h-11 w-11"
            ></Image>
            <span className="text-white text-[26px] font-bold">Inorbit</span>
          </Link>
          {/* <Link
            className="text-black font-semibold text-[28px] font-tektur flex items-center mt-[4px]"
            href={isConnected ? "/" : ""}
          >

          </Link> */}
        </div>

        <div className="flex gap-3 items-center">

          <>
            <div className="flex gap-4">
              <Link
                href={"/ecosystem"}
                className={`${styles.item} font-medium ${pathname.includes(`/ecosystem`)
                  ? `text-white ${styles.activeitem}`
                  : "text-blue-200"
                  }`}
              >
                Ecosystem
              </Link>
              <Link
                href={`https://inorbit-modules.vercel.app/`}
                target="_blank"
                className={`${styles.item} text-blue-200 font-medium relative`}
              >
                Modules
                <span className="rounded-full px-1 text-[11px]">
                  (by Inorbit)
                </span>
              </Link>
              <Link
                href={"/dashboard"}
                className={`${styles.item} font-medium ${pathname.includes(`/dashboard`)
                  ? `text-white ${styles.activeitem}`
                  : "text-blue-200"
                  }`}
              >
                Dashboard
              </Link>
              <Link
                href={"/lectures?hours=ongoing"}
                className={`${styles.item} font-medium ${pathname.includes(`/lectures`)
                  ? `text-white ${styles.activeitem}`
                  : "text-blue-200"
                  }`}
              >
                Lectures
              </Link>
              <Link
                href={"/sessions?active=availableExperts"}
                className={`${styles.item} font-medium ${pathname.includes(`/sessions`)
                  ? `text-white ${styles.activeitem}`
                  : "text-blue-200"
                  }`}
              >
                Experts Sessions
              </Link>
              {/* <Link
                href={"/invite"}
                className={`${styles.item} font-medium  ${pathname.includes(`/invite`)
                  ? `text-white ${styles.activeitem}`
                  : "text-blue-200"
                  }`}
              >
                Invite
              </Link> */}
              <Badge
                isInvisible={!hasAnyUnreadNotification}
                content={""}
                color="danger"
                shape="circle"
                className={hasAnyUnreadNotification ? style.pulseBadge : ""}
              >
                <Link
                  href={"/notifications?active=all"}
                  className={`${styles.item} font-medium ${pathname.includes(`/notifications`)
                    ? `text-white ${styles.activeitem}`
                    : "text-blue-200"
                    }`}
                >
                  Notification
                </Link>
              </Badge>
              <Link
                href={`/profile/${address}?active=info`}
                // onClick={handleProfileClick}
                className={`${styles.item}  font-medium ${pathname.includes(`/profile`)
                  ? `text-white ${styles.activeitem}`
                  : "text-blue-200"
                  }`}
              >
                Profile
              </Link>
            </div>
            {/* Account/Login Button */}
            <div className="relative">
              {!authenticated ? (
                <button
                  onClick={login}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition"
                >
                  <FaGithub className="mr-2" /> Login with GitHub
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowAccountMenu(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    <FaGithub className="text-black" />
                    <span className="text-black">{githubUsername || "GitHub User"}</span>
                    {/* <FaWallet className="ml-2 text-blue-600" />
                    <span className="text-xs text-blue-600">{walletAddress ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4) : "No Wallet"}</span> */}
                  </button>
                  {showAccountMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border z-50 p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-2">
                        <FaGithub className="text-black" />
                        <span className="font-semibold text-black">{githubUsername || "GitHub User"}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaWallet className="text-blue-600" />
                        <span className="font-mono text-xs text-black">{walletAddress ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4) : "No embedded wallet"}</span>
                        {walletAddress && (
                          <button
                            onClick={handleCopy}
                            className="ml-2 px-2 py-1 bg-gray-200 rounded text-blue-600 hover:bg-gray-300 text-xs"
                          >
                            <FaCopy className="inline-block mr-1" />
                            {copySuccess ? "Copied!" : "Copy"}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold mt-2"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>

        </div>
      </div>
    </>
  );
}

export default TopNavbar;
