import { connectDB } from "@/config/connectDB";
import { NextRequest, NextResponse } from "next/server";
import { AuthTokenClaims, PrivyClient } from "@privy-io/server-auth";

const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_SECRET!
);

interface DelegateRequestBody {
  isEmailVisible: boolean;
  createdAt: Date;
  referrer: string | null;
  githubId: string;
  githubUsername: string;
}

export async function POST(req: NextRequest, res: NextResponse) {
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
          { error: "No GitHub account linked to user" },
          { status: 401 }
        );
      }
      // Get request body
      const {
        isEmailVisible,
        createdAt,
        referrer,
        githubId,
        githubUsername,
      }: DelegateRequestBody = await req.json();
      // Connect to database
      client = await connectDB();
      const db = client.db();
      const collection = db.collection("users");
      // Check if user already exists by githubId
      const existingDocument = await collection.findOne({
        "socialHandles.githubId": githubId,
      });
      if (existingDocument) {
        return NextResponse.json(
          { result: "Already Exists!" },
          { status: 409 }
        );
      }
      // Create new user document
      const newDocument = {
        isEmailVisible,
        createdAt,
        image: null,
        displayName: null,
        description: null,
        emailId: null,
        socialHandles: {
          githubId: githubId,
          githubUsername: githubUsername,
        },
        referrer: referrer,
      };
      // Insert document
      const result = await collection.insertOne(newDocument);
      if (result.insertedId) {
        const insertedDocument = await collection.findOne({
          _id: result.insertedId,
        });
        return NextResponse.json({ result: insertedDocument }, { status: 200 });
      } else {
        return NextResponse.json(
          { error: "Failed to insert document" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error storing delegate:", error);
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
