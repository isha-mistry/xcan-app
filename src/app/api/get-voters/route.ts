// import { Client, fetchExchange, gql } from "urql";
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export const runtime = "nodejs";

// const client = new Client({
//   url: process.env.OPTIMISM_PROPOSALS_GRAPH_URL|| "default_url",
//   exchanges: [fetchExchange],
// });

// const arb_client = new Client({
//   url: "https://api.studio.thegraph.com/query/68573/arbitrum_proposals/v0.0.4",
//   exchanges: [fetchExchange],
// });

// const COMBINED_VOTE_QUERY = gql`
//   query CombinedVoteQuery(
//     $proposalId: String!
//     $blockTimestamp: String!
//     $first: Int!
//   ) {
//     voteCastWithParams: voteCastWithParams_collection(
//       where: { proposalId: $proposalId, blockTimestamp_gte: $blockTimestamp }
//       first: $first
//       orderBy: blockTimestamp
//       orderDirection: asc
//     ) {
//       voter
//       weight
//       support
//       blockTimestamp
//       transactionHash
//       id
//       reason
//     }
//     voteCasts(
//       where: { proposalId: $proposalId, blockTimestamp_gte: $blockTimestamp }
//       orderBy: blockTimestamp
//       orderDirection: asc
//       first: $first
//     ) {
//       voter
//       weight
//       support
//       blockTimestamp
//       transactionHash
//       id
//       reason
//     }
//   }
// `;
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const proposalId = searchParams.get("proposalId");
//   const blockTimestamp = searchParams.get("blockTimestamp") || "0";
//   const first = parseInt(searchParams.get("first") || "1000", 10);
//   const dao = searchParams.get("dao");

//   if (!proposalId) {
//     return NextResponse.json(
//       { error: "Missing proposalId parameter" },
//       {
//         status: 400,
//         headers: {
//           "Cache-Control": "no-store, max-age=0",
//         },
//       }
//     );
//   }

//   try {
//     let result;
//     if (dao === "optimism") {
//       result = await client
//         .query(COMBINED_VOTE_QUERY, { proposalId, blockTimestamp, first })
//         .toPromise();
//     } else {
//       result = await arb_client
//         .query(COMBINED_VOTE_QUERY, { proposalId, blockTimestamp, first })
//         .toPromise();
//     }

//     if (result.error) {
//       console.error("GraphQL query error:", result.error);
//       return NextResponse.json(
//         { error: "An error occurred while fetching data" },
//         {
//           status: 500,
//           headers: {
//             "Cache-Control": "no-store, max-age=0",
//           },
//         }
//       );
//     }

//     return NextResponse.json(
//       {
//         ...result.data,
//         timestamp: new Date().toISOString(),
//       },
//       {
//         headers: {
//           "Cache-Control": "no-store, max-age=0",
//         },
//       }
//     );
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return NextResponse.json(
//       { error: "An unexpected error occurred" },
//       {
//         status: 500,
//         headers: {
//           "Cache-Control": "no-store, max-age=0",
//         },
//       }
//     );
//   }
// }

import { cacheExchange, Client, createClient, fetchExchange, gql } from "urql";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { daoConfigs } from "@/config/daos";

export const runtime = "nodejs";

// Define a type for the DAO-specific query configuration
type DAOQueryConfig = {
  query: string;
  variables?: Record<string, any>;
};

// Extend the daoConfigs type to include optional custom query
interface ExtendedDAOConfig {
  proposalUrl?: string;
  customQuery?: DAOQueryConfig;
}

// Default combined vote query
const COMBINED_VOTE_QUERY = gql`
  query CombinedVoteQuery(
    $proposalId: String!
    $blockTimestamp: String!
    $first: Int!
  ) {
    proposalDailyVoteSummaries(
      orderBy: dayString
      orderDirection: asc
      where: { proposalId: $proposalId }
    ) {
      day
      dayString
      weightFor
      totalVotes
      weightAgainst
      weightAbstain
    }
    voterDetails(
      orderBy: votingPower
      orderDirection: desc
      where: { proposalId: $proposalId }
      first: $first
    ) {
      voter
      support
      votingPower
      transactionHash
    }
  }
`;

// Letsgrow DAO specific query
const LETSGROW_VOTE_QUERY = gql`
  query MyQuery($proposal: String!) {
    submitVotes(where: {proposal: $proposal}) {
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
`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const proposalId = searchParams.get("proposalId");
  const blockTimestamp = searchParams.get("blockTimestamp") || "0";
  const first = parseInt(searchParams.get("first") || "1000", 10);
  const dao = searchParams.get("dao");

  // Type assertion to use extended config
  const currentDAO = dao ? (daoConfigs[dao] as ExtendedDAOConfig) : null;

  // Determine which client and query to use
  const clientUrl = currentDAO?.proposalUrl || "";
  
  const client = createClient({
    url: clientUrl,
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_THEGRAPH_API_KEY}`,
      },
    },
    exchanges: [fetchExchange],
  });

  if (!proposalId) {
    return NextResponse.json(
      { error: "Missing proposalId parameter" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  try {
    let result;
    
    // Check if it's Letsgrow DAO with a custom query
    if (dao === "letsgrowdao") {
      const voterlist = await client.query(LETSGROW_VOTE_QUERY, { 
        proposal: proposalId 
      }).toPromise();
      const formattedVoterList = voterlist.data.submitVotes.map((vote:any) => ({
        support: vote.approved ? 1 : 0, // Assuming 'approved' represents support (true/false)
        transactionHash: vote.transactionHash,
        voter: vote.member, // Using 'voter' instead of 'member'
        votingPower: vote.balance, // Assuming 'balance' represents voting power
      }));
      

      const weightFor = formattedVoterList
      .filter((vote:any) => vote.support === 1)
      .reduce((sum:any, vote:any) => sum + Number(vote.votingPower) / 10 ** 18, 0);
    
    const weightAgainst = formattedVoterList
      .filter((vote:any) => vote.support === 0)
      .reduce((sum:any, vote:any) => sum + Number(vote.votingPower) / 10 ** 18, 0);
    
  const totalVotes = formattedVoterList.length;

  result = {
    voterDetails: formattedVoterList,
    proposalDailyVoteSummaries: [
      {
        weightFor: weightFor.toString()*10**18, // Convert BigInt to string for JSON compatibility
        weightAgainst: weightAgainst.toString()*10**18,
        weightAbstain: (0 * 10**18).toString(),
        totalVotes,
        quorum : 10,
      },
    ],
  };      console.log(result,"result");
    } else {
      // Use default combined vote query for other DAOs
      result = await client.query(COMBINED_VOTE_QUERY, {
        proposalId,
        blockTimestamp,
        first
      }).toPromise();
      result = result.data;
      console.log(result,"result");
    }
    if (result.error) {
      console.error("GraphQL query error:", result.error);
      return NextResponse.json(
        { error: "An error occurred while fetching data" },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    return NextResponse.json(
      {
        ...result,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}