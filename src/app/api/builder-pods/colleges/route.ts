import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/dbConnect";
import { College } from "@/models/College";
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    const [colleges, statsResult] = await Promise.all([
      College.find({ 
        $or: [
          { deletedAt: null },
          { deletedAt: { $exists: false } }
        ]
      })
        .select(
          "name slug city state regionSnapshot podName memberCount activeMemberCount projectCount deploymentCount status activatedAt logoUrl",
        )
        .sort({ name: 1 })
        .lean(),

      College.aggregate([
        { 
          $match: { 
            $or: [
              { deletedAt: null },
              { deletedAt: { $exists: false } }
            ]
          } 
        },
        {
          $group: {
            _id: null,
            totalColleges: { $sum: 1 },
            activeColleges: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
            totalMembers: { $sum: "$memberCount" },
            totalActiveMembers: { $sum: "$activeMemberCount" },
            totalDeployments: { $sum: "$deploymentCount" },
            totalProjects: { $sum: "$projectCount" },
          },
        },
      ]),
    ]);

    const stats = statsResult[0] ?? {
      totalColleges: 0,
      activeColleges: 0,
      totalMembers: 0,
      totalActiveMembers: 0,
      totalDeployments: 0,
      totalProjects: 0,
    };

    // console.log("console: ", colleges);

    return NextResponse.json(
      { success: true, colleges, stats },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
