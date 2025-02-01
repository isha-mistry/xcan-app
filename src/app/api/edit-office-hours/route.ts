import { connectDB } from "@/config/connectDB";
import { Attendee, OfficeHoursProps } from "@/types/OfficeHoursTypes";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const updateData: OfficeHoursProps = await req.json();
    const { host_address, dao_name, reference_id, attendees, ...updateFields } =
      updateData;

    //console.log("Line 12:",host_address,dao_name,reference_id,attendees,updateFields);

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
    const delegatesCollection = db.collection("delegates");

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
        //console.log("Line 77:",value);
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
    addFieldIfChanged("host_uid", updateFields.uid_host);
    addFieldIfChanged("onchain_host_uid", updateFields.onchain_host_uid);
    addFieldIfChanged("nft_image", updateFields.nft_image);

    if (
      updateFields.onchain_host_uid &&
      updateFields.onchain_host_uid !== existingMeeting.onchain_host_uid
    ) {
      addFieldIfChanged("onchain_host_uid", updateFields.onchain_host_uid);

      // Update host's onchain count in delegates collection
      await delegatesCollection.findOneAndUpdate(
        { address: host_address },
        {
          $inc: {
            [`meetingRecords.${dao_name}.officeHoursHosted.onchainCounts`]: 1,
          },
        }
      );
    }

    if (
      updateFields.meeting_status &&
      updateFields.meeting_status !== existingMeeting.meeting_status
    ) {
      addFieldIfChanged("meeting_status", updateFields.meeting_status);

      // Check if the new status is "Recorded" or "Finished"
      if (["Recorded", "Finished"].includes(updateFields.meeting_status)) {
        // Update host's total hosted count
        await delegatesCollection.findOneAndUpdate(
          { address: host_address },
          {
            $inc: {
              [`meetingRecords.${dao_name}.officeHoursHosted.totalHostedOfficeHours`]: 1,
            },
          }
        );

        // Update total attended count for all attendees
        if (existingMeeting.attendees && existingMeeting.attendees.length > 0) {
          const updatePromises = existingMeeting.attendees.map(
            (attendee: Attendee) =>
              delegatesCollection.findOneAndUpdate(
                { address: attendee.attendee_address },
                {
                  $inc: {
                    [`meetingRecords.${dao_name}.officeHoursAttended.totalAttendedOfficeHours`]: 1,
                  },
                }
              )
          );
          await Promise.all(updatePromises);
        }
      }
    }

    // Handle attendees update
    if (attendees) {
      const attendeesArray = Array.isArray(attendees) ? attendees : [attendees];

      if (attendeesArray.find((attendee) => !attendee.attendee_address)) {
        await client.close();
        return NextResponse.json(
          {
            success: false,
            error: "Each attendee must have an address",
          },
          { status: 400 }
        );
      }

      let currentAttendees = existingMeeting.attendees || [];

      // Track new onchain UIDs to update counts
      const newOnchainUids = new Set();

      // Process attendees
      attendeesArray.forEach((newAttendee) => {
        const existingIndex = currentAttendees.findIndex(
          (existing: Attendee) =>
            existing.attendee_address.toLowerCase() ===
            newAttendee.attendee_address.toLowerCase()
        );

        if (existingIndex === -1) {
          // Add new attendee
          currentAttendees.push({
            address: newAttendee.attendee_address,
            ...(newAttendee.attendee_uid && { uid: newAttendee.attendee_uid }),
            ...(newAttendee.attendee_onchain_uid && {
              onchain_uid: newAttendee.attendee_onchain_uid,
            }),
          });

          // Track new onchain UIDs
          if (newAttendee.attendee_onchain_uid) {
            newOnchainUids.add(newAttendee.attendee_address);
          }

          // If meeting is already Recorded or Finished, increment total attended count for new attendee
          if (
            ["Recorded", "Finished"].includes(existingMeeting.meeting_status)
          ) {
            delegatesCollection.findOneAndUpdate(
              { address: newAttendee.attendee_address },
              {
                $inc: {
                  [`meetingRecords.${dao_name}.officeHoursAttended.totalAttendedOfficeHours`]: 1,
                },
              }
            );
          }
        } else if (
          newAttendee.attendee_uid ||
          newAttendee.attendee_onchain_uid
        ) {
          // Update existing attendee
          if (newAttendee.attendee_uid) {
            currentAttendees[existingIndex].uid = newAttendee.attendee_uid;
          }
          if (
            newAttendee.attendee_onchain_uid &&
            !currentAttendees[existingIndex].onchain_uid
          ) {
            currentAttendees[existingIndex].onchain_uid =
              newAttendee.attendee_onchain_uid;
            newOnchainUids.add(newAttendee.attendee_address);
          }
        }
      });

      // Update onchain counts for attendees
      for (const attendeeAddress of newOnchainUids) {
        await delegatesCollection.findOneAndUpdate(
          { address: attendeeAddress },
          {
            $inc: {
              [`meetingRecords.${dao_name}.officeHoursAttended.onchainCounts`]: 1,
            },
          }
        );
      }

      // Update attendees field
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
