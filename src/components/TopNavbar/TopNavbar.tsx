"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/daos/CCLogo.png";
import { usePathname } from "next/navigation";
import styles from "./TopNavbar.module.css";
import { usePrivy } from "@privy-io/react-auth";
import { useSidebar } from "@/app/hooks/useSidebar";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";

function TopNavbar() {
  const pathname = usePathname();
  const { authenticated } = usePrivy();
  const { status, walletAddress, isConnected } = useSidebar();
  const sessionLoading = status === "loading";

  return (
    <>
      <div className="flex justify-between items-center w-screen px-4">
        <div className="flex gap-2 items-center">
          <Link href={"/"} target="_blank">
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
          {isConnected && authenticated ? (
            <>
              <div className="flex gap-4">
                <Link
                  href={"/explore-daos"}
                  className={`${styles.item} text-blue-shade-500 font-medium ${
                    pathname.includes("/explore-daos")
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
