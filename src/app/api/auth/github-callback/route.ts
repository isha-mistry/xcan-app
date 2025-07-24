import { NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // This contains the wallet address

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/?error=missing_params", request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_GITHUB_ID,
          client_secret: process.env.GITHUB_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/?error=token_error", request.url));
    }

    // Get GitHub user data
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "YourAppName", // GitHub API requires a User-Agent header
      },
    });

    if (!userResponse.ok) {
      console.error(
        "GitHub API error:",
        userResponse.status,
        userResponse.statusText
      );
      return NextResponse.redirect(
        new URL("/?error=github_api_error", request.url)
      );
    }

    const userData = await userResponse.json();

    // Validate required GitHub data
    if (!userData.id || !userData.login) {
      console.error("Invalid GitHub user data:", userData);
      return NextResponse.redirect(
        new URL("/?error=invalid_user_data", request.url)
      );
    }

    // Store in database using the correct schema
    const client = await connectDB();
    const db = client.db();

    console.log("GitHub user data:", userData);
    console.log("Wallet address (state):", state);

    // Update user document with GitHub information
    const updateResult = await db.collection("users").findOneAndUpdate(
      { address: { $regex: new RegExp(`^${state}$`, "i") } },
      {
        $set: {
          "socialHandles.githubId": userData.id.toString(),
          "socialHandles.githubUsername": userData.login,
          // "socialHandles.githubAvatarUrl": userData.avatar_url, // Optional: store avatar
          // "socialHandles.githubName": userData.name, // Optional: store display name
          // "socialHandles.githubConnectedAt": new Date(), // Optional: track when connected
        },
      },
      {
        returnDocument: "after", // Return the updated document
        upsert: false, // Don't create if doesn't exist
      }
    );

    // Check if user was found and updated
    if (!updateResult) {
      console.error("User not found for address:", state);
      return NextResponse.redirect(
        new URL("/?error=user_not_found", request.url)
      );
    }

    console.log("Successfully updated user:", updateResult);

    // Optionally, you can redirect with success parameter
    return NextResponse.redirect(
      new URL("/?success=github_connected", request.url)
    );
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(new URL("/?error=server_error", request.url));
  }
}
