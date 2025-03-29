"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/daos/CCLogo.png";
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
  const { authenticated } = usePrivy();
  const { status, walletAddress, isConnected } = useSidebar();
  const sessionLoading = status === "loading";
  const { 
    hasAnyUnreadNotification, 
    setHasAnyUnreadNotification,
    setNotifications,
    updateCombinedNotifications
  } = useNotificationStudioState();

  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isConnected && authenticated && walletAddress) {
        try {
          const token = await getAccessToken();
          const myHeaders: HeadersInit = {
            "Content-Type": "application/json",
            "x-wallet-address": walletAddress,
            Authorization: `Bearer ${token}`,
          };

          const raw = JSON.stringify({ address: walletAddress });
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
    walletAddress, 
    setNotifications, 
    setHasAnyUnreadNotification,
    updateCombinedNotifications,
    getAccessToken
  ]);

  return (
    <>
      <div className="flex justify-between items-center w-screen px-4">
        <div className="flex gap-2 items-center">
          <Link href={isConnected? "/":""} target="_blank">
            <Image
              src={logo}
              alt={"image"}
              width={200}
              height={200}
              className="logo bg-black rounded-full p-1 w-10 h-10"
            ></Image>
          </Link>
          <Link
            className="text-black font-semibold text-[28px] font-poppins flex items-center mt-[4px]"
            href={isConnected? "/":""}
          >
            Chora{" "}
            <span className="ml-1 text-white flex items-center">Club</span>
          </Link>
        </div>

        <div className="flex gap-3 items-center">
          {isConnected && authenticated ? (
            <>
              <div className="flex gap-4">
                <Link
                  href={"/"}
                  className={`${styles.item} text-blue-shade-500 font-medium ${
                    isHomePage
                      ? `text-white ${styles.activeitem}`
                      : ""
                  }`}
                >
                  DAOs
                </Link>
                <Link
                  href={"/office-hours?hours=ongoing"}
                  className={`${styles.item} text-blue-shade-500 font-medium ${
                    pathname.includes(`/office-hours`)
                      ? `text-white ${styles.activeitem}`
                      : ""
                  }`}
                >
                  Office Hours
                </Link>
                <Link
                  href={"/sessions?active=availableDelegates"}
                  className={`${styles.item} text-blue-shade-500 font-medium ${
                    pathname.includes(`/sessions`)
                      ? `text-white ${styles.activeitem}`
                      : ""
                  }`}
                >
                  Sessions
                </Link>
                <Link
                  href={"/invite"}
                  className={`${styles.item} text-blue-shade-500 font-medium  ${
                    pathname.includes(`/invite`)
                      ? `text-white ${styles.activeitem}`
                      : ""
                  }`}
                >
                  Invite
                </Link>
                <Badge
                  isInvisible={!hasAnyUnreadNotification}
                  content={""}
                  color="danger"
                  shape="circle"
                  className={hasAnyUnreadNotification ? style.pulseBadge : ""}
                >
                <Link
                  href={"/notifications?active=all"}
                  className={`${styles.item} text-blue-shade-500 font-medium ${
                    pathname.includes(`/notifications`)
                      ? `text-white ${styles.activeitem}`
                      : ""
                  }`}
                >
                  Notification
                </Link>
                </Badge>
                <Link
                  href={"https://docs.chora.club/"}
                  target="_blank"
                  className={`${styles.item} text-blue-shade-500 font-medium`}
                >
                  Docs
                </Link>
                <Link
                  href={`/profile/${walletAddress}?active=info`}
                  className={`${styles.item} text-blue-shade-500 font-medium ${
                    pathname.includes(`/profile`)
                      ? `text-white ${styles.activeitem}`
                      : ""
                  }`}
                >
                  Profile
                </Link>
              </div>
              {<ConnectWalletWithENS />}
            </>
          ) : (
            (isLoginPage && isConnected && authenticated) && <ConnectWalletWithENS />
          )}
        </div>
      </div>
    </>
  );
}

export default TopNavbar;
