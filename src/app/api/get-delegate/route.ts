import { NextRequest, NextResponse } from "next/server";
import { Client, cacheExchange, fetchExchange, gql } from "urql";
export const revalidate = 0;

const op_client = new Client({
  url: "https://api.studio.thegraph.com/query/68573/op/v0.0.9",
  exchanges: [cacheExchange, fetchExchange],
});

const arb_client = new Client({
  url: "https://api.studio.thegraph.com/query/68573/arb_token/v0.0.3",
  exchanges: [cacheExchange, fetchExchange],
});

// Default sorted query by balance
const DELEGATE_QUERY = gql`
  query MyQuery($first: Int!, $skip: Int!) {
    delegates(
      orderBy: latestBalance
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      latestBalance
      id
      blockTimestamp
    }
  }
`;

// Query sorted by delegator count
const DELEGATE_MOST_DELEGATORS_QUERY = gql`
  query MyQuery($first: Int!, $skip: Int!) {
    delegates(
      orderBy: delegatedFromCount
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      latestBalance
      id
      blockTimestamp
      delegatedFromCount
    }
  }
`;

// Random query without ordering
const DELEGATE_RANDOM_QUERY = gql`
  query MyQuery($first: Int!, $skip: Int!) {
    delegates(
      first: $first
      skip: $skip
    ) {
      latestBalance
      id
      blockTimestamp
    }
  }
`;

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const dao = searchParams.get("dao");
    const skip = parseInt(searchParams.get("skip") || "0", 0);
    const sort = searchParams.get("sort") || "default";
    const UNIQUE_DELEGATES_COUNT = 20;
    const FETCH_SIZE = 1000;
    let uniqueDelegates = new Map();
    let hasMore = true;
    let newSkip = skip;
    let skipCount = 0;

    // Select query based on sort parameter
    let query;
    switch (sort) {
      case "random":
        query = DELEGATE_RANDOM_QUERY;
        break;
      case "most-delegators":
        query = DELEGATE_MOST_DELEGATORS_QUERY;
        break;
      default:
        query = DELEGATE_QUERY;
    }

    while (uniqueDelegates.size < UNIQUE_DELEGATES_COUNT && hasMore) {
      let data;
      if (dao === "optimism") {
        data = await op_client
          .query(query, { first: FETCH_SIZE, skip: newSkip })
          .toPromise();
      } else {
        data = await arb_client
          .query(query, { first: FETCH_SIZE, skip: newSkip })
          .toPromise();
      }
      const delegateChangeds = data?.data?.delegates;
      if (delegateChangeds.length < FETCH_SIZE) {
        hasMore = false;
      }

      for (const change of delegateChangeds) {
        const { id, blockTimestamp, latestBalance, delegatedFromCount } = change;
        if (
          !uniqueDelegates.has(id) ||
          blockTimestamp > uniqueDelegates.get(id).blockTimestamp
        ) {
          uniqueDelegates.set(id, { 
            blockTimestamp, 
            latestBalance, 
            delegatedFromCount 
          });
        }
        skipCount++;
        if (uniqueDelegates.size >= UNIQUE_DELEGATES_COUNT) {
          break;
        }
      }
      newSkip += skipCount;
    }

    // Remove wrong address
    const wrongAddress = "0x00000000000000000000000000000000000a4b86";
    uniqueDelegates.delete(wrongAddress);

    // Convert to array and apply random sorting if needed
    let result = Array.from(uniqueDelegates, ([delegate, data]) => ({
      delegate,
      ...data,
    })).slice(0, UNIQUE_DELEGATES_COUNT);

    // Shuffle array if random sort is selected
    if (sort === "random") {
      result = result
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    }

    return NextResponse.json({
      delegates: result,
      nextSkip: newSkip,
      hasMore,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
};