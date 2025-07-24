import { connectDB } from "@/config/connectDB";
import { NextRequest, NextResponse } from "next/server";

interface ProfileRequestBody {
  githubId: string;
  githubUsername: string;
  image?: string;
  displayName?: string;
  description?: string;
  emailId?: string;
  isEmailVisible?: boolean;
  socialHandles?: {
    githubId: string;
    githubUsername: string;
  };
}

export async function POST(req: NextRequest) {
  const {
    githubId,
    githubUsername,
    image,
    displayName,
    description,
    emailId,
    isEmailVisible,
    socialHandles,
  }: ProfileRequestBody = await req.json();

  try {
    const client = await connectDB();
    const db = client.db();
    const collection = db.collection("users");
    // Insert or update the profile document using githubId as the key
    const result = await collection.updateOne(
      { "socialHandles.githubId": githubId },
      {
        $set: {
          githubId,
          githubUsername,
          image,
          displayName,
          description,
          emailId,
          isEmailVisible,
          socialHandles,
        },
      },
      { upsert: true }
    );
    client.close();
    if (result.upsertedId || result.modifiedCount > 0) {
      const updatedDocument = await collection.findOne({
        "socialHandles.githubId": githubId,
      });
      return NextResponse.json({ result: updatedDocument }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Failed to update or insert document" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error storing profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  res: NextApiResponse<ProfileResponseBody>
) {
  const {
    address,
    image,
    displayName,
    description,
    emailId,
    isEmailVisible,
    socialHandles,
  }: ProfileRequestBody = await req.json();

  try {
    // Connect to your MongoDB database
    console.log("Connecting to MongoDB...");
    const client = await connectDB();
    console.log("Connected to MongoDB");

    // Access the collection
    const db = client.db();
    const collection = db.collection("users");

    // Prepare update fields
    const updateFields: any = {};
    if (image !== undefined) updateFields.image = image;
    if (displayName !== undefined) updateFields.displayName = displayName;
    if (description !== undefined) updateFields.description = description;
    if (emailId !== undefined) updateFields.emailId = emailId;
    if (isEmailVisible !== undefined)
      updateFields.isEmailVisible = isEmailVisible;
    if (socialHandles !== undefined) updateFields.socialHandles = socialHandles;

    // Update the profile document
    console.log("Updating profile document...");
    const result = await collection.updateOne(
      { address: address },
      { $set: updateFields }
    );
    console.log("Profile document updated:", result);

    if (cacheWrapper.isAvailable) {
      const cacheKey = `profile:${address}`;
      await cacheWrapper.delete(cacheKey);
    }

    client.close();
    console.log("MongoDB connection closed");

    if (result.modifiedCount > 0) {
      // If at least one document was modified
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      // If no document was modified
      if (result.acknowledged) {
        return NextResponse.json({ success: true }, { status: 200 });
      } else {
        return NextResponse.json(
          { error: "No document found to update" },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
