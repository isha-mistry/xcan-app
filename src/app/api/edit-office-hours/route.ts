import { connectDB } from "@/config/connectDB";
import { NextResponse } from "next/server";

interface UpdateMeetingRequestBody {
  host_address: string;
  dao_name: string;
  reference_id: string;
  title?: string;
  description?: string;
  slot_time?: string;
}

export async function PUT(req: Request) {
  try {
    const updateData: UpdateMeetingRequestBody = await req.json();
    const { host_address, dao_name, reference_id, title, description } =
      updateData;

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

    // Build update object only with non-empty values
    const fieldsToUpdate: { [key: string]: any } = {};

    // Only include fields that have non-empty values
    if (title && title.trim() !== "") {
      fieldsToUpdate[`dao.$[daoElem].meetings.$[meetingElem].title`] = title;
    }

    if (description && description.trim() !== "") {
      fieldsToUpdate[`dao.$[daoElem].meetings.$[meetingElem].description`] =
        description;
    }

    // Only proceed with update if there are non-empty fields to update
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
