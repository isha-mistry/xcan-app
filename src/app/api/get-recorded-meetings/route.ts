import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { cacheWrapper } from "@/utils/cacheWrapper";

export const revalidate = 0;

export async function GET(req: NextRequest, res: NextResponse) {
  let client;
  try {
    // Connect to MongoDB
    client = await connectDB();

    // Access the collections
    const db = client.db();
    const meetingsCollection = db.collection("meetings");
    const delegatesCollection = db.collection("delegates");

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // const cacheKey = "meetings"; // Single cache key for all meeting data
    const cacheKey = `meetings_${page}_${limit}`;

    // Try to get from cache first
    if (cacheWrapper.isAvailable) {
      const cacheValue = await cacheWrapper.get(cacheKey);
      if (cacheValue) {
        console.log("Serving from cache meetings!");
        return NextResponse.json(
          { success: true, data: JSON.parse(cacheValue) },
          { status: 200 }
        );
      }
    }

    // Fetch total count of recorded meetings
    const totalCount = await meetingsCollection.countDocuments({
      meeting_status: "Recorded",
    });

    // Fetch paginated documents from the meetings collection
    const meetings = await meetingsCollection
      .find({ meeting_status: "Recorded" })
      .sort({ slot_time: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const uniqueAddresses = new Set<string>();
    meetings.forEach((meeting) => {
      uniqueAddresses.add(meeting.host_address);
      meeting.attendees.forEach((attendee: any) => {
        uniqueAddresses.add(attendee.attendee_address);
      });
    });

    // Fetch profile data from delegates collection
    const delegates = await delegatesCollection
      .find({ address: { $in: Array.from(uniqueAddresses) } })
      .toArray();

    // Create a map for quick lookup of delegate data
    const delegatesMap = new Map<string, any>();
    delegates.forEach((delegate) => {
      delegatesMap.set(delegate.address, delegate);
    });

    const mergedData = meetings.map((meeting) => {
      const hostInfo = delegatesMap.get(meeting.host_address) || null;
      const attendees = meeting.attendees.map((attendee: any) => {
        const guestInfo = delegatesMap.get(attendee.attendee_address) || null;
        return { ...attendee, guestInfo };
      });
      return { ...meeting, hostInfo, attendees };
    });

    if(cacheWrapper.isAvailable){
      await cacheWrapper.set(cacheKey,JSON.stringify(mergedData),300);
    }

    await client.close();
    console.log("Serving from database!");

    // Return the merged data with pagination info
    return NextResponse.json(
      {
        success: true,
        data: mergedData,
        // totalCount,
        // currentPage: page,
        // totalPages: Math.ceil(totalCount / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.close();
    }
  }
}
