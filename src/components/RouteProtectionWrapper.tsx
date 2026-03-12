"use client";

import { usePathname } from "next/navigation";
import WalletWrapper from "./WalletWrapper";

interface RouteProtectionWrapperProps {
  children: React.ReactNode;
}

/**
 * RouteProtectionWrapper - Global route protection component
 * 
 * This component automatically applies appropriate authentication requirements
 * based on the current route path. It works in conjunction with WalletWrapper
 * to provide seamless protection across the application.
 * 
 * Route Categories:
 * - Public Routes: No authentication required (e.g., home page, dashboard)
 * - Protected Routes: Require full wallet connection and authentication
 * 
 * Usage: Place this component at the root level to protect all routes automatically
 */
export default function RouteProtectionWrapper({ children }: RouteProtectionWrapperProps) {
  const pathname = usePathname();

  // Exact public routes that don't require authentication
  const exactPublicRoutes = [
    "/", // Home page
    "/members", // Dashboard page - accessible to all users
    "/doc",
    "/ecosystem",
    "/sessions",
    "/lectures",
    "/notifications",
    "/claim-rewards",
    "/invite",
    "/orbit-chains",
    "/meeting",
    "/watch",
    "/builder-pods", // keep exact root too
  ];

  // Prefix public routes where nested pages should also stay public
  const publicPrefixes = [
    "/builder-pods",
    "/watch",
    "/meeting",
  ];

  const isPublicRoute =
    exactPublicRoutes.includes(pathname) ||
    publicPrefixes.some((prefix) => pathname.startsWith(`${prefix}/`));

  // If it's a public route, render children without protection
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For all other routes, require wallet authentication
  return (
    <WalletWrapper requireWallet={true}>
      {children}
    </WalletWrapper>
  );
} 