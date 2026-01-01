import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

export const revalidate = 0;

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Connect to user database
    const userClient = await connectDB();
    const userDb = userClient.db("inorbit_modules");
    const orbitChainsCollection = userDb.collection("deployed-orbit-chains");

    // Fetch all orbit chains, sorted by deployment date (newest first)
    const orbitChains = await orbitChainsCollection
      .find({})
      .sort({ "metadata.deployedAt": -1 })
      .toArray();

    // Close database connection
    await userClient.close();

    return NextResponse.json({
      success: true,
      data: orbitChains,
      count: orbitChains.length,
    });
  } catch (error) {
    console.error("Orbit Chains API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
