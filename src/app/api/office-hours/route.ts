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

function getRandomElementFromArray(arr: any[]) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
const randomImage = getRandomElementFromArray(imageCIDs);

// // Helper function for MongoDB operations
// const addMeetingsToExistingDAO = async (
//   collection: Collection<OfficeHoursDocument>,
//   hostAddress: string,
//   daoName: string,
//   meetings: Meeting[]
// ) => {
//   const meetingDocument = meetings.map((meeting) => ({
//     reference_id: uuidv4(),
//     ...meeting,
//     meeting_status: "Upcoming",
//     thumbnail_image: randomImage,
//     created_at: new Date(),
//   }));

//   return await collection.updateOne(
//     { host_address: hostAddress, "dao.name": daoName },
//     {
//       $push: {
//         "dao.$.meetings": {
//           $each: meetingDocument,
//         },
//       },
//       $set: { updated_at: new Date() },
//     }
//   );
// };
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
      thumbnail_image: randomImage,
      created_at: new Date(),
    };

    if (meetingDate.getTime() === today.getTime()) {
      try {
        // Direct API call since we're already in the API route
        const response = await fetch(`${process.env.NEXT_PUBLIC_CREATE_ROOM_ENDPOINT}`, {
          method: 'GET',
          headers: {
            // Add any necessary headers for your room service
            'Content-Type': 'application/json',
            // Add any authentication headers if required
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to create room');
        }
        
        const result = await response.json();
        meetingDocument.push({
          ...baseDocument,
          meetingId: result.data
        });
      } catch (error) {
        console.error('Error generating meeting ID:', error);
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
      meeting_status: "Upcoming",
      thumbnail_image: randomImage,
      created_at: new Date(),
    };
    if (meetingDate.getTime() === today.getTime()) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CREATE_ROOM_ENDPOINT}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any other required headers
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to create room');
        }
        
        const result = await response.json();
        meetingDocument.push({
          ...baseDocument,
          meetingId: result.data
        });
      } catch (error) {
        console.error('Error generating meeting ID:', error);
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
      thumbnail_image: randomImage,
      created_at: new Date(),
    };

    if (meetingDate.getTime() === today.getTime()) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CREATE_ROOM_ENDPOINT}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any other required headers
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to create room');
        }
        
        const result = await response.json();
        meetingDocument.push({
          ...baseDocument,
          meetingId: result.data
        });
      } catch (error) {
        console.error('Error generating meeting ID:', error);
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

    const { host_address: hostAddress, dao_name: daoName, meetings } = data;

    const existingHost = await collection.findOne({
      host_address: hostAddress,
    });

    if (existingHost) {
      const existingDAO = existingHost.dao?.find((dao) => dao.name === daoName);
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
      await createNewHostWithMeetings(
        collection,
        hostAddress,
        daoName,
        meetings
      );
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
