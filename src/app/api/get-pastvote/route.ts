import { cacheExchange, createClient, fetchExchange, gql } from "urql/core";
import { NextResponse } from "next/server";

const op_client = createClient({
    url: process.env.OPTIMISM_PROPOSALS_GRAPH_URL!,
    exchanges: [cacheExchange, fetchExchange],
});

const arb_client = createClient({
    url: process.env.NEXT_PUBLIC_ARBITRUM_PROPOSALS_GRAPH_URL!,
    exchanges: [cacheExchange, fetchExchange],
});

// Keep your existing GraphQL queries
const VoterQuery = (first: any, skip: any) => gql`
  query MyQuery($address: String!) {
    voteCasts(
      where: { voter: $address}
      orderDirection: desc
      orderBy: blockTimestamp
      first: ${first}
      skip: ${skip}
    ) {
      proposalId
      reason
      support
      weight
      transactionHash
      blockTimestamp
    }
  
    voteCastWithParams_collection(
      where: {voter: $address}
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      proposalId
      reason
      support
      weight
      transactionHash
      blockTimestamp
      params
    }
  }
  `;
const opDescription = gql`
  query MyDescriptionQuery($proposalId: String!) {
    proposalCreated1S(where: { proposalId: $proposalId }) {
      description
    }
    proposalCreated2S(where: { proposalId: $proposalId }) {
      description
    }
    proposalCreated3S(where: { proposalId: $proposalId }) {
      description
    }
    proposalCreateds(where: { proposalId: $proposalId }) {
      description
    }
  }
`;
const arbDescription = gql`
  query MyQuery($proposalId: String!) {
    proposalCreateds(
      where: { proposalId: $proposalId }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      description
    }
  }
`;
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const daoName = searchParams.get('daoName');
        const address = searchParams.get('address');
        const first = parseInt(searchParams.get('first') || '1000');
        const skip = parseInt(searchParams.get('skip') || '0');

        if (!daoName || !address) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        let proposalIdsResult: any;
        if (daoName === "optimism") {
            proposalIdsResult = await op_client.query(VoterQuery(first, skip), {
                address: address,
            });
        } else if (daoName === "arbitrum") {
            proposalIdsResult = await arb_client.query(VoterQuery(first, skip), {
                address: address,
            });
        } else {
            return NextResponse.json(
                { error: "Invalid daoName parameter" },
                { status: 400 }
            );
        }

        const voteCasts = proposalIdsResult.data.voteCasts || [];
        const voteCastWithParamsCollection =
            proposalIdsResult.data.voteCastWithParams_collection || [];

        const combinedData = [...voteCasts, ...voteCastWithParamsCollection];
        combinedData.sort((a: any, b: any) => b.blockTimestamp - a.blockTimestamp);

        const proposalIds = combinedData.map((voteCast: any) => voteCast);

        let descriptionsResults: any = [];
        if (daoName === "optimism") {
            for (const proposalId of proposalIds) {
                try {
                    const result = await op_client.query(opDescription, {
                        proposalId: proposalId.proposalId.toString()
                    }).toPromise();

                    if (result?.data) {
                        // Check each array in the response
                        const description = result.data.proposalCreated1S?.[0]?.description ||
                            result.data.proposalCreated2S?.[0]?.description ||
                            result.data.proposalCreated3S?.[0]?.description ||
                            result.data.proposalCreateds?.[0]?.description;

                        if (description) {
                            descriptionsResults.push({
                                proposalId: proposalId,
                                proposal: { description },
                                support: proposalId.support
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching description for proposal ${proposalId.proposalId}:`, error);
                    // Continue with next proposal instead of failing completely
                    continue;
                }
            }
        } else if (daoName === "arbitrum") {
            for (const proposalId of proposalIds) {
                try {
                    const result = await arb_client.query(arbDescription, {
                        proposalId: proposalId.proposalId.toString()
                    }).toPromise();

                    if (result?.data?.proposalCreateds?.[0]?.description) {
                        descriptionsResults.push({
                            proposalId: proposalId,
                            proposal: {
                                description: result.data.proposalCreateds[0].description
                            },
                            support: proposalId.support
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching description for proposal ${proposalId.proposalId}:`, error);
                    // Continue with next proposal instead of failing completely
                    continue;
                }
            }
        }
        // console.log('for op ....',descriptionsResults)
        const FinalResult = descriptionsResults.filter((item: any) =>
            item &&
            item.proposal &&
            item.proposal.description &&
            item.proposal.description.length > 0
        );
        return NextResponse.json(FinalResult);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
