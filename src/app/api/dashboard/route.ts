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

    // Fetch all users
    const users = await usersCollection.find({}).toArray();

    // Fetch all NFTs
    const nfts = await nftsCollection.find({}).toArray();

    // Create a map of NFTs by user address for efficient lookup
    const nftsByAddress = new Map<string, NFT>();
    nfts.forEach((nft) => {
      const address = nft.userAddress.toLowerCase();
      nftsByAddress.set(address, nft);
    });

    // Combine user data with their NFTs
    const dashboardUsers: DashboardUser[] = users.map((user) => {
      const nftData = nftsByAddress.get(user.address.toLowerCase()) || null;

      // Determine connected socials
      const connectedSocials = {
        github: !!user.socialHandles?.githubUsername,
        twitter: !!user.socialHandles?.twitterUsername,
        discord: !!user.socialHandles?.discordUsername,
        telegram: !!user.socialHandles?.telegramUsername,
      };

      return {
        ...user,
        _id: user._id.toString(),
        nftData,
        totalNftsMinted: nftData?.totalMinted || 0,
        connectedSocials,
      };
    });

    console.log("dashboardUsers: ", dashboardUsers.length);

    // Close database connections
    await userClient.close();

    return NextResponse.json({
      success: true,
      data: dashboardUsers,
      count: dashboardUsers.length,
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
