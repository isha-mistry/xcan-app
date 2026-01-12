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
    const userModulesCollection = userDb.collection("user-modules");
    const foundationUsersCollection = userDb.collection("foundation-users");

    // Get orbit chains collection
    const orbitChainsCollection = userDb.collection("deployed-orbit-chains");

    // Fetch statistics in parallel
    const advocatesCollection = userDb.collection("advocates");

    const [
      totalUsers,
      // totalSessions,
      // totalOfficeHours,
      usersWithSocials,
      usersWithGithub,
      legacyTotalMintedAgg,
      totalOrbitChains,
      totalAdvocates,
      userModulesCertCount,
      userModulesHolders,
      foundationUsersCertCount,
      foundationUsersHolders,
      advocatesCertCount,
      advocatesHolders,
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

      // Total orbit chains deployed
      orbitChainsCollection.countDocuments({ status: "orbit_deployed" }),
      advocatesCollection.countDocuments({}),

      // Count total claimed certifications from user-modules collection
      userModulesCollection
        .aggregate([
          {
            $project: {
              userAddress: 1,
              modules: { $objectToArray: "$modules" },
            },
          },
          { $unwind: "$modules" },
          {
            $match: {
              "modules.v.certification": {
                $exists: true,
                $type: "array",
                $ne: [],
              },
            },
          },
          { $unwind: "$modules.v.certification" },
          { $match: { "modules.v.certification.claimed": true } },
          { $count: "total" },
        ])
        .toArray(),

      // Get distinct holders from user-modules collection
      userModulesCollection
        .aggregate([
          {
            $project: {
              userAddress: 1,
              modules: { $objectToArray: "$modules" },
            },
          },
          { $unwind: "$modules" },
          {
            $match: {
              "modules.v.certification": {
                $exists: true,
                $type: "array",
                $ne: [],
              },
            },
          },
          { $unwind: "$modules.v.certification" },
          { $match: { "modules.v.certification.claimed": true } },
          { $group: { _id: "$userAddress" } },
        ])
        .toArray(),

      // Count total claimed certifications from foundation-users collection
      foundationUsersCollection
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
        .toArray(),

      // Get distinct holders from foundation-users collection
      foundationUsersCollection
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
        .toArray(),

      // Count total claimed certifications from advocates collection
      advocatesCollection
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
        .toArray(),

      // Get distinct holders from advocates collection
      advocatesCollection
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
        .toArray(),
    ]);

    // Legacy totals from minted-nft collection
    const legacyTotalMinted =
      legacyTotalMintedAgg.length > 0 ? legacyTotalMintedAgg[0].total : 0;
    const legacyHolders: string[] = await nftsCollection.distinct(
      "userAddress",
      { totalMinted: { $gt: 0 } }
    );

    // Get claimed certifications count from user-modules
    const userModulesTotalMinted =
      userModulesCertCount.length > 0 ? userModulesCertCount[0].total : 0;

    // Get unique holders from user-modules
    const userModulesHoldersList = userModulesHolders
      .map((d: any) => (d._id || "").toLowerCase())
      .filter(Boolean);

    // Get claimed certifications count from foundation-users
    const foundationUsersTotalMinted =
      foundationUsersCertCount.length > 0
        ? foundationUsersCertCount[0].total
        : 0;

    // Get unique holders from foundation-users
    const foundationUsersHoldersList = foundationUsersHolders
      .map((d: any) => (d._id || "").toLowerCase())
      .filter(Boolean);

    // Get claimed certifications count from advocates
    const advocatesTotalMinted =
      advocatesCertCount.length > 0 ? advocatesCertCount[0].total : 0;

    // Get unique holders from advocates
    const advocatesHoldersList = advocatesHolders
      .map((d: any) => (d._id || "").toLowerCase())
      .filter(Boolean);

    // Combine minted totals: minted-nft + user-modules + foundation-users + advocates
    const totalMinted =
      legacyTotalMinted +
      userModulesTotalMinted +
      foundationUsersTotalMinted +
      advocatesTotalMinted;

    // Unique holders across minted-nft, user-modules, foundation-users, and advocates
    const uniqueHolders = new Set<string>();
    legacyHolders.forEach(
      (addr) => addr && uniqueHolders.add(String(addr).toLowerCase())
    );
    userModulesHoldersList.forEach((addr) => uniqueHolders.add(addr));
    foundationUsersHoldersList.forEach((addr) => uniqueHolders.add(addr));
    advocatesHoldersList.forEach((addr) => uniqueHolders.add(addr));
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
        totalOrbitChains,
        totalAdvocates,
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
