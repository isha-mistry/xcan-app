import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodProject } from '@/models/PodProject';
import { PodMember } from '@/models/PodMember';
import { AuditLog } from '@/models/AuditLog';

// POST — join a project team via team code
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { teamCode, walletAddress } = body;

        if (!teamCode || !walletAddress) {
            return NextResponse.json(
                { success: false, error: 'teamCode and walletAddress are required' },
                { status: 400 }
            );
        }

        const wallet = walletAddress.toLowerCase();
        const code = teamCode.trim().toUpperCase();

        const project = await PodProject.findOne({ teamCode: code, deletedAt: null });
        if (!project) {
            return NextResponse.json(
                { success: false, error: 'Invalid team code. Please check and try again.' },
                { status: 404 }
            );
        }

        const alreadyInTeam = project.teamMembers.some(
            (m: any) => m.walletAddress === wallet
        );
        if (alreadyInTeam) {
            return NextResponse.json(
                { success: false, error: 'You are already a member of this project team' },
                { status: 409 }
            );
        }

        const membership = await PodMember.findOne({
            collegeId: project.collegeId,
            walletAddress: wallet,
            status: { $in: ['active', 'pending'] },
            deletedAt: null,
        }).lean();

        if (!membership) {
            return NextResponse.json(
                { success: false, error: 'You must be a member of this pod to join the project team' },
                { status: 403 }
            );
        }

        await PodProject.updateOne(
            { _id: project._id },
            {
                $push: {
                    teamMembers: {
                        walletAddress: wallet,
                        name: membership.name,
                        role: 'team_member',
                        joinedAt: new Date(),
                    },
                },
            }
        );

        await AuditLog.create({
            actorWallet: wallet,
            action: 'project.join_team',
            entityType: 'PodProject',
            entityId: project._id.toString(),
            newValue: { teamCode: code, role: 'team_member' },
        });

        return NextResponse.json(
            {
                success: true,
                project: {
                    _id: project._id,
                    name: project.name,
                },
                message: `Successfully joined team "${project.name}"`,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Join team error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
