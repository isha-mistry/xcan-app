import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import {
  Attendee,
  Meeting,
  OfficeHoursDocument,
} from "@/types/OfficeHoursTypes";

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
    const delegatesCollection = db.collection("users");

    // First try to find in meetings collection
    const meetingsDocuments = await meetingsCollection
      .find({ meetingId, meeting_status: "Recorded" })
      .toArray();

    // Modified query for office hours to search within the dao array's meetings
    const officeHoursDocuments = (await officeHoursCollection
      .find({
        "dao.meetings.meetingId": meetingId,
      })
      .toArray()) as unknown as OfficeHoursDocument[];

    if (meetingsDocuments.length > 0) {
      const mergedData = await Promise.all(
        meetingsDocuments.map(async (session) => {
          const { host_address, dao_name, attendees } = session;

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
        { success: true, collection: "meetings", data: mergedData },
        { status: 200 }
      );
    } else if (officeHoursDocuments.length > 0) {
      const mergedData = await Promise.all(
        officeHoursDocuments.flatMap(async (officeHour) => {
          // Find the specific meeting across all DAOs
          const matchingMeetings = officeHour.dao.flatMap((daoItem) => {
            const meeting = daoItem.meetings.find(
              (meeting) => meeting.meetingId === meetingId
            );
            return meeting ? [{ meeting, daoName: daoItem.name }] : [];
          });

          if (matchingMeetings.length === 0) {
            return [];
          }

          // Get host info
          const hostInfo = await delegatesCollection.findOne({
            address: officeHour.host_address,
          });

          // Process each matching meeting
          return Promise.all(
            matchingMeetings.map(async ({ meeting, daoName }) => {
              // Get attendees info if present
              const attendeesProfileDetails = meeting.attendees
                ? await Promise.all(
                    meeting.attendees.map(async (attendee: Attendee) => {
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
                ...meeting,
                host_address: officeHour.host_address,
                dao_name: daoName,
                attendees: attendeesProfileDetails,
                hostProfileInfo: hostInfo,
              };
            })
          );
        })
      );

      // Flatten the array and filter out empty results
      const flattenedData = mergedData.flat().filter(Boolean);

      client.close();
      if (flattenedData.length > 0) {
        return NextResponse.json(
          {
            success: true,
            collection: "office_hours",
            data: flattenedData,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { success: true, data: null },
          { status: 404 }
        );
      }
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
