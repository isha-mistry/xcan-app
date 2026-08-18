import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ShowcaseEvent } from "@/models/ShowcaseEvent";
import { ShowcaseSubmission } from "@/models/ShowcaseSubmission";
import { getShowcaseDetailsBySlug } from "@/lib/builder-pods/showcase-details";

export const dynamic = "force-dynamic";

/**
 * GET /api/builder-pods/showcases/[slug]/submissions
 * Public list of active showcase submissions for a regional showcase (by catalog slug / city).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    await dbConnect();

    const slug = (params.slug || "").toLowerCase().trim();
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Showcase slug is required" },
        { status: 400 },
      );
    }

    const details = getShowcaseDetailsBySlug(slug);
    const cityNames = Array.from(
      new Set(
        [details?.city, details?.slug, slug]
          .filter(Boolean)
          .map((c) => String(c).trim()),
      ),
    );

    const events = await ShowcaseEvent.find({
      $or: cityNames.flatMap((c) => {
        const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`^${escaped}$`, "i");
        return [
          { city: re },
          { "regionSnapshot.showcaseCity": re },
        ];
      }),
    })
      .select("_id name city status eventDate")
      .lean();

    if (events.length === 0) {
      return NextResponse.json({
        success: true,
        submissions: [],
        event: null,
      });
    }

    const eventIds = events.map((e) => e._id);
    const submissions = await ShowcaseSubmission.find({
      showcaseEventId: { $in: eventIds },
      isActive: { $ne: false },
      status: { $ne: "rejected" },
    })
      .select(
        "status placement projectSnapshot collegeSnapshot demoLink githubRepo contractAddress pitchDeckUrl createdAt projectId",
      )
      .populate(
        "projectId",
        "name problemStatement techStack teamMembers teamLeader githubRepo demoLink contractAddress",
      )
      .sort({ createdAt: -1 })
      .lean();

    // Prefer live PodProject fields over the stored snapshot so edits from
    // the college project page are reflected everywhere.
    const normalizedSubmissions = submissions.map((s: any) => {
      const proj = s.projectId as any;
      if (!proj) return s;

      return {
        ...s,
        projectSnapshot: {
          ...(s.projectSnapshot || {}),
          name: proj.name ?? s.projectSnapshot?.name,
          problemStatement:
            proj.problemStatement ?? s.projectSnapshot?.problemStatement,
        },
      };
    });

    return NextResponse.json({
      success: true,
      event: events[0],
      submissions: normalizedSubmissions,
    });
  } catch (error) {
    console.error("Error fetching showcase city submissions:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
