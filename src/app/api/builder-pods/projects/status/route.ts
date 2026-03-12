import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PodProject } from '@/models/PodProject';
import { AuditLog } from '@/models/AuditLog';
import { Notification } from '@/models/Notification';
import { recalculatePodScore } from '@/lib/builder-pods/leaderboard';

// PATCH /api/builder-pods/projects/status — update project status or approve
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { projectId, status, isApproved, adminWallet } = body;

        if (!projectId || !adminWallet) {
            return NextResponse.json(
                { success: false, error: 'projectId and adminWallet are required' },
                { status: 400 }
            );
        }

        const project = await PodProject.findById(projectId);
        if (!project || project.deletedAt) {
            return NextResponse.json(
                { success: false, error: 'Project not found' },
                { status: 404 }
            );
        }

        const oldValues: Record<string, any> = {};
        const newValues: Record<string, any> = {};

        if (status) {
            oldValues.status = project.status;
            project.status = status;
            project.statusUpdatedBy = adminWallet.toLowerCase();
            project.statusUpdatedAt = new Date();
            newValues.status = status;
        }

        if (typeof isApproved === 'boolean') {
            oldValues.isApproved = project.isApproved;
            project.isApproved = isApproved;
            if (isApproved) {
                project.approvedBy = adminWallet.toLowerCase();
                project.approvedAt = new Date();
            }
            newValues.isApproved = isApproved;
        }

        await project.save();

        // Notify project creator
        await Notification.create({
            walletAddress: project.createdBy,
            type: 'project_status_changed',
            title: `Project Updated: ${project.name}`,
            body: status ? `Status changed to ${status.replace(/_/g, ' ')}` : 'Project approved',
            link: '/builder-pods',
        });

        await AuditLog.create({
            actorWallet: adminWallet.toLowerCase(),
            action: status ? 'project.status_update' : 'project.approve',
            entityType: 'PodProject',
            entityId: projectId,
            oldValue: oldValues,
            newValue: newValues,
        });

        // Inline leaderboard update for pod score
        await recalculatePodScore(project.collegeId);

        return NextResponse.json(
            { success: true, project: { _id: project._id, status: project.status, isApproved: project.isApproved } },
            { status: 200 }
        );
    } catch (error) {
        console.error('Project status update error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
