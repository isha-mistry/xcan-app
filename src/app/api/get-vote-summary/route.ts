import { Client, createClient, fetchExchange, gql } from "urql";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { daoConfigs } from "@/config/daos";

export const runtime = "nodejs";

const op_client = new Client({
  url: 'https://api.studio.thegraph.com/query/68573/v6/version/latest',
  exchanges: [fetchExchange],
});

const arb_client = new Client({
  url: "https://api.studio.thegraph.com/query/68573/arb_proposal/version/latest",
  exchanges: [fetchExchange],
});

const COMBINED_VOTE_QUERY = gql`
 query MyQuery {
  proposalVoteSummaries(orderBy: lastUpdated, orderDirection: desc,first: 1000) {
    id
    lastUpdated
    percentAbstain
    percentAgainst
    percentFor
    proposalId
    totalVotes
    totalWeight
    votesAbstain
    votesAgainst
    votesFor
    weightAbstain
    weightAgainst
    weightFor
  }
}
`;
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

//   const proposalId = searchParams.get("proposalId");
//   const blockTimestamp = searchParams.get("blockTimestamp") || "0";
//   const first = parseInt(searchParams.get("first") || "1000", 10);
  const dao = searchParams.get("dao");

  const currentDAO=dao?daoConfigs[dao]:"";

  const client = createClient({
    url: currentDAO?currentDAO.proposalUrl:"",
    exchanges: [fetchExchange],
  });

  if (!dao) {
    return NextResponse.json(
      { error: "Missing dao parameter" },
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

    result=await client.query(COMBINED_VOTE_QUERY,{}).toPromise();
    // if (dao === "optimism") {
    //   result = await op_client
    //     .query(COMBINED_VOTE_QUERY,{})
    //     .toPromise();
    // } else {
    //   result = await arb_client
    //     .query(COMBINED_VOTE_QUERY, {})
    //     .toPromise();
    // }

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