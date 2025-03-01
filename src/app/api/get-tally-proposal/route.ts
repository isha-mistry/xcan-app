// app/api/proposals/route.ts
import { NextResponse } from 'next/server';

// Define types for the proposal data
interface Block {
  id: string;
  timestamp: string;
}

interface BlocklessTimestamp {
  timestamp: string;
}

interface ProposalMetadata {
  title: string;
  description: string;
  eta: string;
  ipfsHash: string;
  previousEnd: string;
  timelockId: string;
  txHash: string;
  discourseURL: string;
  snapshotURL: string;
}

interface ProposalEvent {
  type: string;
  txHash: string;
  chainId: string;
  createdAt: string;
  block: Block;
}

interface Proposal {
  id: string;
  onchainId: string;
  end: Block | BlocklessTimestamp;
  start: Block | BlocklessTimestamp;
  createdAt: string;
  quorum: string;
  block: Block;
  metadata: ProposalMetadata;
  events: ProposalEvent[];
  status: string;
}

interface GraphQLResponse {
  data: {
    proposal: Proposal;
  };
}

// Database connection utility
import { connectDB } from "@/config/connectDB";

export async function GET(request: Request) {
  // Get query parameters
  const url = new URL(request.url);
  const onchainId = url.searchParams.get('onchainId');
  const governorId = url.searchParams.get('governorId');
  
  // Validate required parameters
  if (!onchainId || !governorId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }
console.log("onchainId is ",onchainId,"governorId is ",governorId);
  const API_KEY = process.env.NEXT_PUBLIC_TALLY_API_KEY || "";
  
  try {
    // Prepare the GraphQL query
    const query = `
      query Proposal($input: ProposalInput!) {
        proposal(input: $input) {
          id
          onchainId
          end {
            ... on Block {
              id
              timestamp
            }
            ... on BlocklessTimestamp {
              timestamp
            }
          }
          start {
            ... on Block {
              id
              timestamp
            }
            ... on BlocklessTimestamp {
              timestamp
            }
          }
          createdAt
          quorum
          block {
            id
          }
          metadata {
            title
            description
            eta
            ipfsHash
            previousEnd
            timelockId
            txHash
            discourseURL
            snapshotURL
          }
          events {
            type
            txHash
            chainId
            createdAt
            block {
              id
              timestamp
            }
          }
          status
        }
      }
    `;

    // Prepare variables
    const variables = {
      input: {
        onchainId,
        governorId
      }
    };

    // Make the GraphQL request
    const response = await fetch('https://api.tally.xyz/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const result: GraphQLResponse = await response.json();
console.log("result is ",result);
    if (!result.data?.proposal) {
      return NextResponse.json({ error: 'No proposal found' }, { status: 404 });
    }

    // Connect to database and save data
    const client = await connectDB();
    const db = client.db();    

    // Save the proposal data to the database
    // Using upsert to update if exists or insert if not
    const dbResult = await db.collection('tally-proposals').updateOne(
      { proposalId: result.data.proposal.onchainId },
      { $set: { ...result.data.proposal, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: dbResult.upsertedId ? 'Proposal saved' : 'Proposal updated',
      proposalId: result.data.proposal.id,
      proposal: result.data.proposal
    });
  } catch (error) {
    console.error('Error processing proposal data:', error);
    return NextResponse.json({ error: 'Failed to process proposal data' }, { status: 500 });
  }
}