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



import { Client, fetchExchange, gql } from "urql";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const client = new Client({
  url: process.env.NEXT_PUBLIC_OPTIMISM_PROPOSALS_GRAPH_URL|| "https://api.studio.thegraph.com/query/95484/optimismproposals/version/latest",
  exchanges: [fetchExchange],
});

const arb_client = new Client({
  url:process.env.NEXT_PUBLIC_ARBITRUM_PROPOSALS_GRAPH_URL|| "https://api.studio.thegraph.com/query/95484/arbitrumproposals/version/latest",
  exchanges: [fetchExchange],
});

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
`;export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const proposalId = searchParams.get("proposalId");
  const blockTimestamp = searchParams.get("blockTimestamp") || "0";
  const first = parseInt(searchParams.get("first") || "1000", 10);
  const dao = searchParams.get("dao");

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
    if (dao === "optimism") {
      result = await client
        .query(COMBINED_VOTE_QUERY, { proposalId, blockTimestamp, first })
        .toPromise();
    } else {
      result = await arb_client
        .query(COMBINED_VOTE_QUERY, { proposalId, blockTimestamp, first })
        .toPromise();
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
        ...result.data,
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