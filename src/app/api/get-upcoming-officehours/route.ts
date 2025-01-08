import { connectDB } from "@/config/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { Meeting } from "@/types/OfficeHoursTypes";

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const host_address = searchParams.get("host_address");
    const dao_name = searchParams.get("dao_name");

    // Validate required parameters
    if (!host_address || !dao_name) {
      return NextResponse.json(
        { error: "Both host_address and dao_name are required parameters" },
        { status: 400 }
      );
    }

    const currentDate = new Date();
    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("office_hours");

    // Query with required parameters
    const query = {
      host_address: host_address,
      "dao.name": dao_name,
      "dao.meetings.startTime": { $gt: currentDate.toISOString() },
    };

    const projection = {
      dao: {
        $filter: {
          input: "$dao",
          as: "dao",
          cond: { $eq: ["$$dao.name", dao_name] },
        },
      },
      host_address: 1,
    };

    const result = await collection.findOne(query, { projection });
    await client.close();

    if (!result || !result.dao.length) {
      return NextResponse.json(
        { error: "No upcoming meetings found for the specified host and DAO" },
        { status: 404 }
      );
    }

    // Filter for upcoming meetings
    const upcomingMeetings =
      result.dao[0].meetings?.filter(
        (meeting:Meeting) =>
          new Date(meeting.startTime) > currentDate &&
          meeting.meeting_status === "Upcoming"
      ) || [];

    return NextResponse.json(
      {
        success: true,
        data: {
          host_address: result.host_address,
          dao_name: dao_name,
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
