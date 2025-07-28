import { NextRequest, NextResponse } from "next/server";
import { connectDB, connectMintDB } from "@/config/connectDB";

interface SocialHandles {
  githubId?: string;
  githubUsername?: string;
  twitterId?: string;
  twitterUsername?: string;
  discordId?: string;
  discordUsername?: string;
  telegramId?: string;
  telegramUsername?: string;
}

interface User {
  _id: string;
  address: string;
  isEmailVisible: boolean;
  createdAt: string;
  image: string | null;
  displayName: string | null;
  description: string | null;
  emailId: string | null;
  socialHandles: SocialHandles;
  referrer: string | null;
}

interface NFT {
  userAddress: string;
  transactionHash: string;
  metadataUrl: string;
  imageUrl: string;
  mintedAt: string;
  network: string;
}

interface DashboardUser extends User {
  nfts: NFT[];
}

export const revalidate = 0;

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Connect to user database
    const userClient = await connectDB();
    const userDb = userClient.db();
    const usersCollection = userDb.collection<User>("users");

    // Connect to NFT database
    const nftClient = await connectMintDB();
    const nftDb = nftClient.db();
    const nftsCollection = nftDb.collection<NFT>("minted-nft");

    // Fetch all users
    const users = await usersCollection.find({}).toArray();

    // Fetch all NFTs
    const nfts = await nftsCollection.find({}).toArray();

    // Create a map of NFTs by user address for efficient lookup
    const nftsByAddress = new Map<string, NFT[]>();
    nfts.forEach((nft) => {
      const address = nft.userAddress.toLowerCase();
      if (!nftsByAddress.has(address)) {
        nftsByAddress.set(address, []);
      }
      nftsByAddress.get(address)!.push(nft);
    });

    // Combine user data with their NFTs
    const dashboardUsers: DashboardUser[] = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
      nfts: nftsByAddress.get(user.address.toLowerCase()) || [],
    }));

    console.log("dashboardUsers: ", dashboardUsers.length);

    // Close database connections
    await userClient.close();
    await nftClient.close();

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
