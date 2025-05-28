"use client";
import React, { useCallback, useEffect, useState } from "react";
import oplogo from "@/assets/images/daos/op.png";
import arblogo from "@/assets/images/daos/arb.png";
import Image from "next/image";
import { HiGift } from "react-icons/hi";
import { gql } from "urql";
import { nft_client, op_client } from "@/config/staticDataUtils";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { Address, formatEther } from "viem";
import {
  protocolRewardsABI,
  protocolRewardsAddress,
} from "chora-protocol-deployments";
import { fetchEnsNameAndAvatar } from "@/utils/ENSUtils";
import { truncateAddress } from "@/utils/text";
import { useConnection } from "@/app/hooks/useConnection";
import Link from "next/link";
import { Gift, Loader2 } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import toast from "react-hot-toast";

interface NetworkBalance {
  chainId: number;
  name: string;
  logo: any;
  accountBalance: bigint;
}

interface Reward {
  platform: string;
  amount: string;
  value: string;
  logo: any;
}

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

function TotalRewards() {
  const { isConnected: isUserConnected, isReady } = useConnection();
  const [totalRewards, setTotalRewards] = useState<any>({
    amount: "0.0",
    value: "$0.0",
  });
  const { address } = useAccount();
  const chainId = useChainId();
  const [ethToUsdConversionRate, setEthToUsdConversionRate] = useState(0);
  const [claimableRewards, setClaimableRewards] = useState<Reward[]>([]);
  const [displayEnsName, setDisplayEnsName] = useState<any>();
  const { writeContractAsync } = useWriteContract();
  const [claimingReward, setClaimingReward] = useState<boolean>(false);
  const [fetchingReward, setFetchingReward] = useState<boolean>(false);
  const { switchChainAsync } = useSwitchChain();

  // Network configurations
  const NETWORKS = {
    ARBITRUM: {
      chainId: 42161,
      name: "Arbitrum",
      logo: arblogo
    },
    ARBITRUM_SEPOLIA: {
      chainId: 421614,
      name: "Arbitrum Sepolia",
      logo: arblogo
    },
    OPTIMISM: {
      chainId: 10,
      name: "Optimism",
      logo: oplogo
    }
  };

  // Fetch balances for each network
  const { data: arbitrumBalance } = useReadContract({
    abi: protocolRewardsABI,
    address: protocolRewardsAddress[NETWORKS.ARBITRUM.chainId as keyof typeof protocolRewardsAddress],
    functionName: "balanceOf",
    args: [address as Address],
    chainId: NETWORKS.ARBITRUM.chainId
  });

  const { data: arbitrumSepoliaBalance } = useReadContract({
    abi: protocolRewardsABI,
    address: protocolRewardsAddress[NETWORKS.ARBITRUM_SEPOLIA.chainId as keyof typeof protocolRewardsAddress],
    functionName: "balanceOf",
    args: [address as Address],
    chainId: NETWORKS.ARBITRUM_SEPOLIA.chainId,
  });

  const { data: optimismBalance } = useReadContract({
    abi: protocolRewardsABI,
    address: protocolRewardsAddress[NETWORKS.OPTIMISM.chainId as keyof typeof protocolRewardsAddress],
    functionName: "balanceOf",
    args: [address as Address],
    chainId: NETWORKS.OPTIMISM.chainId,
  });

  // const fetchEthPrice = useCallback(async () => {
  //   try {
  //     const response = await fetch(
  //       "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  //     );
  //     const data = await response.json();
  //     setEthToUsdConversionRate(data.ethereum.usd);
  //   } catch (error) {
  //     console.error("Error fetching ETH price:", error);
  //   }
  // }, []);


  const fetchReward = useCallback(async () => {
    try {
      setFetchingReward(true);
      const data = await nft_client
        .query(REWARD_QUERY, { address: address })
        .toPromise();

      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const coingeckoData = await response.json();
      setEthToUsdConversionRate(coingeckoData.ethereum.usd);
      if (data.data.rewardsPerUsers.length < 1) {
        setTotalRewards({ amount: "0.0 ", value: "$0.0" });
        setFetchingReward(false);
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

      setClaimableRewards(Rewards);
      // console.log(claimableRewards);
      setFetchingReward(false);
    } catch (error) {
      console.log("Error in fetching rewards:", error);
      setFetchingReward(false);
    }
  }, [chainId]);

  useEffect(() => {
    if (address && isUserConnected) {
      fetchReward();
      const fetchEnsName = async () => {
        const ensName = await fetchEnsNameAndAvatar(address);
        const truncatedAddress = truncateAddress(address);
        setDisplayEnsName(ensName?.ensName ? ensName.ensName : truncatedAddress);
      };
      fetchEnsName();
    }
  }, [address, isUserConnected]);

  async function handleClaim(chain: number, balance: bigint) {
    if (!address) {
      console.error("Recipient address is undefined.");
      return;
    }
    try {
      setClaimingReward(true);

      // Switch chain if needed
      if (chainId !== chain) {
        try {
          await switchChainAsync({ chainId: chain });
        } catch (error) {
          console.error("Failed to switch chain:", error);
          setClaimingReward(false);
          return;
        }
      }

      const withdrawAmount = balance / BigInt(2);

      // Use the chain parameter instead of chainId here
      await writeContractAsync({
        abi: protocolRewardsABI,
        address: protocolRewardsAddress[chain as keyof typeof protocolRewardsAddress],
        functionName: "withdraw",
        args: [address as `0x${string}`, withdrawAmount],
      });
    } catch (error) {
      console.error("Error claiming reward:", error);
    } finally {
      setClaimingReward(false);
    }

  }

  // Process all network balances
  const networkBalances = [
    {
      ...NETWORKS.ARBITRUM,
      accountBalance: arbitrumBalance || BigInt(0)
    },
    {
      ...NETWORKS.ARBITRUM_SEPOLIA,
      accountBalance: arbitrumSepoliaBalance || BigInt(0)
    },
    {
      ...NETWORKS.OPTIMISM,
      accountBalance: optimismBalance || BigInt(0)
    }
  ].filter(network => network.accountBalance > BigInt(0));



  const formatETHValue: any = (value: bigint) => {
    return Number(formatEther(value)).toFixed(5); // Consistently using 4 decimal places
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:py-6 font-tektur">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="p-6">
            <h2 className="text-2xl font-bold flex items-center mb-4">
              <Gift className="mr-2" size={24} />
              Total Rewards
            </h2>
            <div className="mt-4">
              <span className="text-3xl font-bold">
                {totalRewards?.amount} ETH
              </span>
              <p className="text-base opacity-80 mt-2">
                ≈ {totalRewards?.value} USD
              </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-700 bg-slate-900 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 xm:p-6">
            <h2 className="text-2xl font-bold mb-4">Claim Rewards</h2>
            {fetchingReward ? (
              <div className="flex flex-col items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500">Fetching your rewards...</p>
              </div>
            ) : networkBalances.length > 0 ? (
              <div className="space-y-4">
                {networkBalances.map((network, index) => (
                  <div
                    key={index}
                    className="flex flex-col xm:flex-row md:flex-col 1.7lg:flex-row items-center justify-between border-b pb-4 last:border-b-0 last:pb-0 gap-4"
                  >
                    <div className="flex items-center gap-4 0.2xs:gap-6 md:gap-4 1.7lg:gap-6 justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <Image
                            src={network.logo}
                            alt="logo"
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-xs xm:text-base md:text-xs 1.7lg:text-base">
                            {displayEnsName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {network.name}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-sm xm:text-lg md:text-sm 1.7lg:text-lg">
                          {formatETHValue(network.accountBalance)} ETH
                        </div>
                        <div className="text-xs xm:text-sm md:text-xs 1.7lg:text-sm text-gray-500">
                          ≈ ${(Number(formatEther(network.accountBalance)) * ethToUsdConversionRate).toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClaim(network.chainId, network.accountBalance)}
                      disabled={claimingReward || network.accountBalance <= BigInt(0)}
                      className={`bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center min-w-[100px] ${(claimingReward || network.accountBalance <= BigInt(0))
                          ? "opacity-50 cursor-not-allowed from-gray-400 to-gray-500"
                          : "hover:from-green-500 hover:to-blue-600"
                        }`}
                    >
                      {claimingReward && network.chainId == chainId ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      ) : (
                        "Claim"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <HiGift size={48} className="mx-auto mb-4 text-gray-400" />
                <p>No rewards available to claim at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {/* <Link
          href="https://docs.chora.club/earn-rewards/mint-referral-reward"
          target="_blank"
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
        >
          Learn more about Referral Rewards
        </Link> */}
      </div>
    </>
  );
}

export default TotalRewards;

