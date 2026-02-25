import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

interface SocialHandles {
  githubUsername?: string;
  githubConnectedAt?: string;
  twitterUsername?: string;
  twitterConnectedAt?: string;
  discordUsername?: string;
  discordConnectedAt?: string;
  telegramUsername?: string;
  telegramConnectedAt?: string;
}

interface User {
  _id: string;
  address: string;
  isEmailVisible: boolean;
  createdAt: string;
  socialHandles: SocialHandles;
}

interface MintedLevel {
  level: number;
  levelKey: string;
  levelName: string;
  transactionHash: string;
  metadataUrl: string;
  imageUrl: string;
  mintedAt: string;
  network: string;
}

interface NFT {
  _id: string;
  userAddress: string;
  githubUsername: string;
  lastMintedAt: string;
  mintedLevels: MintedLevel[];
  totalMinted: number;
}

interface Certification {
  level: number;
  levelName: string;
  claimed: boolean;
  mintedAt: string | Date;
  transactionHash: string;
  metadataUrl: string;
  imageUrl: string;
}

interface ChallengeDocument {
  _id: string;
  userAddress: string;
  certification?: Certification[];
  [key: string]: any;
}

interface DashboardUser extends User {
  nftData: NFT | null;
  totalNftsMinted: number;
  connectedSocials: {
    github: boolean;
    twitter: boolean;
    discord: boolean;
    telegram: boolean;
  };
}

export const revalidate = 0;

/**
 * Normalizes a certification object from different collection schemas.
 * - advocates use imageURL/metadataURL (uppercase)
 * - user-modules & foundation-users use imageUrl/metadataUrl (camelCase)
 */
