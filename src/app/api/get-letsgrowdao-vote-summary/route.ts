import { NextRequest, NextResponse } from 'next/server';
export const revalidate = 0;

interface Vote {
  transactionHash: string;
  proposal: string;
  member: string;
  id: string;
  blockTimestamp: string;
  blockNumber: string;
  balance: string;
  approved: boolean;
}

interface ProposalVoteSummary {
  proposalId: string;
  weightFor: string;
  weightAgainst: string;
  totalVotes: number;
  quorumReached: boolean;
}

// Adjust total supply and quorum as needed
const TOTAL_SUPPLY = BigInt(21); // Increased for more realistic scenario
const QUORUM_THRESHOLD = TOTAL_SUPPLY * BigInt(51) / BigInt(100); 
async function fetchAllVotes(): Promise<Vote[]> {
  try {
    const response = await fetch('https://api.studio.thegraph.com/query/68573/lets_grow_dao_proposal/version/latest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_THEGRAPH_API_KEY}`,
      },
      body: JSON.stringify({
        query: `
          query AllVotesQuery {
            submitVotes(first: 1000){
              transactionHash
              proposal
              member
              id
              blockTimestamp
              blockNumber
              balance
              approved
            }
          }
        `
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    return responseData.data?.submitVotes || [];
  } catch (error) {
    console.error('Fetch votes error:', error);
    return [];
  }
}

function calculateVoteWeights(votes: Vote[]): ProposalVoteSummary {
  // Safer parsing of balance, handling potential string formats
  const safeParseBalance = (balance: string): bigint => {
    try {
      // Remove any commas or other formatting
      const cleanBalance = balance.replace(/[,]/g, '');
      return BigInt(cleanBalance);
    } catch (error) {
      console.error(`Balance parsing error for: ${balance}`, error);
      return BigInt(0);
    }
  };

  const weightFor = votes
    .filter(vote => vote.approved)
    .reduce((total, vote) => total + safeParseBalance(vote.balance), BigInt(0));

  const weightAgainst = votes
    .filter(vote => !vote.approved)
    .reduce((total, vote) => total + safeParseBalance(vote.balance), BigInt(0));

  const totalVotes = weightFor + weightAgainst;
  return {
    proposalId: votes[0]?.proposal || '',
    weightFor: weightFor.toString(),
    weightAgainst: weightAgainst.toString(),
    totalVotes: Number(totalVotes),
    quorumReached: (totalVotes / BigInt(10**18)) >= QUORUM_THRESHOLD
  };
}

function summarizeProposalVotes(votes: Vote[]): ProposalVoteSummary[] {
  const proposalIds = [...new Set(votes.map(vote => vote.proposal))];

  return proposalIds.map(proposalId => {
    const proposalVotes = votes.filter(vote => vote.proposal === proposalId);
    return calculateVoteWeights(proposalVotes);
  });
}

export async function GET(request: NextRequest) {
  try {
    const votes = await fetchAllVotes();
    
    if (votes.length === 0) {
      return NextResponse.json({ error: 'No votes found' }, { status: 404 });
    }

    const proposalSummaries = summarizeProposalVotes(votes);

    return NextResponse.json({ 
      totalVotesFound: votes.length,
      proposalVoteSummaries: proposalSummaries 
    });
  } catch (error) {
    console.error('Error processing votes:', error);
    return NextResponse.json({ error: 'Failed to process votes' }, { status: 500 });
  }
}