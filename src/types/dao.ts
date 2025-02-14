import { DocumentNode } from "graphql";
import { Chain } from "viem/chains"; 

export interface DAOConfig {
    name: string;
    logo: string;
    chainId: number;
    chainName:string;
    viemchain:Chain;
    chainAddress: string;
    lighthoueseIcon:string;
    explorerUrl: string;
    governanceUrl?: string;
    tokenSymbol: string;
    subgraphUrl: string;
    discourseUrl:string;
    proposalUrl:string;
    proposalAbi:Object;
    descriptionQuery:DocumentNode;
    attestationUrl:string;
    eascontracAddress:string;
    delegateChangedsUrl:string;
    alchemyAttestationUrl:string;
    offchainAttestationUrl:string;
    // Add any other DAO-specific fields you need
  }