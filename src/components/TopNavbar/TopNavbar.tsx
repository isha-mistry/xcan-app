"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import useSWR from "swr";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useDisconnect } from "wagmi";
import logo from "@/assets/images/icon.svg";
import { useSidebar } from "@/app/hooks/useSidebar";
import { useIsSuperAdmin } from "@/app/hooks/useRoleCheck";
import ConnectWalletWithENS from "../ConnectWallet/ConnectWalletWithENS";
import {
  builderPodsActionItems,
  builderPodsAdminItems,
  builderPodsPrimaryItems,
  getBuilderPodsPersonalItems,
  type BuilderPodsNavItem,
} from "../BuilderPods/builderPodsNav";
import { useNotificationStudioState } from "@/store/notificationStudioState";
import { useSidebarStore } from "@/store/sidebarStore";
import { fetchApi } from "@/utils/api";

function isRouteActive(pathname: string, href: string) {
  const base = href.split("?")[0];
  if (base === "/") return pathname === "/";
  return pathname === base || pathname.startsWith(`${base}/`);
}

function getMostSpecificActiveHref(
  pathname: string,
  items: BuilderPodsNavItem[]
) {
  return (
    items
      .filter((item) => isRouteActive(pathname, item.href))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null
  );
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type DesktopNavLinkProps = {
  href: string;
  label: string;
  pathname: string;
  external?: boolean;
  subLabel?: string;
};

type MegaMenuSection = {
  kicker: string;
  title: string;
  items: BuilderPodsNavItem[];
};

type DesktopMegaMenuProps = {
  label: string;
  pathname: string;
  isActive: boolean;
  align?: "trigger-center" | "screen-center";
  anchorRef?: RefObject<HTMLDivElement>;
  feature: {
    kicker: string;
    title: string;
    description: string;
    href: string;
    cta: string;
    accentClassName: string;
  };
  sections: MegaMenuSection[];
  panelClassName?: string;
};

function DesktopNavLink({
  href,
  label,
  pathname,
  external,
  subLabel,
}: DesktopNavLinkProps) {
  const active = !external && isRouteActive(pathname, href);

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`text-[11px] font-bold transition-all px-4 py-2.5 rounded-full uppercase tracking-widest flex items-baseline gap-1.5 ${
        active
          ? "bg-white text-black"
          : "text-white/60 hover:text-white hover:bg-white/5"
      }`}
    >
      <span>{label}</span>
      {subLabel && (
        <span
          className={`text-[8px] font-bold ${
            active ? "text-black/40" : "text-blue-400"
          }`}
        >
          {subLabel}
        </span>
      )}
    </Link>
  );
}

