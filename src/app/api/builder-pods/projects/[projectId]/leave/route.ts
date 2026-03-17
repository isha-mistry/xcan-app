import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { PodProject } from "@/models/PodProject";
import { PodMember } from "@/models/PodMember";
import { AuditLog } from "@/models/AuditLog";

export async function POST(
    req: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        await dbConnect();
        const body = await req.json();
        const { walletAddress } = body;
        const projectId = params.projectId;

        if (!walletAddress) {
            return NextResponse.json(
                { success: false, error: "walletAddress is required" },
                { status: 400 }
            );
        }

        const wallet = walletAddress.toLowerCase();

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
        console.error("Leave team error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
