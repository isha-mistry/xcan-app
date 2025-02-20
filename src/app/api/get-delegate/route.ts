// import { NextRequest, NextResponse } from "next/server";
// import { Client, cacheExchange, fetchExchange, gql } from "urql";
// export const revalidate = 0;

// const op_client = new Client({
//   url: "https://api.studio.thegraph.com/query/68573/op/v0.0.9",
//   exchanges: [cacheExchange, fetchExchange],
// });

// const arb_client = new Client({
//   url: "https://api.studio.thegraph.com/query/68573/arb_token/v0.0.3",
//   exchanges: [cacheExchange, fetchExchange],
// });

// // Default sorted query by balance
// const DELEGATE_QUERY = gql`
//   query MyQuery($first: Int!, $skip: Int!) {
//     delegates(
//       orderBy: latestBalance
//       orderDirection: desc
//       first: $first
//       skip: $skip
//     ) {
//       latestBalance
//       id
//       blockTimestamp
//     }
//   }
// `;

// // Query sorted by delegator count
// const DELEGATE_MOST_DELEGATORS_QUERY = gql`
//   query MyQuery($first: Int!, $skip: Int!) {
//     delegates(
//       orderBy: delegatedFromCount
//       orderDirection: desc
//       first: $first
//       skip: $skip
//     ) {
//       latestBalance
//       id
//       blockTimestamp
//       delegatedFromCount
//     }
//   }
// `;

// // Random query without ordering
// const DELEGATE_RANDOM_QUERY = gql`
//   query MyQuery($first: Int!, $skip: Int!) {
//     delegates(
//       first: $first
//       skip: $skip
//     ) {
//       latestBalance
//       id
//       blockTimestamp
//     }
//   }
// `;

// export const GET = async (req: NextRequest) => {
//   try {
//     const { searchParams } = new URL(req.url);
//     const dao = searchParams.get("dao");
//     const skip = parseInt(searchParams.get("skip") || "0", 0);
//     const sort = searchParams.get("sort") || "default";
//     const UNIQUE_DELEGATES_COUNT = 20;
//     const FETCH_SIZE = 1000;
//     let uniqueDelegates = new Map();
//     let hasMore = true;
//     let newSkip = skip;
//     let skipCount = 0;

//     // Select query based on sort parameter
//     let query;
//     switch (sort) {
//       case "random":
//         query = DELEGATE_RANDOM_QUERY;
//         break;
//       case "most-delegators":
//         query = DELEGATE_MOST_DELEGATORS_QUERY;
//         break;
//       default:
//         query = DELEGATE_QUERY;
//     }

//     while (uniqueDelegates.size < UNIQUE_DELEGATES_COUNT && hasMore) {
//       let data;
//       if (dao === "optimism") {
//         data = await op_client
//           .query(query, { first: FETCH_SIZE, skip: newSkip })
//           .toPromise();
//       } else {
//         data = await arb_client
//           .query(query, { first: FETCH_SIZE, skip: newSkip })
//           .toPromise();
//       }
//       const delegateChangeds = data?.data?.delegates;
//       if (delegateChangeds.length < FETCH_SIZE) {
//         hasMore = false;
//       }

//       for (const change of delegateChangeds) {
//         const { id, blockTimestamp, latestBalance, delegatedFromCount } = change;
//         if (
//           !uniqueDelegates.has(id) ||
//           blockTimestamp > uniqueDelegates.get(id).blockTimestamp
//         ) {
//           uniqueDelegates.set(id, { 
//             blockTimestamp, 
//             latestBalance, 
//             delegatedFromCount 
//           });
//         }
//         skipCount++;
//         if (uniqueDelegates.size >= UNIQUE_DELEGATES_COUNT) {
//           break;
//         }
//       }
//       newSkip += skipCount;
//     }

//     // Remove wrong address
//     const wrongAddress = "0x00000000000000000000000000000000000a4b86";
//     uniqueDelegates.delete(wrongAddress);

//     // Convert to array and apply random sorting if needed
//     let result = Array.from(uniqueDelegates, ([delegate, data]) => ({
//       delegate,
//       ...data,
//     })).slice(0, UNIQUE_DELEGATES_COUNT);

