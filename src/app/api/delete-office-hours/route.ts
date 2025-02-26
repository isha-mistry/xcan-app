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

interface UpdateMeetingRequestBody {
  host_address: string;
  dao_name: string;
  reference_id: string;
  delete_reason: string;
}

async function sendMeetingDeletionNotification({
  db,
  title,
  dao_name,
  startTime,
  host_address,
  additionalData,
  deleteReason,
}: {
  db: any;
  title: string;
  dao_name: string;
  startTime: string;
  host_address: string;
  additionalData: any;
  deleteReason: string;
}) {
  try {
    const usersCollection = db.collection("delegates");
    const notificationCollection = db.collection("notifications");
    const normalizedHostAddress = host_address.toLowerCase();

    const allUsers = await usersCollection
      .find({
        $expr: {
          $ne: [{ $toLower: "$address" }, normalizedHostAddress],
        },
      })
      .toArray();

    // const allUsers = [{address: "0x92DDc071cC4337b08e"}]
    if (!allUsers || allUsers.length === 0) {
      console.log("No users found to notify");
      return;
    }

    // Format the time
    const localSlotTime = await formatSlotDateAndTime({
      dateInput: startTime,
    });
    const hostENSNameOrAddress = await getDisplayNameOrAddr(host_address);

    // Updated notification content to include deletion reason
    const baseNotification = {
      content: `Office hours "${title}" for ${dao_name}, previously scheduled for ${localSlotTime} UTC and hosted by ${hostENSNameOrAddress}, has been cancelled. We apologize for any inconvenience. ${
        deleteReason && `Reason: ${deleteReason}.`
      }`,
      createdAt: Date.now(),
      read_status: false,
      notification_name: "officeHoursDeleted",
      notification_title: "Office Hours Cancelled",
      notification_type: "officeHours",
      additionalData: {
        additionalData,
        host_address,
        dao_name,
        delete_reason: deleteReason,
      },
    };

    // Create notifications for all users except host
    const notifications = allUsers.map((user: any) => ({
      ...baseNotification,
      receiver_address: user.address,
    }));

    // Insert all notifications at once
    const notificationResults = await notificationCollection.insertMany(
      notifications
    );

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

// Rename the function to PATCH since we're updating, not deleting
export async function PUT(req: Request) {
  try {
    const updateData: UpdateMeetingRequestBody = await req.json();
    const { host_address, dao_name, reference_id, delete_reason } = updateData;

    // Validate required fields
    if (!host_address || !dao_name || !reference_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: host_address, dao_name, reference_id, or delete_reason",
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
      if (cacheWrapper.isAvailable) {
        const cacheKey = `office-hours-all`;
        await cacheWrapper.delete(cacheKey);
      }
      await sendMeetingDeletionNotification({
        db,
        title: existingMeeting.title,
        dao_name,
        startTime: existingMeeting.startTime,
        host_address,
        additionalData: existingMeeting,
        deleteReason: delete_reason,
      });
    } catch (error) {
      console.error("Error sending deletion notifications:", error);
    }

    // Update the meeting status to 'deleted' instead of removing it
    const result = await collection.updateOne(
      {
        host_address,
        "dao.name": dao_name,
        "dao.meetings.reference_id": reference_id,
      },
      {
        $set: {
          "dao.$[daoElem].meetings.$[meetingElem].status": "deleted",
          "dao.$[daoElem].meetings.$[meetingElem].delete_reason": delete_reason,
          updated_at: new Date(),
        },
      },
      {
        arrayFilters: [
          { "daoElem.name": dao_name },
          { "meetingElem.reference_id": reference_id },
        ],
      }
    );

    if (result.modifiedCount === 0) {
      await client.close();
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update meeting status",
        },
        { status: 500 }
      );
    }

    await client.close();
    return NextResponse.json(
      {
        success: true,
        message: "Meeting marked as deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating meeting status:", error);
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
