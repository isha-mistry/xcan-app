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

    // Challenge-wise collections that may contain certification arrays
    const challengeCollectionNames = [
      "challenges-cross-chain",
      "challenges-master-defi",
      "challenges-orbit-chain",
      "challenges-precompiles-overview",
      "challenges-stylus-core-concepts",
      "challenges-web3-basics",
      "foundation-users",
    ];

    const countClaimedInCollection = async (
      collectionName: string
    ): Promise<number> => {
      try {
        const col = userDb.collection(collectionName);
        const result = await col
          .aggregate([
            {
              $match: {
                certification: { $exists: true, $type: "array", $ne: [] },
              },
            },
            { $unwind: "$certification" },
            { $match: { "certification.claimed": true } },
            { $count: "total" },
          ])
          .toArray();
        return result.length > 0 ? result[0].total : 0;
      } catch {
        return 0;
      }
    };

    const distinctHoldersInCollection = async (
      collectionName: string
    ): Promise<string[]> => {
      try {
        const col = userDb.collection(collectionName);
        const result = await col
          .aggregate([
            {
              $match: {
                certification: { $exists: true, $type: "array", $ne: [] },
              },
            },
            { $unwind: "$certification" },
            { $match: { "certification.claimed": true } },
            { $group: { _id: "$userAddress" } },
          ])
          .toArray();
        return result
          .map((d: any) => (d._id || "").toLowerCase())
          .filter(Boolean);
      } catch {
        return [];
      }
    };

    // Fetch statistics in parallel
    const [
      totalUsers,
      // totalSessions,
      // totalOfficeHours,
      usersWithSocials,
      usersWithGithub,
      legacyTotalMintedAgg,
    ] = await Promise.all([
      // Total users
      usersCollection.countDocuments({}),

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

      // Users with GitHub connected
      usersCollection.countDocuments({
        "socialHandles.githubUsername": { $exists: true, $ne: "" },
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

    // Legacy totals from minted-nft collection
    const legacyTotalMinted =
      legacyTotalMintedAgg.length > 0 ? legacyTotalMintedAgg[0].total : 0;
    const legacyHolders: string[] = await nftsCollection.distinct(
      "userAddress",
      { totalMinted: { $gt: 0 } }
    );

    // Challenge totals in parallel
    const [challengeClaimedCounts, challengeHoldersArrays] = await Promise.all([
      Promise.all(
        challengeCollectionNames.map((name) => countClaimedInCollection(name))
      ),
      Promise.all(
        challengeCollectionNames.map((name) =>
          distinctHoldersInCollection(name)
        )
      ),
    ]);

    // Combine minted totals: legacy + challenges
    const totalMinted = challengeClaimedCounts.reduce(
      (sum, n) => sum + (Number(n) || 0),
      legacyTotalMinted
    );

    // Unique holders across legacy and challenges
    const uniqueHolders = new Set<string>();
    legacyHolders.forEach(
      (addr) => addr && uniqueHolders.add(String(addr).toLowerCase())
    );
    challengeHoldersArrays.forEach((arr) =>
      arr.forEach((addr) => uniqueHolders.add(addr))
    );
    const totalNFTs = uniqueHolders.size;

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
        usersWithGithub,
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