//     // Shuffle array if random sort is selected
//     if (sort === "random") {
//       result = result
//         .map(value => ({ value, sort: Math.random() }))
//         .sort((a, b) => a.sort - b.sort)
//         .map(({ value }) => value);
//     }

//     return NextResponse.json({
//       delegates: result,
//       nextSkip: newSkip,
//       hasMore,
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "An error occurred." }, { status: 500 });
//   }
// };



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
        blockTimestamp
      }
    }
  `,
  "most-delegators": gql`
    query MyQuery($first: Int!, $skip: Int!) {
      delegates(orderBy: delegatedFromCount, orderDirection: desc, first: $first, skip: $skip) {
        latestBalance
        id
        blockTimestamp
        delegatedFromCount
      }
    }
  `,
  random: gql`
    query MyQuery($first: Int!, $skip: Int!) {
      delegates(first: $first, skip: $skip) {
        latestBalance
        id
        blockTimestamp
      }
    }
  `} as any;

// const daoConfigs: { [key: string]: DaoConfig } = {
//   optimism: {
//     url: "https://api.studio.thegraph.com/query/68573/op/v0.0.9",
//     excludeAddresses: ["0x00000000000000000000000000000000000a4b86"],
//     queries: {
//       default: gql`
//         query MyQuery($first: Int!, $skip: Int!) {
//           delegates(orderBy: latestBalance, orderDirection: desc, first: $first, skip: $skip) {
//             latestBalance
//             id
//             blockTimestamp
//           }
//         }
//       `,
//       "most-delegators": gql`
//         query MyQuery($first: Int!, $skip: Int!) {
//           delegates(orderBy: delegatedFromCount, orderDirection: desc, first: $first, skip: $skip) {
//             latestBalance
//             id
//             blockTimestamp
//             delegatedFromCount
//           }
//         }
//       `,
//       random: gql`
//         query MyQuery($first: Int!, $skip: Int!) {
//           delegates(first: $first, skip: $skip) {
//             latestBalance
//             id
//             blockTimestamp
//           }
//         }
//       `
//     }
//   },
//   arbitrum: {
//     url: "https://api.studio.thegraph.com/query/68573/arb_token/v0.0.3",
//     queries: {
//       default: gql`
//         query MyQuery($first: Int!, $skip: Int!) {
//           delegates(orderBy: latestBalance, orderDirection: desc, first: $first, skip: $skip) {
//             latestBalance
//             id
//             blockTimestamp
//           }
//         }
//       `,
//       "most-delegators": gql`
//         query MyQuery($first: Int!, $skip: Int!) {
//           delegates(orderBy: delegatedFromCount, orderDirection: desc, first: $first, skip: $skip) {
//             latestBalance
//             id
//             blockTimestamp
//             delegatedFromCount
//           }
//         }
//       `,
//       random: gql`
//         query MyQuery($first: Int!, $skip: Int!) {
//           delegates(first: $first, skip: $skip) {
//             latestBalance
//             id
//             blockTimestamp
//           }
//         }
//       `
//     }
//   },
//   mantle: {
//     url: "https://api.studio.thegraph.com/query/68573/arb_token/v0.0.3",
//     queries: {
//       default: gql`
//         query MyQuery($first: Int!, $skip: Int!) {
//           delegates(orderBy: latestBalance, orderDirection: desc, first: $first, skip: $skip) {
//             latestBalance
//             id
//             blockTimestamp
//           }
//         }
//       `,
//       "most-delegators": gql`
//         query MyQuery($first: Int!, $skip: Int!) {
//           delegates(orderBy: delegatedFromCount, orderDirection: desc, first: $first, skip: $skip) {
//             latestBalance
//             id
//             blockTimestamp
//             delegatedFromCount
//           }
//         }
//       `,
//       random: gql`
//         query MyQuery($first: Int!, $skip: Int!) {
//           delegates(first: $first, skip: $skip) {
//             latestBalance
//             id
//             blockTimestamp
//           }
//         }
//       `
//     }
//   }
// };

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
  if (!response.ok) throw new Error('Failed to fetch API delegates');
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

