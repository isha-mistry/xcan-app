// import { Client, cacheExchange, fetchExchange, gql } from 'urql';
// import type { NextRequest } from 'next/server';
// import { NextResponse } from 'next/server';

// const client = new Client({
//   url: 'https://api.studio.thegraph.com/query/68573/v6_proxy/version/latest',
//   exchanges: [cacheExchange, fetchExchange],
// });
// const arb_client = new Client({
//   url:'https://api.studio.thegraph.com/query/68573/arbitrum_proposals/v0.0.4',
//   exchanges: [cacheExchange,fetchExchange],
// });

// const GET_CANCELED_PROPOSALS = gql`
//   query GetCanceledProposals($first: Int!, $skip: Int!) {
//     proposalCanceleds(orderBy: blockTimestamp, orderDirection: desc, first: $first, skip: $skip) {
//       proposalId
//       blockTimestamp
//     }
//   }
// `;

// async function fetchAllProposals(first: number, skip: number, accumulatedResults: any[] = [],dao:any): Promise<any[]> {
//   let result;
//   if(dao === 'arbitrum'){
//      result = await arb_client.query(GET_CANCELED_PROPOSALS, { first, skip }).toPromise();
//   }else{
//      console.log("here it come!");
//      result = await client.query(GET_CANCELED_PROPOSALS, { first, skip }).toPromise();
//   }

//   if (result.error) {
//     throw new Error(result.error.message);
//   }

//   const newResults = result.data.proposalCanceleds;
//   accumulatedResults.push(...newResults);

//   // If no new results are returned, we have fetched all data
//   if (newResults.length === 0) {
//     return accumulatedResults;
//   }

//   // Otherwise, continue fetching
//   return fetchAllProposals(first, skip + first, accumulatedResults,dao);
// }

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const dao = searchParams.get('dao');
//   console.log("Line 52:",dao);
//   try {
//     const first = 100; // You can adjust this value based on the API's limit
//     const skip = 0;

//     const allProposals = await fetchAllProposals(first, skip,[],dao);

//     return NextResponse.json(allProposals);
//   } catch (error) {
//     console.error('Unexpected error:', error);
//     return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
//   }
// }


// // app/api/proposals/route.ts
// import { Client, cacheExchange, fetchExchange, gql } from 'urql';
// import type { NextRequest } from 'next/server';
// import { NextResponse } from 'next/server';

// // Define the base query template that's common across DAOs
// const BASE_PROPOSAL_QUERY = gql`
//   query GetCanceledProposals($first: Int!, $skip: Int!) {
//     proposalCanceleds(orderBy: blockTimestamp, orderDirection: desc, first: $first, skip: $skip) {
//       proposalId
//       blockTimestamp
//     }
//   }
// `;

// // DAO Configuration type
// type DAOConfig = {
//   url: string;
//   query?: any; // Optional custom query if different from BASE_PROPOSAL_QUERY
// };

// // Configure all DAOs in one place
// const daoConfigs: { [key: string]: DAOConfig } = {
//   arbitrum: {
//     url: 'https://api.studio.thegraph.com/query/68573/arbitrum_proposals/v0.0.4'
//   },
//   optimism: {
//     url: 'https://api.studio.thegraph.com/query/68573/v6_proxy/version/latest'
//   },
//   starknet: {
//     url: 'https://api.studio.thegraph.com/query/YOUR_STARKNET_ENDPOINT'
//   },
//   mantle: {
//     url: 'https://api.studio.thegraph.com/query/YOUR_MANTLE_ENDPOINT'
//   },
//   // Add more DAOs here
//   near: {
//     url: 'https://api.studio.thegraph.com/query/YOUR_NEAR_ENDPOINT',
//     // Example of custom query if NEAR has different structure
//     query: gql`
//       query GetCanceledProposals($first: Int!, $skip: Int!) {
//         proposalCanceleds(
//           orderBy: blockTimestamp
//           orderDirection: desc
//           first: $first
//           skip: $skip
//         ) {
//           proposalId
//           blockTimestamp
//           # Add any NEAR-specific fields
//         }
//       }
//     `
//   }
// };

