import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { ShowcaseSubmission } from "@/models/ShowcaseSubmission";
import { PodProject } from "@/models/PodProject";
import { PodMember } from "@/models/PodMember";
import {
  getAuthContext,
  UnauthorizedError,
  ForbiddenError,
} from "@/lib/rbac";
import {
  certificateFileName,
  renderShowcaseCertificate,
} from "@/lib/builder-pods/showcase-certificate";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { submissionId: string } },
) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx) throw new UnauthorizedError("Not authenticated");

    await dbConnect();
    const wallet = ctx.walletAddress.toLowerCase();
    const { submissionId } = params;

    const submission = await ShowcaseSubmission.findById(submissionId);
    if (!submission || submission.isActive === false) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 },
      );
    }

    if (!submission.certificateClaimable) {
      throw new ForbiddenError(
        "Certificate is not yet available for this team",
      );
    }

    const project = await PodProject.findOne({
      _id: submission.projectId,
      deletedAt: null,
    });
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const onTeam =
      project.teamLeader?.toLowerCase() === wallet ||
      project.teamMembers?.some(
        (m) => m.walletAddress.toLowerCase() === wallet,
      );
    if (!onTeam) {
      throw new ForbiddenError(
        "Only project team members can download this certificate",
      );
    }

    const teamEntry = project.teamMembers?.find(
      (m) => m.walletAddress.toLowerCase() === wallet,
    );
    let memberName = teamEntry?.name?.trim() || "";
    if (!memberName) {
      const podMember = await PodMember.findOne({
        collegeId: submission.collegeId,
        walletAddress: wallet,
      })
        .select("name")
        .lean();
      memberName = podMember?.name?.trim() || "";
    }
    if (!memberName) memberName = "Participant";

    const podName = submission.collegeSnapshot?.podName || "Builder Pod";
    const png = await renderShowcaseCertificate({ memberName, podName });
    const filename = certificateFileName(memberName);

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }
    console.error("Certificate download error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
