// config.ts
import { gql } from 'urql';


export const SubgraphdaoConfigs = {
  optimism: {
    url: 'https://api.studio.thegraph.com/query/68573/v6_proxy/version/latest',
    queryMapping: {
      proposalCanceled: gql`
        query GetCanceledProposals($first: Int!, $skip: Int!) {
          proposalCanceleds(orderBy: blockTimestamp, orderDirection: desc, first: $first, skip: $skip) {
            proposalId
            blockTimestamp
          }
        }
      `
    }
  },
  arbitrum: {
    url: 'https://api.studio.thegraph.com/query/68573/arbitrum_proposals/v0.0.4',
    queryMapping: {
      proposalCanceled: gql`
        query GetCanceledProposals($first: Int!, $skip: Int!) {
          proposalCanceleds(orderBy: blockTimestamp, orderDirection: desc, first: $first, skip: $skip) {
            proposalId
            blockTimestamp
          }
        }
      `,
    }
  },
  // Add new DAOs here
  starknet: {
    url: 'https://api.studio.thegraph.com/query/YOUR_STARKNET_SUBGRAPH',
    queryMapping: {
      proposalCanceled: gql`
        query GetCanceledProposals($first: Int!, $skip: Int!) {
          proposalCanceleds(orderBy: blockTimestamp, orderDirection: desc, first: $first, skip: $skip) {
            proposalId
            blockTimestamp
          }
        }
      `,
    }
  }
};