function DesktopMegaMenu({
  label,
  pathname,
  isActive,
  align = "trigger-center",
  anchorRef,
  feature,
  sections,
  panelClassName = "w-[min(calc(100vw-2.5rem),1040px)]",
}: DesktopMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [panelTop, setPanelTop] = useState<number | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeHref = getMostSpecificActiveHref(
    pathname,
    sections.flatMap((section) => section.items)
  );

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimer();
    setIsOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!isOpen || align !== "screen-center") return;

    const syncPosition = () => {
      const anchorRect = anchorRef?.current?.getBoundingClientRect();
      if (!anchorRect) return;

      setPanelTop(anchorRect.bottom);
    };

    syncPosition();
    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition, true);

    return () => {
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition, true);
    };
  }, [align, anchorRef, isOpen]);

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocusCapture={openMenu}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!event.currentTarget.contains(nextTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`text-[11px] font-bold transition-all px-4 py-2.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 ${
          isActive || isOpen
            ? "bg-white text-black"
            : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
      >
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`hidden lg:block ${
          align === "screen-center"
            ? "fixed left-1/2 -translate-x-1/2"
            : "absolute left-1/2 top-full -translate-x-1/2"
        } ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={
          align === "screen-center"
            ? { top: panelTop ?? -9999 }
            : undefined
        }
      >
        <div
          className={`${panelClassName} relative overflow-hidden rounded-[32px] border border-white/10 bg-[#05070d]/95 p-3 shadow-[0_32px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 ease-out ${
            isOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-3 scale-[0.98] opacity-0"
          }`}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <div className="absolute -left-16 top-12 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute -right-10 bottom-6 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
          </div>

          <div className="relative grid gap-3 xl:grid-cols-[270px_minmax(0,1fr)]">
            <div
              className={`relative overflow-hidden rounded-[28px] border border-white/10 p-6 ${feature.accentClassName}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_38%)]" />
              <div className="relative flex h-full flex-col justify-between gap-8">
                <div className="space-y-4">
                  <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-white/75">
                    {feature.kicker}
                  </span>
                  <div className="space-y-3">
                    <h3 className="max-w-[14ch] text-[32px] font-black font-unbounded leading-[1.02] tracking-tight text-white">
                      {feature.title}
                    </h3>
                    <p className="max-w-[28ch] text-sm leading-6 text-white/70">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <Link
                  href={feature.href}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-all hover:border-white/30 hover:bg-white/15"
                >
                  {feature.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-2 xl:items-start">
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="mb-4 space-y-1 px-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-300/70">
                      {section.kicker}
                    </p>
                    <h4 className="text-sm font-black uppercase tracking-[0.18em] text-white">
                      {section.title}
                    </h4>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {section.items.map((item) => {
                      const active = activeHref === item.href;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group rounded-[22px] border p-3.5 transition-all ${
                            active
                              ? "border-white bg-white text-black shadow-[0_16px_30px_rgba(255,255,255,0.08)]"
                              : "border-white/10 bg-black/20 text-white/75 hover:border-cyan-300/35 hover:bg-white/[0.05] hover:text-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                                active
                                  ? "border-black/10 bg-black/5 text-black"
                                  : "border-cyan-400/20 bg-cyan-400/5 text-cyan-300 group-hover:border-cyan-300/40 group-hover:text-white"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                                  {item.label}
                                </span>
                                <ArrowUpRight
                                  className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                                    active
                                      ? "text-black/45"
                                      : "text-white/25 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-200"
                                  }`}
                                />
                              </div>
                              <p
                                className={`mt-2 text-[11px] leading-5 ${
                                  active ? "text-black/60" : "text-white/45"
                                }`}
                              >
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopNavbar() {
  const pathname = usePathname();
  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const { toggle: toggleSidebar } = useSidebarStore();
  const { authenticated, logout } = usePrivy();
  const { address, isConnected } = useSidebar();
  const [copied, setCopied] = useState(false);
  const {
    hasAnyUnreadNotification,
    setHasAnyUnreadNotification,
    setNotifications,
    updateCombinedNotifications,
  } = useNotificationStudioState();

  const [isScrolled, setIsScrolled] = useState(false);
  const { disconnect } = useDisconnect();
  const { isSuperAdmin } = useIsSuperAdmin(isConnected && authenticated);
  const { data: memberCheck } = useSWR(
    isConnected && authenticated && address ? "/api/builder-pods/members/me" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      errorRetryCount: 0,
    }
  );

  const myCollegeSlug =
    (memberCheck?.membership?.collegeId?.slug as string | undefined) ??
    (memberCheck?.memberships?.[0]?.college?.slug as string | undefined);
  const personalBuilderPodsItems = getBuilderPodsPersonalItems({
    address,
    myCollegeSlug,
  });

  const sessionLinks = [
    { label: "Expert Sessions", href: "/sessions?active=availableExperts" },
    { label: "Lectures", href: "/lectures?hours=ongoing" },
  ];

  const isSessionActive = sessionLinks.some((link) =>
    isRouteActive(pathname, link.href)
  );
  const isBuilderPodsActive = pathname.startsWith("/builder-pods");
  const isBuilderPodsAdminActive = pathname.startsWith("/admin/builder-pods");

  const builderPodsSections: MegaMenuSection[] = [
    {
      kicker: "Discover",
      title: "Explore Builder Pods",
      items: builderPodsPrimaryItems,
    },
    {
      kicker: "Participate",
      title: "Join And Contribute",
      items: [...builderPodsActionItems, ...personalBuilderPodsItems],
    },
  ].filter((section) => section.items.length > 0);

  const adminSections: MegaMenuSection[] = [
    {
      kicker: "Operations",
      title: "Program Controls",
      items: builderPodsAdminItems.slice(0, 6),
    },
    {
      kicker: "Oversight",
      title: "Review And Reporting",
      items: builderPodsAdminItems.slice(6),
    },
  ];

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

          const raw = JSON.stringify({ address });
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
              notificationsData.some((notification: any) => !notification.read_status)
            );
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
  }, [
    address,
    authenticated,
    isConnected,
    setHasAnyUnreadNotification,
    setNotifications,
    updateCombinedNotifications,
  ]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`w-full z-[100] transition-all duration-500 font-robotoMono ${
        isScrolled
          ? "py-4 bg-transparent backdrop-blur-xl px-8"
          : "py-6 bg-transparent px-10"
      }`}
    >
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
            <span className="text-white text-xl font-black font-unbounded tracking-tighter">
              Xcan
            </span>
          </Link>
        </div>

        <div
          ref={desktopNavRef}
          className="hidden lg:flex gap-1 items-center bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10"
        >
          <DesktopNavLink href="/ecosystem" label="Ecosystem" pathname={pathname} />
          <DesktopNavLink
            href="https://modules.xcan.dev/"
            label="Modules"
            pathname={pathname}
            external
            subLabel="BY XCAN"
          />
          <DesktopNavLink href="/members" label="Members" pathname={pathname} />

          <DesktopMegaMenu
            label="Builder Pods"
            pathname={pathname}
            isActive={isBuilderPodsActive}
            align="screen-center"
            anchorRef={desktopNavRef}
            feature={{
              kicker: "Arbitrum Ecosystem",
              title: "Builder Pods",
              description:
                "Move between discovery, analytics, showcases, and participation flows.",
              href: "/builder-pods",
              cta: "Navigate to Home",
              accentClassName:
                "bg-[linear-gradient(145deg,rgba(37,99,235,0.22),rgba(14,165,233,0.10),rgba(79,70,229,0.18))]",
            }}
            sections={builderPodsSections}
            panelClassName="w-[min(calc(100vw-2.5rem),1120px)]"
          />

          <DesktopNavLink href="/doc" label="Docs" pathname={pathname} />

          {isSuperAdmin && (
            <DesktopMegaMenu
              label="Admin"
              pathname={pathname}
              isActive={isBuilderPodsAdminActive}
              align="screen-center"
              anchorRef={desktopNavRef}
              feature={{
                kicker: "Internal Access",
                title: "Builder Pods Admin",
                description:
                  "Review member activity, manage colleges, and operate the full Builder Pods program without a second desktop navbar.",
                href: "/admin/builder-pods",
                cta: "Open Dashboard",
                accentClassName:
                  "bg-[linear-gradient(145deg,rgba(8,145,178,0.18),rgba(59,130,246,0.12),rgba(15,23,42,0.42))]",
              }}
              sections={adminSections}
              panelClassName="w-[min(calc(100vw-2.5rem),1120px)]"
            />
          )}

          <Dropdown placement="bottom-end" className="bg-[#0D1117] border border-white/10">
            <DropdownTrigger>
              <button
                className={`text-[11px] font-bold transition-all px-4 py-2.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 outline-none ${
                  isSessionActive
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
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
                    className={`block w-full text-[11px] font-bold uppercase tracking-wider ${
                      isRouteActive(pathname, item.href) ? "text-white" : "text-white/60"
                    }`}
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
                  <div
                    className={`p-2.5 rounded-full transition-all border border-white/5 ${
                      pathname.includes("/profile") || pathname.includes("/notifications")
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
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
                    <span className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">
                      Wallet Address
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-blue-400 font-bold font-robotoMono tracking-tight">
                        {address
                          ? `${address.slice(0, 6)}...${address.slice(-4)}`
                          : "Not Connected"}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-white/40 hover:text-white"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
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
                    className={`block w-full text-[11px] font-bold uppercase tracking-wider py-1 ${
                      pathname.includes("/profile") ? "text-white" : "text-white/60"
                    }`}
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
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        pathname.includes("/notifications") ? "text-white" : "text-white/60"
                      }`}
                    >
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
                  onPress={() => {
                    logout();
                    disconnect();
                  }}
                  className="rounded-lg data-[hover=true]:bg-red-500/10 text-red-400 data-[hover=true]:text-red-400 mt-1"
                >
                  <div className="flex items-center gap-2 py-1">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Logout
                    </span>
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
