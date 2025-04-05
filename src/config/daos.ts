// config/daos.ts
import { gql } from "urql";
import { DAOConfig } from "../types/dao";
import { optimism, arbitrum, arbitrumSepolia, mantle } from "viem/chains";
import arb_proposals_abi from "../artifacts/Dao.sol/arb_proposals_abi.json";
import op_proposals_abi from "../artifacts/Dao.sol/op_proposals_abi.json";
import { Abi } from "viem";

export const daoConfigs: { [key: string]: DAOConfig } = {
  optimism: {
    name: "optimism",
    uniqueIdentifier: "optimism-mainnet", 
    logo: "/images/op.png", // Move images to public folder for better maintainability
    chainId: 10,
    chainName: "OP Mainnet",
    tokenContractAddress: "0x4200000000000000000000000000000000000042",
    viemchain: optimism,
    lighthoueseIcon:
      "https://gateway.lighthouse.storage/ipfs/QmXaKNwUxvd4Ksc9R6hd36eBo97e7e7YPDCVuvHwqG4zgQ",
    useContractSourceAddress:{Address:"0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"},
    discourseUrl: "https://gov.optimism.io/u",
    explorerUrl: "https://optimistic.etherscan.io",
    governanceUrl: "https://vote.optimism.io",
    tokenSymbol: "OP",
    dataSource:{},
    subgraphUrl: "https://api.studio.thegraph.com/query/68573/op/v0.0.9",
    alchemyAttestationUrl: process.env.NEXT_PUBLIC_OP_ATTESTATION_URL || "",
    offchainAttestationUrl: "https://optimism.easscan.org",
    communityCalendarUrl:"https://calendar.google.com/calendar/u/0/embed?src=c_fnmtguh6noo6qgbni2gperid4k@group.calendar.google.com&ctz=America/Los_Angeles&pli=1",
    proposalUrl:
      process.env.NEXT_PUBLIC_OPTIMISM_PROPOSALS_GRAPH_URL ||
      "https://api.studio.thegraph.com/query/68573/v6_proxy/version/latest",
    proposalAbi: op_proposals_abi as Abi,
    attestationUrl: "https://optimism.easscan.org/offchain/attestation/view",
    eascontracAddress: "0x4200000000000000000000000000000000000021",
    delegateChangedsUrl:
      "https://api.studio.thegraph.com/query/68573/op/v0.0.9",
    descriptionQuery: gql`
      query OptimismDescription($proposalId: String!) {
        proposalCreated1S(where: { proposalId: $proposalId }) {
          description
        }
        proposalCreated2S(where: { proposalId: $proposalId }) {
          description
        }
        proposalCreated3S(where: { proposalId: $proposalId }) {
          description
        }
        proposalCreateds(where: { proposalId: $proposalId }) {
          description
        }
      }
    `,
    type:"subgraph",
    excludeAddresses: ["0x00000000000000000000000000000000000a4b86"]
  },
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
  letsgrowdao: {
    name: "Let's Grow DAO",
    uniqueIdentifier: "letsgrowdao-mainnet", 
    logo: "/images/letsGrow.jpg", // Move images to public folder for better maintainability
    chainId: 10,
    chainName: "OP Mainnet",
    tokenContractAddress: "0x6d95ad838d00427838d6e6fac043271a0ef2e484",
    viemchain: optimism,
    lighthoueseIcon:
      "https://gateway.lighthouse.storage/ipfs/QmXaKNwUxvd4Ksc9R6hd36eBo97e7e7YPDCVuvHwqG4zgQ",
    useContractSourceAddress:{Address:"0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"},
    discourseUrl: "https://gov.optimism.io/u",
    explorerUrl: "https://optimistic.etherscan.io",
    governanceUrl: "https://vote.optimism.io",
    tokenSymbol: "OP",
    dataSource:{},
    subgraphUrl: "https://api.studio.thegraph.com/query/68573/lets_grow_dao_votingtoken/v0.0.3",
    proposalAPIendpoint:{ProposalEndpoint:"/api/get-letsgrowdao-proposals",ProposalQueueEndpoint:"/api/get-arbitrum-queue-info"},
    alchemyAttestationUrl: process.env.NEXT_PUBLIC_OP_ATTESTATION_URL || "",
    offchainAttestationUrl: "https://optimism.easscan.org",
    proposalUrl:"https://api.studio.thegraph.com/query/68573/lets_grow_dao_proposal/version/latest",
    proposalAbi: op_proposals_abi as Abi,
    attestationUrl: "https://optimism.easscan.org/offchain/attestation/view",
    eascontracAddress: "0x4200000000000000000000000000000000000021",
    delegateChangedsUrl:
      "https://api.studio.thegraph.com/query/68573/lets_grow_dao_votingtoken/v0.0.2",
    descriptionQuery: gql`
      query OptimismDescription($proposalId: String!) {
        proposalCreated1S(where: { proposalId: $proposalId }) {
          description
        }
        proposalCreated2S(where: { proposalId: $proposalId }) {
          description
        }
        proposalCreated3S(where: { proposalId: $proposalId }) {
          description
        }
        proposalCreateds(where: { proposalId: $proposalId }) {
          description
        }
      }
    `,
    type:"subgraph",
    excludeAddresses: ["0x00000000000000000000000000000000000a4b86"]
  },
  // mantle: {
  //   name: "Mantle",
  //   logo: "/images/Mantledaologo.png",
  //   chainId: 5000,
  //   chainName: "Mantle",
  //   tokenContractAddress: "0xEd459209796D741F5B609131aBd927586fcCACC5", // Replace with actual address
  //   viemchain: mantle,
  //   lighthoueseIcon:
  //     "https://gateway.lighthouse.storage/ipfs/QmdP6ZkLq4FF8dcvxBs48chqFiXu7Gr8SgPCqMtfr7VA4L",
  //   discourseUrl: "https://forum.mantle.xyz/u",
  //   explorerUrl: "https://explorer.mantlenetwork.io/",
  //   governanceUrl: "https://mantlenetwork.io/governance",
  //   tokenSymbol: "MNT",
  //   subgraphUrl: "https://api.studio.thegraph.com/query/68573/arb_proposal/v0.0.9",
  //   alchemyAttestationUrl: process.env.NEXT_PUBLIC_ARB_ATTESTATION_URL || "",
  //   offchainAttestationUrl: "https://arbitrum.easscan.org",
  //   proposalUrl:
  //     process.env.NEXT_PUBLIC_ARBITRUM_PROPOSALS_GRAPH_URL ||
  //     "https://api.studio.thegraph.com/query/68573/arb_proposal/v0.0.9",
  //   proposalAPIendpoint:{ProposalEndpoint:"/api/get-arbitrumproposals",ProposalQueuEndpoint:"/api/get-arbitrum-queue-info"},  
  //   proposalAbi: arb_proposals_abi as Abi,  
  //   attestationUrl: "https://optimism.easscan.org/offchain/attestation/view",
  //   eascontracAddress: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
  //   delegateChangedsUrl:
  //     "https://api.studio.thegraph.com/query/477/arbitrum/v0.0.2",
  //   descriptionQuery: gql`
  //     query MyQuery($proposalId: String!) {
  //       proposalCreateds(
  //         where: { proposalId: $proposalId }
  //         orderBy: blockTimestamp
  //         orderDirection: desc
  //       ) {
  //         description
  //       }
  //     }
  //   `,
  //   type:"subgraph",
  // },
  // smallDao: {
  //   id: 'smallDao',
  //   name: 'Community DAO',
  //   logo: '/images/community-dao.png',
  //   dataSource: {
  //     type: 'api',
  //     proposalEndpoint: '/api/daos/community/proposals',
  //     delegateEndpoint: '/api/daos/community/delegates'
  //   },
  // }
};
