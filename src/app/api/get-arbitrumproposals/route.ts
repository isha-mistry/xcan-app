import { NextRequest, NextResponse } from 'next/server';
import { Client, cacheExchange, fetchExchange, gql } from 'urql';
export const revalidate = 0;

const client = new Client({
  url: 'https://api.studio.thegraph.com/query/68573/arb_proxy/version/latest',
  exchanges: [fetchExchange],
});

const GET_PROPOSALS = gql`
query GetAllProposals {
  proposalCreateds(orderBy: blockTimestamp, orderDirection: desc, first: 1000) {
    blockTimestamp
    description
    proposalId
    proposer
    transactionHash
    startBlock
    endBlock
    contractSource {
      contractAddress
      governors
    }
  }
  proposalExtendeds(first: 1000) {
    proposalId
    extendedDeadline
    id
    blockTimestamp
  }
}`;

const GET_PROPOSAL = gql`
query GetProposal($proposalId: BigInt!) {
  proposalCreateds(where: { proposalId: $proposalId }) {
    blockTimestamp
    description
    proposalId
    proposer
    transactionHash
    startBlock
    endBlock
    contractSource {
      contractAddress
      governors
    }
  }
  proposalExtendeds(where: { proposalId: $proposalId }) {
    proposalId
    extendedDeadline
    id
    blockTimestamp
  }
}`;

interface ProposalCreated {
  blockTimestamp: string;
  description: string;
  proposalId: string;
  proposer: string;
  transactionHash: string;
  startBlock: string;
  endBlock: string;
  contractSource: {
    contractAddress: string;
    governors: string[];
  };
}

interface ProposalExtended {
  proposalId: string;
  extendedDeadline: string;
  id: string;
  blockTimestamp: string;
}

interface QueryResult {
  proposalCreateds: ProposalCreated[];
  proposalExtendeds: ProposalExtended[];
}

function mergeProposalData(data: QueryResult) {
  const { proposalCreateds, proposalExtendeds } = data;

  return proposalCreateds.map(proposal => {
    const extension = proposalExtendeds.find(ext => ext.proposalId === proposal.proposalId);
    return {
      ...proposal,
      extension: extension ? {
        extendedDeadline: extension.extendedDeadline,
        extensionTimestamp: extension.blockTimestamp
      } : null
    };
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');

    let result;

    if (proposalId) {
      // Convert proposalId to BigInt format if needed
      result = await client.query(GET_PROPOSAL, { proposalId: proposalId.toString() }).toPromise();
    } else {
      // Fetch all proposals
      result = await client.query(GET_PROPOSALS, {}).toPromise();
    }

    if (result.error) {
      console.error('GraphQL query error:', result.error);
      return NextResponse.json({ error: 'An error occurred while fetching data' }, { status: 500 });
    }

    // Merge the proposal and extension data
    const mergedData = mergeProposalData(result.data);

    return NextResponse.json({ data: mergedData });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}