"use client";
import Link from "next/link";
import Image from "next/image";
import { Menu, User, ChevronDown, LogOut, Copy, Check } from "lucide-react";
import logo from "@/assets/images/icon.svg";
import { usePathname } from "next/navigation";
import styles from "./TopNavbar.module.css";
import style from "../Notification/NotificationIconComponent.module.css";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useSidebar } from "@/app/hooks/useSidebar";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import { useNotificationStudioState } from "@/store/notificationStudioState";
import { useEffect, useState } from "react";
import { Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { fetchApi } from "@/utils/api";
import { useSidebarStore } from "@/store/sidebarStore";

function TopNavbar() {
  const pathname = usePathname();
  const { toggle: toggleSidebar } = useSidebarStore();
  const { authenticated, logout } = usePrivy();
  const { address, isConnected } = useSidebar();
  const [copied, setCopied] = useState(false);
  const {
    hasAnyUnreadNotification,
    setHasAnyUnreadNotification,
    setNotifications,
    updateCombinedNotifications
  } = useNotificationStudioState();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

            setNotifications(notificationsData);
            updateCombinedNotifications();
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

  const navLinks = [
    { label: "Ecosystem", href: "/ecosystem" },
    {
      label: "Modules",
      subLabel: "BY XCAN",
      href: "https://modules.xcan.dev/",
      external: true
    },
    { label: "Members", href: "/members" },
    { label: "Docs", href: "/doc" }
  ];

  const sessionLinks = [
    { label: "Expert Sessions", href: "/sessions?active=availableExperts" },
    { label: "Lectures", href: "/lectures?hours=ongoing" }
  ];

  const isSessionActive = sessionLinks.some(link => pathname.includes(link.href.split('?')[0]));

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`w-full z-[100] transition-all duration-500 font-robotoMono ${isScrolled
      ? "py-4 bg-transparent backdrop-blur-xl px-8"
      : "py-6 bg-transparent px-10"
      }`}>
      <div className="max-w-[1800px] mx-auto flex justify-between items-center w-full">
        <div className="flex gap-2 items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
              <Image
                src={logo}
                alt="logo"
                width={40}
                height={40}
                className="h-10 w-10 relative z-10 transition-transform duration-500 group-hover:rotate-12"
              />
            </div>
            <span className="text-white text-xl font-black font-unbounded tracking-tighter">Xcan</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-1 items-center bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              className={`text-[11px] font-bold transition-all px-4 py-2.5 rounded-full uppercase tracking-widest flex items-baseline gap-1.5 ${pathname.includes(item.href.split('?')[0])
                ? "bg-white text-black"
                : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
            >
              <span>{item.label}</span>
              {item.subLabel && (
                <span className={`text-[8px] font-bold ${pathname.includes(item.href) ? "text-black/40" : "text-blue-400"}`}>
                  {item.subLabel}
                </span>
              )}
            </Link>
          ))}

          {/* Academy Dropdown */}
          <Dropdown placement="bottom-end" className="bg-[#0D1117] border border-white/10">
            <DropdownTrigger>
              <button className={`text-[11px] font-bold transition-all px-4 py-2.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 outlined-none ${isSessionActive
                ? "bg-white text-black"
                : "text-white/60 hover:text-white hover:bg-white/5"
                }`}>
                Explore <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Sessions" className="p-2">
              {sessionLinks.map((item) => (
                <DropdownItem
                  key={item.href}
                  textValue={item.label}
                  className="rounded-lg data-[hover=true]:bg-white/10"
                >
                  <Link
                    href={item.href}
                    className={`block w-full text-[11px] font-bold uppercase tracking-wider ${pathname.includes(item.href.split('?')[0]) ? "text-white" : "text-white/60"}`}
                  >
                    {item.label}
                  </Link>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && authenticated && (
            <Dropdown placement="bottom-end" className="bg-[#0D1117] border border-white/10">
              <DropdownTrigger>
                <div className="cursor-pointer">
                  <div className={`p-2.5 rounded-full transition-all border border-white/5 ${pathname.includes("/profile") || pathname.includes("/notifications") ? "bg-white text-black" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    }`}>
                    <User className="w-5 h-5" />
                  </div>
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label="User Menu" className="p-2 min-w-[220px]">
                <DropdownItem
                  key="address"
                  isReadOnly
                  className="rounded-lg cursor-default opacity-100 data-[hover=true]:bg-transparent mb-1 border-b border-white/5 pb-3"
                >
                  <div className="flex flex-col gap-1.5 px-1">
                    <span className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">Wallet Address</span>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-blue-400 font-bold font-robotoMono tracking-tight">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-white/40 hover:text-white"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </DropdownItem>
                <DropdownItem
                  key="profile"
                  textValue="Profile"
                  className="rounded-lg data-[hover=true]:bg-white/10 "
                >
                  <Link
                    href={`/profile/${address}?active=info`}
                    className={`block w-full text-[11px] font-bold uppercase tracking-wider py-1 ${pathname.includes("/profile") ? "text-white" : "text-white/60"}`}
                  >
                    Profile
                  </Link>
                </DropdownItem>
                <DropdownItem
                  key="inbox"
                  textValue="Inbox"
                  className="rounded-lg data-[hover=true]:bg-white/10 border-b border-white/5 pb-2"
                >
                  <Link
                    href="/notifications?active=all"
                    className="flex items-center justify-between w-full py-1"
                  >
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${pathname.includes("/notifications") ? "text-white" : "text-white/60"}`}>
                      Inbox
                    </span>
                    {hasAnyUnreadNotification && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Link>
                </DropdownItem>
                
                <DropdownItem
                  key="logout"
                  textValue="Logout"
                  onPress={() => logout()}
                  className="rounded-lg data-[hover=true]:bg-red-500/10 text-red-400 data-[hover=true]:text-red-400 mt-1"
                >
                  <div className="flex items-center gap-2 py-1">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Logout</span>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}

          {!(isConnected && authenticated) && (
            <div className="hidden sm:block">
              <ConnectWalletWithENS />
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2.5 text-white hover:bg-white/10 rounded-full transition-colors border border-white/5"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopNavbar;
