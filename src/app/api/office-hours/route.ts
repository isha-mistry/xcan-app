import { connectDB } from "@/config/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { Collection } from "mongodb";
import {
  Meeting,
  OfficeHoursDocument,
  OfficeHoursRequestBody,
} from "@/types/OfficeHoursTypes";
import { v4 as uuidv4 } from "uuid";
import { imageCIDs } from "@/config/staticDataUtils";
import { cacheWrapper } from "@/utils/cacheWrapper";
import { io } from "socket.io-client";
import {
  formatSlotDateAndTime,
  getDisplayNameOrAddr,
} from "@/utils/NotificationUtils";
import { SOCKET_BASE_URL } from "@/config/constants";



function getRandomElementFromArray(arr: any[]) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
const randomImage = getRandomElementFromArray(imageCIDs);

async function sendNotifications(
  db: any,
  hostAddress: string,
  daoName: string,
  meetings: Meeting[]
) {
  try {
    const usersCollection = db.collection("delegates");
    const notificationCollection = db.collection("notifications");

    const normalizedHostAddress = hostAddress.toLowerCase();

    const allUsers = await usersCollection
      .find({
        $expr: {
          $ne: [{ $toLower: "$address" }, normalizedHostAddress],
        },
      })
      .toArray();

    if (!allUsers || allUsers.length === 0) {
      console.log("No users found to notify");
      return;
    }

    const localSlotTime = async (slot_time: string) => {
      const data = await formatSlotDateAndTime({
        dateInput: slot_time,
      });

      return data;
    };

    const notifications = meetings.flatMap((meeting) => {
      const timePromise = localSlotTime(meeting.startTime);

      return Promise.all(
        allUsers.map(async (user: any) => {
          const formattedTime = await timePromise;
          const hostENSNameOrAddress = await getDisplayNameOrAddr(hostAddress);
          return {
            receiver_address: user.address,
            content: `New office hours is scheduled on ${daoName} by ${hostENSNameOrAddress} on ${formattedTime} UTC.`,
            createdAt: Date.now(),
            read_status: false,
            notification_name: "officeHoursScheduled",
            notification_title: "Office Hours Scheduled",
            notification_type: "officeHours",
            additionalData: {
              ...meeting,
              host_address: hostAddress,
              dao_name: daoName,
            },
          };
        })
      );
    });

    const resolvedNotifications = await Promise.all(notifications).then(
      (arrays) => arrays.flat()
    );

    // console.log("Resolved notifications:", resolvedNotifications);

    if (resolvedNotifications.length > 0) {
      try {
        const result = await notificationCollection.insertMany(
          resolvedNotifications
        );
        console.log(`${result.insertedCount} notifications stored in database`);

        const storedNotifications = await notificationCollection
          .find({
            _id: { $in: Object.values(result.insertedIds) },
          })
          .toArray();

        const socket = io(SOCKET_BASE_URL, {
          withCredentials: true,
        });

        socket.on("connect", () => {
          console.log("Connected to WebSocket server from API");

          // Emit office_hours_scheduled event with notifications
          socket.emit("officehours_scheduled", {
            notifications: storedNotifications.map((notification: any) => ({
              ...notification,
              _id: notification._id.toString(),
            })),
          });

          console.log("Office hours notifications sent through socket");
          socket.disconnect();
        });

        socket.on("connect_error", (err) => {
          console.error("WebSocket connection error:", err);
        });

        socket.on("error", (err) => {
          console.error("WebSocket error:", err);
        });
      } catch (dbError) {
        console.error("Error storing notifications in database:", dbError);
        throw dbError;
      }
    } else {
      console.log("No notifications to send");
    }
  } catch (error) {
    console.error("Error in notification process:", error);
    throw error;
  }
}

