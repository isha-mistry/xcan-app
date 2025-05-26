// config/daos.ts
import { gql } from "urql";
import { DAOConfig } from "../types/dao";
import { optimism, arbitrum, arbitrumSepolia, mantle } from "viem/chains";
import arb_proposals_abi from "../artifacts/Dao.sol/arb_proposals_abi.json";
import op_proposals_abi from "../artifacts/Dao.sol/op_proposals_abi.json";
import { Abi } from "viem";

export const daoConfigs: { [key: string]: DAOConfig } = {
  arbitrum: {
    name: "arbitrum",
    uniqueIdentifier: "arbitrum-mainnet", 
    logo: "/images/arbitrum.jpg",
    chainId: 42161,
    chainName: "Arbitrum One",
    tokenContractAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    viemchain: arbitrum,
    lighthoueseIcon:
      "https://gateway.lighthouse.storage/ipfs/QmdP6ZkLq4FF8dcvxBs48chqFiXu7Gr8SgPCqMtfr7VA4L",
    discourseUrl: "https://forum.arbitrum.foundation/u",
    explorerUrl: "https://arbiscan.io",
    governanceUrl: "https://snapshot.org/#/arbitrum",
    tokenSymbol: "ARB",
    subgraphUrl: "https://api.studio.thegraph.com/query/68573/arb_token/v0.0.3",
    alchemyAttestationUrl: process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL || "",
    offchainAttestationUrl: "https://arbitrum.easscan.org",
    communityCalendarUrl:"https://calendar.google.com/calendar/u/0/embed?src=c_4157985d2452dfd8a91b6a36bccab37deb9bffe9053a4b9bcc4e9fff9ef02924@group.calendar.google.com&ctz=Europe/Warsaw&pli=1",
    proposalUrl:
      process.env.NEXT_PUBLIC_ARBITRUM_PROPOSALS_GRAPH_URL ||
      "https://api.studio.thegraph.com/query/68573/arb_proposal/v0.0.9",
    proposalAPIendpoint:{ProposalEndpoint:"/api/get-arbitrumproposals",ProposalQueueEndpoint:"/api/get-arbitrum-queue-info"},
    proposalAbi: arb_proposals_abi as Abi,
    attestationUrl: "https://arbitrum.easscan.org/offchain/attestation/view",
    eascontracAddress: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
    delegateChangedsUrl:
      "https://api.studio.thegraph.com/query/68573/arb_token/v0.0.3",
    descriptionQuery: gql`
      query MyQuery($proposalId: String!) {
        proposalCreateds(
          where: { proposalId: $proposalId }
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          description
        }
      }
    `,
    type:"subgraph",
  },
  arbitrumSepolia: {
    name: "Arbitrum Sepolia",
    uniqueIdentifier: "arbitrumsepolia-mainnet", 
    logo: "/images/arbitrum.jpg", // Ensure you add this image to your public folder
    chainId: 421614,
    chainName: "Arbitrum Sepolia",
    tokenContractAddress: "0x0000000000000000000000000000000000000000", // Replace with actual address if available
    viemchain: arbitrumSepolia,
    lighthoueseIcon:
      "https://gateway.lighthouse.storage/ipfs/QmdP6ZkLq4FF8dcvxBs48chqFiXu7Gr8SgPCqMtfr7VA4L",
    useContractSourceAddress:{Address:""},  
    discourseUrl: "https://forum.arbitrum.foundation/u",
    explorerUrl: "https://sepolia.arbiscan.io",
    governanceUrl: "https://snapshot.org/#/arbitrum",
    tokenSymbol: "ARB",
    subgraphUrl:
      "https://api.studio.thegraph.com/query/68573/arb_sepolia/v0.0.1", // Replace with actual subgraph if available
    alchemyAttestationUrl: process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL || "",
    offchainAttestationUrl: "https://arbitrum.easscan.org",
    proposalUrl:
      process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_PROPOSALS_GRAPH_URL ||
      "https://api.studio.thegraph.com/query/68573/arbitrum_sepolia_proposals/v0.0.1",
    proposalAbi: arb_proposals_abi as Abi,
    attestationUrl: "https://arbitrum.easscan.org/offchain/attestation/view",
    eascontracAddress: "0x0000000000000000000000000000000000000000", // Replace with actual address if available
    delegateChangedsUrl:
      "https://api.studio.thegraph.com/query/477/arbitrum_sepolia/v0.0.1",
    descriptionQuery: gql`
      query ArbitrumSepoliaDescription($proposalId: String!) {
        proposalCreateds(
          where: { proposalId: $proposalId }
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          description
        }
      }
    `,
    type:"subgraph",
  },
};
