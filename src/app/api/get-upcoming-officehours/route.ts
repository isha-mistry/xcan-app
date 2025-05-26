import { connectDB } from "@/config/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { Meeting } from "@/types/OfficeHoursTypes";

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const host_address = searchParams.get("host_address");

    // Validate required parameters
    if (!host_address) {
      return NextResponse.json(
        { error: "host_address is a required parameter" },
        { status: 400 }
      );
    }

    const currentDate = new Date();
    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("office_hours");

    // Updated query to work with simplified schema
    const query = {
      host_address: host_address,
      "meetings.startTime": { $gt: currentDate.toISOString() },
      "meetings.status": "active", // Add status filter
    };

    const result = await collection.findOne(query);
    await client.close();

    if (!result || !result.meetings?.length) {
      return NextResponse.json(
        {
          success: true,
          data: {
            host_address: host_address,
            meetings: [],
          },
        },
        { status: 200 }
      );
    }

    // Filter for upcoming and active meetings
    const upcomingMeetings =
      result.meetings?.filter(
        (meeting: Meeting) =>
          new Date(meeting.startTime) > currentDate &&
          meeting.meeting_status === "Upcoming" &&
          meeting.status === "active" // Add status filter here as well
      ) || [];

    return NextResponse.json(
      {
        success: true,
        data: {
          host_address: result.host_address,
          meetings: upcomingMeetings,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
