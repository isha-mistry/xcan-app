import type { NextRequest } from "next/server";
import { connectDB } from "@/config/connectDB";
import { nft_client } from "@/config/staticDataUtils";
const GET_CLAIMED_NFTS = `
  query GetClaimedNFTs($addresses: [String!]!) {
    token1155Holders(where: {user_in: $addresses}) {
      user
      balance
    }
  }
`;
async function getClaimedNFTs(addresses: string[]): Promise<Record<string, number>> {
  const result = await nft_client.query(GET_CLAIMED_NFTS, { addresses }).toPromise();
  
  if (result.error) {
    throw new Error(`GraphQL query failed: ${result.error.message}`);
  }

  return result.data.token1155Holders.reduce((acc: Record<string, number>, holder: { user: string, balance: string }) => {
    const user = holder.user.toLowerCase();
    const balance = parseInt(holder.balance, 10);
    
    // If the user already exists in the accumulator, sum the balance, otherwise set it
    acc[user] = (acc[user] || 0) + balance;

    return acc;
  }, {});
}

// Function to calculate CC_SCORE
function calculateCCScore(data: any[]) {

    // Logarithmic Scaling with Normalization
    const logScaleNormalized = (value:number, maxValue:number, base = 10) => {
      if (value <= 0) return 0;
      return (Math.log(value + 1) / Math.log(maxValue + 1)) * 100;
    };
  
  // Define weights
  const SESSION_TAKEN_WEIGHT = 0.3;
  const NFT_CLAIMED_WEIGHT = 0.3;
  const VIEWS_SESSION_WEIGHT = 0.2;
  const RATING_WEIGHT = 0.2;

  // Find Max Values for Normalization
  const maxValues = {
    sessions: Math.max(...data.map(d => d.sessionCount), 1), 
    nfts: Math.max(...data.map(d => d.ClaimedNFT), 1),
    views: Math.max(...data.map(d => d.totalViews), 1),
    ratings: 5  // Since max rating is 5.0
  };

  // Process records and calculate scores
  return data.map((item) => {

     // Compute individual scores
     const sessionsScore = logScaleNormalized(item.sessionCount, maxValues.sessions);
     const nftsScore = logScaleNormalized(item.ClaimedNFT || 0, maxValues.nfts);
     const viewsScore = logScaleNormalized(item.totalViews, maxValues.views);
     const ratingsScore = logScaleNormalized(item.averageRating || 0, maxValues.ratings);
 
     // Compute final weighted score
     const weightedScore = 
       (sessionsScore * SESSION_TAKEN_WEIGHT) +
       (nftsScore * NFT_CLAIMED_WEIGHT) +
       (viewsScore * VIEWS_SESSION_WEIGHT) +
       (ratingsScore * RATING_WEIGHT);
 
     // Debug information
    //  const debugInfo = {
    //    sessionsScore: Math.round(sessionsScore),
    //    nftsScore: Math.round(nftsScore),
    //    viewsScore: Math.round(viewsScore),
    //    ratingsScore: Math.round(ratingsScore),
    //    weightedScore: Math.round(weightedScore)
    //  };
 

    // Store the SCORE in the object
    return { ...item, CC_SCORE: Math.round(weightedScore)};
  });
}


export async function GET(req: NextRequest) {
  let client;
  try {
    const dao_name = req.url.split("getleaderboard/")[1];
    client = await connectDB();
    const db = client.db();
    const meetingsCollection = db.collection("meetings");

    const pipeline = [
      {
        $match: {
          dao_name: dao_name,
          meeting_status: { $eq: "Recorded" },
        },
      },
      {
        $group: {
          _id: "$host_address",
          sessionCount: { $sum: 1 },
          ClaimedNFT: { $sum: "$ClaimeddNFT" },
          totalViews: { $sum: "$views" }, // Add this line to sum up the views
        },
      },
      {
        $lookup: {
          from: "feedbacks",
          localField: "_id",
          foreignField: "address",
          as: "feedbackData",
        },
      },
      {
        $unwind: {
          path: "$feedbackData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          delegate_address: "$_id",
          sessionCount: 1,
          ClaimedNFT: 1,
          totalViews: 1, // Include totalViews in the projection
          feedbackReceived: { $ifNull: ["$feedbackData.feedbackReceived", []] },
        },
      },
      {
        $unwind: {
          path: "$feedbackReceived",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$feedbackReceived.ratings",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$delegate_address",
          sessionCount: { $first: "$sessionCount" },
          ClaimedNFT: { $first: "$ClaimedNFT" },
          totalViews: { $first: "$totalViews" }, // Include totalViews
          ratingCount: {
            $sum: {
              $cond: [
                { $ifNull: ["$feedbackReceived.ratings.ratings", false] },
                1,
                0,
              ],
            },
          },
          ratingSum: {
            $sum: { $ifNull: ["$feedbackReceived.ratings.ratings", 0] },
          },
        },
      },
      {
        $project: {
          delegate_address: "$_id",
          sessionCount: 1,
          // ClaimedNFT: 1,
          totalViews: 1, // Include totalViews in the final projection
          ratingCount: 1,
          averageRating: {
            $cond: [
              { $eq: ["$ratingCount", 0] },
              0,
              { $divide: ["$ratingSum", "$ratingCount"] },
            ],
          },
        },
      },
      {
        $sort: { sessionCount: -1 },
      },
    ];

    let result = await meetingsCollection.aggregate(pipeline).toArray();
      // Fetch ClaimedNFT data from subgraph
      const addresses = result.map(item => item.delegate_address);
      const claimedNFTs = await getClaimedNFTs(addresses);

       // Merge ClaimedNFT data with the result
    result = result.map(item => ({
      ...item,
      ClaimedNFT: claimedNFTs[item.delegate_address.toLowerCase()] || 0
    }));

    console.log("Line 195:",result);

    result = calculateCCScore(result);
    // console.log(result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error("Error closing MongoDB client:", closeError);
      }
    }
  }
}
