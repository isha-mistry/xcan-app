import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

export async function GET(req: NextRequest, res: NextResponse) {
  // console.log("GET req call");
  const user_address = req.url.split("get-session-data/")[1];

  try {
    // Connect to MongoDB
    // console.log("Connecting to MongoDB...");
    const client = await connectDB();
    // console.log("Connected to MongoDB");

    // Access the collection
    const db = client.db();
    const collection = db.collection("sessions");

    const currentTimeISO = new Date().toISOString();

    let currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 30);
    const updatedTimeISO = currentTime.toISOString();

    // Find documents based on user_address
    // console.log("Finding documents for user:", user_address);
    const documents = await collection
      .find({
        "attendees.attendee_address": {
          $regex: new RegExp(`^${user_address}$`, "i"),
        }
      })
      .sort({ slot_time: -1 })
      .toArray();
    // console.log("Documents found:", documents);

    const documentsForAttending = await collection
      .find({
        "attendees.attendee_address": {
          $regex: new RegExp(`^${user_address}$`, "i"),
        },
        slot_time: { $gte: updatedTimeISO },
        meeting_status: { $ne: "Recorded" },
      })
      .sort({ slot_time: -1 })
      .toArray();

    client.close();
    // console.log("MongoDB connection closed");

    // Return the found documents
    return NextResponse.json(
      { success: true, data: documents, attending: documentsForAttending },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving data in get session by user:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
