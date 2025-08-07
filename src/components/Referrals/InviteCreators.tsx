import React, { useCallback, useEffect, useState } from "react";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import { SiFarcaster } from "react-icons/si";
import { BASE_URL } from "@/config/constants";
import Image from "next/image";
import user from "@/assets/images/user/user8.svg";
import { fetchInviteeDetails } from "./InviteUtils";
import Link from "next/link";
import { useConnection } from "@/app/hooks/useConnection";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import Heading from "../ComponentUtils/Heading";
import { RxCross2 } from "react-icons/rx";
import { useRouter } from 'next/navigation';
import { nft_client } from "@/config/staticDataUtils";
import { gql } from "urql";
import oplogo from "@/assets/images/daos/op.png";
import arblogo from "@/assets/images/daos/arb.png";
import { useAccount, useChainId } from "wagmi";
import { fetchEnsNameAndAvatar } from "@/utils/ENSUtils";
import { truncateAddress } from "@/utils/text";

const REWARD_QUERY = gql`
  query MyQuery($address: String!) {
    rewardsPerUsers(where: { address: $address }) {
      address
      amount
      id
      withdrawn
    }
  }
`;


function InviteCreators({ userAddress }: { userAddress: any }) {
  const [copied, setCopied] = useState(false);
  const [inviteeDetails, setInviteeDetails] = useState<any>();
  const { isConnected, isLoading, isPageLoading, isReady } =
    useConnection();
  const { address } = useAccount();
  const router = useRouter();
  const [totalRewards, setTotalRewards] = useState<any>({
    amount: "0.0",
    value: "$0.0",
  });
  const chainId = useChainId();


  const handleCopy = () => {
    navigator.clipboard.writeText(`${BASE_URL}/invite/${userAddress}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
  };

  const fetchReward = useCallback(async () => {
    try {
      // setFetchingReward(true);
      const data = await nft_client
        .query(REWARD_QUERY, { address: address })
        .toPromise();

      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const coingeckoData = await response.json();
      // setEthToUsdConversionRate(coingeckoData.ethereum.usd);
      if (data.data.rewardsPerUsers.length < 1) {
        setTotalRewards({ amount: "0.0 ", value: "$0.0" });
        // setFetchingReward(false);
        return;
      }
      const total =
        data?.data.rewardsPerUsers?.map((reward: any) => ({
          amount: (reward.amount / 10 ** 18).toFixed(5),
          value: `$${(
            (reward.amount * coingeckoData.ethereum.usd) /
            10 ** 18
          ).toFixed(2)}`,
        })) || [];

      setTotalRewards(total[0]);
      const Rewards =
        data?.data.rewardsPerUsers?.map((reward: any) => ({
          platform: reward.id,
          amount: ((reward.amount - reward.withdrawn) / 10 ** 18).toFixed(5),
          value: `$${(
            (reward.amount * coingeckoData.ethereum.usd) /
            10 ** 18
          ).toFixed(2)}`,
          logo: reward.id.includes("op") ? oplogo : arblogo,
        })) || [];

      // setClaimableRewards(Rewards);
      // console.log(claimableRewards);
      // setFetchingReward(false);
    } catch (error) {
      console.log("Error in fetching rewards:", error);
      // setFetchingReward(false);
    }
  }, [chainId]);

  useEffect(() => {
    if (address && isConnected) {
      fetchReward();
    }
  }, [address, isConnected]);

  const url = encodeURIComponent(`${BASE_URL}/invite/${userAddress}`);
  const text = encodeURIComponent(`Join me on Xcan`);

  const shareOn = (platform: any) => {
    const url = encodeURIComponent(`${BASE_URL}/invite/${userAddress}`);
    const text = encodeURIComponent(
      `Join me on Xcan and let's revolutionize Web3 together! 🚀`
    );
    const links: any = {
      farcaster: `https://warpcast.com/~/compose?text=${text}&embeds%5B%5D=${url}`,
      telegram: `https://t.me/share/url?text=${text}&url=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    };
    window.open(links[platform], "_blank");
  };

  useEffect(() => {
    const fetchData = async () => {
      const details = await fetchInviteeDetails(userAddress);
      setInviteeDetails(details);
      // setIsPageLoading(false);
    };
    fetchData();
  }, []);

  const handleClaimRewards = () => {
    router.push('/claim-rewards'); // Programmatically navigate to /claim-rewards
  };

  return (
    <>
      <div className="min-h-screen h-full bg-dark-primary">
        <div className="relative mx-auto px-4 md:px-6 lg:px-16 py-8">
          <Heading />

          <main className="container mx-auto sm:px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-secondary rounded-lg shadow-xl p-4 sm:p-8"
            >
              <h1 className="text-3xl font-bold text-dark-text-primary mb-6">
                Welcome,{" "}
                {inviteeDetails?.ensName ||
                  inviteeDetails?.displayName ||
                  "Creator"}
                !
              </h1>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-dark-text-primary mb-4">
                  Ready to earn ETH by inviting creators?
                </h2>
                <p className="text-base sm:text-lg text-dark-text-secondary">
                  Invite creators to Xcan and earn ETH every time they
                  mint! The more you bring, the more you earn!
                </p>
                {/* <Link
                  href="https://docs.chora.club/earn-rewards/create-referral-reward"
                  target="_blank"
                  className="inline-block mt-4 text-blue-shade-100 hover:text-blue-shade-200 hover:underline transition-colors duration-300"
                >
                  Learn more about referrals →
                </Link> */}
              </div>

              <div className="bg-gradient-to-r from-blue-shade-400/20 via-purple-500/20 to-pink-500/20 rounded-lg p-2 sm:p-4 md:p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Image
                    src={
                      inviteeDetails?.ensAvatar ||
                      (inviteeDetails?.displayImage &&
                        `https://gateway.lighthouse.storage/ipfs/${inviteeDetails.displayImage}`) ||
                      user
                    }
                    width={100}
                    height={100}
                    alt="Invitee avatar"
                    className="rounded-full border-4 border-dark-secondary shadow-lg size-24 md:size-28"
                  />
                </div>
                <div className="font-semibold text-center mb-1 text-sm sm:text-base text-dark-text-primary">
                  You&apos;ve been invited to create on Xcan by
                </div>
                <div className="font-bold text-base sm:text-lg mb-2 text-center break-words max-w-full px-2 text-dark-text-primary">
                  {inviteeDetails?.ensName ||
                    inviteeDetails?.displayName ||
                    inviteeDetails?.formattedAddr}
                </div>
                <p className="text-center text-dark-text-secondary mb-2">
                  Your unique invite link:
                </p>
                <div className="flex items-stretch bg-dark-tertiary rounded-md overflow-hidden shadow-sm">
                  <div className="flex-grow mr-1 p-2 sm:p-3 text-dark-text-secondary text-sm sm:text-base w-full min-w-0 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:transition-all [&::-webkit-scrollbar]:duration-300  [&::-webkit-scrollbar-track]:rounded-full  [&::-webkit-scrollbar-thumb]:rounded-full  [&::-webkit-scrollbar-thumb]:bg-blue-shade-400  [&::-webkit-scrollbar-track]:bg-dark-secondary  hover:[&::-webkit-scrollbar-thumb]:bg-blue-shade-300
                            transition-all duration-300 whitespace-nowrap">
                    {`${BASE_URL}/invite/${userAddress}`}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`p-2 sm:px-4 sm:py-3 text-[13px] sm:text-base font-semibold transition-colors duration-200 whitespace-nowrap ${copied
                      ? "bg-green-shade-100 text-white"
                      : "bg-blue-shade-100 text-white hover:bg-blue-shade-200"
                      }`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-dark-text-primary mb-4">
                  Share your invite:
                </h3>
                <div className="flex justify-center gap-3 sm:gap-4">
                  {[
                    {
                      platform: "twitter",
                      icon: FaXTwitter,
                      color: "bg-black",
                      iconStyle: "text-white",
                      iconSize: 20,
                    },
                    {
                      platform: "farcaster",
                      icon: SiFarcaster,
                      color: "bg-[#9c64ed]",
                      iconStyle: "text-white",
                      iconSize: 28,
                    },
                    {
                      platform: "telegram",
                      icon: FaTelegram,
                      color: "bg-white",
                      iconStyle: "text-[#229ED9]",
                      iconSize: 48,
                    },
                  ].map(
                    ({ platform, icon: Icon, color, iconStyle, iconSize }) => (
                      <motion.button
                        key={platform}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => shareOn(platform)}
                        className={`${color} rounded-full transition-colors duration-200 size-10 md:size-12 flex items-center justify-center `}
                      >
                        <Icon size={iconSize} className={`${iconStyle} `} />
                      </motion.button>
                    )
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-[10px] 0.5xs:p-4 xm:p-6">
                <h3 className="text-xl font-semibold text-dark-text-primary mb-4 flex items-center">
                  <FaFire className="text-orange-500 mr-2" /> Your Earnings
                </h3>
                <div className="flex justify-between items-center">
                  <p className="text-dark-text-secondary text-sm xm:text-base">
                    Total earnings:
                  </p>
                  <p className="text-sm 0.5xs:text-xl xm:text-2xl font-bold text-green-shade-100">
                    {totalRewards?.amount} ETH
                  </p>
                </div>
                <button onClick={handleClaimRewards} className="mt-4 w-full bg-[#4f4b41] text-white py-2 rounded-md hover:bg-[#4f4b41]/80 transition-colors duration-200">
                  Claim Rewards
                </button>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}

export default InviteCreators;
