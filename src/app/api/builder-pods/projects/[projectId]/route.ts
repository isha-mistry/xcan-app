import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { PodProject } from "@/models/PodProject";
import { PodMember } from "@/models/PodMember";
import { AuditLog } from "@/models/AuditLog";
import { WeeklyUpdate } from "@/models/WeeklyUpdate";
import { getAuthContext, UnauthorizedError, ForbiddenError } from "@/lib/rbac";
import { ProjectUpdateSchema } from "@/schemas/builder-pods";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx) throw new UnauthorizedError("Not authenticated");

    await dbConnect();
    const projectId = params.projectId;
    const wallet = ctx.walletAddress.toLowerCase();

    const project = await PodProject.findOne({
      _id: projectId,
      deletedAt: null,
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const member = await PodMember.findOne({
      collegeId: project.collegeId,
      walletAddress: wallet,
      status: "active",
      deletedAt: null,
    }).lean();

    if (!member) {
      return NextResponse.json(
        { success: false, error: "You are not an active member of this pod" },
        { status: 403 },
      );
    }

    const isProjectCreator = project.teamLeader.toLowerCase() === wallet;

    if (!isProjectCreator) {
      return NextResponse.json(
        {
          success: false,
          error: "Only the project creator can delete this project",
        },
        { status: 403 },
      );
    }

    await PodProject.updateOne({ _id: project._id }, { deletedAt: new Date() });

    await WeeklyUpdate.updateMany(
      { targetProjectId: project._id },
      { deletedAt: new Date() },
    );

    await AuditLog.create({
      actorWallet: wallet,
      action: "project.delete",
      entityType: "PodProject",
      entityId: project._id.toString(),
      newValue: { status: "deleted" },
    });

    // Note: Do not demote project creators on project deletion.
    // Pod role should remain `pod_lead` even if they delete their last project.

    return NextResponse.json(
      { success: true, message: "Project deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }
    console.error("Delete project error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx) throw new UnauthorizedError("Not authenticated");

    await dbConnect();

    const projectId = params.projectId;
    const wallet = ctx.walletAddress.toLowerCase();

    const project = await PodProject.findOne({
      _id: projectId,
      deletedAt: null,
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const member = await PodMember.findOne({
      collegeId: project.collegeId,
      walletAddress: wallet,
      status: "active",
      deletedAt: null,
    }).lean();

    if (!member) {
      return NextResponse.json(
        { success: false, error: "You are not an active member of this pod" },
        { status: 403 },
      );
    }

    const isProjectCreator = project.teamLeader.toLowerCase() === wallet;
    if (!isProjectCreator) {
      return NextResponse.json(
        {
          success: false,
          error: "Only the project creator can edit this project",
        },
        { status: 403 },
      );
    }

    const parsed = ProjectUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Invalid project payload",
        },
        { status: 400 },
      );
    }

    const oldValue = {
      name: project.name,
      problemStatement: project.problemStatement,
      githubRepo: project.githubRepo,
      demoLink: project.demoLink,
      techStack: project.techStack,
    };

    const { name, problemStatement, githubRepo, demoLink, techStack } =
      parsed.data;

    if (name !== undefined) project.name = name.trim();
    if (problemStatement !== undefined)
      project.problemStatement = problemStatement.trim() || "";
    if (githubRepo !== undefined) project.githubRepo = githubRepo;
    if (demoLink !== undefined) project.demoLink = demoLink;
    if (techStack !== undefined) {
      project.techStack = Array.from(new Set(techStack))
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);
    }

    await project.save();

    await AuditLog.create({
      actorWallet: wallet,
      action: "project.edit",
      entityType: "PodProject",
      entityId: project._id.toString(),
      oldValue,
      newValue: {
        name: project.name,
        problemStatement: project.problemStatement,
        githubRepo: project.githubRepo,
        demoLink: project.demoLink,
        techStack: project.techStack,
      },
    });

    return NextResponse.json({ success: true, project }, { status: 200 });
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

    console.error("Edit project error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
