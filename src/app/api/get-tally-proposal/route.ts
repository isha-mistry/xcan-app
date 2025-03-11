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
  let client;
  try {
    // Get query parameters
    const url = new URL(request.url);
    const onchainId = url.searchParams.get('onchainId');
    const governorId = url.searchParams.get('governorId');

    // Validate required parameters
    if (!onchainId || !governorId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    console.log("onchainId is ", onchainId, "governorId is ", governorId);

    // Connect to database
    client = await connectDB();
    const db = client.db();

    // Check if proposal already exists in the database
    const existingProposal = await db.collection('tally-proposals').findOne({ onchainId });
    
    // If proposal exists in database, return it without calling Tally API
    if (existingProposal) {
      console.log("Proposal found in database, skipping API call");
      return NextResponse.json({
        success: true,
        message: 'Proposal retrieved from database',
        proposalId: existingProposal.id,
        proposal: existingProposal,
        source: 'database'
      });
    }

    // If proposal not in database, call Tally API
    console.log("Proposal not found in database, fetching from Tally API");
    const API_KEY = process.env.NEXT_PUBLIC_TALLY_API_KEY || "";

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
    console.log("result is ", result);

    if (!result.data?.proposal) {
      return NextResponse.json({ error: 'No proposal found' }, { status: 404 });
    }

    // Save the new proposal data to the database
    const dbResult = await db.collection('tally-proposals').insertOne({
      ...result.data.proposal,
      onchainId: result.data.proposal.onchainId, // Ensure onchainId is properly saved for future lookups
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'New proposal fetched and saved',
      proposalId: result.data.proposal.id,
      proposal: result.data.proposal,
      source: 'tally_api'
    });
  } catch (error) {
    console.error('Error processing proposal data:', error);
    return NextResponse.json({ error: 'Failed to process proposal data' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
      console.log("Database connection closed");
    }
  }
}