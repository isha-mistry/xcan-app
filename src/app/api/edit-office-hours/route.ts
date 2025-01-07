import { connectDB } from "@/config/connectDB";
import { NextResponse } from "next/server";

interface Attendee {
  address: string;
  uid?: string;
  onchain_uid?: string;
}

interface UpdateMeetingRequestBody {
  host_address: string;
  dao_name: string;
  reference_id: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  meeting_status?: string;
  video_uri?: string;
  thumbnail_image?: string;
  isMeetingRecorded?: boolean;
  host_uid?: string;
  host_onchain_uid?: string;
  attendees?: Attendee[];
  attendee_update?: {
    address: string;
    uid?: string;
    onchain_uid?: string;
  };
}

export async function PUT(req: Request) {
  try {
    const updateData: UpdateMeetingRequestBody = await req.json();
    const {
      host_address,
      dao_name,
      reference_id,
      attendees,
      attendee_update,
      ...updateFields
    } = updateData;

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

    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("office_hours");

    // First, get the existing document
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

    // Find the existing meeting data
    const existingDAO = existingDoc.dao.find(
      (dao: any) => dao.name === dao_name
    );
    const existingMeeting = existingDAO?.meetings.find(
      (meeting: any) => meeting.reference_id === reference_id
    );

    if (!existingMeeting) {
      await client.close();
      return NextResponse.json(
        {
          success: false,
          message: "Meeting not found in the specified DAO",
        },
        { status: 404 }
      );
    }

    // Build update object only with provided values
    const fieldsToUpdate: { [key: string]: any } = {};

    // Helper function to add field if it exists and is different
    const addFieldIfChanged = (
      fieldName: string,
      value: any,
      prefix = "dao.$[daoElem].meetings.$[meetingElem]."
    ) => {
      if (value !== undefined && value !== existingMeeting[fieldName]) {
        fieldsToUpdate[`${prefix}${fieldName}`] = value;
      }
    };

    // Handle regular meeting field updates
    addFieldIfChanged("title", updateFields.title?.trim());
    addFieldIfChanged("description", updateFields.description?.trim());
    addFieldIfChanged("startTime", updateFields.startTime);
    addFieldIfChanged("endTime", updateFields.endTime);
    addFieldIfChanged("meeting_status", updateFields.meeting_status);
    addFieldIfChanged("video_uri", updateFields.video_uri);
    addFieldIfChanged("thumbnail_image", updateFields.thumbnail_image);
    addFieldIfChanged("isMeetingRecorded", updateFields.isMeetingRecorded);
    addFieldIfChanged("host_uid", updateFields.host_uid);
    addFieldIfChanged("host_onchain_uid", updateFields.host_onchain_uid);

    // Get current attendees or initialize empty array
    let currentAttendees = existingMeeting.attendees || [];

    // Handle adding new attendees with UIDs
    if (attendees) {
      // Validate attendees array
      if (!Array.isArray(attendees)) {
        await client.close();
        return NextResponse.json(
          {
            success: false,
            error: "Attendees must be an array",
          },
          { status: 400 }
        );
      }

      // Validate each attendee has required address
      const invalidAttendee = attendees.find((attendee) => !attendee.address);
      if (invalidAttendee) {
        await client.close();
        return NextResponse.json(
          {
            success: false,
            error: "Each attendee must have an address",
          },
          { status: 400 }
        );
      }

      // Process each new attendee
      attendees.forEach((newAttendee) => {
        const existingIndex = currentAttendees.findIndex(
          (existing: Attendee) => existing.address === newAttendee.address
        );

        if (existingIndex === -1) {
          // Add new attendee with any provided UIDs
          currentAttendees.push({
            address: newAttendee.address,
            uid: newAttendee.uid,
            onchain_uid: newAttendee.onchain_uid,
          });
        } else {
          // Update existing attendee's UIDs if provided
          if (newAttendee.uid !== undefined) {
            currentAttendees[existingIndex].uid = newAttendee.uid;
          }
          if (newAttendee.onchain_uid !== undefined) {
            currentAttendees[existingIndex].onchain_uid =
              newAttendee.onchain_uid;
          }
        }
      });
    }

    // Handle updating specific attendee's UIDs
    if (attendee_update) {
      const { address, uid, onchain_uid } = attendee_update;

      if (!address) {
        await client.close();
        return NextResponse.json(
          {
            success: false,
            error: "Address is required for updating attendee UIDs",
          },
          { status: 400 }
        );
      }

      const attendeeIndex = currentAttendees.findIndex(
        (a: Attendee) => a.address === address
      );

      if (attendeeIndex === -1) {
        await client.close();
        return NextResponse.json(
          {
            success: false,
            error: "Attendee not found in the meeting",
          },
          { status: 404 }
        );
      }

      // Update the specific attendee's UIDs
      if (uid !== undefined) {
        currentAttendees[attendeeIndex].uid = uid;
      }
      if (onchain_uid !== undefined) {
        currentAttendees[attendeeIndex].onchain_uid = onchain_uid;
      }
    }

    // Always update attendees field if we have processed any attendee changes
    if (attendees || attendee_update) {
      fieldsToUpdate["dao.$[daoElem].meetings.$[meetingElem].attendees"] =
        currentAttendees;
    }

    // Only proceed with update if there are fields to update
    if (Object.keys(fieldsToUpdate).length === 0) {
      await client.close();
      return NextResponse.json(
        {
          success: true,
          message: "No valid fields to update",
          data: existingDoc,
        },
        { status: 200 }
      );
    }

    // Add updated_at timestamp
    fieldsToUpdate["updated_at"] = new Date();

    // Update document
    const result = await collection.updateOne(
      {
        host_address,
        "dao.name": dao_name,
        "dao.meetings.reference_id": reference_id,
      },
      { $set: fieldsToUpdate },
      {
        arrayFilters: [
          { "daoElem.name": dao_name },
          { "meetingElem.reference_id": reference_id },
        ],
      }
    );

    // Fetch updated document
    const updatedDocument = await collection.findOne({
      host_address,
      "dao.name": dao_name,
      "dao.meetings.reference_id": reference_id,
    });

    await client.close();

    return NextResponse.json(
      {
        success: true,
        data: updatedDocument,
        message: "Meeting updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating meeting:", error);
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

interface DeleteMeetingRequestBody {
  host_address: string;
  dao_name: string;
  reference_id: string;
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
