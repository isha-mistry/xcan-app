import { Client, cacheExchange, fetchExchange, gql } from 'urql';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
export const revalidate = 0;

const client = new Client({
  // url: process.env.NEXT_PUBLIC_OPTIMISM_PROPOSALS_GRAPH_URL||'',
  url: 'https://api.studio.thegraph.com/query/68573/proposal/version/latest',
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${process.env.THEGRAPH_API_KEY}`,
    },
  },
  exchanges: [fetchExchange],
});

const GET_PROPOSALS = gql`
  query GetProposals {
    proposalCreated1S(orderDirection: desc, orderBy: blockTimestamp, first: 100) {
      proposalId
      blockTimestamp
      description
      proposalData
      proposer 
      startBlock
      endBlock
      transactionHash
      startTime
      endTime
      blockNumber
    }
    proposalCreated2S(orderDirection: desc, orderBy: blockTimestamp, first: 100) {
      proposalId
      blockTimestamp
      description
      proposalData
      proposer
      startBlock
      endBlock
      transactionHash
      startTime
      endTime
      blockNumber
    }
    proposalCreated3S(orderDirection: desc, orderBy: blockTimestamp, first: 100) {
      proposalId
      blockTimestamp
      description
      proposer
      startBlock
      endBlock
      transactionHash
      startTime
      endTime
      blockNumber
    }
    proposalCreateds(orderDirection: desc, orderBy: blockTimestamp, first: 100) {
      proposalId
      blockTimestamp
      description
      proposer
      startBlock
      endBlock
      transactionHash
      startTime
      endTime 
      blockNumber
    }
  }
`;

const GET_PROPOSAL_DESCRIPTIONS = gql`
  query GetProposalDescriptions($proposalId: String!) {
    proposalCreated1S(where: { proposalId: $proposalId }) {
      description
      blockTimestamp
      startBlock
      endBlock
      startTime
      endTime 
      blockNumber
    }
    proposalCreated2S(where: { proposalId: $proposalId }) {
      description
      blockTimestamp
      startBlock
      endBlock
      startTime
      endTime 
      blockNumber
    }
    proposalCreated3S(where: { proposalId: $proposalId }) {
      description
      blockTimestamp
      startBlock
      endBlock
      startTime
      endTime
      blockNumber
    }
    proposalCreateds(where: { proposalId: $proposalId }) {
      description
      blockTimestamp
      startBlock
      endBlock
      startTime
      endTime 
      blockNumber
    }
  }
`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');

    let result;

    if (proposalId) {
      // Fetch specific proposal
      result = await client.query(GET_PROPOSAL_DESCRIPTIONS, { proposalId }).toPromise();
    } else {
      // Fetch all proposals
      result = await client.query(GET_PROPOSALS, {}).toPromise();
    }

    if (result.error) {
      console.error('GraphQL query error:', result.error);
      return NextResponse.json({ error: 'An error occurred while fetching data' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}