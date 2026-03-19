import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { PodProject } from "@/models/PodProject";
import { PodMember } from "@/models/PodMember";
import { AuditLog } from "@/models/AuditLog";
import { WeeklyUpdate } from "@/models/WeeklyUpdate";
import { getAuthContext, UnauthorizedError } from "@/lib/rbac";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { projectId: string } }
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
                { status: 404 }
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
                { status: 403 }
            );
        }

        const isProjectCreator = project.teamLeader.toLowerCase() === wallet;

        if (!isProjectCreator) {
            return NextResponse.json(
                { success: false, error: "Only the project creator can delete this project" },
                { status: 403 }
            );
        }

        await PodProject.updateOne(
            { _id: project._id },
            { deletedAt: new Date() }
        );

        await WeeklyUpdate.updateMany(
            { targetProjectId: project._id },
            { deletedAt: new Date() }
        );

        await AuditLog.create({
            actorWallet: wallet,
            action: "project.delete",
            entityType: "PodProject",
            entityId: project._id.toString(),
            newValue: { status: "deleted" },
        });

        // Demote if they have no other projects
        const remainingProjects = await PodProject.countDocuments({
            collegeId: project.collegeId,
            teamLeader: { $regex: new RegExp(`^${wallet}$`, "i") },
            deletedAt: null,
        });

        if (remainingProjects === 0) {
            await PodMember.updateOne(
                { collegeId: project.collegeId, walletAddress: { $regex: new RegExp(`^${wallet}$`, "i") }, deletedAt: null },
                { $set: { role: "pod_member" } }
            );
            
            // Note: Inorbit platform roles could also be updated here if PlatformRole/UserRole models are imported,
            // but the PodMember is the primary indicator of role in the pod.
        }

        return NextResponse.json(
            { success: true, message: "Project deleted successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }
        console.error("Delete project error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
