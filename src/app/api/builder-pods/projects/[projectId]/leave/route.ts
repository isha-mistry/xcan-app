import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { PodProject } from "@/models/PodProject";
import { AuditLog } from "@/models/AuditLog";
import { getAuthContext, UnauthorizedError } from "@/lib/rbac";

export async function POST(
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

        const member = project.teamMembers.find(
            (m: any) => m.walletAddress.toLowerCase() === wallet
        );

        if (!member) {
            return NextResponse.json(
                { success: false, error: "You are not a member of this project team" },
                { status: 409 }
            );
        }

        if (project.teamLeader.toLowerCase() === wallet) {
            return NextResponse.json(
                { success: false, error: "Team Leader cannot leave the project without deleting it" },
                { status: 400 }
            );
        }

        await PodProject.updateOne(
            { _id: project._id },
            {
                $pull: {
                    teamMembers: { walletAddress: wallet },
                },
            }
        );

        await AuditLog.create({
            actorWallet: wallet,
            action: "project.leave_team",
            entityType: "PodProject",
            entityId: project._id.toString(),
            newValue: { role: member.role },
        });

        return NextResponse.json(
            { success: true, message: "Successfully left the project team" },
            { status: 200 }
        );
    } catch (error: any) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }
        console.error("Leave team error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
