// api/fetch-notifications.ts
import { connectDB } from "@/config/connectDB";
import { NextRequest, NextResponse } from "next/server";
import { cacheWrapper } from "@/utils/cacheWrapper";

export async function POST(req: NextRequest) {
  const { address } = await req.json();
  let client;
  try {
    const cacheKey = `Notification:${address}`;

    // Try to get from cache first
    if (cacheWrapper.isAvailable) {
      const cacheValue = await cacheWrapper.get(cacheKey);
      if (cacheValue) {
        console.log("Serving from cache notifications!");
        return NextResponse.json(
          { success: true, data: JSON.parse(cacheValue) },
          { status: 200 }
        );
      }
    }

    client = await connectDB();
    const db = client.db();
    const collection = db.collection("notifications");

    const notifications = await collection
      .find({ receiver_address: address })
      .toArray();

    if (cacheWrapper.isAvailable) {
      await cacheWrapper.set(cacheKey, JSON.stringify(notifications), 300);
    }

    console.log("Serving from database for notifications.");

    if (notifications.length > 0) {
      return NextResponse.json(
        { success: true, data: notifications },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ success: false, data: [] }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.close();
    }
  }
}
