import React, { useEffect, useState } from "react";
import { Calendar, ChevronDown, Copy, LogOut, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import toast, { Toaster } from "react-hot-toast";
import OPLogo from "@/assets/images/daos/op.png";
import ArbLogo from "@/assets/images/daos/arb.png";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { user } from "@nextui-org/react";

interface ChainSwitcherHeaderProps {
  address?: string;
  currentChainId?: number;
  switchChain?: (params: { chainId: number }) => void;
  ensAvatar?: string | null;
}

const ChainSwitcherHeader: React.FC<ChainSwitcherHeaderProps> = ({
  address = "",
  currentChainId,
  switchChain,
  ensAvatar,
}) => {
  const [copied, setCopied] = useState(false);
  const { logout, user, authenticated } = usePrivy();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const getSlicedAddress = (addr: string): string => {
    if (!addr) return "";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast("Copied");
    }
  };

  const { chains } = useSwitchChain();
  const currentChain = chains.find((chain) => chain.id === currentChainId);

  const desiredChains = [
    { id: 10, name: "Optimism", icon: OPLogo },
    { id: 42161, name: "Arbitrum", icon: ArbLogo },
    { id: 421614, name: "Arbitrum Sepolia", icon: ArbLogo },
  ];

  const handleLogout = async () => {
    try {
      if (isConnected) disconnect();
      await logout();
      localStorage.removeItem("persistentWalletAddress");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userOnWrongNetwork = !desiredChains.some(
    (chain) => chain.id === currentChainId
  );

  // Find the current chain's logo or use the first chain's logo as default
  const currentChainLogo = currentChain
    ? desiredChains.find((chain) => chain.id === currentChain.id)?.icon
    : desiredChains[0].icon;

  return (
    <div className="relative group w-full flex bg-gradient-to-br from-blue-50 to-blue-100 rounded-full hover:scale-105 p-1 transform-none transition-all duration-300 shadow-md hover:shadow-lg ">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center text-blue-800 px-3 py-2 rounded-full hover:bg-blue-200 transition-all duration-300 group relative transform-none border-none hover:scale-105">
          <div className="flex items-center">
            <Wallet
              size={16}
              className="mr-2 size-5 text-blue-600 group-hover:rotate-6 transition-transform"
            />
            <span className="text-sm mr-2">{getSlicedAddress(address)}</span>
            <Image
              src={currentChainLogo || ""}
              alt="Current Chain"
              width={20}
              height={20}
              className="mr-1"
            />
            <ChevronDown size={12} className="ml-1" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="animate-slide-down w-[194px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-xl p-4 ">
          <div className="mb-4 pb-2 border-b border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-1">
              Connected as:
            </h3>
            <div className="flex items-center space-x-2">
              <Wallet size={16} className="text-blue-600" />
              <span className="text-sm text-gray-700">
                {getSlicedAddress(address)}
              </span>
              <Copy
                size={14}
                onClick={copyToClipboard}
                className={`cursor-pointer ${
                  copied
                    ? "text-green-500"
                    : "text-gray-500 hover:text-blue-700"
                }`}
              />
            </div>
          </div>

          <div className="mb-4 pb-2 border-b border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              Switch Network:
            </h3>
            {desiredChains.map((chain) => (
              <DropdownMenuItem
                key={chain.id}
                disabled={chain.id === currentChainId}
                onClick={() => switchChain?.({ chainId: chain.id })}
                className="flex items-center text-sm px-2 py-1.5 hover:bg-blue-200 rounded-md mb-1"
              >
                <Image
                  src={chain.icon}
                  alt={chain.name}
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {chain.name}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center text-sm px-2 py-1.5 hover:bg-red-100 rounded-md text-red-600"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <Toaster
      toastOptions={{
        style: {
          fontSize: "14px",
          backgroundColor: "#3E3D3D",
          color: "#fff",
          boxShadow: "none",
          borderRadius: "50px",
          padding: "3px 5px",
          marginTop: "64px",
        },
      }}
    /> */}
    </div>
  );
};

ChainSwitcherHeader.displayName = "ChainSwitcherHeader";

export default ChainSwitcherHeader;
