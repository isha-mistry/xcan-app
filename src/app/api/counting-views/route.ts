import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { RateLimiter } from "limiter";
import { createHash } from "crypto";

const limiters = new Map<string, RateLimiter>();

export async function PUT(req: NextRequest, res: NextResponse) {
  let client;

  try {
    // Parse the request body once
    const { clientToken, meetingId, collection } = await req.json();

    if (!clientToken || !meetingId || !collection) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Create a unique identifier based on clientToken
    const identifier = createHash("sha256").update(clientToken).digest("hex");

    // Get or create a rate limiter for this client
    let limiter = limiters.get(identifier);
    if (!limiter) {
      limiter = new RateLimiter({ tokensPerInterval: 50, interval: "minute" });
      limiters.set(identifier, limiter);
    }

    const hasToken = await limiter.removeTokens(1);
    if (hasToken < 1) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    client = await connectDB();
    const db = client.db();
    const collectionRef = db.collection(collection);

    if (collection === "meetings") {
      // Handle meetings collection
      const result = await collectionRef.findOneAndUpdate(
        { meetingId: meetingId, meeting_status: "Recorded" },
        [
          {
            $set: {
              views: {
                $cond: {
                  if: { $isNumber: "$views" },
                  then: { $add: ["$views", 1] },
                  else: 1,
                },
              },
            },
          },
        ],
        { returnDocument: "after", upsert: false }
      );

      if (result == null) {
        return NextResponse.json(
          { success: true, data: "Meeting status is not valid!" },
          { status: 200 }
        );
      }
    } else if (collection === "office_hours") {
      // First, find the document and identify the specific meeting
      const document = await collectionRef.findOne({
        "dao.meetings": {
          $elemMatch: {
            meetingId: meetingId,
            meeting_status: "Recorded",
          },
        },
      });

      if (!document) {
        return NextResponse.json(
          { success: true, data: "Meeting not found or status is not valid!" },
          { status: 200 }
        );
      }

      // Find the indices for the dao and meeting
      let daoIndex = -1;
      let meetingIndex = -1;

      for (let i = 0; i < document.dao.length; i++) {
        const meetingIdx = document.dao[i].meetings.findIndex(
          (m: any) =>
            m.meetingId === meetingId && m.meeting_status === "Recorded"
        );
        if (meetingIdx !== -1) {
          daoIndex = i;
          meetingIndex = meetingIdx;
          break;
        }
      }

      if (daoIndex === -1 || meetingIndex === -1) {
        return NextResponse.json(
          { success: true, data: "Meeting not found in any DAO!" },
          { status: 200 }
        );
      }

      // Update the specific meeting's views using the found indices
      const updatePath = `dao.${daoIndex}.meetings.${meetingIndex}.views`;
      const currentViews =
        document.dao[daoIndex].meetings[meetingIndex].views || 0;

      const result = await collectionRef.updateOne(
        { _id: document._id },
        { $set: { [updatePath]: currentViews + 1 } }
      );

      if (!result.modifiedCount) {
        return NextResponse.json(
          { success: false, data: "Failed to update view count!" },
          { status: 200 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid collection specified" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: "View count updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating meeting views:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
