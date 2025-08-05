import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

export const revalidate = 0;

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Connect to user database
    const userClient = await connectDB();
    const userDb = userClient.db("inorbit_modules");
    const usersCollection = userDb.collection("users");
    const nftsCollection = userDb.collection("minted-nft");

    // Fetch statistics in parallel
    const [
      totalUsers,
      totalNFTs,
      // totalSessions,
      // totalOfficeHours,
      usersWithSocials,
      totalNFTsMinted,
    ] = await Promise.all([
      // Total users
      usersCollection.countDocuments({}),

      // Total NFTs (unique users who have NFTs)
      nftsCollection.countDocuments({ totalMinted: { $gt: 0 } }),

      // Total sessions
      // sessionsCollection.countDocuments({}),

      // Total office hours
      // officeHoursCollection.countDocuments({}),

      // Users with at least one social connected
      usersCollection.countDocuments({
        $or: [
          { "socialHandles.githubUsername": { $exists: true, $ne: "" } },
          { "socialHandles.twitterUsername": { $exists: true, $ne: "" } },
          { "socialHandles.discordUsername": { $exists: true, $ne: "" } },
          { "socialHandles.telegramUsername": { $exists: true, $ne: "" } },
        ],
      }),

      // Total NFTs minted (sum of all minted levels)
      nftsCollection
        .aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: "$totalMinted" },
            },
          },
        ])
        .toArray(),
    ]);

    // Extract total NFTs minted from aggregation result
    const totalMinted =
      totalNFTsMinted.length > 0 ? totalNFTsMinted[0].total : 0;

    // Close database connections
    await userClient.close();

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalNFTs,
        // totalSessions,
        // totalOfficeHours,
        usersWithSocials,
        totalNFTsMinted: totalMinted,
      },
    });
  } catch (error) {
    console.error("Statistics API Error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
