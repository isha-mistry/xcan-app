"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import type { ComponentType } from "react";
import useSWR from "swr";
import { Shield, LineChart, Trophy, ClipboardCheck, Presentation, Home, User, Sparkles } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const coreItems: NavItem[] = [
  { label: "Landing", href: "/builder-pods", icon: Home },
  { label: "Leaderboard", href: "/builder-pods/leaderboard", icon: Trophy },
  { label: "Showcase", href: "/builder-pods/showcase", icon: Presentation },
  { label: "Analytics", href: "/builder-pods/analytics", icon: LineChart },
  { label: "Register", href: "/builder-pods/register", icon: ClipboardCheck },
  { label: "Submit Showcase", href: "/builder-pods/showcase-submit", icon: Presentation },
];

const adminItems: NavItem[] = [
  { label: "Admin Dashboard", href: "/admin/builder-pods", icon: Shield },
  { label: "Colleges", href: "/admin/builder-pods/colleges", icon: Sparkles },
  { label: "Members", href: "/admin/builder-pods/members", icon: Sparkles },
  { label: "Projects", href: "/admin/builder-pods/projects", icon: Sparkles },
  { label: "Deployments", href: "/admin/builder-pods/deployments", icon: Sparkles },
  { label: "Lab Events", href: "/admin/builder-pods/lab-events", icon: Sparkles },
  { label: "Badges", href: "/admin/builder-pods/badges", icon: Sparkles },
  { label: "Showcases", href: "/admin/builder-pods/showcases", icon: Sparkles },
  { label: "Milestones", href: "/admin/builder-pods/milestones", icon: Sparkles },
  { label: "Audit Logs", href: "/admin/builder-pods/audit-logs", icon: Sparkles },
  { label: "Export", href: "/admin/builder-pods/export", icon: Sparkles },
  { label: "Add College", href: "/admin/builder-pods/colleges/new", icon: Sparkles },
];

function matchesPath(pathname: string, href: string) {
  if (href === "/builder-pods") return pathname === href;

  // Exact route or a nested route, but avoid partial matches like
  // "/showcase" matching "/showcase-submit"
  return pathname === href || pathname.startsWith(`${href}/`);
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BuilderPodsRouteNav() {
  const pathname = usePathname();
  const { address } = useAccount();
  const isAdminRoute = pathname.startsWith("/admin/builder-pods");
  const { data: memberCheck } = useSWR(
    !isAdminRoute && address ? "/api/builder-pods/members/me" : null,
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
  const myPodItem = myCollegeSlug
    ? [{ label: "My Pod", href: `/builder-pods/${myCollegeSlug}`, icon: Sparkles }]
    : [];

  const profileHref = address ? `/builder-pods/profile` : "/members";
  const profileItem: NavItem = { label: "Profile", href: profileHref, icon: User };
  const userNavItems = [...coreItems, ...myPodItem, profileItem];
  const navItems = isAdminRoute ? adminItems : userNavItems;

  // Only mark ONE item as active: the most specific match (longest href).
  // This prevents parent routes like "/colleges" from also looking active on
  // "/colleges/new".
  const activeHref =
    navItems
      .filter((item) => matchesPath(pathname, item.href))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 pt-3 pb-1">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const active = activeHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest font-robotoMono border transition-all whitespace-nowrap ${
                active
                  ? "bg-white text-black border-white shadow-[0_8px_20px_rgba(255,255,255,0.10)]"
                  : "bg-white/[0.02] text-white/75 border-white/10 hover:text-white/80 hover:border-white/25 hover:bg-white/[0.04]"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
