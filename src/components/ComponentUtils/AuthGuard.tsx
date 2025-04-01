"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bars, Oval } from "react-loader-spinner";
import { useAccount } from "wagmi";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (ready) {
      // Delay authentication check if not initially connected
      if (isChecking && !isConnected) {
        const timeoutId = setTimeout(() => {
          setIsLoading(false);
          setIsChecking(false);
        }, 2000); // 2 seconds timeout

        return () => clearTimeout(timeoutId); // Cleanup timeout on unmount or re-run
      }
      const isLoggedIn = isConnected && authenticated;

      if (!isLoggedIn && pathname !== "/login") {
        router.push("/login");
      }

      setIsLoading(false);
      setIsChecking(false);
    }
  }, [isConnected, authenticated, router, pathname, ready, isChecking]);

  if (isLoading || isChecking) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Bars
          height="150"
          width="150"
          color="#0500FF"
          ariaLabel="bars-loading"
          visible={true}
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
