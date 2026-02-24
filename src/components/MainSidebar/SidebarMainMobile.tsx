"use client";
import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { IoClose, IoGiftSharp } from "react-icons/io5";
import { IoMdNotifications } from "react-icons/io";
import { PiUsersThreeFill } from "react-icons/pi";
import { FaBusinessTime, FaUser } from "react-icons/fa6";
import { FiArrowUpRight, FiCodesandbox } from "react-icons/fi";
import { MdHub } from "react-icons/md";
import { useSidebar } from "../../app/hooks/useSidebar";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import logo from "@/assets/images/icon.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarStore } from "@/store/sidebarStore";

const SidebarMainMobile = () => {
  const { isOpen, setOpen } = useSidebarStore();
  const pathname = usePathname();
  const { authenticated, login } = usePrivy();
  const {
    storedDao,
    handleBadgeClick,
    address,
    isConnected,
  } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setOpen]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!authenticated || !address || !isConnected) {
      login();
    } else {
      window.location.href = `/profile/${address}?active=info`;
    }
    setOpen(false);
  };

  const menuItems = [
    { label: "Ecosystem", href: "/ecosystem", icon: <MdHub className="size-5" /> },
    {
      label: "Modules",
      subLabel: "BY XCAN",
      href: "https://modules.xcan.dev/",
      icon: <FiCodesandbox className="size-5" />,
      external: true
    },
    { label: "Dashboard", href: "/dashboard", icon: <FaUser className="size-5" /> },
    { label: "Lectures", href: "/lectures?hours=ongoing", icon: <FaBusinessTime className="size-5" /> },
    { label: "Expert Sessions", href: "/sessions?active=availableExperts", icon: <PiUsersThreeFill className="size-5" /> },
    { label: "Claim Rewards", href: "/claim-rewards", icon: <IoGiftSharp className="size-5" />, mobileOnly: true },
    { label: "Notification", href: "/notifications?active=all", icon: <IoMdNotifications className="size-5" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#07090D]/95 backdrop-blur-2xl border-r border-white/10 z-[1001] lg:hidden flex flex-col font-robotoMono overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                <Image src={logo} alt="logo" width={32} height={32} />
                <span className="text-white text-xl font-black font-unbounded tracking-tighter">Xcan</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-white/60 hover:text-white rounded-full transition-colors"
              >
                <IoClose className="size-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${pathname === item.href ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon}
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-widest uppercase">{item.label}</span>
                        {item.subLabel && (
                          <span className="text-[8px] text-blue-400 font-bold opacity-80">{item.subLabel}</span>
                        )}
                      </div>
                    </div>
                    <FiArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}

                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center justify-between p-4 rounded-2xl text-white/60 hover:bg-white/5 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <FaUser className="size-5" />
                    <span className="font-bold text-sm tracking-widest uppercase">Profile</span>
                  </div>
                  <FiArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/5">
              <ConnectWalletWithENS />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidebarMainMobile;

