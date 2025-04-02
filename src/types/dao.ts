import { DocumentNode } from "graphql";
import { Chain } from "viem/chains"; 
import type { Abi } from "viem";


export interface BaseDAOConfig {
    name: string;
    logo: string;
    chainId: number;
    chainName:string;
    viemchain:Chain;
    dataSource?:object; //object used for if DAO doesn't have contract to APIs endpoint 
    useContractSourceAddress?:{Address:string},
    chainAddress: string;
    lighthoueseIcon:string;
    explorerUrl: string;
    governanceUrl?: string;
    tokenSymbol: string;
    subgraphUrl?: string;
    discourseUrl:string;
    proposalUrl:string;
    proposalAPIendpoint?:{ProposalEndpoint:string,ProposalQueueEndpoint:string}
    proposalAbi:Abi;
    descriptionQuery:DocumentNode;
    attestationUrl:string;
    eascontracAddress:string;
    delegateChangedsUrl:string;
    alchemyAttestationUrl:string;
    offchainAttestationUrl:string;
    communityCalendarUrl?:string;
    // Add any other DAO-specific fields you need
  }

  interface SubgraphDAOConfig extends BaseDAOConfig {
    type: 'subgraph';
    subgraphUrl: string;
    excludeAddresses?: string[];
  }
  
  interface APIDAOConfig extends BaseDAOConfig {
    type: 'api';
    dataSource: {
      delegateEndpoint: string;
      proposalEndpoint: string;
    };
  }
  
  export type DAOConfig = SubgraphDAOConfig | APIDAOConfig;