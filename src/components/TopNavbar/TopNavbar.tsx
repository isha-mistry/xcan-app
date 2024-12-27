"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/daos/CCLogo.png";
import { Tooltip } from "@nextui-org/react";
import { IoIosRocket } from "react-icons/io";
import { usePathname } from "next/navigation";
import styles from "./TopNavbar.module.css";
import { FaBusinessTime } from "react-icons/fa";
import { PiUsersThreeFill } from "react-icons/pi";
import { BiSolidMessageSquareAdd } from "react-icons/bi";
import { SiGitbook } from "react-icons/si";
import { FaUser } from "react-icons/fa6";
import { usePrivy } from "@privy-io/react-auth";
import { useSidebar } from "@/app/hooks/useSidebar";
import { useRouter } from "next-nprogress-bar";
import { ConnectWallet } from "../ConnectWallet/ConnectWallet";
import NotificationIconComponent from "../Notification/NotificationIconComponent";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";

function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, login, user, connectWallet } = usePrivy();
  const {
    storedDao,
    handleMouseOver,
    handleMouseOut,
    handleBadgeClick,
    badgeVisiblity,
    isPageLoading,
    session,
    status,
    walletAddress,
    isConnected,
  } = useSidebar();
  const sessionLoading = status === "loading";

  const HandleRedirect = async () => {
    if (!authenticated) {
      login();
    } else {
      if (!user?.google && !user?.farcaster) {
        if (isConnected == false) {
          connectWallet();
        } else {
          router.push(`/profile/${walletAddress}?active=info`);
        }
      } else {
        router.push(`/profile/${walletAddress}?active=info`);
      }
    }
  };
  return (
    <>
      <div className="flex justify-between items-center w-screen px-4">
        <div className="flex gap-2 items-center">
          <Link href={"https://chora.club/"} target="_blank">
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
            href={"https://chora.club/"}
          >
            Chora{" "}
            <span className="ml-1 text-white flex items-center">Club</span>
          </Link>
        </div>

        <div className="flex gap-3 items-center">
          {isConnected ? (
            <>
              <div className="flex gap-4">
                {/* <Tooltip
                content={<div className={`${styles.customTooltip}`}>DAOs</div>}
                placement="bottom"
                className="rounded-md bg-opacity-90"
                closeDelay={1}
              >
                <Link
                  href={"/"}
                  className={`dao cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12  rounded-full flex items-center justify-center border border-white bg-blue-shade-800 w-10 h-10 ${
                    styles.icon3d
                  } ${
                    pathname.endsWith(`/`)
                      ? "border-white border-2 rounded-full"
                      : ""
                  }`}
                >
                  <IoIosRocket
                    className={`size-5 text-white ${styles.iconInner}`}
                  />
                </Link>
              </Tooltip> */}
                <Link
                  href={"/explore-daos"}
                  className={`${styles.item} text-blue-shade-500 font-medium ${
                    pathname.includes("/explore-daos") ? `text-white ${styles.activeitem}` : ""
                  }`}
                >
                  DAOs
                </Link>
                <Link
                  href={"/office-hours?hours=ongoing"}
                  className={`${styles.item} text-blue-shade-500 font-medium ${
                    pathname.includes(`/office-hours`) ? `text-white ${styles.activeitem}` : ""
                  }`}
                >
                  Office Hours
                </Link>
                <Link
                  href={"/sessions?active=availableDelegates"}
                  className={`${styles.item} text-blue-shade-500 font-medium ${
                    pathname.includes(`/sessions`) ? `text-white ${styles.activeitem}` : ""
                  }`}
                >
                  Sessions
                </Link>
                <Link
                  href={"/invite"}
                  className={`${styles.item} text-blue-shade-500 font-medium  ${
                    pathname.includes(`/invite`) ? `text-white ${styles.activeitem}` : ""
                  }`}
                >
                  Invite
                </Link>
                <Link
                  href={"/notifications?active=all"}
                  className={`${styles.item} text-blue-shade-500 font-medium ${
                    pathname.includes(`/notifications`) ? `text-white ${styles.activeitem}` : ""
                  }`}
                >
                  Notification
                </Link>
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
                    pathname.includes(`/profile`) ? `text-white ${styles.activeitem}` : ""
                  }`}
                >
                  Profile
                </Link>
                {/* <Tooltip
                content={
                  <div className={`${styles.customTooltip}`}>Office Hours</div>
                }
                placement="bottom"
                className="rounded-md bg-opacity-90"
                closeDelay={1}
              >
                <Link
                  href={"/office-hours?hours=ongoing"}
                  className={`office cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 rounded-full flex items-center justify-center border border-white bg-blue-shade-800 w-10 h-10 ${
                    styles.icon3d
                  } ${
                    pathname.includes(`/office-hours`)
                      ? "border-white border-2 rounded-full"
                      : ""
                  }`}
                >
                  <FaBusinessTime
                    className={`size-5 text-white ${styles.iconInner}`}
                  />
                </Link>
              </Tooltip> */}
                {/* <Tooltip
                content={
                  <div className={`${styles.customTooltip}`}>Sessions</div>
                }
                placement="bottom"
                className="rounded-md bg-opacity-90"
                closeDelay={1}
              >
                <Link
                  href={"/sessions?active=availableDelegates"}
                  className={`session cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 rounded-full flex items-center justify-center border border-white bg-blue-shade-800 w-10 h-10 ${
                    styles.icon3d
                  } ${
                    pathname.includes(`/sessions`)
                      ? "border-white border-2 rounded-full"
                      : ""
                  }`}
                >
                  <PiUsersThreeFill
                    className={`size-5 text-white ${styles.iconInner}`}
                  />
                </Link>
              </Tooltip> */}
                {/* <Tooltip
                content={
                  <div className={`${styles.customTooltip}`}>Invite</div>
                }
                placement="bottom"
                className="rounded-md bg-opacity-90"
                closeDelay={1}
              >
                <Link
                  href={"/invite"}
                  className={`cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12  rounded-full flex items-center justify-center border border-white bg-blue-shade-800 w-10 h-10 ${
                    styles.icon3d
                  } ${
                    pathname.includes(`/invite`)
                      ? "border-white border-2 rounded-full"
                      : ""
                  }`}
                >
                  <BiSolidMessageSquareAdd
                    className={`size-5 text-white ${styles.iconInner}`}
                  />
                </Link>
              </Tooltip> */}
                {/* <NotificationIconComponent /> */}
                {/* <Tooltip
                content={
                  <div className={`${styles.customTooltip}`}>Git Book</div>
                }
                placement="right"
                className="rounded-md bg-opacity-90"
                closeDelay={1}
              >
                <Link
                  href={"https://docs.chora.club/"}
                  target="_blank"
                  className={`gitbook cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 rounded-full flex items-center justify-center bg-white w-10 h-10 ${styles.icon3d} ${styles.whiteBg}`}
                >
                  <SiGitbook
                    className={`size-5 text-blue-shade-200 ${styles.iconInner}`}
                  />
                </Link>
              </Tooltip> */}
                {/* {!authenticated ? (
                <Tooltip
                  content={
                    <div className={`${styles.customTooltip}`}>Wallet</div>
                  }
                  placement="right"
                  className="rounded-md bg-opacity-90"
                  closeDelay={1}
                >
                  {isPageLoading || sessionLoading ? (
                    <div
                      className={`cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 rounded-full flex items-center justify-center bg-white w-10 h-10 ${styles.icon3d} ${styles.whiteBg}`}
                    >
                      <FaUser
                        className={`size-5 text-blue-shade-200 ${styles.iconInner}`}
                      />
                    </div>
                  ) : (
                    <ConnectWallet />
                  )}
                </Tooltip>
              ) : (
                <Tooltip
                  content={
                    <div className={`${styles.customTooltip}`}>Profile</div>
                  }
                  placement="right"
                  className="rounded-md bg-opacity-90"
                  closeDelay={1}
                >
                  <div
                    className={`cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 rounded-full flex items-center justify-center bg-white w-10 h-10 ${styles.icon3d} ${styles.whiteBg}`}
                    // onClick={() => router.push(`/profile/${walletAddress}?active=info`)}
                    onClick={HandleRedirect}
                  >
                    <FaUser
                      className={`size-5 text-blue-shade-200 ${styles.iconInner}`}
                    />
                  </div>
                </Tooltip>
              )} */}
              </div>
              <ConnectWalletWithENS />
            </>
          ) : (
            <ConnectWalletWithENS />
          )}
        </div>
      </div>
    </>
  );
}

export default TopNavbar;
