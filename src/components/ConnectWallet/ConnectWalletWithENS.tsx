"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiSolidWallet } from "react-icons/bi";
import {
  FiArrowUpRight,
  FiCopy,
  FiExternalLink,
  FiLogOut,
} from "react-icons/fi";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount, useEnsName, useDisconnect } from "wagmi";
import { CheckIcon } from "lucide-react";

export default function ConnectWalletWithENS() {
  const { login, authenticated, user, logout, ready, connectWallet } =
    usePrivy();
  const { wallets } = useWallets();
  const { address, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayAddress, setDisplayAddress] = useState<
    string | null | `0x${string}` | undefined
  >(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const dropdownRef = useRef<any>(null);

  // console.log("------------");
  // console.log("isConnected", isConnected);
  // console.log("authenticated", authenticated);
  // console.log("address", address);
  // console.log("wallets", wallets);
  // console.log("ready", ready);
  // console.log("user", user);

  useEffect(() => {
    // Check if there's a social login
    const hasSocialLogin = user?.google || user?.farcaster;

    // If there's a social login, don't modify wallet connection
    if (hasSocialLogin) {
      setDisplayAddress(address);
      return;
    }

    // Find the first wallet with a matching address from a real wallet provider
    const realWallet = wallets.find(
      (wallet) =>
        wallet.address === address && wallet.walletClientType !== "privy"
    );

    if (realWallet) {
      setDisplayAddress(realWallet.address);
    } else {
      setDisplayAddress(null);
      if (
        !hasSocialLogin &&
        wallets.every((wallet) => wallet.walletClientType === "privy")
      ) {
        wagmiDisconnect();
        console.log("LOGOUT::::::::::");
      }
    }
  }, [wallets, address, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef?.current?.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopyAddress = () => {
    if (displayAddress) {
      navigator.clipboard.writeText(displayAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const truncateAddress = (addr: any) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleLogin = async () => {
    if (!authenticated) {
      login();
    } else {
      if (!user?.google && !user?.farcaster) {
        connectWallet();
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    if (!user?.google && !user?.farcaster) {
      wagmiDisconnect();
      setDisplayAddress(null);
    }
    setIsDropdownOpen(false);
  };

  const isWalletConnected =
    user?.google || user?.farcaster || displayAddress !== null;

  return (
    <div className="relative font-robotoMono" ref={dropdownRef}>
      {!isWalletConnected || !authenticated ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          className="flex items-center justify-center 
            bg-white text-black px-5 py-2.5 rounded-full 
            text-[11px] font-bold uppercase tracking-widest
            transition-all duration-300 
            group relative overflow-hidden"
        >
          <BiSolidWallet className="mr-2 size-4 group-hover:rotate-12 transition-transform" />
          <span className="font-bold">Connect Wallet</span>
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </motion.button>
      ) : (
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center 
              px-5 py-2.5 rounded-full 
              text-[11px] font-bold uppercase tracking-widest
              transition-all duration-300 
              group relative border border-white/10
              ${isDropdownOpen ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}
            `}
          >
            <BiSolidWallet className={`mr-2 size-4 transition-transform group-hover:rotate-6 ${isDropdownOpen ? 'text-black' : 'text-blue-400'}`} />
            <span>
              {displayAddress && truncateAddress(displayAddress)}
            </span>
          </motion.button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-3 w-64 bg-[#0D1117] backdrop-blur-2xl
                  rounded-2xl shadow-2xl border border-white/10 
                  overflow-hidden z-50 p-2"
              >
                <div className="p-3 mb-1 border-b border-white/5 pb-4">
                  <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em] mb-1.5">Connected as</p>
                  <p className="text-[12px] text-blue-400 font-bold truncate">
                    {user?.google?.email ||
                      user?.farcaster?.displayName ||
                      ensName ||
                      (displayAddress && truncateAddress(displayAddress))}
                  </p>
                </div>

                <div className="space-y-1">
                  {displayAddress && (
                    <button
                      onClick={handleCopyAddress}
                      className="w-full flex items-center justify-between 
                        px-4 py-3 text-[11px] font-bold uppercase tracking-wider
                        text-white/60 hover:text-white hover:bg-white/5
                        rounded-xl transition-all 
                        group relative"
                    >
                      <div className="flex items-center">
                        {copiedAddress ? (
                          <CheckIcon className="mr-2 size-4 text-green-500" />
                        ) : (
                          <FiCopy className="mr-2 size-4 text-blue-400" />
                        )}
                        {copiedAddress ? "Copied!" : "Copy Address"}
                      </div>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between 
                      px-4 py-3 text-[11px] font-bold uppercase tracking-wider
                      text-red-400/80 hover:text-red-400 hover:bg-red-400/10 
                      rounded-xl transition-all 
                      group relative"
                  >
                    <div className="flex items-center">
                      <FiLogOut className="mr-2 size-4" />
                      Logout
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
