import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { OfficeHoursDocument, Meeting } from "@/types/OfficeHoursTypes";

// Define types for meeting status responses
type MeetingStatusResponse = {
  success: boolean;
  message: string;
  status: number;
  includeData: boolean;
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
    Upcoming: {
      success: true,
      message: "Meeting is upcoming",
      status: 200,
      includeData: true,
    },
    active: {
      success: true,
      message: "Meeting is upcoming",
      status: 200,
      includeData: true,
    },
    Recorded: {
      success: true,
      message: "Meeting has ended",
      status: 200,
      includeData: true,
    },
    Finished: {
      success: true,
      message: "Meeting has ended",
      status: 200,
      includeData: true,
    },
    inactive: {
      success: true,
      message: "Meeting has ended",
      status: 200,
      includeData: true,
    },
    Ongoing: {
      success: true,
      message: "Meeting is ongoing",
      status: 200,
      includeData: true,
    },
    ongoing: {
      success: true,
      message: "Meeting is ongoing",
      status: 200,
      includeData: true,
    },
    Denied: {
      success: true,
      message: "Meeting has been denied",
      status: 200,
      includeData: true,
    },
  };

  return (
    responses[status] || {
      success: false,
      message: "Meeting status is invalid",
      status: 400,
      includeData: true,
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
        .collection("sessions")
        .findOne({ meetingId: roomId });

      if (!meeting) {
        return createResponse(false, "Meeting does not exist", null, 404);
      }

      const { success, message, status, includeData } =
        getMeetingStatusResponse(meeting.meeting_status);

      return createResponse(
        success,
        message,
        includeData ? meeting : null,
        status
      );
    } else if (meetingType === "office_hours") {
      const officeHours = await db
        .collection<OfficeHoursDocument>("office_hours")
        .findOne({ "meetings.meetingId": roomId });

      if (!officeHours) {
        return createResponse(false, "Meeting does not exist", null, 404);
      }

      // Find the specific meeting directly from the meetings array
      const meeting = officeHours.meetings.find((m) => m.meetingId === roomId);

      if (!meeting) {
        return createResponse(false, "Meeting does not exist", null, 404);
      }

      // Add host_address to the meeting data for consistency
      const meetingWithHost = {
        ...meeting,
        host_address: officeHours.host_address,
      };

      const { success, message, status, includeData } =
        getMeetingStatusResponse(meeting.meeting_status!);

      return createResponse(
        success,
        message,
        includeData ? meetingWithHost : null,
        status
      );
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
