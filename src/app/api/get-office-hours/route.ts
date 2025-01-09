import { connectDB } from "@/config/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { Meeting, OfficeHoursDocument } from "@/types/OfficeHoursTypes";

export async function GET(req: NextRequest) {
  let client;

  try {
    const url = new URL(req.url);
    const host_address = url.searchParams.get("host_address");
    const dao_name = url.searchParams.get("dao_name");

    client = await connectDB();
    const db = client.db();
    const collection = db.collection("office_hours");
    const Attestcollction = db.collection("attestation");

    let query: any = {};

    // Modified query to fetch both hosted meetings and meetings where user is an attendee
    if (host_address && dao_name) {
      query = {
        $and: [
          { "dao.name": dao_name },
          {
            $or: [
              { host_address: host_address },
              { "dao.meetings.attendees.attendee_address": host_address },
            ],
          },
        ],
      };
    } else if (dao_name) {
      query = {
        "dao.name": dao_name,
      };
    } else if (host_address) {
      query = {
        $or: [
          { host_address: host_address },
          { "dao.meetings.attendees.attendee_address": host_address },
        ],
      };
    }

    const results = await collection.find(query).toArray();

    if (!results.length) {
      return NextResponse.json(
        {
          success: true,
          data: {
            ongoing: [],
            upcoming: [],
            recorded: [],
            hosted: [],
            attended: [],
          },
        },
        { status: 200 }
      );
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

    await Promise.all(
      results.flatMap((result) => {
        const relevantDaos = dao_name
          ? result.dao.filter((d: any) => d.name === dao_name)
          : result.dao;

        return relevantDaos.flatMap((dao: any) => {
          return (dao.meetings || []).map(async (meeting: Meeting) => {
            const meetingDocument = {
              ...meeting,
              host_address: result.host_address,
              dao_name: dao.name,
              meetingType: 0,
              meeting_starttime: null,
              meeting_endtime: null,
              isEligible: false,
            };

            const attendanceVerification = await Attestcollction.findOne(
              {
                roomId: meetingDocument.meetingId,
                $or: [
                  {
                    "hosts.metadata.walletAddress": {
                      $regex: `^${host_address}$`,
                      $options: "i",
                    },
                  },
                  {
                    "participants.metadata.walletAddress": {
                      $regex: `^${host_address}$`,
                      $options: "i",
                    },
                  },
                ],
              },
              {
                projection: {
                  "hosts.metadata.walletAddress": 1,
                  "participants.metadata.walletAddress": 1,
                  startTime: 1,
                  endTime: 1,
                  meetingType: 1,
                },
              }
            );

            // console.log("Line 124:", attendanceVerification);

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
                  meetingDocument.meeting_starttime =
                    attendanceVerification?.startTime;
                  meetingDocument.meeting_endtime =
                    attendanceVerification?.endTime;
                  meetingDocument.meetingType = 3;
                  const isHost = attendanceVerification?.hosts?.some(
                    (host: { metadata: { walletAddress: string } }) =>
                      host.metadata?.walletAddress?.toLowerCase() ===
                      host_address?.toLowerCase()
                  );
                  meetingDocument.isEligible = isHost;
                  hosted.push(meetingDocument);
                }

                // Check if this is an attended meeting (where user is not the host)
                if (
                  host_address &&
                  result.host_address !== host_address &&
                  meeting.attendees?.some(
                    (attendee) => attendee.attendee_address === host_address
                  )
                ) {
                  meetingDocument.meeting_starttime =
                    attendanceVerification?.startTime;
                  meetingDocument.meeting_endtime =
                    attendanceVerification?.endTime;
                  meetingDocument.meetingType = 4;
                  const isParticipant =
                    attendanceVerification?.participants?.some(
                      (participant: { metadata: { walletAddress: string } }) =>
                        participant.metadata?.walletAddress?.toLowerCase() ===
                        host_address?.toLowerCase()
                    );
                  meetingDocument.isEligible = isParticipant;
                  attended.push(meetingDocument);
                }
                break;
            }
          });
        });
      })
    );

    // Sort meetings by date if available
    const sortByDate = (a: Meeting, b: Meeting) => {
      const dateA = new Date(a.startTime || 0).getTime();
      const dateB = new Date(b.startTime || 0).getTime();
      return dateB - dateA; // Most recent first
    };

    await client.close();

    return NextResponse.json(
      {
        success: true,
        data: {
          ongoing: ongoing,
          upcoming: upcoming,
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
  } finally {
    if (client) {
      await client.close();
    }
  }
}
