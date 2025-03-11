"use client";
import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { FaBalanceScale, FaVoteYea } from "react-icons/fa";
import { useReadContract } from "wagmi";
import CONTRACT_ABI from "../../artifacts/Dao.sol/op_proposals_abi.json";
import ARB_CONTRACT_ABI from "../../artifacts/Dao.sol/arb_proposals_abi.json";
import { daoConfigs } from "@/config/daos";
const COLORS = ["#4caf50", "#ea4034", "#004dff"]; // For, Against, Abstain

interface ProposalvotesProps {
  dao: string;
  contract: `0x${string}` | undefined;
  proposalId: string | undefined;
  blockNumber: number | undefined;
}

// Helper function to convert wei to ether (divide by 10^18)
const weiToEther = (wei: bigint | number | undefined): number => {
  if (!wei) return 0;
  // Convert to string first to handle bigint
  const weiStr = wei.toString();
  // Handle division by 10^18
  if (weiStr.length <= 18) {
    return parseFloat(`0.${weiStr.padStart(18, "0")}`);
  }
  const etherInt = weiStr.slice(0, weiStr.length - 18);
  const etherDec = weiStr.slice(weiStr.length - 18).padEnd(18, "0");
  return parseFloat(`${etherInt}.${etherDec}`);
};

// Format number with appropriate units (K, M, B)
const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + "B";
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + "K";
  } else {
    return num.toFixed(2);
  }
};

const Proposalvotes: React.FC<ProposalvotesProps> = ({
  dao,
  contract,
  proposalId,
  blockNumber,
}) => {
  // Only run queries when both contract and proposalId are available
  const isReady = !!contract && !!proposalId;
  console.log("contract", contract, blockNumber, dao, proposalId);
  const { data: votesData, isLoading: isVotesLoading } = useReadContract({
    address: contract,
    abi: daoConfigs[dao.toLowerCase()].proposalAbi,
    functionName: "proposalVotes",
    args: [proposalId !== undefined ? BigInt(proposalId) : BigInt(0)],
    chainId: daoConfigs[dao].chainId,
  });

  const { data: quorum, isLoading: isQuorumLoading } = useReadContract({
    address: contract,
    abi: daoConfigs[dao.toLowerCase()].proposalAbi,
    functionName: "quorum",
    args:
      daoConfigs[dao].name === "arbitrum"
        ? [blockNumber !== undefined ? BigInt(blockNumber) : BigInt(0)]
        : [proposalId !== undefined ? BigInt(proposalId) : BigInt(0)],
    chainId: daoConfigs[dao].chainId,
  });
  console.log("votedata", quorum, votesData);
  // Create vote data for chart only when data is available
  const voteData = useMemo(() => {
    if (!votesData || !Array.isArray(votesData)) {
      return [
        { name: "For", value: 0 },
        { name: "Against", value: 0 },
        { name: "Abstain", value: 0 },
      ];
    }

    return [
      { name: "For", value: weiToEther(votesData[1]) },
      { name: "Against", value: weiToEther(votesData[0]) },
      { name: "Abstain", value: weiToEther(votesData[2]) },
    ];
  }, [votesData]);

  const isVoteDataEmpty = useMemo(() => {
    if (!votesData || !Array.isArray(votesData)) {
        return true;
    }
    return votesData.every(vote => Number(vote) === 0 || vote === undefined);
}, [votesData]);

  // Calculate total votes
  const totalVotes = useMemo(() => {
    if (!voteData) return 0;
    return voteData.reduce((sum, item) => sum + item.value, 0);
  }, [voteData]);

  // Format quorum value
  const formattedQuorum = useMemo(() => {
    return formatNumber(weiToEther(quorum as any));
  }, [quorum]);

  // Format total votes
  const formattedTotalVotes = useMemo(() => {
    return formatNumber(totalVotes);
  }, [totalVotes]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded-md shadow-md text-sm">
          <p className="font-bold">{`${payload[0]?.name}`}</p>
          <p className="text-gray-700">{`Votes: ${formatNumber(
            payload[0].value
          )}`}</p>
        </div>
      );
    }
    return null;
  };

  // Show loading state
  // if (!isReady || isVotesLoading || isQuorumLoading) {
  //   return (
  //     <div className="w-full flex justify-center flex-col rounded-[1rem] font-poppins h-fit p-6 min-h-[416px]">
  //       <h2 className="text-2xl font-bold mb-6 text-center">Loading votes...</h2>
  //     </div>
  //   );
  // }

  return (
    <div
      className="w-full flex justify-center flex-col rounded-[1rem] font-poppins h-fit p-6 min-h-[416px] 1.3lg:h-fit"
    >
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-slate-600 text-center">
        Current Votes
      </h2>
      
          <div className="mb-4 flex flex-col items-start gap-2">
            {parseFloat(formattedQuorum) !== 0.0 && (
              <p className="text-sm flex justify-between w-full font-medium">
                <span className="flex gap-2">
                  <FaBalanceScale size={18} className="text-indigo-600" />
                  Quorum
                </span>{" "}
                <span className="">
                  {formattedTotalVotes} of {formattedQuorum}
                </span>
              </p>
            )}
            <p className="text-sm flex justify-between w-full font-medium">
              <span className="flex gap-2">
                <FaVoteYea size={18} className="text-indigo-600" />
                Total Votes
              </span>{" "}
              <span>{formattedTotalVotes}</span>
            </p>
          </div>
          {!isVoteDataEmpty ? (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={voteData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={30}
                  labelLine={false}
                  label={false}
                >
                  {voteData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      stroke="#fff"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconSize={12}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
      ) : (
        <p className="text-lg font-poppins text-gray-500 flex items-center" style={{ width: "100%", height: 200 }}>
          📊 Chart Empty: No votes have been recorded on this chart.
        </p>
      )}
    </div>
  );
};

export default Proposalvotes;
