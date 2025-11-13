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

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Connect to user database
    const userClient = await connectDB();
    const db = userClient.db("inorbit_modules");
    const usersCollection = db.collection<User>("users");
    const nftsCollection = db.collection<NFT>("minted-nft");

    // Challenge collections that contain certification arrays
    const challengeCollectionNames = [
      "challenges-cross-chain",
      "challenges-master-defi",
      "challenges-orbit-chain",
      "challenges-precompiles-overview",
      "challenges-stylus-core-concepts",
      "challenges-web3-basics",
      "foundation-users",
      "advocates",
    ];

    // Helper function to count claimed certifications in a collection (matches statistics API)
    const countClaimedInCollection = async (
      collectionName: string
    ): Promise<number> => {
      try {
        const col = db.collection(collectionName);
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
      } catch (error) {
        console.error(`Error counting claimed in ${collectionName}:`, error);
        return 0;
      }
    };

    // Helper function to extract claimed certifications from a challenge collection using aggregation
    const getClaimedCertifications = async (
      collectionName: string
    ): Promise<
      Array<{ userAddress: string; certification: Certification }>
    > => {
      try {
        const collection = db.collection<ChallengeDocument>(collectionName);
        const result = await collection
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
          .toArray();
        return result as Array<{
          userAddress: string;
          certification: Certification;
        }>;
      } catch (error) {
        console.error(
          `Error fetching claimed certifications from ${collectionName}:`,
          error
        );
        return [];
      }
    };

    // Fetch all users
    const users = await usersCollection.find({}).toArray();

    // Fetch all NFTs from minted-nft collection
    const nfts = await nftsCollection.find({}).toArray();

    // Calculate total from minted-nft collection using aggregation (matches statistics API)
    const legacyTotalMintedAgg = await nftsCollection
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$totalMinted" },
          },
        },
      ])
      .toArray();
    const legacyTotalMinted =
      legacyTotalMintedAgg.length > 0 ? legacyTotalMintedAgg[0].total : 0;

    // Count claimed certifications from challenge collections in parallel (matches statistics API)
    const challengeClaimedCounts = await Promise.all(
      challengeCollectionNames.map((name) => countClaimedInCollection(name))
    );

    // Calculate total NFTs minted (matches statistics API calculation)
    const totalNFTsMinted = challengeClaimedCounts.reduce(
      (sum, n) => sum + (Number(n) || 0),
      legacyTotalMinted
    );

    // Fetch all claimed certifications from challenge collections in parallel using aggregation
    const challengeCertificationsArrays = await Promise.all(
      challengeCollectionNames.map((name) => getClaimedCertifications(name))
    );

    // Create a map to aggregate all NFTs by user address
    const nftsByAddress = new Map<
      string,
      { mintedLevels: MintedLevel[]; totalMinted: number }
    >();

    // Process minted-nft collection
    nfts.forEach((nft) => {
      const address = nft?.userAddress?.toLowerCase();
      if (!address) return; // Skip if address is missing

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

    // Process challenge collections - extract claimed certifications
    challengeCertificationsArrays.forEach((certifications) => {
      certifications.forEach(({ userAddress, certification: cert }) => {
        const address = userAddress?.toLowerCase();
        if (!address) return; // Skip if address is missing

        // Transform certification to MintedLevel format
        const mintedLevel: MintedLevel = {
          level: cert.level,
          levelKey: cert.levelName || `level-${cert.level}`,
          levelName: cert.levelName,
          transactionHash: cert.transactionHash,
          metadataUrl: cert.metadataUrl,
          imageUrl: cert.imageUrl,
          mintedAt:
            cert.mintedAt instanceof Date
              ? cert.mintedAt.toISOString()
              : typeof cert.mintedAt === "string"
              ? cert.mintedAt
              : new Date().toISOString(),
          network: "", // Network info not available in challenge collections
        };

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
      });
    });

    // Combine user data with their NFTs
    const dashboardUsers: DashboardUser[] = users.map((user) => {
      const address = user?.address?.toLowerCase();
      const nftData = nftsByAddress.get(address);

      // Determine connected socials
      const connectedSocials = {
        github: !!user.socialHandles?.githubUsername,
        twitter: !!user.socialHandles?.twitterUsername,
        discord: !!user.socialHandles?.discordUsername,
        telegram: !!user.socialHandles?.telegramUsername,
      };

      // Create NFT data structure matching the original format
      const combinedNftData: NFT | null = nftData
        ? {
            _id: "", // Not needed for dashboard
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

    // Calculate total NFTs minted across registered users (for dashboard display)
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
      totalNftsMinted: totalNFTsMinted, // Total from all collections (matches statistics API)
      totalNftsMintedForUsers: totalNftsMintedForUsers, // Total for registered users only
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
