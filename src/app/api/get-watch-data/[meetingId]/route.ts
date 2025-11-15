import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import {
  Attendee,
  Meeting,
  OfficeHoursDocument,
} from "@/types/OfficeHoursTypes";
import { UploadedVideo } from "@/types/UploadedVideoTypes";

type Params = {
  meetingId: string;
};

export async function GET(req: NextRequest, context: { params: Params }) {
  console.log("inside get watch data API");
  const meetingId = context.params.meetingId;

  try {
    const client = await connectDB();
    const db = client.db();
    const meetingsCollection = db.collection("sessions");
    const officeHoursCollection = db.collection("office_hours");
    const recordedVideosCollection = db.collection("uploaded_videos");
    const delegatesCollection = db.collection("users");

    // First try to find in meetings collection
    const meetingsDocuments = await meetingsCollection
      .find({ meetingId, meeting_status: "Recorded" })
      .toArray();

    // Modified query for office hours to search within the meetings array directly
    const officeHoursDocuments = (await officeHoursCollection
      .find({
        "meetings.meetingId": meetingId,
      })
      .toArray()) as unknown as OfficeHoursDocument[];

    const recordedVideosDocuments = await recordedVideosCollection
      .find({
        youtube_video_id: meetingId,
      })
      .toArray();

    if (meetingsDocuments.length > 0) {
      const mergedData = await Promise.all(
        meetingsDocuments.map(async (session) => {
          const { host_address, attendees } = session;

          const hostInfo = await delegatesCollection.findOne({
            address: host_address,
          });

          const attendeesProfileDetails = await Promise.all(
            (attendees || []).map(async (attendee: Attendee) => {
              const attendeeInfo = await delegatesCollection.findOne({
                address: attendee.attendee_address,
              });
              return {
                ...attendee,
                profileInfo: attendeeInfo,
              };
            })
          );

          return {
            ...session,
            attendees: attendeesProfileDetails,
            hostProfileInfo: hostInfo,
          };
        })
      );

      client.close();
      return NextResponse.json(
        { success: true, collection: "sessions", data: mergedData },
        { status: 200 }
      );
    } else if (officeHoursDocuments.length > 0) {
      const mergedData = await Promise.all(
        officeHoursDocuments.map(async (officeHour) => {
          // Find the specific meeting in the meetings array
          const matchingMeeting = officeHour.meetings.find(
            (meeting) => meeting.meetingId === meetingId
          );

          if (!matchingMeeting) {
            return null;
          }

          // Get host info
          const hostInfo = await delegatesCollection.findOne({
            address: officeHour.host_address,
          });

          // Get attendees info if present
          const attendeesProfileDetails = matchingMeeting.attendees
            ? await Promise.all(
                matchingMeeting.attendees.map(async (attendee: Attendee) => {
                  const attendeeInfo = await delegatesCollection.findOne({
                    address: attendee.attendee_address,
                  });
                  return {
                    ...attendee,
                    profileInfo: attendeeInfo,
                  };
                })
              )
            : [];

          // Construct response object
          return {
            ...matchingMeeting,
            host_address: officeHour.host_address,
            attendees: attendeesProfileDetails,
            hostProfileInfo: hostInfo,
          };
        })
      );

      // Filter out null results
      const filteredData = mergedData.filter(Boolean);

      client.close();
      if (filteredData.length > 0) {
        return NextResponse.json(
          {
            success: true,
            collection: "office_hours",
            data: filteredData,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { success: true, data: null },
          { status: 404 }
        );
      }
    } else if (recordedVideosDocuments.length > 0) {
      const mergedData = await Promise.all(
        recordedVideosDocuments.map(async (recordedVideo) => {
          return {
            host_address: recordedVideo.user_address,
            video_uri: recordedVideo.video_link,
            thumbnail_url: recordedVideo.thumbnail_url,
            slot_time: recordedVideo.created_at,
            ...recordedVideo,
          };
        })
      );
      client.close();
      return NextResponse.json(
        { success: true, data: mergedData },
        { status: 200 }
      );
    } else {
      client.close();
      return NextResponse.json({ success: true, data: null }, { status: 404 });
    }
  } catch (error) {
    console.error(
      "Error retrieving data in meeting session data by id:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