// // Create client for a specific DAO
// function createDAOClient(daoName: string): Client {
//   const config = daoConfigs[daoName];
//   if (!config) {
//     throw new Error(`DAO "${daoName}" not configured`);
//   }

//   return new Client({
//     url: config.url,
//     exchanges: [cacheExchange, fetchExchange]
//   });
// }

// // Fetch proposals for a specific DAO
// async function fetchProposals(
//   daoName: string,
//   first: number,
//   skip: number,
//   accumulatedResults: any[] = []
// ): Promise<any[]> {
//   // Get DAO configuration
//   const config = daoConfigs[daoName];
//   if (!config) {
//     throw new Error(`DAO "${daoName}" not configured`);
//   }

//   // Create client
//   const client = createDAOClient(daoName);

//   // Use custom query if provided, otherwise use base query
//   const query = BASE_PROPOSAL_QUERY;

//   // Fetch data
//   const result = await client.query(query, { first, skip }).toPromise();

//   if (result.error) {
//     throw new Error(result.error.message);
//   }

//   const newResults = result.data.proposalCanceleds;
//   accumulatedResults.push(...newResults);

//   // If no new results, return accumulated results
//   if (newResults.length === 0) {
//     return accumulatedResults;
//   }

//   // Continue fetching
//   return fetchProposals(daoName, first, skip + first, accumulatedResults);
// }

// // API Route handler
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const dao = searchParams.get('dao');
//   console.log("Line 177:",dao);

//   if (!dao) {
//     return NextResponse.json(
//       { error: 'DAO parameter is required' },
//       { status: 400 }
//     );
//   }

//   if (!daoConfigs[dao]) {
//     return NextResponse.json(
//       { error: `DAO "${dao}" not supported. Available DAOs: ${Object.keys(daoConfigs).join(', ')}` },
//       { status: 400 }
//     );
//   }

//   try {
//     const allProposals = await fetchProposals(dao, 100, 0);
//     return NextResponse.json(allProposals);
//   } catch (error) {
//     console.error('Unexpected error:', error);
//     return NextResponse.json(
//       { error: 'An unexpected error occurred' },
//       { status: 500 }
//     );
//   }
// }


import { Client, cacheExchange, fetchExchange, gql } from 'urql';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BASE_PROPOSAL_QUERY = gql`
  query GetCanceledProposals($first: Int!, $skip: Int!) {
    proposalCanceleds(orderBy: blockTimestamp, orderDirection: desc, first: $first, skip: $skip) {
      proposalId
      blockTimestamp
    }
  }
`;

type DAOConfig = {
  url: string;
  query?: any;
};

const DEFAULT_ENDPOINT = 'https://api.studio.thegraph.com/query/68573/v6_proxy/version/latest';

const daoConfigs: { [key: string]: DAOConfig } = {
  arbitrum: {
    url: 'https://api.studio.thegraph.com/query/68573/arbitrum_proposals/v0.0.4'
  },
  optimism: {
    url: DEFAULT_ENDPOINT
  },
  mantle: {
    url: 'https://api.studio.thegraph.com/query/68573/v6_proxy/version/latest'
  },
};

function createDAOClient(url: string): Client {
  return new Client({
    url,
    exchanges: [cacheExchange, fetchExchange]
  });
}

async function fetchProposals(
  url: string,
  first: number,
  skip: number,
  accumulatedResults: any[] = []
): Promise<any[]> {
  const client = createDAOClient(url);
  const result = await client.query(BASE_PROPOSAL_QUERY, { first, skip }).toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  const newResults = result.data.proposalCanceleds;
  accumulatedResults.push(...newResults);

  if (newResults.length === 0) {
    return accumulatedResults;
  }

  return fetchProposals(url, first, skip + first, accumulatedResults);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dao = searchParams.get('dao');

  try {
    const url = dao ? daoConfigs[dao]?.url : DEFAULT_ENDPOINT;
    
    if (dao && !url) {
      return NextResponse.json(
        { error: `DAO "${dao}" not supported. Available DAOs: ${Object.keys(daoConfigs).join(', ')}` },
        { status: 400 }
      );
    }

    const allProposals = await fetchProposals(url || DEFAULT_ENDPOINT, 100, 0);
    return NextResponse.json(allProposals);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}