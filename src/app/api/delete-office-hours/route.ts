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
  reference_id: string;
  delete_reason: string;
}

async function sendMeetingDeletionNotification({
  db,
  title,
  startTime,
  host_address,
  additionalData,
  deleteReason,
}: {
  db: any;
  title: string;
  startTime: string;
  host_address: string;
  additionalData: any;
  deleteReason: string;
}) {
  try {
    const usersCollection = db.collection("users");
    const notificationCollection = db.collection("notifications");
    const normalizedHostAddress = host_address.toLowerCase();

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

    // Format the time
    const localSlotTime = await formatSlotDateAndTime({
      dateInput: startTime,
    });
    const hostENSNameOrAddress = await getDisplayNameOrAddr(host_address);

    // Updated notification content without DAO name
    const baseNotification = {
      content: `Lecture "${title}" previously scheduled for ${localSlotTime} UTC and hosted by ${hostENSNameOrAddress}, has been cancelled. We apologize for any inconvenience. ${
        deleteReason && `Reason: ${deleteReason}.`
      }`,
      createdAt: Date.now(),    
      read_status: false,
      notification_name: "officeHoursDeleted",
      notification_title: "Lecture Cancelled",
      notification_type: "officeHours",
      additionalData: {
        ...additionalData,
        host_address,
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

      // socket.on("connect", () => {
      //   console.log("Connected to WebSocket server from API");

      //   socket.emit("officehours_deleted", {
      //     notifications: insertedNotifications.map((notification: any) => ({
      //       ...notification,
      //       _id: notification._id.toString(),
      //     })),
      //   });

      //   console.log(
      //     "Bulk deletion notifications sent from API to socket server"
      //   );
      //   socket.disconnect();
      // });

      // socket.on("connect_error", (err) => {
      //   console.error("WebSocket connection error:", err);
      // });

      // socket.on("error", (err) => {
      //   console.error("WebSocket error:", err);
      // });
    }

    return notificationResults;
  } catch (error) {
    console.error("Error sending meeting deletion notifications:", error);
    throw error;
  }
}

export async function PUT(req: Request) {
  try {
    const walletAddress = req.headers.get("x-wallet-address");
    const updateData: UpdateMeetingRequestBody = await req.json();
    const { host_address, reference_id, delete_reason } = updateData;

    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }
    if (walletAddress.toLowerCase() !== host_address.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to delete this lecture",
        },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!host_address || !reference_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: host_address or reference_id",
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

    // First, check if the document exists with the simplified schema
    const existingDoc = await collection.findOne({
      host_address,
      "meetings.reference_id": reference_id,
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

    const existingMeeting = existingDoc.meetings?.find(
      (m: any) => m.reference_id === reference_id
    );

    if (!existingMeeting) {
      await client.close();
      return NextResponse.json(
        {
          success: false,
          message: "Meeting not found",
        },
        { status: 404 }
      );
    }

    try {
      if (cacheWrapper.isAvailable) {
        const cacheKey = `office-hours-all`;
        await cacheWrapper.delete(cacheKey);
      }
      await sendMeetingDeletionNotification({
        db,
        title: existingMeeting.title,
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
        "meetings.reference_id": reference_id,
      },
      {
        $set: {
          "meetings.$[meetingElem].status": "deleted",
          "meetings.$[meetingElem].delete_reason": delete_reason,
          updated_at: new Date(),
        },
      },
      {
        arrayFilters: [{ "meetingElem.reference_id": reference_id }],
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