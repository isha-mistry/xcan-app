import { Client, cacheExchange, fetchExchange, gql } from 'urql';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BASE_PROPOSAL_QUERY = gql`
  query GetCanceledProposals($first: Int!, $skip: Int!) {
    proposalCanceleds(orderBy: blockTimestamp, orderDirection: desc, first: $first, skip: $skip) {
      proposalId
      blockTimestamp
    }
  }
`;

const LETSGROW_QUERY = gql`
  query GetLetsGrowCanceledProposals($first: Int!, $skip: Int!) {
    cancelProposals(orderBy: blockTimestamp, orderDirection: desc, first: $first, skip: $skip) {
      proposal
      blockNumber
      blockTimestamp
      id
      transactionHash
    }
  }
`;

type DAOConfig = {
  url: string;
  query: any;
  dataTransformer?: (data: any) => any;
};

const DEFAULT_ENDPOINT = 'https://api.studio.thegraph.com/query/68573/v6_proxy/version/latest';

const transformLetsGrowData = (data: any) => {
  if (!data || !data.cancelProposals) return [];
  return data.cancelProposals.map((proposal: any) => ({
    proposalId: proposal.proposal,
    blockTimestamp: proposal.blockTimestamp,
    blockNumber: proposal.blockNumber,
    transactionHash: proposal.transactionHash
  }));
};

const daoConfigs: { [key: string]: DAOConfig } = {
  arbitrum: {
    url: 'https://api.studio.thegraph.com/query/68573/arbitrum_proposals/v0.0.4',
    query: BASE_PROPOSAL_QUERY
  },
  optimism: {
    url: DEFAULT_ENDPOINT,
    query: BASE_PROPOSAL_QUERY
  },
  mantle: {
    url: 'https://api.studio.thegraph.com/query/68573/v6_proxy/version/latest',
    query: BASE_PROPOSAL_QUERY
  },
  letsgrowdao: {
    url: 'https://api.studio.thegraph.com/query/68573/lets_grow_dao_proposal/version/latest',
    query: LETSGROW_QUERY,
    dataTransformer: transformLetsGrowData
  }
};

function createDAOClient(url: string): Client {
  return new Client({
    url,
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${process.env.THEGRAPH_API_KEY}`,
      },
    },
    exchanges: [cacheExchange, fetchExchange]
  });
}

async function fetchProposals(
  url: string,
  query: any,
  first: number,
  skip: number,
  dataTransformer?: (data: any) => any,
  accumulatedResults: any[] = []
): Promise<any[]> {
  const client = createDAOClient(url);
  const result = await client.query(query, { first, skip }).toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  let newResults;
  if (dataTransformer) {
    newResults = dataTransformer(result.data);
  } else {
    newResults = result.data.proposalCanceleds || result.data.cancelProposals;
  }

  accumulatedResults.push(...newResults);

  if (newResults.length === 0) {
    return accumulatedResults;
  }

  return fetchProposals(url, query, first, skip + first, dataTransformer, accumulatedResults);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dao = searchParams.get('dao');

  try {
    const config = dao ? daoConfigs[dao] : { url: DEFAULT_ENDPOINT, query: BASE_PROPOSAL_QUERY };
    
    if (dao && !config) {
      return NextResponse.json(
        { error: `DAO "${dao}" not supported. Available DAOs: ${Object.keys(daoConfigs).join(', ')}` },
        { status: 400 }
      );
    }

    const allProposals = await fetchProposals(
      config.url, 
      config.query, 
      100, 
      0,
      config.dataTransformer
    );
    return NextResponse.json(allProposals);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}