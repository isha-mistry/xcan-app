import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

type Params = {
  userAddress: string;
};

export async function GET(request: NextRequest, context: { params: Params }) {
  const url = new URL(request.url);
  const daoName = url.searchParams.get("dao_name");
  const userAddress = context.params.userAddress;
  try {
    const client = await connectDB();

    const db = client.db();
    const collection = db.collection("scheduling");

    const documents = await collection
      .find({
        userAddress: { $regex: new RegExp(`^${userAddress}$`, "i") },
        dao_name: daoName,
      })
      .toArray();

    client.close();
    // console.log("MongoDB connection closed");

    return NextResponse.json(
      { success: true, data: documents },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving data get availability by user:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
