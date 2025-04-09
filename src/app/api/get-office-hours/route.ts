import { connectDB } from "@/config/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { Meeting, OfficeHoursDocument } from "@/types/OfficeHoursTypes";
import { cacheWrapper } from "@/utils/cacheWrapper";

export async function GET(req: NextRequest) {
  let client;

  try {
    const url = new URL(req.url);
    const host_address = url.searchParams.get("host_address");
    const dao_name = url.searchParams.get("dao_name");
    const type = url.searchParams.get("type");

    let query: any = {
      "dao.meetings.status": "active", // Base condition for active meetings
    };

    // Case-insensitive regex for host_address
    const hostAddressRegex = host_address
      ? new RegExp(`^${host_address}$`, "i")
      : null;

    // Modified query to fetch both hosted meetings and meetings where user is an attendee
    if (host_address && dao_name) {
      // query = {
      //   $and: [
      //     { "dao.name": dao_name },
      //     { "dao.meetings.status": "active" },
      // {
      //   $or: [
      //     { host_address: { $regex: hostAddressRegex } }, // Case-insensitive host check
      //     { "dao.meetings.attendees.attendee_address": { $regex: hostAddressRegex } },
      //   ],
      // },
      //   ],
      // };
      if (type === "attended") {
        query = {
          $and: [
            { "dao.name": dao_name },
            { "dao.meetings.status": "active" },
            {
              $or: [
                { host_address: { $regex: hostAddressRegex } }, 
                {
                  "dao.meetings.attendees.attendee_address": {
                    $regex: hostAddressRegex,
                  },
                },
              ],
            },
          ],
        };
      } else {
        query = {
          $and: [
            { "dao.name": dao_name },
            { "dao.meetings.status": "active" },
            {
              $or: [
                { host_address: { $regex: hostAddressRegex } }, 
              ],
            },
          ],
        };
      }
    } else if (dao_name) {
      query = {
        $and: [{ "dao.name": dao_name }, { "dao.meetings.status": "active" }],
      };
    } else if (host_address) {
      if (type === "attended") {
        query = {
          $and: [
            { "dao.name": dao_name },
            { "dao.meetings.status": "active" },
            {
              $or: [
                { host_address: { $regex: hostAddressRegex } },
                {
                  "dao.meetings.attendees.attendee_address": {
                    $regex: hostAddressRegex,
                  },
                },
              ],
            },
          ],
        };
      } else {
        query = {
          $and: [
            { "dao.name": dao_name },
            { "dao.meetings.status": "active" },
            {
              $or: [
                { host_address: { $regex: hostAddressRegex } }, 
              ],
            },
          ],
        };
      }
    }

    // Check if query is empty (only has status filter)
    const isEmptyQuery =
      Object.keys(query).length === 1 && query["dao.meetings.status"];

    if (isEmptyQuery) {
      const cacheKey = `office-hours-all`;

      if (cacheWrapper.isAvailable) {
        const cacheValue = await cacheWrapper.get(cacheKey);
        if (cacheValue) {
          console.log(`Serving from cache: office-hours-all`);
          return NextResponse.json(
            { success: true, data: JSON.parse(cacheValue) },
            { status: 200 }
          );
        }
      }
    }

    client = await connectDB();
    const db = client.db();
    const collection = db.collection("office_hours");
    const attestCollection = db.collection("attestation");

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

    const currentTime = new Date().getTime();
    const bufferTime = currentTime - 60 * 60 * 1000;

    await Promise.all(
      results.flatMap((result) => {
        const relevantDaos = dao_name
          ? result.dao.filter((d: any) => d.name === dao_name)
          : result.dao;

        return relevantDaos.flatMap((dao: any) => {
          // Filter for active meetings only
          return (dao.meetings || [])
            .filter((meeting: Meeting) => meeting.status === "active")
            .map(async (meeting: Meeting) => {
              const meetingDocument = {
                ...meeting,
                host_address: result.host_address,
                dao_name: dao.name,
                meetingType: 0,
                meeting_starttime: null,
                meeting_endtime: null,
                isEligible: false,
              };

              const attendanceVerification = await attestCollection.findOne(
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

              const meetingStartTime = new Date(
                meeting.startTime || 0
              ).getTime();
              const oneDayAgo = currentTime - 6 * 60 * 60 * 1000;

              // Categorize meetings
              switch (meeting.meeting_status) {
                case "Ongoing":
                  if (meetingStartTime > oneDayAgo) {
                    ongoing.push(meetingDocument);
                  }
                  break;
                case "Upcoming":
                  if (meetingStartTime > bufferTime) {
                    upcoming.push(meetingDocument);
                  }
                  break;
                case "Recorded":
                  recorded.push(meetingDocument);

                  if (result.host_address.toLowerCase() === host_address?.toLowerCase()) {
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

                  if (
                    meeting.attendees?.some(
                      (attendee) => attendee.attendee_address.toLowerCase() === (host_address || '').toLowerCase()
                    )
                  ) {
                    meetingDocument.meeting_starttime =
                      attendanceVerification?.startTime;
                    meetingDocument.meeting_endtime =
                      attendanceVerification?.endTime;
                    meetingDocument.meetingType = 4;
                    const isParticipant =
                      attendanceVerification?.participants?.some(
                        (participant: {
                          metadata: { walletAddress: string };
                        }) =>
                          participant.metadata?.walletAddress?.toLowerCase() ===
                          (host_address || '').toLowerCase()
                      );
                    meetingDocument.isEligible = isParticipant;
                    attended.push(meetingDocument);
                  }

                // Check if this is an attended meeting (where user is not the host)
                // if (
                //   host_address &&
                //   result.host_address !== host_address &&
                //   meeting.attendees?.some(
                //     (attendee) => attendee.attendee_address === host_address
                //   )
                // ) {
                //   meetingDocument.meeting_starttime =
                //     attendanceVerification?.startTime;
                //   meetingDocument.meeting_endtime =
                //     attendanceVerification?.endTime;
                //   meetingDocument.meetingType = 4;
                //   const isParticipant =
                //     attendanceVerification?.participants?.some(
                //       (participant: { metadata: { walletAddress: string } }) =>
                //         participant.metadata?.walletAddress?.toLowerCase() ===
                //         host_address?.toLowerCase()
                //     );
                //   meetingDocument.isEligible = isParticipant;
                //   attended.push(meetingDocument);
                // }
                // break;
              }
            });
        });
      })
    );

    const sortAscending = (a: Meeting, b: Meeting) => {
      const dateA = new Date(a.startTime || 0).getTime();
      const dateB = new Date(b.startTime || 0).getTime();
      return dateA - dateB;
    };

    const sortDescending = (a: Meeting, b: Meeting) => {
      const dateA = new Date(a.startTime || 0).getTime();
      const dateB = new Date(b.startTime || 0).getTime();
      return dateB - dateA;
    };

    await client.close();

    const response = {
      ongoing: ongoing.sort(sortAscending),
      upcoming: upcoming.sort(sortAscending),
      recorded: recorded.sort(sortDescending),
      hosted: hosted.sort(sortDescending),
      attended: attended.sort(sortDescending),
    };

    // Cache the response if it's an empty query
    if (isEmptyQuery && cacheWrapper.isAvailable) {
      const cacheKey = `office-hours-all`;
      await cacheWrapper.set(cacheKey, JSON.stringify(response), 600); // Cache for 10 minutes
    }

    return NextResponse.json(
      {
        success: true,
        data: response,
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
