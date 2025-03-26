import { NextRequest, NextResponse } from 'next/server';
import { Client, cacheExchange, fetchExchange, gql } from 'urql';
export const revalidate = 0;

const client = new Client({
  url: 'https://api.studio.thegraph.com/query/68573/lets_grow_dao_proposal/version/latest',
  exchanges: [fetchExchange],
});

const GET_PROPOSALS = gql`
query GetAllProposals {
   submitProposals(orderDirection: desc, orderBy: proposal) {
    blockNumber
    blockTimestamp
    details
    expiration
    id
    proposal
    proposalData
    proposalDataHash
    selfSponsor
    timestamp
    transactionHash
    votingPeriod
  }
}`;

const GET_PROPOSAL = gql`
query GetProposal($proposalId: BigInt!) {
 submitProposals(orderDirection: desc, orderBy: proposal, where: {proposal: $proposalId}) {
    blockNumber
    blockTimestamp
    details
    expiration
    id
    proposal
    proposalData
    proposalDataHash
    selfSponsor
    timestamp
    transactionHash
    votingPeriod
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

// function mergeProposalData(data: QueryResult) {
//   const { proposalCreateds, proposalExtendeds } = data;

//   return proposalCreateds.map(proposal => {
//     const extension = proposalExtendeds.find(ext => ext.proposalId === proposal.proposalId);
//     return {
//       ...proposal,
//       extension: extension ? {
//         extendedDeadline: extension.extendedDeadline,
//         extensionTimestamp: extension.blockTimestamp
//       } : null
//     };
//   });
// }

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
    // Extract the data we nee
    const dataToPass = result.data.submitProposals.map((proposal: any) => ({
        blockTimestamp: proposal.blockTimestamp, 
        description: proposal.details || "No description", 
        blockNumber: proposal.blockNumber, 
        proposalId: proposal.proposal, 
        proposer: proposal.selfSponsor, 
        transactionHash: proposal.transactionHash, 
        startTime:proposal.blockTimestamp,
        endTime: parseInt(proposal.blockTimestamp) + (parseInt(proposal.votingPeriod) )
    }));
  
    // Merge the proposal and extension data
    // const mergedData = mergeProposalData(result.data);
    return NextResponse.json({ data: dataToPass });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}