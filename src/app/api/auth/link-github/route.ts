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
      // Get GitHub account from linkedAccounts
      const githubAccount = userDetails.linkedAccounts.find(
        (account) => account.type === "github_oauth"
      );
      if (!githubAccount) {
        return NextResponse.json(
          { error: "GitHub account not linked to user" },
          { status: 401 }
        );
      }
      // Get request body
      const { githubId, githubUsername }: GitHubLinkRequestBody =
        await req.json();
      // Verify the GitHub ID matches the linked account
      if (githubAccount.subject !== githubId) {
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
        { "socialHandles.githubId": githubId },
        {
          $set: {
            "socialHandles.githubId": githubId,
            "socialHandles.githubUsername": githubUsername,
          },
        },
        { upsert: false }
      );
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: "User not found. Please sign up with GitHub first." },
          { status: 404 }
        );
      }
      const updatedDocument = await collection.findOne({
        "socialHandles.githubId": githubId,
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
