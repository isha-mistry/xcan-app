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
 * - Public Routes: No authentication required (e.g., home page)
 * - Social Login Routes: Allow social authentication without wallet requirement
 * - Protected Routes: Require full wallet connection and authentication
 * 
 * Usage: Place this component at the root level to protect all routes automatically
 */
export default function RouteProtectionWrapper({ children }: RouteProtectionWrapperProps) {
  const pathname = usePathname();

  // Define public routes that don't require wallet connection
  const publicRoutes = [
    "/", // Home page
    "/ecosystem", // Public ecosystem page
  ];

  // Define routes that allow social login without wallet
  const socialLoginRoutes = [
    "/invite", // Invite pages might be accessible with social login
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check if current route allows social login
  const allowsSocialLogin = socialLoginRoutes.some(route =>
    pathname.startsWith(route)
  );

  // If it's a public route, render children without protection
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If it allows social login, use WalletWrapper with requireWallet=false
  if (allowsSocialLogin) {
    return (
      <WalletWrapper requireWallet={false}>
        {children}
      </WalletWrapper>
    );
  }

  // For all other routes, require full wallet connection
  return (
    <WalletWrapper requireWallet={true}>
      {children}
    </WalletWrapper>
  );
} 