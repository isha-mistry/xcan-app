import { daoConfigs } from "@/config/daos";
import { NextRequest, NextResponse } from "next/server";
import { Client, cacheExchange, fetchExchange, gql } from "urql";

export const revalidate = 0;

const DELEGATE_QUERIES = {
  default: gql`
    query MyQuery($first: Int!, $skip: Int!) {
      delegates(orderBy: latestBalance, orderDirection: desc, first: $first, skip: $skip) {
        latestBalance
        id
      }
    }
  `,
  "most-delegators": gql`
    query MyQuery($first: Int!, $skip: Int!) {
      delegates(orderBy: delegatedFromCount, orderDirection: desc, first: $first, skip: $skip) {
        latestBalance
        id
        delegatedFromCount
      }
    }
  `,
  random: gql`
    query MyQuery($first: Int!, $skip: Int!) {
      delegates(first: $first, skip: $skip) {
        latestBalance
        id
      }
    }
  `,
} as any;

async function fetchSubgraphDelegates(
  client: Client,
  query: string,
  first: number,
  skip: number,
  excludeAddresses?: string[]
): Promise<any> {
  const result = await client.query(query, { first, skip }).toPromise();
  if (result.error) throw result.error;

  let delegates = result.data.delegates;
  if (excludeAddresses?.length) {
    delegates = delegates.filter((d: any) => !excludeAddresses.includes(d.id));
  }

  return delegates;
}

async function fetchAPIDelegates(
  endpoint: string,
  sort: string,
  skip: number,
  first: number
): Promise<any> {
  const response = await fetch(
    `${endpoint}?sort=${sort}&skip=${skip}&limit=${first}`
  );
  if (!response.ok) throw new Error("Failed to fetch API delegates");
  return response.json();
}

const clientCache: { [key: string]: Client } = {};

function getClient(daoName: string): Client {
  if (!clientCache[daoName]) {
    const config = daoConfigs[daoName];
    if (!config) throw new Error(`DAO "${daoName}" not configured`);

    clientCache[daoName] = new Client({
      url: config.subgraphUrl as string,
      exchanges: [cacheExchange, fetchExchange],
    });
  }
  return clientCache[daoName];
}

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const dao = searchParams.get("dao");
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const sort = searchParams.get("sort") || "default";
    const UNIQUE_DELEGATES_COUNT = 20;
    const FETCH_SIZE = 1000;

    if (!dao || !daoConfigs[dao]) {
      return NextResponse.json(
        { error: "Invalid DAO", available: Object.keys(daoConfigs) },
        { status: 400 }
      );
    }

    const config = daoConfigs[dao];

    // Handle API-based DAOs
    if (config.type === "api") {
      const result = await fetchAPIDelegates(
        config.dataSource.delegateEndpoint,
        sort,
        skip,
        UNIQUE_DELEGATES_COUNT
      );
      return NextResponse.json(result);
    }

    // Handle Subgraph-based DAOs
    const query = DELEGATE_QUERIES[sort || "default"];
    if (!query) {
      return NextResponse.json(
        { error: "Invalid sort option", available: Object.keys(DELEGATE_QUERIES) },
        { status: 400 }
      );
    }

    const client = getClient(dao);
    let uniqueDelegates = new Map();
    let hasMore = true;
    let newSkip = skip;

    while (uniqueDelegates.size < UNIQUE_DELEGATES_COUNT && hasMore) {
      const delegateChangeds = await fetchSubgraphDelegates(
        client,
        query,
        FETCH_SIZE,
        newSkip,
        config.excludeAddresses
      );

      if (delegateChangeds.length < FETCH_SIZE) hasMore = false;

      for (const change of delegateChangeds) {
        const { id, latestBalance, delegatedFromCount } = change;
    
        if (!uniqueDelegates.has(id)) {
          uniqueDelegates.set(id, { 
            balance: latestBalance, 
            ...(delegatedFromCount !== undefined && { delegatedFromCount }) 
          });
        }
    
        if (uniqueDelegates.size >= UNIQUE_DELEGATES_COUNT) break;
      }

      newSkip += delegateChangeds.length;
    }

    let result = Array.from(uniqueDelegates.entries()).map(([delegate, data]) => ({
      delegate,
      ...data,
    }));

    // Ensure result is always an array
    if (!Array.isArray(result)) {
      console.error("Error: result is not an array!", result);
      result = [];
    }

    result = result.slice(0, UNIQUE_DELEGATES_COUNT);

    // Random sorting if requested
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