// async function fetchDelegates(
//   client: Client,
//   query: string,
//   first: number,
//   skip: number
// ): Promise<any> {
//   const result = await client.query(query, { first, skip }).toPromise();
//   if (result.error) throw result.error;
//   return result.data.delegates;
// }

// export const GET = async (req: NextRequest) => {
//   try {
//     const { searchParams } = new URL(req.url);
//     const dao = searchParams.get("dao");
//     const skip = parseInt(searchParams.get("skip") || "0", 0);
//     const sort = searchParams.get("sort") || "default";
//     const UNIQUE_DELEGATES_COUNT = 20;
//     const FETCH_SIZE = 1000;

//     if (!dao || !daoConfigs[dao]) {
//       return NextResponse.json(
//         { error: "Invalid DAO", available: Object.keys(daoConfigs) },
//         { status: 400 }
//       );
//     }

//     const config = daoConfigs[dao];
//     const client = getClient(dao);
//     const query = config.queries[sort];

//     if (!query) {
//       return NextResponse.json(
//         { error: "Invalid sort option", available: Object.keys(config.queries) },
//         { status: 400 }
//       );
//     }

//     let uniqueDelegates = new Map();
//     let hasMore = true;
//     let newSkip = skip;
//     let skipCount = 0;

//     while (uniqueDelegates.size < UNIQUE_DELEGATES_COUNT && hasMore) {
//       const delegateChangeds = await fetchDelegates(client, query, FETCH_SIZE, newSkip);
      
//       if (delegateChangeds.length < FETCH_SIZE) hasMore = false;

//       for (const change of delegateChangeds) {
//         const { id, blockTimestamp, latestBalance, delegatedFromCount } = change;
        
//         if (config.excludeAddresses?.includes(id)) continue;
        
//         if (!uniqueDelegates.has(id) || 
//             blockTimestamp > uniqueDelegates.get(id).blockTimestamp) {
//           uniqueDelegates.set(id, { blockTimestamp, latestBalance, delegatedFromCount });
//         }
        
//         skipCount++;
//         if (uniqueDelegates.size >= UNIQUE_DELEGATES_COUNT) break;
//       }
//       newSkip += skipCount;
//     }

//     let result = Array.from(uniqueDelegates, ([delegate, data]) => ({
//       delegate,
//       ...data,
//     })).slice(0, UNIQUE_DELEGATES_COUNT);

//     if (sort === "random") {
//       result = result
//         .map(value => ({ value, sort: Math.random() }))
//         .sort((a, b) => a.sort - b.sort)
//         .map(({ value }) => value);
//     }

//     return NextResponse.json({
//       delegates: result,
//       nextSkip: newSkip,
//       hasMore,
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "An error occurred." }, { status: 500 });
//   }
// };

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const dao = searchParams.get("dao");
    const skip = parseInt(searchParams.get("skip") || "0", 0);
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
    if (config.type === 'api') {
      const result = await fetchAPIDelegates(
        config.dataSource.delegateEndpoint,
        sort,
        skip,
        UNIQUE_DELEGATES_COUNT
      );
      return NextResponse.json(result);
    }

    // Handle Subgraph-based DAOs
    const query = DELEGATE_QUERIES[sort];
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
    let skipCount = 0;

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
        const { id, blockTimestamp, latestBalance, delegatedFromCount } = change;
        
        if (!uniqueDelegates.has(id) || 
            blockTimestamp > uniqueDelegates.get(id).blockTimestamp) {
          uniqueDelegates.set(id, { blockTimestamp, latestBalance, delegatedFromCount });
        }
        
        skipCount++;
        if (uniqueDelegates.size >= UNIQUE_DELEGATES_COUNT) break;
      }
      newSkip += skipCount;
    }

    let result = Array.from(uniqueDelegates, ([delegate, data]) => ({
      delegate,
      ...data,
    })).slice(0, UNIQUE_DELEGATES_COUNT);

    if (sort === "random") {
      result = result
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    }

    console.log('Line 516:',result);

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