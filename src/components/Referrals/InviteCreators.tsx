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
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { gql } from "urql";
import oplogo from "@/assets/images/daos/op.png";
import arblogo from "@/assets/images/daos/arb.png";
import { useChainId } from "wagmi";
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
  const [earnings, setEarnings] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(true);
  const router = useRouter();
  const [totalRewards, setTotalRewards] = useState<any>({
      amount: "0.0",
      value: "$0.0",
    });
     const { walletAddress } = useWalletAddress();
    //  const [fetchingReward, setFetchingReward] = useState<boolean>(false);
    //  const [ethToUsdConversionRate, setEthToUsdConversionRate] = useState(0);
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
        .query(REWARD_QUERY, { address: walletAddress })
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
    if (walletAddress) {
      fetchReward();
      // const fetchEnsName = async () => {
      //   const ensName = await fetchEnsNameAndAvatar(walletAddress);
      //   const truncatedAddress = truncateAddress(walletAddress);
      //   setDisplayEnsName(ensName?.ensName ? ensName.ensName : truncatedAddress);
      // };
      // fetchEnsName();
    }
  }, [walletAddress]);

  const url = encodeURIComponent(`${BASE_URL}/invite/${userAddress}`);
  const text = encodeURIComponent(`Join me on Chora Club`);

  const shareOn = (platform: any) => {
    const url = encodeURIComponent(`${BASE_URL}/invite/${userAddress}`);
    const text = encodeURIComponent(
      `Join me on Chora Club and let's revolutionize Web3 together! 🚀`
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
      <div className="min-h-screen h-full bg-gradient-to-br from-blue-50 to-purple-50 ">
        <div className="relative mx-auto px-4 md:px-6 lg:px-16 py-8">
          <Heading />

          <main className="container mx-auto sm:px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-xl p-4 sm:p-8"
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Welcome,{" "}
                {inviteeDetails?.ensName ||
                  inviteeDetails?.displayName ||
                  "Creator"}
                !
              </h1>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  Ready to earn ETH by inviting creators?
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  Invite creators to Chora Club and earn ETH every time they
                  mint! The more you bring, the more you earn!
                </p>
                <Link
                  href="https://docs.chora.club/earn-rewards/create-referral-reward"
                  target="_blank"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
                >
                  Learn more about referrals →
                </Link>
              </div>

              <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-lg p-2 sm:p-4 md:p-6 mb-8">
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
                    className="rounded-full border-4 border-white shadow-lg size-24 md:size-28"
                  />
                </div>
                <div className="font-semibold text-center mb-1 text-sm sm:text-base">
                  You&apos;ve been invited to create on Chora Club by
                </div>
                <div className="font-bold text-base sm:text-lg mb-2 text-center break-words max-w-full px-2">
                  {inviteeDetails?.ensName ||
                    inviteeDetails?.displayName ||
                    inviteeDetails?.formattedAddr}
                </div>
                <p className="text-center text-gray-700 mb-2">
                  Your unique invite link:
                </p>
                <div className="flex items-stretch bg-white rounded-md overflow-hidden shadow-sm">
                <div className="flex-grow mr-1 p-2 sm:p-3 text-gray-700 text-sm sm:text-base w-full min-w-0 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:transition-all [&::-webkit-scrollbar]:duration-300  [&::-webkit-scrollbar-track]:rounded-full  [&::-webkit-scrollbar-thumb]:rounded-full  [&::-webkit-scrollbar-thumb]:bg-indigo-200  [&::-webkit-scrollbar-track]:bg-blue-50  hover:[&::-webkit-scrollbar-thumb]:bg-blue-200
                            transition-all duration-300 whitespace-nowrap">
    {`${BASE_URL}/invite/${userAddress}`}
</div>
                  <button
                    onClick={handleCopy}
                    className={`p-2 sm:px-4 sm:py-3 text-[13px] sm:text-base font-semibold transition-colors duration-200 whitespace-nowrap ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
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
                      color: "",
                      iconStyle: "text-[#229ED9] bg-white",
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

              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-[10px] 0.5xs:p-4 xm:p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaFire className="text-orange-500 mr-2" /> Your Earnings
                  {/* {showComingSoon && (
                    <div className="flex items-center bg-[#ffffff] border border-yellow-400 rounded-full px-2 ml-4 py-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-yellow-700 mx-2">
                        <span className="hidden sm:block">
                          Claiming feature
                        </span>{" "}
                        coming soon
                      </p>
                      <button
                        onClick={() => setShowComingSoon(false)}
                        className="text-yellow-700 hover:text-yellow-800"
                      >
                        <RxCross2 size={12} />
                      </button>
                    </div>
                  )} */}
                </h3>
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 text-sm xm:text-base">
                    {/* Total earnings from referrals: */}
                    Total earnings:
                  </p>
                  <p className="text-sm 0.5xs:text-xl xm:text-2xl font-bold text-green-600">
                  {totalRewards?.amount} ETH
                  </p>
                </div>
                <button onClick={handleClaimRewards} className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors duration-200">
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