const getRoomId = async () => {
  const response = await fetch(
    "https://api.huddle01.com/api/v2/sdk/rooms/create-room",
    {
      method: "POST",
      body: JSON.stringify({
        title: "Test Room",
      }),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create room");
  } else {
    return response.json();
  }
};

const addMeetingsToExistingDAO = async (
  collection: Collection<OfficeHoursDocument>,
  hostAddress: string,
  daoName: string,
  meetings: Meeting[]
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  // Process meetings sequentially using for...of to maintain order
  const meetingDocument = [];
  for (const meeting of meetings) {
    const meetingDate = new Date(meeting.startTime);
    meetingDate.setHours(0, 0, 0, 0);

    const baseDocument = {
      reference_id: uuidv4(),
      ...meeting,
      meeting_status: "Upcoming",
      status: "active",
      thumbnail_image: randomImage,
      created_at: new Date(),
    };

    if (meetingDate.getTime() === today.getTime()) {
      try {
        // Direct API call since we're already in the API route
        const result = await getRoomId();
        meetingDocument.push({
          ...baseDocument,
          meetingId: result.data.roomId,
        });
      } catch (error) {
        console.error("Error generating meeting ID:", error);
        meetingDocument.push(baseDocument);
      }
    } else {
      meetingDocument.push(baseDocument);
    }
  }

  return await collection.updateOne(
    { host_address: hostAddress, "dao.name": daoName },
    {
      $push: {
        "dao.$.meetings": {
          $each: meetingDocument,
        },
      },
      $set: { updated_at: new Date() },
    }
  );
};
const addNewDAOWithMeetings = async (
  collection: Collection<OfficeHoursDocument>,
  hostAddress: string,
  daoName: string,
  meetings: Meeting[]
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  // Process meetings sequentially
  const meetingDocument = [];
  for (const meeting of meetings) {
    const meetingDate = new Date(meeting.startTime);
    meetingDate.setHours(0, 0, 0, 0);

    const baseDocument = {
      reference_id: uuidv4(),
      ...meeting,
      status: "active" as const,
      meeting_status: "Upcoming",
      thumbnail_image: randomImage,
      created_at: new Date(),
    };
    if (meetingDate.getTime() === today.getTime()) {
      try {
        const result = await getRoomId();
        meetingDocument.push({
          ...baseDocument,
          meetingId: result.data.roomId,
        });
      } catch (error) {
        console.error("Error generating meeting ID:", error);
        meetingDocument.push(baseDocument);
      }
    } else {
      meetingDocument.push(baseDocument);
    }
  }

  return await collection.updateOne(
    { host_address: hostAddress },
    {
      $push: {
        dao: {
          name: daoName,
          meetings: meetingDocument,
        },
      },
      $set: { updated_at: new Date() },
    }
  );
};
const createNewHostWithMeetings = async (
  collection: Collection<OfficeHoursDocument>,
  hostAddress: string,
  daoName: string,
  meetings: Meeting[]
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  // Process meetings sequentially
  const meetingDocument = [];
  for (const meeting of meetings) {
    const meetingDate = new Date(meeting.startTime);
    meetingDate.setHours(0, 0, 0, 0);

    const baseDocument = {
      reference_id: uuidv4(),
      ...meeting,
      meeting_status: "Upcoming",
      status: "active" as const,
      thumbnail_image: randomImage,
      created_at: new Date(),
    };

    if (meetingDate.getTime() === today.getTime()) {
      try {
        const result = await getRoomId();
        meetingDocument.push({
          ...baseDocument,
          meetingId: result.data.roomId,
        });
      } catch (error) {
        console.error("Error generating meeting ID:", error);
        meetingDocument.push(baseDocument);
      }
    } else {
      meetingDocument.push(baseDocument);
    }
  }

  return await collection.insertOne({
    host_address: hostAddress,
    dao: [
      {
        name: daoName,
        meetings: meetingDocument,
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  });
};

// Main API handler
export async function POST(req: NextRequest) {
  try {
    const data: OfficeHoursRequestBody = await req.json();

    const client = await connectDB();
    const db = client.db();
    const collection: Collection<OfficeHoursDocument> =
      db.collection("office_hours");

    if (cacheWrapper.isAvailable) {
      const cacheKey = `office-hours-all`;
      await cacheWrapper.delete(cacheKey);
    }

    const { host_address: hostAddress, dao_name: daoName, meetings } = data;

    const existingHost = await collection.findOne({
      host_address: hostAddress,
    });

    if (existingHost) {
      const existingDAO = existingHost.dao?.find((dao) => dao.name === daoName);
      if (cacheWrapper.isAvailable) {
        const cacheKey = `office-hours-all`;
        await cacheWrapper.delete(cacheKey);
      }
      if (existingDAO) {
        await addMeetingsToExistingDAO(
          collection,
          hostAddress,
          daoName,
          meetings
        );
      } else {
        await addNewDAOWithMeetings(collection, hostAddress, daoName, meetings);
      }
    } else {
      if (cacheWrapper.isAvailable) {
        const cacheKey = `office-hours-all`;
        await cacheWrapper.delete(cacheKey);
      }
      await createNewHostWithMeetings(
        collection,
        hostAddress,
        daoName,
        meetings
      );
    }

    await sendNotifications(db, hostAddress, daoName, meetings);

    const updatedDocument = await collection.findOne({
      host_address: hostAddress,
    });
    await client.close();

    return NextResponse.json(
      {
        success: true,
        data: updatedDocument,
        message: "Meetings stored successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error storing office hours:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