function normalizeCertToMintedLevel(cert: any): MintedLevel {
  return {
    level: cert.level,
    levelKey: cert.levelName || `level-${cert.level}`,
    levelName: cert.levelName,
    transactionHash: cert.transactionHash || "",
    metadataUrl: cert.metadataUrl || cert.metadataURL || "",
    imageUrl: cert.imageUrl || cert.imageURL || "",
    mintedAt:
      cert.mintedAt instanceof Date
        ? cert.mintedAt.toISOString()
        : typeof cert.mintedAt === "string"
        ? cert.mintedAt
        : new Date().toISOString(),
    network: "",
  };
}

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Connect to database
    const userClient = await connectDB();
    const db = userClient.db("inorbit_modules");
    const usersCollection = db.collection<User>("users");
    const nftsCollection = db.collection<NFT>("minted-nft");
    const userModulesCollection = db.collection("user-modules");
    const foundationUsersCollection = db.collection("foundation-users");
    const advocatesCollection = db.collection("advocates");

    // ──────────────────────────────────────────────────────
    // STEP 1: Fetch all data in PARALLEL
    // ──────────────────────────────────────────────────────
    const [
      users,
      usersWithSocials,
      nfts,
      legacyTotalMintedAgg,
      userModulesCerts,
      userModulesCertCount,
      foundationUsersCerts,
      foundationUsersCertCount,
      advocatesCerts,
      advocatesCertCount,
    ] = await Promise.all([
      // 1. All users (only needed fields)
      usersCollection
        .find(
          {},
          { projection: { address: 1, socialHandles: 1, createdAt: 1 } }
        )
        .toArray(),

      // 2. Users with at least one social connected (same query as statistics API)
      usersCollection.countDocuments({
        $or: [
          { "socialHandles.githubUsername": { $exists: true, $ne: "" } },
          { "socialHandles.twitterUsername": { $exists: true, $ne: "" } },
          { "socialHandles.discordUsername": { $exists: true, $ne: "" } },
          { "socialHandles.telegramUsername": { $exists: true, $ne: "" } },
        ],
      }),

      // 3. All minted NFTs
      nftsCollection.find({}).toArray(),

      // 3. Legacy total minted count
      nftsCollection
        .aggregate([
          { $group: { _id: null, total: { $sum: "$totalMinted" } } },
        ])
        .toArray(),

      // 4. user-modules: extract claimed certs (nested in modules.{key}.certification[])
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
          {
            $project: {
              userAddress: 1,
              certification: "$modules.v.certification",
            },
          },
        ])
        .toArray(),

      // 5. user-modules: total claimed count (for stats)
      userModulesCollection
        .aggregate([
          {
            $project: {
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

      // 6. foundation-users: extract claimed certs (uses walletAddress, top-level certification[])
      foundationUsersCollection
        .aggregate([
          {
            $match: {
              certification: { $exists: true, $type: "array", $ne: [] },
              walletAddress: { $exists: true, $nin: [null, ""] },
            },
          },
          { $unwind: "$certification" },
          { $match: { "certification.claimed": true } },
          {
            $project: {
              userAddress: "$walletAddress", // normalize to userAddress
              certification: 1,
            },
          },
        ])
        .toArray(),

      // 7. foundation-users: total claimed count
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

      // 8. advocates: extract claimed certs (uses userAddress, top-level certification[])
      advocatesCollection
        .aggregate([
          {
            $match: {
              certification: { $exists: true, $type: "array", $ne: [] },
              userAddress: { $exists: true, $nin: [null, ""] },
            },
          },
          { $unwind: "$certification" },
          { $match: { "certification.claimed": true } },
          {
            $project: {
              userAddress: 1,
              certification: 1,
            },
          },
        ])
        .toArray(),

      // 9. advocates: total claimed count
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
    ]);

    // ──────────────────────────────────────────────────────
    // STEP 2: Calculate total NFTs minted (matches statistics API)
    // ──────────────────────────────────────────────────────
    const legacyTotalMinted =
      legacyTotalMintedAgg.length > 0 ? legacyTotalMintedAgg[0].total : 0;
    const userModulesTotalMinted =
      userModulesCertCount.length > 0 ? userModulesCertCount[0].total : 0;
    const foundationUsersTotalMinted =
      foundationUsersCertCount.length > 0
        ? foundationUsersCertCount[0].total
        : 0;
    const advocatesTotalMinted =
      advocatesCertCount.length > 0 ? advocatesCertCount[0].total : 0;

    const totalNFTsMinted =
      legacyTotalMinted +
      userModulesTotalMinted +
      foundationUsersTotalMinted +
      advocatesTotalMinted;

    // ──────────────────────────────────────────────────────
    // STEP 3: Build NFTs-per-user map
    // ──────────────────────────────────────────────────────
    const nftsByAddress = new Map<
      string,
      { mintedLevels: MintedLevel[]; totalMinted: number }
    >();

    // Helper to add a minted level to the map
    const addToMap = (address: string, mintedLevel: MintedLevel) => {
      const existing = nftsByAddress.get(address);
      if (existing) {
        existing.mintedLevels.push(mintedLevel);
        existing.totalMinted += 1;
      } else {
        nftsByAddress.set(address, {
          mintedLevels: [mintedLevel],
          totalMinted: 1,
        });
      }
    };

    // 3a. Process minted-nft collection
    nfts.forEach((nft) => {
      const address = nft?.userAddress?.toLowerCase();
      if (!address) return;

      const existing = nftsByAddress.get(address);
      if (existing) {
        existing.mintedLevels.push(...nft.mintedLevels);
        existing.totalMinted += nft.totalMinted;
      } else {
        nftsByAddress.set(address, {
          mintedLevels: [...nft.mintedLevels],
          totalMinted: nft.totalMinted,
        });
      }
    });

    // 3b. Process user-modules certifications
    userModulesCerts.forEach((item: any) => {
      const address = item.userAddress?.toLowerCase();
      if (!address) return;
      addToMap(address, normalizeCertToMintedLevel(item.certification));
    });

    // 3c. Process foundation-users certifications (walletAddress → userAddress)
    foundationUsersCerts.forEach((item: any) => {
      const address = item.userAddress?.toLowerCase();
      if (!address) return;
      addToMap(address, normalizeCertToMintedLevel(item.certification));
    });

    // 3d. Process advocates certifications (imageURL/metadataURL)
    advocatesCerts.forEach((item: any) => {
      const address = item.userAddress?.toLowerCase();
      if (!address) return;
      addToMap(address, normalizeCertToMintedLevel(item.certification));
    });

    // ──────────────────────────────────────────────────────
    // STEP 4: Combine user data with their NFTs
    // ──────────────────────────────────────────────────────
    const dashboardUsers: DashboardUser[] = users.map((user) => {
      const address = user?.address?.toLowerCase();
      const nftData = nftsByAddress.get(address);

      const connectedSocials = {
        github: !!user.socialHandles?.githubUsername,
        twitter: !!user.socialHandles?.twitterUsername,
        discord: !!user.socialHandles?.discordUsername,
        telegram: !!user.socialHandles?.telegramUsername,
      };

      const combinedNftData: NFT | null = nftData
        ? {
            _id: "",
            userAddress: user.address,
            githubUsername: user.socialHandles?.githubUsername || "",
            lastMintedAt:
              nftData.mintedLevels.length > 0
                ? nftData.mintedLevels.reduce((latest, level) => {
                    const levelDate = new Date(level.mintedAt).getTime();
                    const latestDate = new Date(latest).getTime();
                    return levelDate > latestDate ? level.mintedAt : latest;
                  }, nftData.mintedLevels[0].mintedAt)
                : new Date().toISOString(),
            mintedLevels: nftData.mintedLevels,
            totalMinted: nftData.totalMinted,
          }
        : null;

      return {
        ...user,
        _id: user._id.toString(),
        nftData: combinedNftData,
        totalNftsMinted: nftData?.totalMinted || 0,
        connectedSocials,
      };
    });

    // Calculate total NFTs minted across registered users only
    const totalNftsMintedForUsers = dashboardUsers.reduce(
      (sum, user) => sum + (user.totalNftsMinted || 0),
      0
    );

    // Close database connections
    await userClient.close();

    return NextResponse.json({
      success: true,
      data: dashboardUsers,
      count: dashboardUsers.length,
      totalNftsMinted: totalNFTsMinted,
      totalNftsMintedForUsers: totalNftsMintedForUsers,
      usersWithSocials: usersWithSocials,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
