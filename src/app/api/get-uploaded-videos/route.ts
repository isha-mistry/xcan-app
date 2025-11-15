import { connectDB } from "@/config/connectDB";
import { NextRequest, NextResponse } from "next/server";
import { UploadedVideo } from "@/types/UploadedVideoTypes";

export async function GET(req: NextRequest) {
  let client;

  try {
    const url = new URL(req.url);
    const user_address = url.searchParams.get("user_address");

    client = await connectDB();
    const db = client.db();
    const collection = db.collection<UploadedVideo>("uploaded_videos");

    let query: any = {};

    // If user_address is provided, filter by it; otherwise return all videos
    if (user_address) {
      query.user_address = { $regex: `^${user_address}$`, $options: "i" };
    }

    const videos = await collection
      .find(query)
      .sort({ created_at: -1 }) // Sort by newest first
      .toArray();

    await client.close();

    return NextResponse.json(
      {
        success: true,
        data: videos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching uploaded videos:", error);
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

