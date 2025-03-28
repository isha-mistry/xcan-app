import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Tooltip } from "@nextui-org/react";
import { IoArrowForward, IoCopy } from "react-icons/io5";
import OPLogo from "@/assets/images/daos/op.png";
import ARBLogo from "@/assets/images/daos/arbitrum.jpg";
import ccLogo from "@/assets/images/daos/CCLogo2.png";
import { fetchEnsNameAndAvatar, getENSName } from "@/utils/ENSUtils";
import { truncateAddress } from "@/utils/text";
import { motion } from "framer-motion";
import { daoConfigs } from "@/config/daos";
interface DelegateInfoCardProps {
  delegate: any;
  daoName: string;
  onCardClick: () => void;
  onDelegateClick: (updatedDelegate: any) => void;
  formatNumber: (number: number) => string;
}

interface GTMEvent {
  event: string;
  category: string;
  action: string;
  label: string;
  value?: number;
  delegateFrom?: "delegateList" | "specificDelegate";
  delegationStatus?: "success" | "failure" | "pending";
}

const DelegateInfoCard: React.FC<DelegateInfoCardProps> = ({
  delegate,
  daoName,
  onCardClick,
  onDelegateClick,
  formatNumber,
}) => {
  const [updatedDelegate, setUpdatedDelegate] = useState(delegate);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("Copy");
  const [isAnimating, setIsAnimating] = useState(false);

console.log("delegate",delegate)  

  const pushToGTM = (eventData: GTMEvent) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push(eventData);
    }
  };

  useEffect(() => {
    const fetchEnsData = async () => {
      setIsLoading(true);
      const { ensName: fetchedName, avatar: fetchedAvatar } =
        await fetchEnsNameAndAvatar(delegate.delegate);
      setEnsName(fetchedName);
      setAvatar(fetchedAvatar);
      setIsLoading(false);
      setUpdatedDelegate((prev: any) => ({
        ...prev,
        ensName: fetchedName || prev.ensName,
        avatar: fetchedAvatar || prev.avatar,
      }));
    };

    fetchEnsData();
  }, [delegate.delegate]);

  function getDaoNameFromUrl() {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const currentDAO=daoConfigs[daoName];
      if (url.includes(currentDAO.name)) return currentDAO.name.toLowerCase();
      // if (url.includes("arbitrum")) return "arbitrum";
    }
    return "";
  }

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(delegate.delegate);
    setTooltipContent("Copied");
    setIsAnimating(true);

    setTimeout(() => {
      setTooltipContent("Copy");
      setIsAnimating(false);
    }, 4000);
  };

  const displayName = isLoading
    ? truncateAddress(delegate.delegate)
    : ensName || truncateAddress(delegate.delegate);

  const handleDelegateButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelegateClick(delegate);

    pushToGTM({
      event: "delegate_button_click",
      category: "Delegate Engagement",
      action: "Delegate Button Click",
      label: `Delegate Button Click - Delegate List - ${getDaoNameFromUrl()}`,
      delegateFrom: "delegateList",
    });
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      onClick={onCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 space-y-4">
        <div className="relative flex justify-center">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={
                avatar ||
                delegate.profilePicture ||
                daoConfigs[daoName].logo
              }
              alt="Delegate"
              width={200}
              height={200}
              className="rounded-full h-20 w-20 object-contain object-center"
            />
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Image
              src={ccLogo}
              alt="ChoraClub Logo"
              width={40}
              height={40}
              className="rounded-full shadow-md"
            />
          </motion.div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold truncate">{displayName}</h3>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-600">
              {`${delegate?.delegate.slice(0, 6)}...${delegate.delegate.slice(
                -4
              )}`}
            </span>
            <Tooltip content={tooltipContent}>
              <button
                onClick={handleCopyAddress}
                className={` ${
                  isAnimating
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-gray-600"
                }  transition-colors duration-200`}
              >
                <IoCopy size={16} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="bg-blue-100 mx-auto w-fit text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full text-center">
          {formatNumber(delegate.adjustedBalance)} delegated tokens
        </div>
{ daoName !== "letsgrowdao" && (
        <motion.button
          className="w-full bg-gradient-to-r from-[#3b82f6] to-[#31316d] text-white font-medium py-2 px-4 rounded-3xl overflow-hidden relative"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          // onClick={(e) => {
          //   e.stopPropagation();
          //   onDelegateClick(delegate);
          // }}
          onClick={handleDelegateButtonClick}
        >
          <motion.div
            className="flex items-center justify-center"
            initial={{ x: 50 }}
            animate={{ x: isButtonHovered ? 0 : 0 }}
            transition={{ duration: 0.3 }}
          >
            Delegate
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ x: 60 }}
            animate={{ x: isButtonHovered ? 70 : 60 }}
            transition={{ duration: 0.3 }}
          >
            <IoArrowForward size={24} />
          </motion.div>
        </motion.button>)}
      </div>
    </motion.div>
  );
};

export default DelegateInfoCard;
