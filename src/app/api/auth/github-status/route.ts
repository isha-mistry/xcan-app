import { NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const client = await connectDB();
    const db = client.db();
    const user = await db.collection("users").findOne({
      address: { $regex: new RegExp(`^${address}$`, "i") },
    });

    console.log("user", address, user);

    return NextResponse.json({
      isLinked: !!user?.socialHandles?.githubId,
      githubUsername: user?.socialHandles?.githubUsername || null,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
