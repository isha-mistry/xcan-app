import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { OfficeHoursDocument, Meeting } from "@/types/OfficeHoursTypes";

// Define types for meeting status responses
type MeetingStatusResponse = {
  success: boolean;
  message: string;
  status: number;
};

// Helper function to create response
const createResponse = (
  success: boolean,
  message: string,
  data?: any,
  status = 200
) => {
  return NextResponse.json(
    { success, message, ...(data && { data }) },
    { status }
  );
};

// Helper function to get meeting status response
const getMeetingStatusResponse = (status: string): MeetingStatusResponse => {
  const responses: { [key: string]: MeetingStatusResponse } = {
    Upcoming: { success: true, message: "Meeting is upcoming", status: 200 },
    active: { success: true, message: "Meeting is upcoming", status: 200 },
    Recorded: { success: true, message: "Meeting has ended", status: 200 },
    Finished: { success: true, message: "Meeting has ended", status: 200 },
    inactive: { success: true, message: "Meeting has ended", status: 200 },
    Ongoing: { success: true, message: "Meeting is ongoing", status: 200 },
    ongoing: { success: true, message: "Meeting is ongoing", status: 200 },
    Denied: { success: true, message: "Meeting has been denied", status: 200 },
  };

  return (
    responses[status] || {
      success: false,
      message: "Meeting status is invalid",
      status: 400,
    }
  );
};

export async function POST(req: NextRequest) {
  let client;

  try {
    const { roomId, meetingType } = await req.json();

    if (roomId === null || roomId === "undefined") {
      return createResponse(false, "Room ID is required", null, 404);
    }

    client = await connectDB();
    const db = client.db();

    if (meetingType === "session") {
      const meeting = await db
        .collection("meetings")
        .findOne({ meetingId: roomId });

      if (!meeting) {
        return createResponse(true, "Meeting does not exist");
      }

      const { success, message, status } = getMeetingStatusResponse(
        meeting.meeting_status
      );
      return createResponse(success, message, meeting, status);
    } else {
      const officeHours = await db
        .collection<OfficeHoursDocument>("office_hours")
        .findOne({ "dao.meetings.meetingId": roomId });

      if (!officeHours) {
        return createResponse(true, "Meeting does not exist");
      }

      // Find the specific meeting and its DAO
      const daoInfo = officeHours.dao.reduce<{
        meeting: Meeting | null;
        daoName: string;
      }>(
        (acc, dao) => {
          const meeting = dao.meetings.find((m) => m.meetingId === roomId);
          return meeting ? { meeting, daoName: dao.name } : acc;
        },
        { meeting: null, daoName: "" }
      );

      if (!daoInfo.meeting) {
        return createResponse(true, "Meeting does not exist");
      }

      const meetingWithContext = {
        ...daoInfo.meeting,
        host_address: officeHours.host_address,
        dao_name: daoInfo.daoName,
      };

      const { success, message, status } = getMeetingStatusResponse(
        daoInfo.meeting.meeting_status!
      );
      return createResponse(success, message, meetingWithContext, status);
    }
  } catch (error) {
    console.error("Error checking meeting status:", error);
    return createResponse(false, "Internal Server Error", null, 500);
  } finally {
    if (client) {
      await client.close();
    }
  }
}
