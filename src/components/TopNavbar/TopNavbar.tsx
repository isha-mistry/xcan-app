"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/icon.svg";
import { usePathname } from "next/navigation";
import styles from "./TopNavbar.module.css";
import style from "../Notification/NotificationIconComponent.module.css";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useSidebar } from "@/app/hooks/useSidebar";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { useNotificationStudioState } from "@/store/notificationStudioState";
import { useEffect } from "react";
import { Badge } from "@nextui-org/react";
import { fetchApi } from "@/utils/api";

function TopNavbar() {
  const pathname = usePathname();
  const { authenticated, login } = usePrivy();
  const { status, address, isConnected } = useSidebar();
  const sessionLoading = status === "loading";
  const {
    hasAnyUnreadNotification,
    setHasAnyUnreadNotification,
    setNotifications,
    updateCombinedNotifications
  } = useNotificationStudioState();

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

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!authenticated || !address || !isConnected) {
      // Show Privy modal if wallet is not connected
      login();
    } else {
      // Redirect to profile if wallet is connected
      window.location.href = `/profile/${address}?active=info`;
    }
  };

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
                onClick={handleProfileClick}
                className={`${styles.item}  font-medium ${pathname.includes(`/profile`)
                  ? `text-white ${styles.activeitem}`
                  : "text-blue-200"
                  }`}
              >
                Profile
              </Link>
            </div>
            <ConnectWalletWithENS />
          </>

        </div>
      </div>
    </>
  );
}

export default TopNavbar;
