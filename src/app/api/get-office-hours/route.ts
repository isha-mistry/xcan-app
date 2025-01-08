import { connectDB } from "@/config/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { Meeting, OfficeHoursDocument } from "@/types/OfficeHoursTypes";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const host_address = url.searchParams.get("host_address");
    const dao_name = url.searchParams.get("dao_name");

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("office_hours");

    let query: any = {};

    // Base query setup based on host_address and dao_name
    if (host_address && dao_name) {
      query = {
        host_address: host_address,
        "dao.name": dao_name,
      };
    } else if (dao_name) {
      query = {
        "dao.name": dao_name,
      };
    }

    const results = await collection.find(query).toArray();
    await client.close();

    if (!results.length) {
      return NextResponse.json({ error: "No meetings found" }, { status: 404 });
    }

    // Create categorized meeting arrays
    const ongoing: Array<Meeting & { host_address: string; dao_name: string }> =
      [];
    const upcoming: Array<
      Meeting & { host_address: string; dao_name: string }
    > = [];
    const recorded: Array<
      Meeting & { host_address: string; dao_name: string }
    > = [];
    const hosted: Array<Meeting & { host_address: string; dao_name: string }> =
      [];
    const attended: Array<
      Meeting & { host_address: string; dao_name: string }
    > = [];

    results.forEach((result) => {
      const relevantDaos = dao_name
        ? result.dao.filter((d: any) => d.name === dao_name)
        : result.dao;

      relevantDaos.forEach((dao: any) => {
        (dao.meetings || []).forEach((meeting: Meeting) => {
          const meetingDocument = {
            ...meeting,
            host_address: result.host_address,
            dao_name: dao.name,
          };

          // Categorize meetings
          switch (meeting.meeting_status) {
            case "Ongoing":
              ongoing.push(meetingDocument);
              break;
            case "Upcoming":
              upcoming.push(meetingDocument);
              break;
            case "Recorded":
              recorded.push(meetingDocument);

              // Check if this is a hosted meeting
              if (result.host_address === host_address) {
                hosted.push(meetingDocument);
              }

              // Check if this is an attended meeting
              if (
                meeting.attendees?.some(
                  (attendee) => attendee.address === host_address
                )
              ) {
                attended.push(meetingDocument);
              }
              break;
          }
        });
      });
    });

    // Sort meetings by date if available
    const sortByDate = (a: Meeting, b: Meeting) => {
      const dateA = new Date(a.startTime || 0).getTime();
      const dateB = new Date(b.startTime || 0).getTime();
      return dateB - dateA; // Most recent first
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          ongoing: ongoing.sort(sortByDate),
          upcoming: upcoming.sort(sortByDate),
          recorded: recorded.sort(sortByDate),
          hosted: hosted.sort(sortByDate),
          attended: attended.sort(sortByDate),
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
