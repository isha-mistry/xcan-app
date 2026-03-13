import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { College } from "@/models/College";
import { PodMember } from "@/models/PodMember";
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    const [rawColleges, memberAgg] = await Promise.all([
      College.find({
        status: "active",
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      })
        .select(
          "name slug city state regionSnapshot podName memberCount activeMemberCount projectCount deploymentCount status activatedAt logoUrl",
        )
        .sort({ name: 1 })
        .lean(),

      PodMember.aggregate([
        {
          $match: {
            deletedAt: null,
          },
        },
        {
          $group: {
            _id: "$collegeId",
            memberCount: { $sum: 1 },
            activeMemberCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "active"] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const countsByCollegeId = new Map<
      string,
      { memberCount: number; activeMemberCount: number }
    >();
    for (const row of memberAgg as any[]) {
      countsByCollegeId.set(String(row._id), {
        memberCount: row.memberCount ?? 0,
        activeMemberCount: row.activeMemberCount ?? 0,
      });
    }

    const colleges = rawColleges.map((c: any) => {
      const counts =
        countsByCollegeId.get(String(c._id)) ?? {
          memberCount: 0,
          activeMemberCount: 0,
        };
      return {
        ...c,
        memberCount: counts.memberCount,
        activeMemberCount: counts.activeMemberCount,
      };
    });

    const stats = {
      totalColleges: colleges.length,
      activeColleges: colleges.filter((c: any) => c.status === "active").length,
      totalMembers: colleges.reduce(
        (sum: number, c: any) => sum + (c.memberCount ?? 0),
        0,
      ),
      totalActiveMembers: colleges.reduce(
        (sum: number, c: any) => sum + (c.activeMemberCount ?? 0),
        0,
      ),
      totalDeployments: colleges.reduce(
        (sum: number, c: any) => sum + (c.deploymentCount ?? 0),
        0,
      ),
      totalProjects: colleges.reduce(
        (sum: number, c: any) => sum + (c.projectCount ?? 0),
        0,
      ),
    };

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
