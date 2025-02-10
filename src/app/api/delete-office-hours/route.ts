import { connectDB } from "@/config/connectDB";
import { Attendee, OfficeHoursProps } from "@/types/OfficeHoursTypes";
import { NextResponse } from "next/server";
import { cacheWrapper } from "@/utils/cacheWrapper";
import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "@/config/constants";
import {
  formatSlotDateAndTime,
  getDisplayNameOrAddr,
} from "@/utils/NotificationUtils";

interface DeleteMeetingRequestBody {
  host_address: string;
  dao_name: string;
  reference_id: string;
}

async function sendMeetingDeletionNotification({
  db,
  title,
  dao_name,
  startTime,
  host_address,
  additionalData,
}: {
  db: any;
  title: string;
  dao_name: string;
  startTime: string;
  host_address: string;
  additionalData: any;
}) {
  try {
    // Get collections
    const usersCollection = db.collection("delegates");
    const notificationCollection = db.collection("notifications");

    const allUsers = await usersCollection
      .find(
        {
          address: {
            $ne: host_address.toLowerCase(),
          },
        },
        { address: 1 }
      )
      .toArray();

    // Format the time
    const localSlotTime = await formatSlotDateAndTime({
      dateInput: startTime,
    });
    const hostENSNameOrAddress = await getDisplayNameOrAddr(host_address);

    // Create base notification object
    const baseNotification = {
      content: `Office hours "${title}" for ${dao_name}, previously scheduled for ${localSlotTime} UTC and hosted by ${hostENSNameOrAddress}, has been cancelled. We apologize for any inconvenience.`,
      createdAt: Date.now(),
      read_status: false,
      notification_name: "officeHoursDeleted",
      notification_title: "Office Hours Cancelled",
      notification_type: "officeHours",
      additionalData: {
        additionalData,
        host_address,
        dao_name,
      },
    };

    // Create notifications for all users except host
    const notifications = allUsers
      .filter(
        (user: any) => user.address.toLowerCase() !== host_address.toLowerCase()
      )
      .map((user: any) => ({
        ...baseNotification,
        receiver_address: user.address,
      }));

    // Insert all notifications at once
    const notificationResults = await notificationCollection.insertMany(
      notifications
    );

    console.log("Inserted deletion notifications:", notificationResults);

    if (notificationResults.acknowledged === true) {
      // Get all inserted notifications
      const insertedNotifications = await notificationCollection
        .find({
          _id: { $in: Object.values(notificationResults.insertedIds) },
        })
        .toArray();

      // Connect to socket server and send notifications
      const socket = io(`${SOCKET_BASE_URL}`, {
        withCredentials: true,
      });

      socket.on("connect", () => {
        console.log("Connected to WebSocket server from API");

        socket.emit("officehours_deleted", {
          notifications: insertedNotifications.map((notification: any) => ({
            ...notification,
            _id: notification._id.toString(),
          })),
        });

        console.log(
          "Bulk deletion notifications sent from API to socket server"
        );
        socket.disconnect();
      });

      socket.on("connect_error", (err) => {
        console.error("WebSocket connection error:", err);
      });

      socket.on("error", (err) => {
        console.error("WebSocket error:", err);
      });
    }

    return notificationResults;
  } catch (error) {
    console.error("Error sending meeting deletion notifications:", error);
    throw error;
  }
}

export async function DELETE(req: Request) {
  try {
    const deleteData: DeleteMeetingRequestBody = await req.json();
    const { host_address, dao_name, reference_id } = deleteData;
    // Validate required fields
    if (!host_address || !dao_name || !reference_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: host_address, dao_name, or reference_id",
        },
        { status: 400 }
      );
    }

    if (cacheWrapper.isAvailable) {
      const cacheKey = `office-hours-all`;
      await cacheWrapper.delete(cacheKey);
    }

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("office_hours");
    // First, check if the document exists
    const existingDoc = await collection.findOne({
      host_address,
      "dao.name": dao_name,
      "dao.meetings.reference_id": reference_id,
    });
    if (!existingDoc) {
      await client.close();
      return NextResponse.json(
        {
          success: false,
          message: "Meeting not found",
        },
        { status: 404 }
      );
    }

    const existingDAO = existingDoc.dao.find((d: any) => d.name === dao_name);
    const existingMeeting = existingDAO?.meetings.find(
      (m: any) => m.reference_id === reference_id
    );

    try {
      await sendMeetingDeletionNotification({
        db,
        title: existingMeeting.title,
        dao_name,
        startTime: existingMeeting.startTime,
        host_address,
        additionalData: existingMeeting,
      });
    } catch (error) {
      console.error("Error sending deletion notifications:", error);
    }

    // Remove the meeting from the meetings array
    const result = await collection.updateOne(
      {
        host_address,
        "dao.name": dao_name,
      },
      {
        /*@ts-ignore*/
        $pull: {
          "dao.$[daoElem].meetings": {
            reference_id: reference_id,
          },
        },
        $set: {
          updated_at: new Date(),
        },
      },
      {
        arrayFilters: [{ "daoElem.name": dao_name }],
      }
    );
    if (result.modifiedCount === 0) {
      await client.close();
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete meeting",
        },
        { status: 500 }
      );
    }
    // Check if the DAO now has no meetings
    const updatedDoc = await collection.findOne({
      host_address,
      "dao.name": dao_name,
    });
    const dao = updatedDoc?.dao.find((d: any) => d.name === dao_name);
    // If DAO has no meetings, remove the entire DAO
    if (dao && dao.meetings.length === 0) {
      await collection.updateOne(
        { host_address },
        {
          /*@ts-ignore*/
          $pull: {
            dao: { name: dao_name },
          },
        }
      );
    }

    await client.close();
    return NextResponse.json(
      {
        success: true,
        message: "Meeting deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error,
      },
      { status: 500 }
    );
  }
}
