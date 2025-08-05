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

  // Public routes that don't require authentication
  const publicRoutes = [
    "/", // Home page
    "/dashboard", // Dashboard page - accessible to all users
  ];

  const isPublicRoute = publicRoutes.includes(pathname);

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