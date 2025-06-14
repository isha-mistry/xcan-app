import React from "react";
import RewardButton from "../ClaimReward/RewardButton";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface TitlesMap {
  [key: string]: string;
}

const titles: TitlesMap = {
  "/ecosystem": "Ecosystem",
  "/lectures": "Lectures",
  "/sessions": "Sessions",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/invite": "",
  "/claim-rewards": "Claim Rewards",
  "/optimism": "",
  "/arbitrum": "",
  // Add more URL mappings here as needed
};

function Heading() {
  const pathname = usePathname();
  let title = "Inorbit";

  Object.keys(titles).forEach((key) => {
    if (pathname === key || pathname.startsWith(key)) {
      title = titles[key];
    }
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-row justify-between items-center mb-6 font-tektur xs:px-4">
          <div className="flex gap-4 items-center">
            <div className="text-[#93c5f3] font-medium text-2xl xs:text-3xl md:text-4xl">
              {title}
            </div>
          </div>
          <div className="flex gap-1 xs:gap-2 items-center font-tektur">
            <RewardButton />
            {/* <ConnectWalletWithENS /> */}
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default Heading;
