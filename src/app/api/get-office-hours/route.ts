import { connectDB } from "@/config/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { Meeting, OfficeHoursDocument } from "@/types/OfficeHoursTypes";

export async function GET(req: NextRequest) {
  try {
    // Get query parameters from the URL
    const url = new URL(req.url);
    const host_address = url.searchParams.get("host_address");
    const dao_name = url.searchParams.get("dao_name");

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("office_hours");

    let query: any = {};
    let projection: any = {};

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
    } else if (host_address) {
      query = {
        host_address: host_address,
      };
    }

    projection = {
      dao: 1,
      host_address: 1,
    };

    const results = await collection.find(query, { projection }).toArray();
    await client.close();

    if (!results.length) {
      return NextResponse.json({ error: "No meetings found" }, { status: 404 });
    }

    // Function to categorize meetings by their states
    const categorizeMeetings = (meetings: Meeting[], hostAddr: string) => {
      return {
        ongoing: meetings.filter(
          (meeting) => meeting.meeting_status === "ongoing"
        ),
        upcoming: meetings.filter(
          (meeting) => meeting.meeting_status === "upcoming"
        ),
        recorded: meetings.filter(
          (meeting) => meeting.meeting_status === "recorded"
        ),
        hosted: meetings.filter(
          (meeting) =>
            meeting.meeting_status === "recorded" && hostAddr === host_address
        ),
        attended: meetings.filter(
          (meeting) =>
            meeting.meeting_status === "recorded" &&
            meeting.attendees?.some(
              (attendee) => attendee.address === host_address
            )
        ),
      };
    };

    // Transform and categorize the results
    const transformedResults = results.flatMap(
      (result) => {
        // If dao_name is specified, filter to only include that DAO
        const relevantDaos = dao_name
          ? result.dao.filter((d: any) => d.name === dao_name)
          : result.dao;

        return relevantDaos.map((dao: any) => {
          const categorizedMeetings = categorizeMeetings(
            dao.meetings || [],
            result.host_address
          );

          return {
            host_address: result.host_address,
            dao_name: dao.name,
            meetings: categorizedMeetings,
          };
        });
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: transformedResults,
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
