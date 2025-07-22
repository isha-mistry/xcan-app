import { connectDB } from "@/config/connectDB";
import { NextRequest, NextResponse } from "next/server";
import { AuthTokenClaims, PrivyClient } from "@privy-io/server-auth";

const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_SECRET!
);

interface GitHubLinkRequestBody {
  githubId: string;
  githubUsername: string;
}

export async function POST(req: NextRequest) {
  let client;
  try {
    // Privy token verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization token" },
        { status: 401 }
      );
    }

    const privyToken = authHeader.split(" ")[1];

    try {
      // Verify the Privy token
      const verifiedUser: AuthTokenClaims = await privyClient.verifyAuthToken(
        privyToken
      );

      const verifiedUserId = verifiedUser.userId;

      // Get full user details
      const userDetails = await privyClient.getUser(verifiedUserId);

      // Get request wallet address from header
      const requestWalletAddress = req.headers.get("x-wallet-address");
      if (!requestWalletAddress) {
        return NextResponse.json(
          { error: "No wallet address provided in request" },
          { status: 401 }
        );
      }

      // Check if user has both wallet and GitHub linked accounts
      const linkedWallets = userDetails.linkedAccounts.filter(
        (account) => account.type === "wallet"
      );
      const linkedGitHub = userDetails.linkedAccounts.find(
        (account) => account.type === "github_oauth"
      );

      const verifiedWallet = linkedWallets.find(
        (wallet) => wallet.address === requestWalletAddress
      );

      if (!verifiedWallet) {
        return NextResponse.json(
          { error: "Wallet address not found in user's linked accounts" },
          { status: 401 }
        );
      }

      if (!linkedGitHub) {
        return NextResponse.json(
          { error: "GitHub account not linked to user" },
          { status: 401 }
        );
      }

      // Get request body
      const { githubId, githubUsername }: GitHubLinkRequestBody =
        await req.json();

      // Verify the GitHub ID matches the linked account
      if (linkedGitHub.subject !== githubId) {
        return NextResponse.json(
          { error: "GitHub ID mismatch" },
          { status: 401 }
        );
      }

      // Connect to database
      client = await connectDB();
      const db = client.db();
      const collection = db.collection("users");

      // Update or create user document with GitHub info
      const result = await collection.updateOne(
        { address: requestWalletAddress },
        {
          $set: {
            githubId,
            githubUsername,
          },
        },
        { upsert: false }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: "User not found. Please complete wallet setup first." },
          { status: 404 }
        );
      }

      const updatedDocument = await collection.findOne({
        address: requestWalletAddress,
      });

      return NextResponse.json({ result: updatedDocument }, { status: 200 });
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error linking GitHub:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
