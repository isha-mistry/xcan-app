import { connectDB } from "@/config/connectDB";
import { NextRequest, NextResponse } from "next/server";

type WatchSession = {
  start_time: number; 
  end_time: number; 
  duration: number; 
};

type UserWatchLogs = {
  user_address: string;
  watch_session: WatchSession[];
  total_watch_time: number; 
};

type VideoWatchLogs = {
  meeting_id: string;
  meeting_type: string;
  video_uri: string;
  watch_logs: UserWatchLogs[];
};

export async function POST(req: NextRequest) {
let client;
  try {
    client = await connectDB();
    console.log("Connected to MongoDB");

    // Access the collection
    const db = client.db();

    const collections = await db.listCollections({ name: "video_watch_logs" }).toArray();

    if (collections.length === 0) {
      // Create collection if it doesn't exist
      await db.createCollection("video_watch_logs");
      console.log("Collection 'video_watch_logs' created!");
    } else {
      console.log("Collection 'video_watch_logs' already exists.");
    }
    const collection = db.collection("video_watch_logs");


    const body = await req.json();
    const { meeting_id, meeting_type, video_uri, watch_logs } = body;

      // Check if all required fields are present
      if (!meeting_id || !meeting_type || !video_uri || !watch_logs) {
        return NextResponse.json(
            { message: "Missing required fields!" },
            { status: 400 }
        );
    }

    const existingDocument = await collection.findOne({ meeting_id });

    if (existingDocument) {
        console.log("Document found for meeting_id:", meeting_id);

        // Iterate over each user log in the incoming data
        for (const newLog of watch_logs) {
            const { user_address, watch_session, total_watch_time } = newLog;

            // Check if user_address already exists in watch_logs array
            const userExists = existingDocument.watch_logs.find(
                (log:any) => log.user_address === user_address
            );

            if (userExists) {
                // If user exists, update watch_session and total_watch_time
                await collection.updateOne(
                    { meeting_id, "watch_logs.user_address": user_address },
                    {
                        $push: {
                            "watch_logs.$.watch_session": { $each: watch_session } as any
                        },
                        $inc: {
                            "watch_logs.$.total_watch_time": total_watch_time
                        }
                    }
                );
                console.log(`Updated watch_session for user: ${user_address}`);
            } else {
                // If user doesn't exist, add new user log to watch_logs array
                await collection.updateOne(
                    { meeting_id },
                    {
                        $push: {
                            watch_logs: newLog
                        }
                    }
                );
                console.log(`Added new user log for user: ${user_address}`);
            }
        }

        return NextResponse.json({ message: "Document updated successfully!" });
    } else {
        // Create a new document
        const newDocument: VideoWatchLogs = {
            meeting_id,
            meeting_type,
            video_uri,
            watch_logs
        };
        await collection.insertOne(newDocument);
        console.log(`Created new document for meeting_id: ${meeting_id}`);

    }
    return NextResponse.json({ message: "Data received successfully!" });
  } catch (error) {
    console.error("Error:", error); // Log any error
    return NextResponse.json(
      { message: "Failed to process data!" },
      { status: 500 }
    );
  }finally {
    if (client) {
      await client.close();  // Close the MongoDB client here
      console.log("MongoDB client closed");
    }
  }
}
