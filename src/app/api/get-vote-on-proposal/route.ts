// app/api/votes/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('proposalId');
    const voter = searchParams.get('voter');
    const dao = searchParams.get('dao');

    if (!proposalId || !voter) {
      return NextResponse.json(
        { error: 'Missing proposalId or voter parameter' },
        { status: 400 }
      );
    }

    const query = `
      query GetVotes($proposalId: String!, $voter: String!) {
        voteCasts(where: {proposalId: $proposalId, voter: $voter}) {
          support
          weight
          reason
        }
        voteCastWithParams_collection(where: {proposalId: $proposalId, voter: $voter}) {
          reason
          support
          weight
        }
      }
    `;

    const variables = {
      proposalId,
      voter,
    };

    // Replace with your actual GraphQL endpoint
    const graphUrl = process.env.NEXT_PUBLIC_OPTIMISM_PROPOSALS_GRAPH_URL;
    if (!graphUrl) {
      return NextResponse.json(
        { error: 'GraphQL endpoint is not defined' },
        { status: 500 }
      );
    }

    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();

    // Get the vote data from either collection
    const voteCasts = data.data?.voteCasts || [];
    const voteCastWithParams = data.data?.voteCastWithParams_collection || [];

    // Return the first non-empty array, or empty array if both are empty
    const votes = voteCasts.length > 0 ? voteCasts : voteCastWithParams;
    return NextResponse.json(votes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}