import { connectDB } from "@/config/connectDB";
import { NextResponse, NextRequest } from "next/server";
import { Collection } from "mongodb";

interface Attendee {
  address: string;
  uid?: string;
  onchain_uid?: string;
}

interface Meeting {
  title: string;
  description: string;
  meeting_status: string;
  meeting_id: string;
  video_uri?: string;
  slot_time: string;
  host_uid?: string;
  host_onchain_uid?: string;
  thumbnail_image: string;
  isMeetingRecorded?: boolean;
  attendees: Attendee[];
  created_at?: Date;
}

interface DAOData {
  [key: string]: Meeting;
}

interface OfficeHoursRequestBody {
  host_address: string;
  dao_name: DAOData;
}

interface OfficeHoursDocument {
  host_address: string;
  dao: {
    name: string;
    meetings: Meeting[];
  }[];
  created_at: Date;
  updated_at: Date;
}

// Helper functions for MongoDB operations
const addMeetingToExistingDAO = async (
  collection: Collection<OfficeHoursDocument>,
  hostAddress: string,
  daoName: string,
  meetingData: Meeting
) => {
  return await collection.updateOne(
    { host_address: hostAddress, "dao.name": daoName },
    {
      $addToSet: {
        "dao.$.meetings": { ...meetingData, created_at: new Date() },
      },
      $set: { updated_at: new Date() },
    }
  );
};

const addNewDAOToHost = async (
  collection: Collection<OfficeHoursDocument>,
  hostAddress: string,
  daoName: string,
  meetingData: Meeting
) => {
  return await collection.updateOne(
    { host_address: hostAddress },
    {
      $push: {
        dao: {
          name: daoName,
          meetings: [{ ...meetingData, created_at: new Date() }],
        },
      },
      $set: { updated_at: new Date() },
    }
  );
};

const createNewHostWithDAO = async (
  collection: Collection<OfficeHoursDocument>,
  hostAddress: string,
  daoName: string,
  meetingData: Meeting
) => {
  return await collection.insertOne({
    host_address: hostAddress,
    dao: [
      {
        name: daoName,
        meetings: [{ ...meetingData, created_at: new Date() }],
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
    console.log("Received data:", data);

    const client = await connectDB();
    const db = client.db();
    const collection: Collection<OfficeHoursDocument> =
      db.collection("office_hours");

    const hostAddress = data.host_address;

    for (const [daoName, meetingData] of Object.entries(data.dao_name)) {
      const existingHost = await collection.findOne({
        host_address: hostAddress,
      });

      if (existingHost) {
        const existingDAO = existingHost.dao?.find(
          (dao) => dao.name === daoName
        );
        if (existingDAO) {
          await addMeetingToExistingDAO(
            collection,
            hostAddress,
            daoName,
            meetingData
          );
        } else {
          await addNewDAOToHost(collection, hostAddress, daoName, meetingData);
        }
      } else {
        await createNewHostWithDAO(
          collection,
          hostAddress,
          daoName,
          meetingData
        );
      }
    }

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
